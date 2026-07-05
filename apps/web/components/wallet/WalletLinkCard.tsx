"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { buildWalletLinkMessage } from "@/lib/wallet/solana";
import {
  bytesToBase64,
  signWalletMessage,
} from "@/lib/wallet/sign";
import { readJsonResponse } from "@/lib/wallet/fetch-json";
import {
  getPhantomDevelopersUrl,
  hasInjectedSolanaWallet,
  isMobileBrowser,
  PHANTOM_EXTENSION_URL,
} from "@/lib/wallet/device";

interface LinkedWallet {
  address: string;
  addressShort: string;
  verifiedAt: string;
}

interface WalletQuota {
  tier: string;
  tierLabel?: string;
  dailyRequests: number;
  usedToday?: number;
  remainingToday?: number;
  gercepBalance?: number | null;
  mintConfigured?: boolean;
  nextTierLabel?: string | null;
  tokensToNextTier?: number | null;
  note: string;
}

function formatBalance(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toLocaleString("id-ID", { maximumFractionDigits: 4 });
}

export function WalletLinkCard() {
  const { publicKey, signMessage, connected } = useWallet();
  const [linked, setLinked] = useState<LinkedWallet | null>(null);
  const [quota, setQuota] = useState<WalletQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  const [siteOrigin, setSiteOrigin] = useState("");

  useEffect(() => {
    setIsMobile(isMobileBrowser());
    setHasWallet(hasInjectedSolanaWallet());
    setSiteOrigin(window.location.origin);
  }, []);

  const loadWallet = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/wallet", { credentials: "same-origin" });
      if (res.status === 401) {
        setNeedsLogin(true);
        return;
      }
      setNeedsLogin(false);
      const data = await readJsonResponse<{
        wallet?: LinkedWallet | null;
        quota?: WalletQuota | null;
      }>(res, "Load wallet");
      if (res.ok) {
        setLinked(data.wallet ?? null);
        setQuota(data.quota ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal load wallet.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const handleLink = async () => {
    if (!publicKey) {
      setError("Connect wallet dulu.");
      return;
    }

    setLinking(true);
    setError(null);

    try {
      const challengeRes = await fetch("/api/v1/wallet/challenge", {
        credentials: "same-origin",
      });
      const challengeData = await readJsonResponse<{
        nonce?: string;
        expiresAt?: string;
        error?: string;
      }>(challengeRes, "Minta challenge");
      if (!challengeRes.ok) {
        throw new Error(
          challengeData.error ??
            "Gagal minta challenge. Cek migration 002_wallet_links.sql di Supabase."
        );
      }

      const address = publicKey.toBase58();
      const expiresAt = new Date(challengeData.expiresAt!);
      const message = buildWalletLinkMessage({
        address,
        nonce: challengeData.nonce!,
        expiresAt,
      });

      let signatureBytes: Uint8Array;
      try {
        signatureBytes = await signWalletMessage(
          message,
          signMessage ?? undefined
        );
      } catch (signErr) {
        const msg =
          signErr instanceof Error ? signErr.message : "Sign message gagal.";
        throw new Error(
          msg.toLowerCase().includes("pattern")
            ? "Phantom gagal sign — disconnect wallet, connect lagi, lalu ulangi."
            : `Sign gagal: ${msg}`
        );
      }

      const verifyRes = await fetch("/api/v1/wallet", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          signatureBase64: bytesToBase64(signatureBytes),
          nonce: challengeData.nonce,
        }),
      });

      const verifyData = await readJsonResponse<{
        wallet?: LinkedWallet;
        error?: string;
      }>(verifyRes, "Verifikasi wallet");
      if (!verifyRes.ok) {
        throw new Error(verifyData.error ?? "Verifikasi gagal.");
      }

      setLinked(verifyData.wallet ?? null);
      await loadWallet();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal link wallet.");
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm("Unlink wallet Solana dari akun ini?")) return;
    await fetch("/api/v1/wallet", { method: "DELETE" });
    setLinked(null);
    await loadWallet();
  };

  const phantomBrowseUrl = siteOrigin
    ? getPhantomDevelopersUrl(siteOrigin)
    : "#";

  return (
    <Card
      title="Solana Wallet"
      description="Wallet Phantom ter-link ke akun Gercep. Tier quota naik otomatis sesuai balance $GERCEP."
      className="mb-6"
    >
      {needsLogin ? (
        <div className="rounded-lg border border-[#A78BFA]/30 bg-[#A78BFA]/10 p-4">
          {hasWallet && (
            <p className="mb-2 text-xs font-medium text-[#2DD4BF]">
              ✓ Phantom terhubung — tapi belum login akun Gercep
            </p>
          )}
          <p className="text-sm text-white/70">
            Wallet Phantom ≠ akun Gercep. Masuk/daftar email dulu, baru link
            wallet ke akun kamu.
          </p>
          <Link
            href="/login?next=/developers&wallet=1"
            className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-xs font-medium text-[#070711]"
          >
            Step 1: Masuk / Daftar
          </Link>
        </div>
      ) : loading ? (
        <p className="text-sm text-white/50">Memuat wallet...</p>
      ) : linked ? (
        <div>
          <div className="rounded-lg border border-[#A78BFA]/30 bg-[#A78BFA]/10 p-4">
            <p className="text-xs uppercase text-[#A78BFA]">Linked</p>
            <p className="mt-1 font-mono text-sm">{linked.addressShort}</p>
            <p className="mt-1 break-all font-mono text-[10px] text-white/40">
              {linked.address}
            </p>
          </div>
          {quota && (
            <div className="mt-3 space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="text-white/50">
                  Tier:{" "}
                  <span className="font-medium text-[#2DD4BF]">
                    {quota.tierLabel ?? quota.tier}
                  </span>
                </span>
                {quota.gercepBalance != null && (
                  <span className="text-white/50">
                    $GERCEP:{" "}
                    <span className="font-medium text-[#A78BFA]">
                      {formatBalance(quota.gercepBalance)}
                    </span>
                  </span>
                )}
              </div>
              <div className="text-xs text-white/40">
                {quota.usedToday ?? 0} /{" "}
                {quota.dailyRequests.toLocaleString("id-ID")} req hari ini
                {quota.remainingToday != null && (
                  <> · sisa {quota.remainingToday.toLocaleString("id-ID")}</>
                )}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#2DD4BF]"
                  style={{
                    width: `${Math.min(100, ((quota.usedToday ?? 0) / quota.dailyRequests) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-white/50">{quota.note}</p>
              {quota.mintConfigured === false && (
                <p className="text-[11px] text-[#F472B6]">
                  Mint $GERCEP belum diset di server — tier Beta sementara.
                </p>
              )}
            </div>
          )}
          <Button
            variant="danger"
            size="sm"
            className="mt-4"
            onClick={handleUnlink}
          >
            Unlink wallet
          </Button>
          <button
            type="button"
            onClick={() => loadWallet()}
            className="ml-2 mt-4 text-xs text-white/40 underline hover:text-white/60"
          >
            Refresh balance
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {isMobile && !hasWallet ? (
            <div className="space-y-3 rounded-lg border border-[#2DD4BF]/20 bg-[#2DD4BF]/5 p-4">
              <p className="text-sm text-white/70">
                Di HP, wallet connect jalan di{" "}
                <strong className="text-white">Phantom app</strong> — bukan
                Safari/Chrome biasa.
              </p>
              <a
                href={phantomBrowseUrl}
                className="inline-block rounded-full bg-[#AB9FF2] px-5 py-2.5 text-sm font-medium text-[#070711]"
              >
                Buka di Phantom App
              </a>
              <p className="text-[11px] text-white/40">
                Step 1: daftar/masuk Gercep → Step 2: Connect Wallet → Sign
                &amp; Link
              </p>
            </div>
          ) : hasWallet ? (
            <div className="flex flex-wrap items-center gap-3">
              <WalletMultiButton />
              {connected && publicKey && (
                <Button onClick={handleLink} disabled={linking}>
                  {linking ? "Verifying..." : "Sign & Link wallet"}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <p className="text-sm text-white/70">
                Browser ini belum punya wallet extension. Pilih salah satu:
              </p>
              <ul className="list-inside list-disc space-y-1 text-xs text-white/50">
                <li>
                  Install{" "}
                  <a
                    href={PHANTOM_EXTENSION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#AB9FF2] underline"
                  >
                    Phantom extension
                  </a>{" "}
                  di Chrome / Brave, refresh halaman ini
                </li>
                <li>
                  Atau pakai HP — tap{" "}
                  <a
                    href={phantomBrowseUrl}
                    className="text-[#2DD4BF] underline"
                  >
                    Buka di Phantom App
                  </a>
                </li>
              </ul>
            </div>
          )}

          {(hasWallet || isMobile) && (
            <p className="text-xs text-white/40">
              1. Connect Phantom → 2. Sign message → 3. Wallet ter-link ke akun
              Gercep
            </p>
          )}
        </div>
      )}
      {error && <p className="mt-3 text-sm text-[#F472B6]">{error}</p>}
    </Card>
  );
}
