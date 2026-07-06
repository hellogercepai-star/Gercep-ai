export interface UsageLogRow {
  id: string;
  api_key_id: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  customer_charge?: number | null;
  plan_slug?: string | null;
  created_at: string;
}

export interface UsageSummary {
  requests: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalCostUsd: number;
}

export interface UsageByKey {
  apiKeyId: string;
  keyName: string;
  keyPrefix: string;
  requests: number;
  totalTokens: number;
}

export interface UsageRecentEntry {
  id: string;
  apiKeyId: string;
  keyName: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number | null;
  planSlug: string | null;
  createdAt: string;
}

function emptySummary(): UsageSummary {
  return {
    requests: 0,
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalCostUsd: 0,
  };
}

function sumLogs(logs: UsageLogRow[]): UsageSummary {
  return logs.reduce(
    (acc, log) => ({
      requests: acc.requests + 1,
      totalTokens: acc.totalTokens + log.total_tokens,
      promptTokens: acc.promptTokens + log.prompt_tokens,
      completionTokens: acc.completionTokens + log.completion_tokens,
      totalCostUsd: acc.totalCostUsd + Number(log.customer_charge ?? 0),
    }),
    emptySummary()
  );
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function buildUsageStats(
  logs: UsageLogRow[],
  keyMap: Map<string, { name: string; keyPrefix: string }>
) {
  const todayStart = startOfToday();
  const monthStart = startOfMonth();

  const todayLogs = logs.filter((l) => new Date(l.created_at) >= todayStart);
  const monthLogs = logs.filter((l) => new Date(l.created_at) >= monthStart);

  const byKeyMap = new Map<string, UsageByKey>();
  for (const log of monthLogs) {
    const key = keyMap.get(log.api_key_id);
    const existing = byKeyMap.get(log.api_key_id);
    if (existing) {
      existing.requests += 1;
      existing.totalTokens += log.total_tokens;
    } else {
      byKeyMap.set(log.api_key_id, {
        apiKeyId: log.api_key_id,
        keyName: key?.name ?? "Unknown key",
        keyPrefix: key?.keyPrefix ?? "sk-gercep-...",
        requests: 1,
        totalTokens: log.total_tokens,
      });
    }
  }

  const recent: UsageRecentEntry[] = logs.slice(0, 30).map((log) => {
    const key = keyMap.get(log.api_key_id);
    return {
      id: log.id,
      apiKeyId: log.api_key_id,
      keyName: key?.name ?? "Unknown key",
      model: log.model,
      promptTokens: log.prompt_tokens,
      completionTokens: log.completion_tokens,
      totalTokens: log.total_tokens,
      costUsd: log.customer_charge != null ? Number(log.customer_charge) : null,
      planSlug: log.plan_slug ?? null,
      createdAt: log.created_at,
    };
  });

  return {
    summary: {
      today: sumLogs(todayLogs),
      month: sumLogs(monthLogs),
      allTime: sumLogs(logs),
    },
    byKey: Array.from(byKeyMap.values()).sort(
      (a, b) => b.totalTokens - a.totalTokens
    ),
    recent,
  };
}
