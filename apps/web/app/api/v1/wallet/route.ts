import { NextRequest, NextResponse } from "next/server";
import {
  buildWalletLinkMessage,
  truncateAddress,
  verifySolanaSignature,
} from "@/lib/wallet/solana";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface WalletLinkRow {
  id: string;
  user_id: string;
  chain: string;
  address: string;
  verified_at: string;
}

interface ChallengeRow {
  nonce: string;
  message: string;
  expires_at: string;
}

function mapWallet(row: WalletLinkRow) {
  return {
    id: row.id,
    chain: row.chain,
    address: row.address,
    addressShort: truncateAddress(row.address),
    verifiedAt: row.verified_at,
  };
}

// GET /api/v1/wallet — linked wallet user (requires session)
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("wallet_links")
    .select("id, user_id, chain, address, verified_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    wallet: data ? mapWallet(data as WalletLinkRow) : null,
    quota: {
      tier: "beta",
      dailyRequests: 1000,
      note: "$GERCEP balance tiers — coming soon",
    },
  });
}

// POST /api/v1/wallet — verify signature & link wallet
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { address?: string; signature?: string; signatureBase64?: string; nonce?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { address, signature, signatureBase64, nonce } = body;
  if (
    !address?.trim() ||
    (!signature?.trim() && !signatureBase64?.trim()) ||
    !nonce?.trim()
  ) {
    return NextResponse.json(
      { error: "address, signature, dan nonce wajib." },
      { status: 400 }
    );
  }

  const { data: challenge, error: challengeError } = await supabase
    .from("wallet_link_challenges")
    .select("nonce, message, expires_at")
    .eq("user_id", user.id)
    .eq("nonce", nonce)
    .maybeSingle();

  if (challengeError || !challenge) {
    return NextResponse.json(
      { error: "Challenge tidak valid atau expired. Minta challenge baru." },
      { status: 400 }
    );
  }

  const row = challenge as ChallengeRow;
  if (new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: "Challenge expired." }, { status: 400 });
  }

  const message = buildWalletLinkMessage({
    address: address.trim(),
    nonce: row.nonce,
    expiresAt: new Date(row.expires_at),
  });

  const valid = verifySolanaSignature({
    address: address.trim(),
    message,
    signatureBase58: signature?.trim(),
    signatureBase64: signatureBase64?.trim(),
  });

  if (!valid) {
    return NextResponse.json({ error: "Signature invalid." }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: existingAddress } = await admin
    .from("wallet_links")
    .select("user_id")
    .eq("address", address.trim())
    .maybeSingle();

  if (existingAddress && existingAddress.user_id !== user.id) {
    return NextResponse.json(
      { error: "Wallet ini sudah ter-link ke akun lain." },
      { status: 409 }
    );
  }

  const { data: linked, error: linkError } = await admin
    .from("wallet_links")
    .upsert(
      {
        user_id: user.id,
        chain: "solana",
        address: address.trim(),
        verified_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("id, user_id, chain, address, verified_at")
    .single();

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 500 });
  }

  await admin.from("wallet_link_challenges").delete().eq("user_id", user.id);

  return NextResponse.json({
    wallet: mapWallet(linked as WalletLinkRow),
  });
}

// DELETE /api/v1/wallet — unlink wallet
export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("wallet_links")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ unlinked: true });
}
