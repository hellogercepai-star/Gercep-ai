import { NextRequest, NextResponse } from "next/server";
import { logAdminAudit } from "@/lib/gateway/audit-log";
import { withAdminDb } from "@/lib/gateway/admin-handler";
import { AdminRepository } from "@/lib/repositories/admin.repository";

export async function GET(request: NextRequest) {
  return withAdminDb(request, async (db) => {
    const repo = new AdminRepository(db);
    return NextResponse.json({ keys: await repo.listApiKeys() });
  });
}

export async function DELETE(request: NextRequest) {
  return withAdminDb(request, async (db) => {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const repo = new AdminRepository(db);
    await repo.revokeApiKey(id);
    await logAdminAudit(db, {
      action: "api_key.revoke",
      resourceType: "api_key",
      resourceId: id,
    });
    return NextResponse.json({ revoked: true });
  });
}
