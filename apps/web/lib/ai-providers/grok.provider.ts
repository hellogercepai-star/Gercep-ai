import { createOpenAiCompatibleProvider } from "./openai-compatible.provider";

/** xAI Grok — OpenAI-compatible API. */
export const grokProvider = createOpenAiCompatibleProvider({
  name: "grok",
  baseUrl: "https://api.x.ai/v1",
  apiKeyEnv: "XAI_API_KEY",
  supportedModels: ["grok-2", "grok-3"],
});
