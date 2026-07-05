import { NextRequest, NextResponse } from "next/server";
import { extractBearerToken } from "@/lib/gateway/api-key";
import { openAiUnauthorized, validateApiKey } from "@/lib/gateway/auth";
import { getModelById } from "@/lib/gateway/models";
import { logUsage } from "@/lib/gateway/usage";
import { assertWithinDailyQuota } from "@/lib/gateway/quota";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ChatCompletionRequest } from "@/lib/ai-providers/types";
import type { ValidatedApiKey } from "@/types/gateway";

// POST /api/v1/chat/completions — OpenAI-compatible gateway
// Auth: Authorization: Bearer sk-gercep-...

async function authenticateRequest(
  request: NextRequest
): Promise<ValidatedApiKey | NextResponse> {
  const token = extractBearerToken(request.headers.get("authorization"));

  if (!token) {
    return NextResponse.json(
      openAiUnauthorized("Header Authorization: Bearer sk-gercep-... wajib."),
      { status: 401 }
    );
  }

  // Dev bypass opsional (local testing sebelum migration jalan)
  if (
    process.env.GATEWAY_DEV_BYPASS_KEY &&
    token === process.env.GATEWAY_DEV_BYPASS_KEY
  ) {
    return {
      id: "dev-bypass",
      userId: "00000000-0000-0000-0000-000000000000",
      name: "Dev Bypass",
      keyPrefix: "dev...",
    };
  }

  try {
    const admin = createAdminClient();
    const apiKey = await validateApiKey(admin, token);
    if (!apiKey) {
      return NextResponse.json(openAiUnauthorized(), { status: 401 });
    }
    return apiKey;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Gateway auth skipped — set SUPABASE_SERVICE_ROLE_KEY + jalankan migration:",
        err instanceof Error ? err.message : err
      );
      return {
        id: "dev-no-db",
        userId: "00000000-0000-0000-0000-000000000000",
        name: "Dev (no DB)",
        keyPrefix: "dev...",
      };
    }
    return NextResponse.json(
      { error: { message: "Gateway auth unavailable.", type: "server_error" } },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) return authResult;
  const apiKey = authResult;

  let body: ChatCompletionRequest;

  try {
    body = (await request.json()) as ChatCompletionRequest;
  } catch {
    return NextResponse.json(
      {
        error: {
          message: "Body harus JSON yang valid.",
          type: "invalid_request_error",
        },
      },
      { status: 400 }
    );
  }

  if (!body.model) {
    return NextResponse.json(
      {
        error: {
          message: "Field 'model' wajib diisi.",
          type: "invalid_request_error",
        },
      },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json(
      {
        error: {
          message: "Field 'messages' wajib berupa array tidak kosong.",
          type: "invalid_request_error",
        },
      },
      { status: 400 }
    );
  }

  const registered = getModelById(body.model);
  if (!registered || registered.status !== "live") {
    return NextResponse.json(
      {
        error: {
          message: `Model '${body.model}' belum didukung. Lihat GET /api/v1/models.`,
          type: "invalid_request_error",
        },
      },
      { status: 404 }
    );
  }

  if (!apiKey.id.startsWith("dev")) {
    try {
      const admin = createAdminClient();
      const quotaCheck = await assertWithinDailyQuota(admin, apiKey.userId);
      if (!quotaCheck.ok) {
        return NextResponse.json(
          {
            error: {
              message: quotaCheck.message,
              type: "rate_limit_error",
              quota: {
                tier: quotaCheck.quota.tier.id,
                dailyRequests: quotaCheck.quota.dailyRequests,
                usedToday: quotaCheck.quota.usedToday,
              },
            },
          },
          { status: 429 }
        );
      }
    } catch (quotaErr) {
      console.error("Quota check failed:", quotaErr);
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          {
            error: {
              message: "Quota service unavailable. Coba lagi nanti.",
              type: "server_error",
            },
          },
          { status: 503 }
        );
      }
    }
  }

  try {
    const completion = await registered.provider.createChatCompletion(body);

    // log usage (skip untuk dev bypass tanpa DB)
    if (!apiKey.id.startsWith("dev")) {
      try {
        const admin = createAdminClient();
        await logUsage(admin, {
          apiKeyId: apiKey.id,
          userId: apiKey.userId,
          model: body.model,
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        });
      } catch (logErr) {
        console.error("Usage log skipped:", logErr);
      }
    }

    return NextResponse.json(completion);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.";
    console.error("Gateway error:", message);
    return NextResponse.json(
      { error: { message, type: "provider_error" } },
      { status: 502 }
    );
  }
}
