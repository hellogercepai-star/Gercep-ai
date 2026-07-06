import { NextRequest, NextResponse } from "next/server";
import { withAdminDb } from "@/lib/gateway/admin-handler";
import { AdminRepository } from "@/lib/repositories/admin.repository";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]!);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const v = row[h];
          const s = v == null ? "" : String(v);
          return s.includes(",") ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    ),
  ];
  return lines.join("\n");
}

export async function GET(request: NextRequest) {
  return withAdminDb(request, async (db) => {
    const sp = request.nextUrl.searchParams;
    const repo = new AdminRepository(db);
    const rows = await repo.exportUsage({
      from: sp.get("from") ?? undefined,
      to: sp.get("to") ?? undefined,
      userId: sp.get("userId") ?? undefined,
      model: sp.get("model") ?? undefined,
    });

    const format = sp.get("format") ?? "json";
    if (format === "csv") {
      const csv = toCsv(rows as Record<string, unknown>[]);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="gercep-usage-export.csv"`,
        },
      });
    }

    return NextResponse.json({ count: rows.length, rows });
  });
}
