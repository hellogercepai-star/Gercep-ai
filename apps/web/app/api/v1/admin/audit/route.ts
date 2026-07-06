import { NextRequest, NextResponse } from "next/server";
import { withAdminDb } from "@/lib/gateway/admin-handler";
import { AdminRepository } from "@/lib/repositories/admin.repository";

export async function GET(request: NextRequest) {
  return withAdminDb(request, async (db) => {
    const repo = new AdminRepository(db);
    const logs = await repo.listAuditLogs(100);
    return NextResponse.json({ logs });
  });
}
