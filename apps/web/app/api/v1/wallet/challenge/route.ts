import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

// GET /api/v1/wallet/challenge — nonce untuk sign message (requires session)
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nonce = randomUUID();
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);

  await supabase.from("wallet_link_challenges").delete().eq("user_id", user.id);

  const { error } = await supabase.from("wallet_link_challenges").insert({
    user_id: user.id,
    nonce,
    message: "",
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    nonce,
    expiresAt: expiresAt.toISOString(),
  });
}
