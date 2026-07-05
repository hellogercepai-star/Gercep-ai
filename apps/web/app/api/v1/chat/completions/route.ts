import { NextRequest, NextResponse } from "next/server";
import { deepseekProvider } from "@/lib/ai-providers/deepseek.provider";
import type { ChatCompletionRequest } from "@/lib/ai-providers/types";

// Endpoint OpenAI-compatible: POST /api/v1/chat/completions
// Customer cukup set base URL ke gateway ini dan pakai SDK OpenAI seperti biasa.

// registry sederhana: model mana ditangani provider mana.
// Nanti nambah provider = tambah entry di sini.
const MODEL_ROUTING: Record<string, typeof deepseekProvider> = {
  "deepseek-chat": deepseekProvider,
  "deepseek-reasoner": deepseekProvider,
};

export async function POST(request: NextRequest) {
  let body: ChatCompletionRequest;

  try {
    body = (await request.json()) as ChatCompletionRequest;
  } catch {
    return NextResponse.json(
      { error: { message: "Body harus JSON yang valid.", type: "invalid_request_error" } },
      { status: 400 }
    );
  }

  if (!body.model) {
    return NextResponse.json(
      { error: { message: "Field 'model' wajib diisi.", type: "invalid_request_error" } },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json(
      { error: { message: "Field 'messages' wajib berupa array tidak kosong.", type: "invalid_request_error" } },
      { status: 400 }
    );
  }

  const provider = MODEL_ROUTING[body.model];
  if (!provider) {
    return NextResponse.json(
      {
        error: {
          message: `Model '${body.model}' belum didukung. Model tersedia: ${Object.keys(MODEL_ROUTING).join(", ")}.`,
          type: "invalid_request_error",
        },
      },
      { status: 404 }
    );
  }

  try {
    const completion = await provider.createChatCompletion(body);
    return NextResponse.json(completion);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.";
    console.error("Gateway error:", message);
    return NextResponse.json(
      { error: { message, type: "provider_error" } },
      { status: 502 }
    );
  }
}
