"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { buildWalletLinkMessage } from "@/lib/wallet/solana";

interface LinkedWallet {
  address: string;
  addressShort: string;
  verifiedAt: string;
}

interface WalletQuota {
  tier: string;
  dailyRequests: number;
  note: string;
}

export function WalletLinkCard() {
  const { publicKey, signMessage, connected } = useWallet();
  const [linked, setLinked] = useState<LinkedWallet | null>(null);
  const [quota, setQuota] = useState<WalletQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWallet = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/wallet");
    if (res.status === 401) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    if (res.ok) {
      setLinked(data.wallet ?? null);
      setQuota(data.quota ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const handleLink = async () => {
    if (!publicKey || !signMessage) {
      setError("Wallet tidak support sign message. Coba Phantom atau Solflare.");
      return;
    }

    setLinking(true);
    setError(null);

    try {
      const challengeRes = await fetch("/api/v1/wallet/challenge");
      const challengeData = await challengeRes.json();
      if (!challengeRes.ok) {
        throw new Error(challengeData.error ?? "Gagal minta challenge.");
      }

      const address = publicKey.toBase58();
      const expiresAt = new Date(challengeData.expiresAt);
      const message = buildWalletLinkMessage({
        address,
        nonce: challengeData.nonce,
        expiresAt,
      });

      const signature = await signMessage(new TextEncoder().encode(message));

      const verifyRes = await fetch("/api/v1/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          signature: bs58.encode(signature),
          nonce: challengeData.nonce,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error ?? "Verifikasi gagal.");
      }

      setLinked(verifyData.wallet);
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

  return (
    <Card
      title="Solana Wallet"
      description="Link wallet untuk $GERCEP quota tiers. Phase 1: verify ownership — balance check coming soon."
      className="mb-6"
    >
      {loading ? (
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
            <p className="mt-3 text-sm text-white/50">
              Tier: <span className="text-[#2DD4BF]">{quota.tier}</span> ·{" "}
              {quota.dailyRequests.toLocaleString("id-ID")} req/day (beta) ·{" "}
              {quota.note}
            </p>
          )}
          <Button
            variant="danger"
            size="sm"
            className="mt-4"
            onClick={handleUnlink}
          >
            Unlink wallet
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <WalletMultiButton />
            {connected && publicKey && (
              <Button onClick={handleLink} disabled={linking}>
                {linking ? "Verifying..." : "Sign & Link wallet"}
              </Button>
            )}
          </div>
          <p className="text-xs text-white/40">
            1. Connect Phantom/Solflare → 2. Sign message → 3. Wallet ter-link ke
            akun Gercep kamu
          </p>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-[#F472B6]">{error}</p>}
    </Card>
  );
}
