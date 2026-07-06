import { NextRequest, NextResponse } from "next/server";
import { logAdminAudit } from "@/lib/gateway/audit-log";
import { withAdminDb } from "@/lib/gateway/admin-handler";
import { AdminRepository } from "@/lib/repositories/admin.repository";

export async function GET(request: NextRequest) {
  return withAdminDb(request, async (db) => {
    const repo = new AdminRepository(db);
    return NextResponse.json({ plans: await repo.listPlans() });
  });
}

export async function PATCH(request: NextRequest) {
  return withAdminDb(request, async (db) => {
    const body = await request.json();
    const { id, ...patch } = body as { id: string };
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const repo = new AdminRepository(db);
    const { data, error } = await repo.updatePlan(id, patch);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    await logAdminAudit(db, {
      action: "plan.update",
      resourceType: "plan",
      resourceId: id,
      metadata: patch,
    });
    return NextResponse.json({ plan: data });
  });
}
