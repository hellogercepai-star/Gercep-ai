import { NextRequest, NextResponse } from "next/server";
import { withAdminDb } from "@/lib/gateway/admin-handler";
import { AdminRepository } from "@/lib/repositories/admin.repository";
import { GatewayRepository } from "@/lib/repositories/gateway.repository";

export async function GET(request: NextRequest) {
  return withAdminDb(request, async (db) => {
    const gateway = new GatewayRepository(db);
    const admin = new AdminRepository(db);
    const metrics = await gateway.getAdminMetrics();
    const { alerts, config } = await admin.getAlerts({
      profitTodayUsd: metrics.profitTodayUsd,
      avgLatencyMsToday: metrics.avgLatencyMsToday,
    });
    const critical = alerts.filter((a) => a.level === "critical");
    if (critical.length > 0 && config.slack_webhook_url) {
      const { sendSlackAlerts } = await import("@/lib/gateway/slack-alerts");
      await sendSlackAlerts(config.slack_webhook_url, critical);
    }
    const failed = await admin.listFailedRequests(20);
    return NextResponse.json({ alerts, config, failedRequests: failed });
  });
}
