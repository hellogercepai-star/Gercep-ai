import type {
  AIProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
} from "./types";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";

// DeepSeek OpenAI-compatible, jadi request/response bisa diteruskan
// hampir apa adanya. Provider lain yang formatnya beda akan melakukan
// transformasi di sini, tapi tetap return ChatCompletionResponse yang sama.
export const deepseekProvider: AIProvider = {
  name: "deepseek",
  supportedModels: ["deepseek-chat", "deepseek-reasoner"],

  async createChatCompletion(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY belum diset di environment.");
    }

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens,
        stream: false, // streaming ditambahkan nanti setelah non-stream stabil
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `DeepSeek error (${response.status}): ${errorText}`
      );
    }

    return (await response.json()) as ChatCompletionResponse;
  },
};
