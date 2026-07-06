import { NextRequest, NextResponse } from "next/server";
import { withAdminDb } from "@/lib/gateway/admin-handler";
import { AdminRepository } from "@/lib/repositories/admin.repository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return withAdminDb(request, async (db) => {
    const repo = new AdminRepository(db);
    const detail = await repo.getCustomerDetail(userId);
    return NextResponse.json(detail);
  });
}
