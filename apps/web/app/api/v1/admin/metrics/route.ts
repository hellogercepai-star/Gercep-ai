import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/gateway/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { GatewayRepository } from "@/lib/repositories/gateway.repository";

// GET /api/v1/admin/metrics — revenue, cost, profit (admin only)
export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server config error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const repo = new GatewayRepository(admin);
  const metrics = await repo.getAdminMetrics();

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    ...metrics,
    estimatedGrossProfitTodayUsd: metrics.profitTodayUsd,
    estimatedGrossProfitMonthUsd: metrics.profitMonthUsd,
    estimatedAiCostTodayUsd: metrics.providerCostTodayUsd,
    estimatedAiCostMonthUsd: metrics.providerCostMonthUsd,
    estimatedRevenueTodayUsd: metrics.revenueTodayUsd,
    estimatedRevenueMonthUsd: metrics.revenueMonthUsd,
  });
}
