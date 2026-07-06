import type { ChatMessage } from "@/lib/ai-providers/types";
import type { ModelPricingRow, TokenCostEstimate } from "@/types/gateway-billing";

const ONE_MILLION = 1_000_000;

export function estimatePromptTokens(messages: ChatMessage[]): number {
  const text = messages
    .map((m) => (typeof m.content === "string" ? m.content : JSON.stringify(m.content)))
    .join("\n");
  return Math.max(1, Math.ceil(text.length / 4));
}

export function estimateCompletionTokens(
  maxTokens: number | undefined,
  modelDefault: number
): number {
  const cap = maxTokens ?? modelDefault;
  return Math.max(1, Math.min(cap, modelDefault));
}

export function calculateTokenCosts(
  promptTokens: number,
  completionTokens: number,
  pricing: ModelPricingRow
): TokenCostEstimate {
  const providerCostUsd =
    (promptTokens * pricing.inputCostPer1M +
      completionTokens * pricing.outputCostPer1M) /
    ONE_MILLION;

  const customerChargeUsd =
    (promptTokens * pricing.inputPricePer1M +
      completionTokens * pricing.outputPricePer1M) /
    ONE_MILLION;

  return {
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    providerCostUsd: roundUsd(providerCostUsd),
    customerChargeUsd: roundUsd(customerChargeUsd),
    profitUsd: roundUsd(customerChargeUsd - providerCostUsd),
  };
}

export function calculateActualCosts(
  promptTokens: number,
  completionTokens: number,
  pricing: ModelPricingRow
): TokenCostEstimate {
  return calculateTokenCosts(promptTokens, completionTokens, pricing);
}

function roundUsd(value: number): number {
  return Math.round(value * 1e8) / 1e8;
}
