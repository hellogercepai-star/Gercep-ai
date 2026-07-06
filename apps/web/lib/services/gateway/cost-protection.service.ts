import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatCompletionRequest } from "@/lib/ai-providers/types";
import { assertWithinDailyQuota } from "@/lib/gateway/quota";
import { startOfToday, startOfMonth } from "@/lib/gateway/usage-stats";
import { GatewayRepository } from "@/lib/repositories/gateway.repository";
import {
  calculateTokenCosts,
  estimateCompletionTokens,
  estimatePromptTokens,
} from "@/lib/services/gateway/pricing.service";
import type {
  CostProtectionDenyCode,
  CostProtectionResult,
} from "@/types/gateway-billing";

/**
 * AI Cost Protection — pre-flight gate before any provider call.
 * Validates subscription, quotas, rate limits, and estimated cost vs balance.
 */
export class CostProtectionService {
  private readonly repo: GatewayRepository;
  private readonly db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
    this.repo = new GatewayRepository(db);
  }

  async evaluatePreRequest(
    userId: string,
    body: ChatCompletionRequest
  ): Promise<CostProtectionResult> {
    const config = await this.repo.getCostProtectionConfig();
    const requestId = randomUUID();

    if (!config.enabled) {
      const sub = await this.repo.ensureDefaultSubscription(userId);
      if (!sub) {
        return deny(
          "pricing_unavailable",
          "Gateway billing belum dikonfigurasi. Jalankan migration 004_gateway_billing.sql.",
          403
        );
      }
      return {
        allowed: true,
        requestId,
        estimate: zeroEstimate(),
        subscription: sub,
      };
    }

    const subscription = await this.repo.ensureDefaultSubscription(userId);
    if (!subscription) {
      return deny(
        "pricing_unavailable",
        "Subscription plan tidak tersedia. Hubungi admin.",
        403
      );
    }

    if (
      subscription.status !== "active" &&
      subscription.status !== "trialing"
    ) {
      return deny(
        "subscription_inactive",
        `Subscription ${subscription.status}. Perbarui paket untuk melanjutkan.`,
        403
      );
    }

    const plan = subscription.plan;

    const { data: override } = await this.db
      .from("customer_rate_overrides")
      .select("daily_request_limit, requests_per_minute")
      .eq("user_id", userId)
      .maybeSingle();

    const effectiveRpm =
      override?.requests_per_minute ?? plan.requestsPerMinute;
    const pricing = await this.repo.getModelPricing(body.model);
    if (!pricing) {
      return deny(
        "pricing_unavailable",
        `Model '${body.model}' belum dikonfigurasi di billing. Hubungi admin.`,
        403
      );
    }

    if (!pricing.enabled) {
      return deny(
        "model_disabled",
        `Model '${body.model}' dinonaktifkan admin.`,
        403
      );
    }

    const walletQuota = await assertWithinDailyQuota(this.db, userId);
    if (!walletQuota.ok) {
      return deny("wallet_quota_exceeded", walletQuota.message, 429);
    }

    const todayStart = startOfToday().toISOString();
    const requestsToday = await this.repo.countRequestsSince(userId, todayStart);
    const effectiveDailyLimit = Math.max(
      override?.daily_request_limit ?? plan.dailyRequestLimit,
      walletQuota.quota.dailyRequests
    );

    if (requestsToday >= effectiveDailyLimit) {
      return deny(
        "daily_quota_exceeded",
        `Daily quota habis (${effectiveDailyLimit} req/day, plan ${plan.name}).`,
        429
      );
    }

    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const requestsLastMinute = await this.repo.countRequestsSince(
      userId,
      oneMinuteAgo
    );
    if (requestsLastMinute >= effectiveRpm) {
      return deny(
        "rate_limit_exceeded",
        `Rate limit ${effectiveRpm} req/menit. Tunggu sebentar.`,
        429
      );
    }

    if (plan.monthlyTokenLimit != null) {
      const monthStart = startOfMonth().toISOString();
      const tokensThisMonth = await this.repo.sumTokensSince(userId, monthStart);
      if (tokensThisMonth >= plan.monthlyTokenLimit) {
        return deny(
          "monthly_token_limit",
          `Monthly token limit habis (${plan.monthlyTokenLimit.toLocaleString()} tokens).`,
          429
        );
      }
    }

    const promptTokens = estimatePromptTokens(body.messages);
    const completionTokens = estimateCompletionTokens(
      body.max_tokens,
      pricing.defaultMaxOutputTokens
    );
    const estimate = calculateTokenCosts(
      promptTokens,
      completionTokens,
      pricing
    );

    if (estimate.customerChargeUsd > config.maxEstimatedCostPerRequestUsd) {
      return deny(
        "cost_cap_exceeded",
        `Perkiraan biaya request ($${estimate.customerChargeUsd.toFixed(4)}) melebihi batas $${config.maxEstimatedCostPerRequestUsd}. Kurangi max_tokens.`,
        402
      );
    }

    if (plan.requiresPositiveBalance || plan.payAsYouGo) {
      const balance = await this.repo.getAccountBalanceUsd(userId);
      const required = estimate.customerChargeUsd;

      if (config.blockOnNegativeBalance && balance < required) {
        return deny(
          "insufficient_balance",
          `Saldo tidak cukup ($${balance.toFixed(4)}). Estimasi request: $${required.toFixed(4)}. Top up untuk Pay As You Go.`,
          402
        );
      }
    }

    return {
      allowed: true,
      requestId,
      estimate,
      subscription,
    };
  }
}

function deny(
  code: CostProtectionDenyCode,
  message: string,
  httpStatus: 402 | 403 | 429
): CostProtectionResult {
  return { allowed: false, code, message, httpStatus };
}

function zeroEstimate() {
  return {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    providerCostUsd: 0,
    customerChargeUsd: 0,
    profitUsd: 0,
  };
}
