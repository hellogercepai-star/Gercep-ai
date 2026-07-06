import { NextResponse } from "next/server";
import { buildUsageStats, type UsageLogRow } from "@/lib/gateway/usage-stats";
import { createClient } from "@/lib/supabase/server";

interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
}

// GET /api/v1/usage — token usage summary & history (requires Supabase session)
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: keys, error: keysError } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix")
    .eq("user_id", user.id);

  if (keysError) {
    return NextResponse.json({ error: keysError.message }, { status: 500 });
  }

  const keyMap = new Map(
    ((keys ?? []) as ApiKeyRow[]).map((k) => [
      k.id,
      { name: k.name, keyPrefix: k.key_prefix },
    ])
  );

  const { data: logs, error: logsError } = await supabase
    .from("usage_logs")
    .select(
      "id, api_key_id, model, prompt_tokens, completion_tokens, total_tokens, customer_charge, plan_slug, created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(500);

  if (logsError) {
    return NextResponse.json({ error: logsError.message }, { status: 500 });
  }

  const stats = buildUsageStats((logs ?? []) as UsageLogRow[], keyMap);

  return NextResponse.json(stats);
}
