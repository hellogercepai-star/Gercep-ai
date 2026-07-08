import { createOpenAiCompatibleProvider } from "./openai-compatible.provider";

export const openaiProvider = createOpenAiCompatibleProvider({
  name: "openai",
  baseUrl: "https://api.openai.com/v1",
  apiKeyEnv: "OPENAI_API_KEY",
  supportedModels: ["gpt-4o", "gpt-4.1", "gpt-5"],
});
