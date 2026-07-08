import type {
  AIProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
} from "./types";

export function createOpenAiCompatibleProvider(options: {
  name: string;
  baseUrl: string;
  apiKeyEnv: string;
  supportedModels: string[];
}): AIProvider {
  const baseUrl = options.baseUrl.replace(/\/$/, "");

  return {
    name: options.name,
    supportedModels: options.supportedModels,

    async createChatCompletion(
      request: ChatCompletionRequest
    ): Promise<ChatCompletionResponse> {
      const apiKey = process.env[options.apiKeyEnv];
      if (!apiKey) {
        throw new Error(`${options.apiKeyEnv} belum diset di environment.`);
      }

      const response = await fetch(`${baseUrl}/chat/completions`, {
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
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `${options.name} error (${response.status}): ${errorText}`
        );
      }

      return (await response.json()) as ChatCompletionResponse;
    },
  };
}
