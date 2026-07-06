import { NextRequest, NextResponse } from "next/server";
import { logAdminAudit } from "@/lib/gateway/audit-log";
import { withAdminDb } from "@/lib/gateway/admin-handler";
import { AdminRepository } from "@/lib/repositories/admin.repository";
import type { CostProtectionConfig } from "@/types/gateway-billing";

export async function GET(request: NextRequest) {
  return withAdminDb(request, async (db) => {
    const repo = new AdminRepository(db);
    const costProtection = await repo.getSetting<CostProtectionConfig>(
      "cost_protection",
      {
        enabled: true,
        maxEstimatedCostPerRequestUsd: 1,
        blockOnNegativeBalance: true,
      }
    );
    const alertConfig = await repo.getSetting("alert_config", {});
    const stripeConfig = await repo.getSetting("stripe_config", {
      enabled: false,
    });
    return NextResponse.json({ costProtection, alertConfig, stripeConfig });
  });
}

export async function PATCH(request: NextRequest) {
  return withAdminDb(request, async (db) => {
    const body = await request.json();
    const repo = new AdminRepository(db);

    if (body.costProtection) {
      await repo.updateCostProtection(body.costProtection);
      await logAdminAudit(db, {
        action: "settings.cost_protection",
        metadata: body.costProtection,
      });
    }
    if (body.alertConfig) {
      await repo.upsertSetting("alert_config", body.alertConfig);
      await logAdminAudit(db, {
        action: "settings.alert_config",
        metadata: body.alertConfig,
      });
    }
    if (body.stripeConfig) {
      await repo.upsertSetting("stripe_config", body.stripeConfig);
      await logAdminAudit(db, {
        action: "settings.stripe_config",
        metadata: { enabled: body.stripeConfig.enabled },
      });
    }

    return NextResponse.json({ ok: true });
  });
}
