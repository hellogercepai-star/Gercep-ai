import { createOpenAiCompatibleProvider } from "./openai-compatible.provider";

/** Google Gemini via OpenAI-compatible endpoint. */
export const geminiProvider = createOpenAiCompatibleProvider({
  name: "gemini",
  baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
  apiKeyEnv: "GOOGLE_API_KEY",
  supportedModels: ["gemini-2.0-flash", "gemini-1.5-pro"],
});
