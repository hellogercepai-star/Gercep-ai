import { createOpenAiCompatibleProvider } from "./openai-compatible.provider";

/** NVIDIA NIM — OpenAI-compatible inference microservices. */
export const nvidiaProvider = createOpenAiCompatibleProvider({
  name: "nvidia",
  baseUrl: "https://integrate.api.nvidia.com/v1",
  apiKeyEnv: "NVIDIA_API_KEY",
  supportedModels: [
    "meta/llama-3.3-70b-instruct",
    "nvidia/nemotron-mini-4b-instruct",
  ],
});
