import { NextRequest, NextResponse } from "next/server";
import { logAdminAudit } from "@/lib/gateway/audit-log";
import { withAdminDb } from "@/lib/gateway/admin-handler";
import { AdminRepository } from "@/lib/repositories/admin.repository";

export async function GET(request: NextRequest) {
  return withAdminDb(request, async (db) => {
    const repo = new AdminRepository(db);
    const data = await repo.listProvidersWithModels();
    return NextResponse.json(data);
  });
}

export async function PATCH(request: NextRequest) {
  return withAdminDb(request, async (db) => {
    const body = await request.json();
    const repo = new AdminRepository(db);

    if (body.action === "toggle_provider") {
      await repo.toggleProvider(body.id, Boolean(body.enabled));
      await logAdminAudit(db, {
        action: "provider.toggle",
        resourceId: body.id,
        metadata: { enabled: body.enabled },
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "toggle_model") {
      await repo.toggleModel(body.id, Boolean(body.enabled));
      await logAdminAudit(db, {
        action: "model.toggle",
        resourceId: body.id,
        metadata: { enabled: body.enabled },
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "update_pricing") {
      const { error } = await repo.updateModelPricing(
        body.providerModelId,
        Number(body.inputPricePer1M),
        Number(body.outputPricePer1M)
      );
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      await logAdminAudit(db, {
        action: "pricing.update",
        resourceId: body.providerModelId,
        metadata: body,
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "update_costs") {
      const { error } = await repo.updateModelCosts(
        body.providerModelId,
        Number(body.inputCostPer1M),
        Number(body.outputCostPer1M)
      );
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      await logAdminAudit(db, {
        action: "provider_cost.update",
        resourceId: body.providerModelId,
        metadata: body,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  });
}
