import type { SupabaseClient } from "@supabase/supabase-js";
import { GatewayRepository } from "@/lib/repositories/gateway.repository";
import { calculateActualCosts } from "@/lib/services/gateway/pricing.service";
import type { UsageLogCostFields } from "@/types/gateway-billing";

export class UsageLoggingService {
  private readonly repo: GatewayRepository;

  constructor(db: SupabaseClient) {
    this.repo = new GatewayRepository(db);
  }

  async logCompletedRequest(input: {
    apiKeyId: string;
    userId: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    requestId: string;
    latencyMs: number;
    planSlug: string;
    preEstimatePromptTokens: number;
    preEstimateCompletionTokens: number;
  }): Promise<UsageLogCostFields | null> {
    const pricing = await this.repo.getModelPricing(input.model);

    const costs = pricing
      ? calculateActualCosts(
          input.promptTokens,
          input.completionTokens,
          pricing
        )
      : {
          promptTokens: input.promptTokens,
          completionTokens: input.completionTokens,
          totalTokens: input.totalTokens,
          providerCostUsd: 0,
          customerChargeUsd: 0,
          profitUsd: 0,
        };

    const fields: UsageLogCostFields = {
      requestId: input.requestId,
      status: "completed",
      latencyMs: input.latencyMs,
      estimatedPromptTokens: input.preEstimatePromptTokens,
      estimatedCompletionTokens: input.preEstimateCompletionTokens,
      estimatedProviderCost: costs.providerCostUsd,
      customerCharge: costs.customerChargeUsd,
      profitEstimation: costs.profitUsd,
      planSlug: input.planSlug,
    };

    const ok = await this.repo.insertUsageLog({
      apiKeyId: input.apiKeyId,
      userId: input.userId,
      model: input.model,
      promptTokens: input.promptTokens,
      completionTokens: input.completionTokens,
      totalTokens: input.totalTokens,
      requestId: fields.requestId,
      status: fields.status,
      latencyMs: fields.latencyMs,
      estimatedPromptTokens: fields.estimatedPromptTokens,
      estimatedCompletionTokens: fields.estimatedCompletionTokens,
      estimatedProviderCost: fields.estimatedProviderCost,
      customerCharge: fields.customerCharge,
      profitEstimation: fields.profitEstimation,
      planSlug: fields.planSlug,
    });

    if (!ok) return null;

    const subscription = await this.repo.getActiveSubscription(input.userId);
    if (subscription?.plan.payAsYouGo && costs.customerChargeUsd > 0) {
      await this.repo.deductBalanceUsd(input.userId, costs.customerChargeUsd);
    }

    return fields;
  }
}
