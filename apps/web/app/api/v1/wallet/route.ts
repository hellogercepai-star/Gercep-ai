import { NextRequest, NextResponse } from "next/server";
import {
  extractAddressFromLinkMessage,
  isChallengeExpired,
} from "@/lib/wallet/challenge";
import {
  isValidSolanaAddress,
  truncateAddress,
  verifySolanaSignature,
} from "@/lib/wallet/solana";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWalletQuotaForUser } from "@/lib/gateway/quota";

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

  const walletRow = data as WalletLinkRow | null;
  const quotaInfo = await getWalletQuotaForUser(
    supabase,
    user.id,
    walletRow?.address ?? null
  );

  return NextResponse.json({
    wallet: walletRow ? mapWallet(walletRow) : null,
    quota: {
      tier: quotaInfo.tier.id,
      tierLabel: quotaInfo.tier.label,
      dailyRequests: quotaInfo.dailyRequests,
      usedToday: quotaInfo.usedToday,
      remainingToday: quotaInfo.remainingToday,
      gercepBalance: quotaInfo.gercepBalance,
      mintConfigured: quotaInfo.mintConfigured,
      nextTier: quotaInfo.nextTier?.id ?? null,
      nextTierLabel: quotaInfo.nextTier?.label ?? null,
      tokensToNextTier: quotaInfo.tokensToNextTier,
      note: quotaInfo.note,
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

  let body: {
    address?: string;
    signature?: string;
    signatureBase64?: string;
    nonce?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const address = body.address?.trim();
  const signature = body.signature?.trim();
  const signatureBase64 = body.signatureBase64?.trim();
  const nonce = body.nonce?.trim();

  if (!address || (!signature && !signatureBase64) || !nonce) {
    return NextResponse.json(
      { error: "address, signature, dan nonce wajib." },
      { status: 400 }
    );
  }

  if (!isValidSolanaAddress(address)) {
    return NextResponse.json({ error: "Alamat Solana tidak valid." }, { status: 400 });
  }

  const { data: challenge, error: challengeError } = await supabase
    .from("wallet_link_challenges")
    .select("nonce, message, expires_at")
    .eq("user_id", user.id)
    .eq("nonce", nonce)
    .maybeSingle();

  if (challengeError || !challenge) {
    return NextResponse.json(
      { error: "Challenge tidak valid atau sudah dipakai. Minta challenge baru." },
      { status: 400 }
    );
  }

  const row = challenge as ChallengeRow;

  if (isChallengeExpired(row.expires_at)) {
    await supabase
      .from("wallet_link_challenges")
      .delete()
      .eq("user_id", user.id)
      .eq("nonce", nonce);
    return NextResponse.json({ error: "Challenge expired." }, { status: 400 });
  }

  const message = row.message?.trim();
  if (!message) {
    return NextResponse.json(
      { error: "Challenge corrupt. Minta challenge baru." },
      { status: 400 }
    );
  }

  const challengeAddress = extractAddressFromLinkMessage(message);
  if (!challengeAddress || challengeAddress !== address) {
    return NextResponse.json(
      { error: "Address tidak cocok dengan challenge." },
      { status: 400 }
    );
  }

  const valid = verifySolanaSignature({
    address,
    message,
    signatureBase58: signature,
    signatureBase64,
  });

  if (!valid) {
    return NextResponse.json({ error: "Signature invalid." }, { status: 401 });
  }

  // Consume challenge atomically — prevents replay even under concurrent POSTs.
  const { data: consumed, error: consumeError } = await supabase
    .from("wallet_link_challenges")
    .delete()
    .eq("user_id", user.id)
    .eq("nonce", nonce)
    .select("nonce")
    .maybeSingle();

  if (consumeError || !consumed) {
    return NextResponse.json(
      { error: "Challenge sudah dipakai. Minta challenge baru." },
      { status: 409 }
    );
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server config error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const { data: existingAddress } = await admin
    .from("wallet_links")
    .select("user_id")
    .eq("address", address)
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
        address,
        verified_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("id, user_id, chain, address, verified_at")
    .single();

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 500 });
  }

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

  await supabase.from("wallet_link_challenges").delete().eq("user_id", user.id);

  return NextResponse.json({ unlinked: true });
}
