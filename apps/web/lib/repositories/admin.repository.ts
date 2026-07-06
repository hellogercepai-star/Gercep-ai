import type { SupabaseClient } from "@supabase/supabase-js";
import type { CostProtectionConfig } from "@/types/gateway-billing";

export interface DailyTimeSeriesPoint {
  date: string;
  requests: number;
  tokens: number;
  revenueUsd: number;
  providerCostUsd: number;
  profitUsd: number;
}

export class AdminRepository {
  constructor(private readonly db: SupabaseClient) {}

  async getTimeSeries(days: number): Promise<DailyTimeSeriesPoint[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const { data } = await this.db
      .from("usage_logs")
      .select(
        "created_at, total_tokens, customer_charge, estimated_provider_cost, profit_estimation"
      )
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true });

    const byDay = new Map<string, DailyTimeSeriesPoint>();

    for (let i = 0; i <= days; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, {
        date: key,
        requests: 0,
        tokens: 0,
        revenueUsd: 0,
        providerCostUsd: 0,
        profitUsd: 0,
      });
    }

    for (const row of data ?? []) {
      const key = row.created_at.slice(0, 10);
      const point = byDay.get(key);
      if (!point) continue;
      point.requests += 1;
      point.tokens += row.total_tokens ?? 0;
      point.revenueUsd += Number(row.customer_charge ?? 0);
      point.providerCostUsd += Number(row.estimated_provider_cost ?? 0);
      point.profitUsd += Number(row.profit_estimation ?? 0);
    }

    return Array.from(byDay.values());
  }

  async listPlans() {
    const { data } = await this.db
      .from("plans")
      .select("*")
      .order("sort_order");
    return data ?? [];
  }

  async updatePlan(
    id: string,
    patch: Partial<{
      name: string;
      daily_request_limit: number;
      monthly_token_limit: number | null;
      requests_per_minute: number;
      pay_as_you_go: boolean;
      requires_positive_balance: boolean;
      is_active: boolean;
    }>
  ) {
    const { data, error } = await this.db
      .from("plans")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    return { data, error };
  }

  async listProvidersWithModels() {
    const { data: providers } = await this.db
      .from("ai_providers")
      .select("*")
      .order("name");

    const { data: models } = await this.db
      .from("provider_models")
      .select("*")
      .order("model_id");

    const enriched = await Promise.all(
      (models ?? []).map(async (model) => {
        const { data: pricing } = await this.db
          .from("model_pricing")
          .select("input_price_per_1m, output_price_per_1m, effective_from")
          .eq("provider_model_id", model.id)
          .is("effective_until", null)
          .order("effective_from", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data: costs } = await this.db
          .from("provider_model_costs")
          .select("input_cost_per_1m, output_cost_per_1m, effective_from")
          .eq("provider_model_id", model.id)
          .is("effective_until", null)
          .order("effective_from", { ascending: false })
          .limit(1)
          .maybeSingle();

        return { ...model, active_pricing: pricing, active_costs: costs };
      })
    );

    return { providers: providers ?? [], models: enriched };
  }

  async toggleProvider(id: string, enabled: boolean) {
    return this.db
      .from("ai_providers")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  async toggleModel(id: string, enabled: boolean) {
    return this.db
      .from("provider_models")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  async updateModelPricing(
    providerModelId: string,
    inputPrice: number,
    outputPrice: number
  ) {
    await this.db
      .from("model_pricing")
      .update({ effective_until: new Date().toISOString() })
      .eq("provider_model_id", providerModelId)
      .is("effective_until", null);

    const { error } = await this.db.from("model_pricing").insert({
      provider_model_id: providerModelId,
      input_price_per_1m: inputPrice,
      output_price_per_1m: outputPrice,
    });
    return { error };
  }

  async updateModelCosts(
    providerModelId: string,
    inputCost: number,
    outputCost: number
  ) {
    await this.db
      .from("provider_model_costs")
      .update({ effective_until: new Date().toISOString() })
      .eq("provider_model_id", providerModelId)
      .is("effective_until", null);

    const { error } = await this.db.from("provider_model_costs").insert({
      provider_model_id: providerModelId,
      input_cost_per_1m: inputCost,
      output_cost_per_1m: outputCost,
    });
    return { error };
  }

  async getSetting<T>(key: string, fallback: T): Promise<T> {
    const { data } = await this.db
      .from("gateway_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    return (data?.value as T) ?? fallback;
  }

  async upsertSetting(key: string, value: unknown, description?: string) {
    return this.db.from("gateway_settings").upsert({
      key,
      value,
      description,
      updated_at: new Date().toISOString(),
    });
  }

  async listApiKeys() {
    const { data } = await this.db
      .from("api_keys")
      .select("id, user_id, name, key_prefix, created_at, revoked_at, last_used_at")
      .order("created_at", { ascending: false });
    return data ?? [];
  }

  async revokeApiKey(id: string) {
    return this.db
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id)
      .is("revoked_at", null);
  }

  async listCustomers(limit = 50) {
    const { data: subs } = await this.db
      .from("subscriptions")
      .select("user_id, status, plans(slug, name)")
      .limit(limit);

    const userIds = (subs ?? []).map((s) => s.user_id);
    if (userIds.length === 0) return [];

    const { data: balances } = await this.db
      .from("account_balances")
      .select("user_id, balance_usd")
      .in("user_id", userIds);

    const { data: usage } = await this.db
      .from("usage_logs")
      .select("user_id, total_tokens, customer_charge")
      .in("user_id", userIds);

    const balanceMap = new Map(
      (balances ?? []).map((b) => [b.user_id, Number(b.balance_usd)])
    );

    const usageMap = new Map<
      string,
      { requests: number; tokens: number; revenue: number }
    >();
    for (const row of usage ?? []) {
      const cur = usageMap.get(row.user_id) ?? {
        requests: 0,
        tokens: 0,
        revenue: 0,
      };
      cur.requests += 1;
      cur.tokens += row.total_tokens ?? 0;
      cur.revenue += Number(row.customer_charge ?? 0);
      usageMap.set(row.user_id, cur);
    }

    return (subs ?? []).map((s) => {
      const planRaw = s.plans as { slug: string; name: string } | { slug: string; name: string }[] | null;
      const plan = Array.isArray(planRaw) ? planRaw[0] ?? null : planRaw;
      return {
        userId: s.user_id,
        status: s.status,
        plan,
        balanceUsd: balanceMap.get(s.user_id) ?? 0,
        ...(usageMap.get(s.user_id) ?? { requests: 0, tokens: 0, revenue: 0 }),
      };
    });
  }

  async getCustomerDetail(userId: string) {
    const { data: sub } = await this.db
      .from("subscriptions")
      .select("*, plans(*)")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: balance } = await this.db
      .from("account_balances")
      .select("balance_usd")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: override } = await this.db
      .from("customer_rate_overrides")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: keys } = await this.db
      .from("api_keys")
      .select("id, name, key_prefix, revoked_at, last_used_at, created_at")
      .eq("user_id", userId);

    const { data: txs } = await this.db
      .from("billing_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: recentUsage } = await this.db
      .from("usage_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: wallet } = await this.db
      .from("wallet_links")
      .select("address, verified_at")
      .eq("user_id", userId)
      .maybeSingle();

    return {
      subscription: sub,
      balanceUsd: balance ? Number(balance.balance_usd) : 0,
      rateOverride: override,
      apiKeys: keys ?? [],
      transactions: txs ?? [],
      recentUsage: recentUsage ?? [],
      wallet,
    };
  }

  async topUpBalance(userId: string, amountUsd: number, note: string) {
    const { data: existing } = await this.db
      .from("account_balances")
      .select("balance_usd")
      .eq("user_id", userId)
      .maybeSingle();

    const current = existing ? Number(existing.balance_usd) : 0;
    const next = current + amountUsd;
    if (next < 0) return { ok: false as const, error: "Balance cannot be negative." };

    await this.db.from("account_balances").upsert({
      user_id: userId,
      balance_usd: next,
      updated_at: new Date().toISOString(),
    });

    await this.db.from("billing_transactions").insert({
      user_id: userId,
      type: amountUsd >= 0 ? "topup" : "refund",
      amount_usd: amountUsd,
      note,
      created_by: "admin",
    });

    return { ok: true as const, balanceUsd: next };
  }

  async setRateOverride(
    userId: string,
    input: {
      dailyRequestLimit?: number | null;
      requestsPerMinute?: number | null;
      note?: string;
    }
  ) {
    return this.db.from("customer_rate_overrides").upsert({
      user_id: userId,
      daily_request_limit: input.dailyRequestLimit ?? null,
      requests_per_minute: input.requestsPerMinute ?? null,
      note: input.note ?? null,
      updated_at: new Date().toISOString(),
    });
  }

  async listAuditLogs(limit = 50) {
    const { data } = await this.db
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  }

  async listFailedRequests(limit = 50) {
    const { data } = await this.db
      .from("usage_logs")
      .select("*")
      .in("status", ["failed", "blocked"])
      .order("created_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  }

  async exportUsage(filters: {
    from?: string;
    to?: string;
    userId?: string;
    model?: string;
  }) {
    let q = this.db
      .from("usage_logs")
      .select(
        "created_at, user_id, model, prompt_tokens, completion_tokens, total_tokens, customer_charge, estimated_provider_cost, profit_estimation, status, plan_slug"
      )
      .order("created_at", { ascending: false })
      .limit(5000);

    if (filters.from) q = q.gte("created_at", filters.from);
    if (filters.to) q = q.lte("created_at", filters.to);
    if (filters.userId) q = q.eq("user_id", filters.userId);
    if (filters.model) q = q.eq("model", filters.model);

    const { data } = await q;
    return data ?? [];
  }

  async getAlerts(metrics: {
    profitTodayUsd: number;
    avgLatencyMsToday: number;
  }) {
    const alertConfig = await this.getSetting("alert_config", {
      profit_negative_alert: true,
      latency_ms_threshold: 8000,
      slack_webhook_url: "",
    });

    const alerts: {
      level: "critical" | "warning" | "info";
      message: string;
    }[] = [];

    if (alertConfig.profit_negative_alert && metrics.profitTodayUsd < 0) {
      alerts.push({
        level: "critical",
        message: "Gross profit today is negative — check pricing vs provider costs.",
      });
    }

    if (
      metrics.avgLatencyMsToday > 0 &&
      metrics.avgLatencyMsToday > alertConfig.latency_ms_threshold
    ) {
      alerts.push({
        level: "warning",
        message: `Avg latency ${(metrics.avgLatencyMsToday / 1000).toFixed(1)}s exceeds threshold.`,
      });
    }

    const { data: recentBlocked } = await this.db
      .from("usage_logs")
      .select("id")
      .eq("status", "blocked")
      .gte("created_at", new Date(Date.now() - 3600_000).toISOString());

    if ((recentBlocked?.length ?? 0) > 10) {
      alerts.push({
        level: "warning",
        message: `${recentBlocked?.length} blocked requests in the last hour — possible quota abuse.`,
      });
    }

    return { alerts, config: alertConfig };
  }

  async updateCostProtection(config: CostProtectionConfig) {
    return this.upsertSetting("cost_protection", config, "AI Cost Protection");
  }
}
