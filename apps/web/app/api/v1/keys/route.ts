import { NextRequest, NextResponse } from "next/server";
import { generateApiKey } from "@/lib/gateway/api-key";
import { createClient } from "@/lib/supabase/server";

interface ApiKeyRow {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  revoked_at: string | null;
  last_used_at: string | null;
}

function mapKeyRow(row: ApiKeyRow) {
  return {
    id: row.id,
    name: row.name,
    keyPrefix: row.key_prefix,
    createdAt: row.created_at,
    revokedAt: row.revoked_at,
    lastUsedAt: row.last_used_at,
  };
}

// GET /api/v1/keys — list API keys user (requires Supabase session)
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, user_id, name, key_prefix, created_at, revoked_at, last_used_at")
    .eq("user_id", user.id)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    keys: ((data ?? []) as ApiKeyRow[]).map(mapKeyRow),
  });
}

// POST /api/v1/keys — create new API key (plain key shown once)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let name = "Default";
  try {
    const body = (await request.json()) as { name?: string };
    if (body.name?.trim()) name = body.name.trim();
  } catch {
    // body kosong OK, pakai default name
  }

  const { plainKey, keyPrefix, keyHash } = generateApiKey();

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      user_id: user.id,
      name,
      key_prefix: keyPrefix,
      key_hash: keyHash,
    })
    .select("id, user_id, name, key_prefix, created_at, revoked_at, last_used_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    key: mapKeyRow(data as ApiKeyRow),
    plainKey, // hanya muncul sekali — user harus simpan sendiri
  });
}

// DELETE /api/v1/keys?id=uuid — revoke API key
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keyId = request.nextUrl.searchParams.get("id");
  if (!keyId) {
    return NextResponse.json({ error: "Query id wajib." }, { status: 400 });
  }

  const { error } = await supabase
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", keyId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ revoked: true });
}
