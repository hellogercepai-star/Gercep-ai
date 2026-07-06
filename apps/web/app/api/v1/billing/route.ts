import { NextResponse } from "next/server";
import { GatewayRepository } from "@/lib/repositories/gateway.repository";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** GET /api/v1/billing — saldo, plan, dan riwayat transaksi user */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const repo = new GatewayRepository(admin);

  const subscription = await repo.getActiveSubscription(user.id);
  const balanceUsd = await repo.getAccountBalanceUsd(user.id);

  const { data: transactions } = await admin
    .from("billing_transactions")
    .select("id, type, amount_usd, note, created_at, created_by")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({
    balanceUsd,
    plan: subscription
      ? {
          slug: subscription.plan.slug,
          name: subscription.plan.name,
          payAsYouGo: subscription.plan.payAsYouGo,
          requiresPositiveBalance: subscription.plan.requiresPositiveBalance,
        }
      : null,
    transactions: (transactions ?? []).map((tx) => ({
      id: tx.id,
      type: tx.type,
      amountUsd: Number(tx.amount_usd),
      note: tx.note,
      createdAt: tx.created_at,
      createdBy: tx.created_by,
    })),
  });
}
