import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/gateway/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export function adminUnauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function adminDbUnavailable(err: unknown) {
  const msg = err instanceof Error ? err.message : "Server config error.";
  return NextResponse.json({ error: msg }, { status: 500 });
}

export async function withAdminDb(
  request: NextRequest,
  handler: (db: SupabaseClient) => Promise<NextResponse>
): Promise<NextResponse> {
  if (!isAdminAuthorized(request)) return adminUnauthorized();
  try {
    const db = createAdminClient();
    return await handler(db);
  } catch (err) {
    return adminDbUnavailable(err);
  }
}
