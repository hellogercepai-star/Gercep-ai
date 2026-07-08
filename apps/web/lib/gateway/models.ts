import { deepseekProvider } from "@/lib/ai-providers/deepseek.provider";
import { geminiProvider } from "@/lib/ai-providers/gemini.provider";
import { grokProvider } from "@/lib/ai-providers/grok.provider";
import { nvidiaProvider } from "@/lib/ai-providers/nvidia.provider";
import { openaiProvider } from "@/lib/ai-providers/openai.provider";
import type { AIProvider } from "@/lib/ai-providers/types";
import type { GatewayModel } from "@/types/gateway";

export interface RegisteredModel extends GatewayModel {
  provider: AIProvider;
}

/** Registry model gateway — tambah provider = tambah entry di sini. */
export const GATEWAY_MODELS: RegisteredModel[] = [
  // DeepSeek
  {
    id: "deepseek-chat",
    object: "model",
    owned_by: "deepseek",
    status: "live",
    provider: deepseekProvider,
  },
  {
    id: "deepseek-reasoner",
    object: "model",
    owned_by: "deepseek",
    status: "live",
    provider: deepseekProvider,
  },
  // OpenAI
  {
    id: "gpt-4o",
    object: "model",
    owned_by: "openai",
    status: "live",
    provider: openaiProvider,
  },
  {
    id: "gpt-4.1",
    object: "model",
    owned_by: "openai",
    status: "live",
    provider: openaiProvider,
  },
  {
    id: "gpt-5",
    object: "model",
    owned_by: "openai",
    status: "live",
    provider: openaiProvider,
  },
  // Google Gemini
  {
    id: "gemini-2.0-flash",
    object: "model",
    owned_by: "google",
    status: "live",
    provider: geminiProvider,
  },
  {
    id: "gemini-1.5-pro",
    object: "model",
    owned_by: "google",
    status: "live",
    provider: geminiProvider,
  },
  // xAI Grok
  {
    id: "grok-2",
    object: "model",
    owned_by: "xai",
    status: "live",
    provider: grokProvider,
  },
  {
    id: "grok-3",
    object: "model",
    owned_by: "xai",
    status: "live",
    provider: grokProvider,
  },
  // NVIDIA NIM
  {
    id: "meta/llama-3.3-70b-instruct",
    object: "model",
    owned_by: "nvidia",
    status: "live",
    provider: nvidiaProvider,
  },
  {
    id: "nvidia/nemotron-mini-4b-instruct",
    object: "model",
    owned_by: "nvidia",
    status: "live",
    provider: nvidiaProvider,
  },
];

export function getModelById(modelId: string): RegisteredModel | undefined {
  return GATEWAY_MODELS.find((m) => m.id === modelId);
}

export function listPublicModels(): GatewayModel[] {
  return GATEWAY_MODELS.map((m) => ({
    id: m.id,
    object: m.object,
    owned_by: m.owned_by,
    status: m.status,
  }));
}

export function getProviderRouting(): Record<string, AIProvider> {
  return Object.fromEntries(GATEWAY_MODELS.map((m) => [m.id, m.provider]));
}
