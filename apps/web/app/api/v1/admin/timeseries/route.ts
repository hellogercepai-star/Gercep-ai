import { NextRequest, NextResponse } from "next/server";
import { withAdminDb } from "@/lib/gateway/admin-handler";
import { AdminRepository } from "@/lib/repositories/admin.repository";

export async function GET(request: NextRequest) {
  return withAdminDb(request, async (db) => {
    const days = Math.min(
      90,
      Math.max(7, Number(request.nextUrl.searchParams.get("days") ?? 30))
    );
    const repo = new AdminRepository(db);
    const series = await repo.getTimeSeries(days);
    return NextResponse.json({ days, series });
  });
}
