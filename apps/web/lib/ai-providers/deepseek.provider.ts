import { createOpenAiCompatibleProvider } from "./openai-compatible.provider";

export const deepseekProvider = createOpenAiCompatibleProvider({
  name: "deepseek",
  baseUrl: "https://api.deepseek.com/v1",
  apiKeyEnv: "DEEPSEEK_API_KEY",
  supportedModels: ["deepseek-chat", "deepseek-reasoner"],
});
