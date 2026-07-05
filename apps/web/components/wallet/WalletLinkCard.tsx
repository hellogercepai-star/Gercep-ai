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
  isPhantomInAppBrowser,
  PHANTOM_EXTENSION_URL,
} from "@/lib/wallet/device";
import { PhantomOpenButton } from "@/components/wallet/PhantomOpenButton";
import { useLanguage } from "@/components/i18n/LanguageProvider";

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
  const { t } = useLanguage();
  const { publicKey, signMessage, connected } = useWallet();
  const [linked, setLinked] = useState<LinkedWallet | null>(null);
  const [quota, setQuota] = useState<WalletQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  const [inPhantom, setInPhantom] = useState(false);
  const [siteOrigin, setSiteOrigin] = useState("");

  useEffect(() => {
    setIsMobile(isMobileBrowser());
    setHasWallet(hasInjectedSolanaWallet());
    setInPhantom(isPhantomInAppBrowser());
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
      setError(t("wallet.connectFirst"));
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
      title={t("wallet.title")}
      description={t("wallet.desc")}
      className="mb-6"
    >
      {inPhantom && !linked && (
        <div className="mb-4 rounded-lg border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 p-3 text-xs text-white/70">
          <p className="font-medium text-[#2DD4BF]">{t("wallet.inPhantom")}</p>
          <p className="mt-1">{t("wallet.inPhantomDesc")}</p>
        </div>
      )}
      {needsLogin ? (
        <div className="rounded-lg border border-[#A78BFA]/30 bg-[#A78BFA]/10 p-4">
          {hasWallet && (
            <p className="mb-2 text-xs font-medium text-[#2DD4BF]">
              {t("wallet.phantomNoLogin")}
            </p>
          )}
          <p className="text-sm text-white/70">{t("wallet.phantomLoginHint")}</p>
          <Link
            href="/login?next=/developers&wallet=1"
            className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-xs font-medium text-[#070711]"
          >
            {t("wallet.loginStep")}
          </Link>
        </div>
      ) : loading ? (
        <p className="text-sm text-white/50">{t("wallet.loading")}</p>
      ) : linked ? (
        <div>
          <div className="rounded-lg border border-[#A78BFA]/30 bg-[#A78BFA]/10 p-4">
            <p className="text-xs uppercase text-[#A78BFA]">{t("wallet.linked")}</p>
            <p className="mt-1 font-mono text-sm">{linked.addressShort}</p>
            <p className="mt-1 break-all font-mono text-[10px] text-white/40">
              {linked.address}
            </p>
          </div>
          {quota && (
            <div className="mt-3 space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="text-white/50">
                  {t("wallet.tier")}:{" "}
                  <span className="font-medium text-[#2DD4BF]">
                    {quota.tierLabel ?? quota.tier}
                  </span>
                </span>
                {quota.gercepBalance != null && (
                  <span className="text-white/50">
                    {t("wallet.gercep")}:{" "}
                    <span className="font-medium text-[#A78BFA]">
                      {formatBalance(quota.gercepBalance)}
                    </span>
                  </span>
                )}
              </div>
              <div className="text-xs text-white/40">
                {quota.usedToday ?? 0} /{" "}
                {quota.dailyRequests.toLocaleString("id-ID")} {t("wallet.usageToday")}
                {quota.remainingToday != null && (
                  <> · {t("wallet.remaining")} {quota.remainingToday.toLocaleString("id-ID")}</>
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
            </div>
          )}
          <Button
            variant="danger"
            size="sm"
            className="mt-4"
            onClick={handleUnlink}
          >
            {t("wallet.unlink")}
          </Button>
          <button
            type="button"
            onClick={() => loadWallet()}
            className="ml-2 mt-4 text-xs text-white/40 underline hover:text-white/60"
          >
            {t("wallet.refreshBalance")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {isMobile && !hasWallet ? (
            <div className="space-y-3 rounded-lg border border-[#2DD4BF]/20 bg-[#2DD4BF]/5 p-4">
              <p className="text-sm text-white/70">{t("wallet.mobileHint")}</p>
              <PhantomOpenButton label={t("wallet.openPhantom")} />
              <p className="text-[11px] text-white/40">{t("wallet.mobileSteps")}</p>
            </div>
          ) : hasWallet ? (
            <div className="flex flex-wrap items-center gap-3">
              <WalletMultiButton />
              {connected && publicKey && (
                <Button onClick={handleLink} disabled={linking}>
                  {linking ? t("wallet.verifying") : t("wallet.signLink")}
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
            <p className="text-xs text-white/40">{t("wallet.steps")}</p>
          )}
        </div>
      )}
      {error && <p className="mt-3 text-sm text-[#F472B6]">{error}</p>}
    </Card>
  );
}
