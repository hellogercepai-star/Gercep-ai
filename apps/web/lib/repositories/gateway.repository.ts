import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CostProtectionConfig,
  GatewayPlan,
  GatewaySubscription,
  ModelPricingRow,
} from "@/types/gateway-billing";

interface PlanRow {
  id: string;
  slug: string;
  name: string;
  daily_request_limit: number;
  monthly_token_limit: number | null;
  requests_per_minute: number;
  pay_as_you_go: boolean;
  requires_positive_balance: boolean;
  included_credit_usd: string | number;
}

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  plans: PlanRow | PlanRow[] | null;
}

function normalizePlanRow(
  plans: PlanRow | PlanRow[] | null | undefined
): PlanRow | null {
  if (!plans) return null;
  if (Array.isArray(plans)) return plans[0] ?? null;
  return plans;
}

function mapPlan(row: PlanRow): GatewayPlan {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    dailyRequestLimit: row.daily_request_limit,
    monthlyTokenLimit: row.monthly_token_limit,
    requestsPerMinute: row.requests_per_minute,
    payAsYouGo: row.pay_as_you_go,
    requiresPositiveBalance: row.requires_positive_balance,
    includedCreditUsd: Number(row.included_credit_usd),
  };
}

export class GatewayRepository {
  constructor(private readonly db: SupabaseClient) {}

  async getCostProtectionConfig(): Promise<CostProtectionConfig> {
    const { data } = await this.db
      .from("gateway_settings")
      .select("value")
      .eq("key", "cost_protection")
      .maybeSingle();

    const value = (data?.value ?? {}) as Partial<CostProtectionConfig>;
    return {
      enabled: value.enabled ?? true,
      maxEstimatedCostPerRequestUsd:
        value.maxEstimatedCostPerRequestUsd ?? 1.0,
      blockOnNegativeBalance: value.blockOnNegativeBalance ?? true,
    };
  }

  async getDefaultPlanSlug(): Promise<string> {
    const { data } = await this.db
      .from("gateway_settings")
      .select("value")
      .eq("key", "default_plan_slug")
      .maybeSingle();
    const slug = data?.value;
    return typeof slug === "string" ? slug.replace(/"/g, "") : "beta";
  }

  async getPlanBySlug(slug: string): Promise<GatewayPlan | null> {
    const { data, error } = await this.db
      .from("plans")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error || !data) return null;
    return mapPlan(data as PlanRow);
  }

  async getActiveSubscription(userId: string): Promise<GatewaySubscription | null> {
    const { data, error } = await this.db
      .from("subscriptions")
      .select("id, user_id, plan_id, status, plans(*)")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;
    const row = data as unknown as SubscriptionRow;
    const planRow = normalizePlanRow(row.plans);
    if (!planRow) return null;

    return {
      id: row.id,
      userId: row.user_id,
      planId: row.plan_id,
      status: row.status as GatewaySubscription["status"],
      plan: mapPlan(planRow),
    };
  }

  async ensureDefaultSubscription(userId: string): Promise<GatewaySubscription | null> {
    const existing = await this.getActiveSubscription(userId);
    if (existing) return existing;

    const slug = await this.getDefaultPlanSlug();
    const plan = await this.getPlanBySlug(slug);
    if (!plan) return null;

    const { data, error } = await this.db
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan_id: plan.id,
        status: "active",
      })
      .select("id, user_id, plan_id, status, plans(*)")
      .single();

    if (error || !data) return null;
    const row = data as unknown as SubscriptionRow;
    const planRow = normalizePlanRow(row.plans);
    if (!planRow) return null;

    return {
      id: row.id,
      userId: row.user_id,
      planId: row.plan_id,
      status: row.status as GatewaySubscription["status"],
      plan: mapPlan(planRow),
    };
  }

  async getModelPricing(modelId: string): Promise<ModelPricingRow | null> {
    const { data: modelRow, error: modelError } = await this.db
      .from("provider_models")
      .select("id, model_id, enabled, default_max_output_tokens")
      .eq("model_id", modelId)
      .maybeSingle();

    if (modelError || !modelRow || !modelRow.enabled) return null;

    const { data: pricing } = await this.db
      .from("model_pricing")
      .select("input_price_per_1m, output_price_per_1m")
      .eq("provider_model_id", modelRow.id)
      .is("effective_until", null)
      .order("effective_from", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: cost } = await this.db
      .from("provider_model_costs")
      .select("input_cost_per_1m, output_cost_per_1m")
      .eq("provider_model_id", modelRow.id)
      .is("effective_until", null)
      .order("effective_from", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!pricing || !cost) return null;

    return {
      modelId: modelRow.model_id,
      inputPricePer1M: Number(pricing.input_price_per_1m),
      outputPricePer1M: Number(pricing.output_price_per_1m),
      inputCostPer1M: Number(cost.input_cost_per_1m),
      outputCostPer1M: Number(cost.output_cost_per_1m),
      defaultMaxOutputTokens: modelRow.default_max_output_tokens,
      enabled: modelRow.enabled,
    };
  }

  async getAccountBalanceUsd(userId: string): Promise<number> {
    const { data } = await this.db
      .from("account_balances")
      .select("balance_usd")
      .eq("user_id", userId)
      .maybeSingle();
    return data ? Number(data.balance_usd) : 0;
  }

  async countRequestsSince(userId: string, sinceIso: string): Promise<number> {
    const { count } = await this.db
      .from("usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", sinceIso);
    return count ?? 0;
  }

  async sumTokensSince(userId: string, sinceIso: string): Promise<number> {
    const { data } = await this.db
      .from("usage_logs")
      .select("total_tokens")
      .eq("user_id", userId)
      .gte("created_at", sinceIso);

    return (data ?? []).reduce(
      (sum, row) => sum + (row.total_tokens ?? 0),
      0
    );
  }

  async deductBalanceUsd(
    userId: string,
    amountUsd: number,
    meta?: { requestId?: string; model?: string }
  ): Promise<{ ok: boolean; balanceUsd?: number }> {
    if (amountUsd <= 0) {
      return { ok: true, balanceUsd: await this.getAccountBalanceUsd(userId) };
    }

    const balance = await this.getAccountBalanceUsd(userId);
    if (balance < amountUsd) return { ok: false };

    const next = balance - amountUsd;
    const { error } = await this.db.from("account_balances").upsert({
      user_id: userId,
      balance_usd: next,
      updated_at: new Date().toISOString(),
    });

    if (error) return { ok: false };

    const note = meta?.requestId
      ? `API ${meta.model ?? "chat"} · ${meta.requestId}`
      : "API usage charge";

    await this.db.from("billing_transactions").insert({
      user_id: userId,
      type: "charge",
      amount_usd: amountUsd,
      note,
      created_by: "system",
    });

    return { ok: true, balanceUsd: next };
  }

  async insertUsageLog(input: {
    apiKeyId: string;
    userId: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    requestId: string;
    status: string;
    latencyMs: number;
    estimatedPromptTokens: number;
    estimatedCompletionTokens: number;
    estimatedProviderCost: number;
    customerCharge: number;
    profitEstimation: number;
    planSlug: string;
  }): Promise<boolean> {
    const { error } = await this.db.from("usage_logs").insert({
      api_key_id: input.apiKeyId,
      user_id: input.userId,
      model: input.model,
      prompt_tokens: input.promptTokens,
      completion_tokens: input.completionTokens,
      total_tokens: input.totalTokens,
      request_id: input.requestId,
      status: input.status,
      latency_ms: input.latencyMs,
      estimated_prompt_tokens: input.estimatedPromptTokens,
      estimated_completion_tokens: input.estimatedCompletionTokens,
      estimated_provider_cost: input.estimatedProviderCost,
      customer_charge: input.customerCharge,
      profit_estimation: input.profitEstimation,
      plan_slug: input.planSlug,
    });
    return !error;
  }

  async getAdminMetrics() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { count: activeKeys } = await this.db
      .from("api_keys")
      .select("id", { count: "exact", head: true })
      .is("revoked_at", null);

    const { data: todayLogs } = await this.db
      .from("usage_logs")
      .select("total_tokens, customer_charge, estimated_provider_cost, profit_estimation, latency_ms, model, user_id")
      .gte("created_at", todayStart.toISOString());

    const { data: monthLogs } = await this.db
      .from("usage_logs")
      .select("total_tokens, customer_charge, estimated_provider_cost, profit_estimation")
      .gte("created_at", monthStart.toISOString());

    const sumField = (
      logs: Array<Record<string, unknown>>,
      field: string
    ) => logs.reduce((acc, row) => acc + Number(row[field] ?? 0), 0);

    const today = todayLogs ?? [];
    const month = monthLogs ?? [];

    const modelCounts = new Map<string, number>();
    for (const log of today) {
      modelCounts.set(log.model, (modelCounts.get(log.model) ?? 0) + 1);
    }

    const customerCounts = new Map<string, number>();
    for (const log of today) {
      customerCounts.set(log.user_id, (customerCounts.get(log.user_id) ?? 0) + 1);
    }

    const latencies = today
      .map((l) => l.latency_ms)
      .filter((n): n is number => typeof n === "number" && n > 0);

    return {
      activeApiKeys: activeKeys ?? 0,
      requestsToday: today.length,
      requestsThisMonth: month.length,
      revenueTodayUsd: sumField(today, "customer_charge"),
      revenueMonthUsd: sumField(month, "customer_charge"),
      providerCostTodayUsd: sumField(today, "estimated_provider_cost"),
      providerCostMonthUsd: sumField(month, "estimated_provider_cost"),
      profitTodayUsd: sumField(today, "profit_estimation"),
      profitMonthUsd: sumField(month, "profit_estimation"),
      tokensToday: sumField(today, "total_tokens"),
      tokensMonth: sumField(month, "total_tokens"),
      avgLatencyMsToday:
        latencies.length > 0
          ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
          : 0,
      topModelsToday: Array.from(modelCounts.entries())
        .map(([model, requests]) => ({ model, requests }))
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 10),
      topCustomersToday: Array.from(customerCounts.entries())
        .map(([userId, requests]) => ({ userId, requests }))
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 10),
    };
  }
}
