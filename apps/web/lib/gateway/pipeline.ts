import type { ChatCompletionRequest } from "@/lib/ai-providers/types";
import type { RegisteredModel } from "@/lib/gateway/models";
import { CostProtectionService } from "@/lib/services/gateway/cost-protection.service";
import { UsageLoggingService } from "@/lib/services/gateway/usage-logging.service";
import type { ValidatedApiKey } from "@/types/gateway";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatCompletionResponse } from "@/lib/ai-providers/types";

export type GatewayPipelineError = {
  httpStatus: number;
  type: string;
  message: string;
  code?: string;
  quota?: Record<string, unknown>;
};

/**
 * Enterprise gateway pipeline — enforces business rules before provider calls.
 *
 * 1. Validate API Key (caller)
 * 2. Validate Subscription + AI Cost Protection (pre-flight)
 * 3. Forward to provider
 * 4. Log usage + cost + profit
 */
export async function executeChatPipeline(input: {
  db: SupabaseClient;
  apiKey: ValidatedApiKey;
  body: ChatCompletionRequest;
  model: RegisteredModel;
}): Promise<
  | { ok: true; response: ChatCompletionResponse; requestId: string }
  | { ok: false; error: GatewayPipelineError }
> {
  const costProtection = new CostProtectionService(input.db);
  const preflight = await costProtection.evaluatePreRequest(
    input.apiKey.userId,
    input.body
  );

  if (!preflight.allowed) {
    const usageLogger = new UsageLoggingService(input.db);
    await usageLogger.logBlockedRequest({
      apiKeyId: input.apiKey.id,
      userId: input.apiKey.userId,
      model: input.body.model,
      requestId: preflight.requestId,
      blockedReason: preflight.code,
      planSlug: preflight.planSlug,
      estimatedPromptTokens: preflight.estimate?.promptTokens,
      estimatedCompletionTokens: preflight.estimate?.completionTokens,
      estimatedProviderCost: preflight.estimate?.providerCostUsd,
      customerCharge: preflight.estimate?.customerChargeUsd,
    });

    return {
      ok: false,
      error: {
        httpStatus: preflight.httpStatus,
        type:
          preflight.httpStatus === 402
            ? "insufficient_quota"
            : preflight.httpStatus === 429
              ? "rate_limit_error"
              : "permission_error",
        message: preflight.message,
        code: preflight.code,
      },
    };
  }

  const started = Date.now();
  let completion: ChatCompletionResponse;

  try {
    completion = await input.model.provider.createChatCompletion(input.body);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.";
    return {
      ok: false,
      error: {
        httpStatus: 502,
        type: "provider_error",
        message,
      },
    };
  }

  const latencyMs = Date.now() - started;
  const usageLogger = new UsageLoggingService(input.db);

  await usageLogger.logCompletedRequest({
    apiKeyId: input.apiKey.id,
    userId: input.apiKey.userId,
    model: input.body.model,
    promptTokens: completion.usage.prompt_tokens,
    completionTokens: completion.usage.completion_tokens,
    totalTokens: completion.usage.total_tokens,
    requestId: preflight.requestId,
    latencyMs,
    planSlug: preflight.subscription.plan.slug,
    preEstimatePromptTokens: preflight.estimate.promptTokens,
    preEstimateCompletionTokens: preflight.estimate.completionTokens,
  });

  return {
    ok: true,
    response: completion,
    requestId: preflight.requestId,
  };
}
