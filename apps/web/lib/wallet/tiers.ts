export interface QuotaTier {
  id: string;
  label: string;
  minBalance: number;
  dailyRequests: number;
}

/** Tier berdasarkan jumlah $GERCEP di wallet (human-readable, bukan raw lamports). */
export const GERCEP_TIERS: QuotaTier[] = [
  { id: "beta", label: "Beta", minBalance: 0, dailyRequests: 1_000 },
  { id: "holder", label: "Holder", minBalance: 1, dailyRequests: 5_000 },
  { id: "supporter", label: "Supporter", minBalance: 10_000, dailyRequests: 25_000 },
  { id: "whale", label: "Whale", minBalance: 100_000, dailyRequests: 100_000 },
];

export function tierForBalance(balance: number): QuotaTier {
  let matched = GERCEP_TIERS[0]!;
  for (const tier of GERCEP_TIERS) {
    if (balance >= tier.minBalance) matched = tier;
  }
  return matched;
}

export function nextTier(current: QuotaTier): QuotaTier | null {
  const idx = GERCEP_TIERS.findIndex((t) => t.id === current.id);
  if (idx < 0 || idx >= GERCEP_TIERS.length - 1) return null;
  return GERCEP_TIERS[idx + 1] ?? null;
}
