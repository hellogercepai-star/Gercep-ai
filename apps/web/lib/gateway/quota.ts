import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchGercepBalanceResult,
  getGercepMintAddress,
} from "@/lib/wallet/balance";
import { nextTier, tierForBalance, type QuotaTier } from "@/lib/wallet/tiers";
import { startOfToday } from "@/lib/gateway/usage-stats";

export interface WalletQuotaInfo {
  tier: QuotaTier;
  dailyRequests: number;
  usedToday: number;
  remainingToday: number;
  gercepBalance: number | null;
  mintConfigured: boolean;
  walletLinked: boolean;
  balanceReadable: boolean;
  nextTier: QuotaTier | null;
  tokensToNextTier: number | null;
  note: string;
}

async function countTodayRequests(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfToday().toISOString());

  if (error) return 0;
  return count ?? 0;
}

export async function getWalletQuotaForUser(
  supabase: SupabaseClient,
  userId: string,
  walletAddress?: string | null
): Promise<WalletQuotaInfo> {
  const mintConfigured = Boolean(getGercepMintAddress());
  const walletLinked = Boolean(walletAddress);
  const usedToday = await countTodayRequests(supabase, userId);

  let gercepBalance: number | null = null;
  let balanceReadable = !mintConfigured;

  if (walletAddress && mintConfigured) {
    const result = await fetchGercepBalanceResult(walletAddress);
    if (result.status === "ok") {
      gercepBalance = result.balance;
      balanceReadable = true;
    } else if (result.status === "error") {
      balanceReadable = false;
      gercepBalance = null;
    }
  }

  const balanceForTier = balanceReadable ? (gercepBalance ?? 0) : 0;
  const tier = walletLinked ? tierForBalance(balanceForTier) : tierForBalance(0);
  const upcoming = nextTier(tier);
  const remainingToday = Math.max(0, tier.dailyRequests - usedToday);

  let note: string;
  if (!walletLinked) {
    note = "Connect Phantom → Sign & Link. Token $GERCEP belum launch — tier Beta tetap aktif.";
  } else if (!mintConfigured) {
    note = "Token $GERCEP belum launch — tier Beta (1.000 req/hari) aktif untuk wallet kamu.";
  } else if (!balanceReadable) {
    note =
      "Balance sementara tidak terbaca (RPC sibuk atau mint belum live). Tier Beta (1.000 req/hari) tetap aktif.";
  } else if (gercepBalance === 0 && upcoming) {
    note = `Wallet ter-link — hold ${formatTokens(upcoming.minBalance)} $GERCEP untuk tier ${upcoming.label}. Saat ini tier Beta aktif.`;
  } else if (upcoming) {
    note = `Hold ${formatTokens(upcoming.minBalance - balanceForTier)} $GERCEP lagi untuk tier ${upcoming.label}.`;
  } else {
    note = "Tier maksimum tercapai.";
  }

  return {
    tier,
    dailyRequests: tier.dailyRequests,
    usedToday,
    remainingToday,
    gercepBalance,
    mintConfigured,
    walletLinked,
    balanceReadable,
    nextTier: upcoming,
    tokensToNextTier: upcoming
      ? Math.max(0, upcoming.minBalance - balanceForTier)
      : null,
    note,
  };
}

export async function assertWithinDailyQuota(
  supabase: SupabaseClient,
  userId: string
): Promise<{ ok: true } | { ok: false; message: string; quota: WalletQuotaInfo }> {
  const { data: wallet } = await supabase
    .from("wallet_links")
    .select("address")
    .eq("user_id", userId)
    .maybeSingle();

  const quota = await getWalletQuotaForUser(
    supabase,
    userId,
    wallet?.address ?? null
  );

  if (quota.usedToday >= quota.dailyRequests) {
    return {
      ok: false,
      message: `Daily quota habis (${quota.dailyRequests} req/day, tier ${quota.tier.label}). Link wallet & hold $GERCEP untuk naik tier.`,
      quota,
    };
  }

  return { ok: true };
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
