import { deepseekProvider } from "@/lib/ai-providers/deepseek.provider";
import type { AIProvider } from "@/lib/ai-providers/types";
import type { GatewayModel } from "@/types/gateway";

export interface RegisteredModel extends GatewayModel {
  provider: AIProvider;
}

/** Registry model gateway — tambah provider = tambah entry di sini. */
export const GATEWAY_MODELS: RegisteredModel[] = [
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
