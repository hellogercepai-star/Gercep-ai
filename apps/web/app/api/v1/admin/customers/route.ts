import { NextRequest, NextResponse } from "next/server";
import { withAdminDb } from "@/lib/gateway/admin-handler";
import { AdminRepository } from "@/lib/repositories/admin.repository";

export async function GET(request: NextRequest) {
  return withAdminDb(request, async (db) => {
    const repo = new AdminRepository(db);
    const customers = await repo.listCustomers();
    return NextResponse.json({ customers });
  });
}

export async function POST(request: NextRequest) {
  return withAdminDb(request, async (db) => {
    const body = await request.json();
    const repo = new AdminRepository(db);

    if (body.action === "topup") {
      const result = await repo.topUpBalance(
        body.userId,
        Number(body.amountUsd),
        body.note ?? "Admin top-up"
      );
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      const { logAdminAudit } = await import("@/lib/gateway/audit-log");
      await logAdminAudit(db, {
        action: "customer.topup",
        resourceType: "user",
        resourceId: body.userId,
        metadata: { amountUsd: body.amountUsd },
      });
      return NextResponse.json({ balanceUsd: result.balanceUsd });
    }

    if (body.action === "rate_override") {
      await repo.setRateOverride(body.userId, {
        dailyRequestLimit: body.dailyRequestLimit,
        requestsPerMinute: body.requestsPerMinute,
        note: body.note,
      });
      const { logAdminAudit } = await import("@/lib/gateway/audit-log");
      await logAdminAudit(db, {
        action: "customer.rate_override",
        resourceType: "user",
        resourceId: body.userId,
        metadata: body,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  });
}
