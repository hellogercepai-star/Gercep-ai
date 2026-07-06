export interface GatewayPlan {
  id: string;
  slug: string;
  name: string;
  dailyRequestLimit: number;
  monthlyTokenLimit: number | null;
  requestsPerMinute: number;
  payAsYouGo: boolean;
  requiresPositiveBalance: boolean;
  includedCreditUsd: number;
}

export interface GatewaySubscription {
  id: string;
  userId: string;
  planId: string;
  status: "active" | "past_due" | "canceled" | "trialing";
  plan: GatewayPlan;
}

export interface ModelPricingRow {
  modelId: string;
  inputPricePer1M: number;
  outputPricePer1M: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  defaultMaxOutputTokens: number;
  enabled: boolean;
}

export interface TokenCostEstimate {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  providerCostUsd: number;
  customerChargeUsd: number;
  profitUsd: number;
}

export interface CostProtectionConfig {
  enabled: boolean;
  maxEstimatedCostPerRequestUsd: number;
  blockOnNegativeBalance: boolean;
}

export type CostProtectionDenyCode =
  | "subscription_inactive"
  | "daily_quota_exceeded"
  | "monthly_token_limit"
  | "rate_limit_exceeded"
  | "insufficient_balance"
  | "cost_cap_exceeded"
  | "model_disabled"
  | "pricing_unavailable"
  | "wallet_quota_exceeded";

export type CostProtectionResult =
  | {
      allowed: true;
      requestId: string;
      estimate: TokenCostEstimate;
      subscription: GatewaySubscription;
    }
  | {
      allowed: false;
      code: CostProtectionDenyCode;
      message: string;
      httpStatus: 402 | 403 | 429;
      requestId: string;
      planSlug?: string;
      estimate?: TokenCostEstimate;
    };

export interface UsageLogCostFields {
  requestId: string;
  status: string;
  latencyMs: number;
  estimatedPromptTokens: number;
  estimatedCompletionTokens: number;
  estimatedProviderCost: number;
  customerCharge: number;
  profitEstimation: number;
  planSlug: string;
}
