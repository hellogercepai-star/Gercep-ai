import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildChallengeMessage,
  CHALLENGE_TTL_MS,
  getAppDomain,
} from "@/lib/wallet/challenge";
import { isValidSolanaAddress } from "@/lib/wallet/solana";

// POST /api/v1/wallet/challenge — issue nonce + exact message to sign (requires session)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { address?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const address = body.address?.trim();
  if (!address) {
    return NextResponse.json({ error: "address wajib." }, { status: 400 });
  }

  if (!isValidSolanaAddress(address)) {
    return NextResponse.json({ error: "Alamat Solana tidak valid." }, { status: 400 });
  }

  const nonce = randomUUID();
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);
  const domain = getAppDomain(request);
  const message = buildChallengeMessage({
    address,
    nonce,
    expiresAt,
    domain,
  });

  await supabase.from("wallet_link_challenges").delete().eq("user_id", user.id);

  const { error } = await supabase.from("wallet_link_challenges").insert({
    user_id: user.id,
    nonce,
    message,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    nonce,
    expiresAt: expiresAt.toISOString(),
    message,
    domain,
  });
}

// Legacy GET — clients must POST with wallet address so the server stores the exact message.
export async function GET() {
  return NextResponse.json(
    {
      error:
        "Use POST /api/v1/wallet/challenge with { address } to request a sign-in challenge.",
    },
    { status: 405 }
  );
}
