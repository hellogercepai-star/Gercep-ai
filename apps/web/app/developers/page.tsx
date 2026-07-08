"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { WalletLinkCard } from "@/components/wallet/WalletLinkCard";
import { PhantomOpenButton } from "@/components/wallet/PhantomOpenButton";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface UsageSummary {
  requests: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalCostUsd: number;
}

interface UsageByKey {
  apiKeyId: string;
  keyName: string;
  keyPrefix: string;
  requests: number;
  totalTokens: number;
}

interface UsageRecentEntry {
  id: string;
  apiKeyId: string;
  keyName: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number | null;
  planSlug: string | null;
  createdAt: string;
}

interface UsageStats {
  summary: {
    today: UsageSummary;
    month: UsageSummary;
    allTime: UsageSummary;
  };
  byKey: UsageByKey[];
  recent: UsageRecentEntry[];
}

interface BillingInfo {
  balanceUsd: number;
  plan: {
    slug: string;
    name: string;
    payAsYouGo: boolean;
    requiresPositiveBalance: boolean;
  } | null;
  stripeEnabled?: boolean;
  transactions: Array<{
    id: string;
    type: string;
    amountUsd: number;
    note: string | null;
    createdAt: string;
    createdBy: string;
  }>;
}

function formatUsd(n: number) {
  if (n === 0) return "$0.00";
  if (n < 0.0001) return `$${n.toFixed(8)}`;
  if (n < 0.01) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(4)}`;
}

function formatTokens(n: number, locale: string) {
  return n.toLocaleString(locale);
}

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const DEV_CARD =
  "dev-card rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] transition-colors hover:border-[rgba(45,212,191,0.3)]";

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-5">
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[rgba(248,250,252,0.3)]">
        {kicker}
      </p>
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#F8FAFC]">
        {title}
      </h2>
    </div>
  );
}

function UsageStatBox({
  label,
  value,
  sub,
  accent,
  icon,
  animDelay = "0ms",
}: {
  label: string;
  value: string;
  sub?: string;
  accent: "teal" | "purple" | "pink" | "white";
  icon: ReactNode;
  animDelay?: string;
}) {
  const accentMap = {
    teal: "text-[#2DD4BF]",
    purple: "text-[#A78BFA]",
    pink: "text-[#F472B6]",
    white: "text-[#F8FAFC]",
  };

  return (
    <div
      className={`${DEV_CARD} group relative overflow-hidden p-5 dev-num-in`}
      style={{ animationDelay: animDelay }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      <div className="relative">
        <div className="mb-3 opacity-60">{icon}</div>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[rgba(248,250,252,0.5)]">
          {label}
        </p>
        <p
          className={`mt-1 font-[family-name:var(--font-display)] text-[32px] font-bold leading-none ${accentMap[accent]}`}
        >
          {value}
        </p>
        {sub && (
          <p className="mt-2 font-mono text-[11px] text-[rgba(248,250,252,0.3)]">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function StatIconToday() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="#2DD4BF" strokeWidth="1.5" opacity="0.8" />
      <path d="M12 7v5l3 2" stroke="#2DD4BF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StatIconCost() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
        stroke="#A78BFA"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatIconMonth() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="#F472B6" strokeWidth="1.5" />
      <path d="M3 9h18M8 3v4M16 3v4" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StatIconTotal() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 18V6M8 18V10M12 18V4M16 18V13M20 18V8"
        stroke="#F8FAFC"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LightningIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="inline-block">
      <path
        d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
        stroke="#2DD4BF"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="rgba(45,212,191,0.15)"
      />
    </svg>
  );
}

function StripeBadgeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="#A78BFA" strokeWidth="1.5" />
      <path d="M3 10h18" stroke="#A78BFA" strokeWidth="1.5" />
    </svg>
  );
}

const TOPUP_AMOUNTS = [5, 10, 25] as const;

function TopUpCreditsPanel({
  t,
  checkoutAmount,
  onCheckout,
}: {
  t: (key: string) => string;
  checkoutAmount: number | null;
  onCheckout: (amount: number) => void;
}) {
  const tierMeta: Record<
    (typeof TOPUP_AMOUNTS)[number],
    { labelKey: string; accent: string; glow: string; recommended?: boolean }
  > = {
    5: {
      labelKey: "developers.addCreditsTierStarter",
      accent: "from-[#2DD4BF]/20 to-transparent",
      glow: "group-hover:shadow-[0_0_28px_rgba(45,212,191,0.25)]",
    },
    10: {
      labelKey: "developers.addCreditsTierPopular",
      accent: "from-[#A78BFA]/25 to-[#2DD4BF]/10",
      glow: "group-hover:shadow-[0_0_32px_rgba(167,139,250,0.35)]",
      recommended: true,
    },
    25: {
      labelKey: "developers.addCreditsTierPro",
      accent: "from-[#F472B6]/20 to-transparent",
      glow: "group-hover:shadow-[0_0_28px_rgba(244,114,182,0.25)]",
    },
  };

  const steps = [
    t("developers.addCreditsStepPick"),
    t("developers.addCreditsStepPay"),
    t("developers.addCreditsStepDone"),
  ];

  return (
    <div className="relative mt-4 overflow-hidden rounded-[20px] border border-[rgba(45,212,191,0.18)] bg-[rgba(45,212,191,0.04)] p-6 md:p-8 dev-topup-panel">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(circle, #2DD4BF 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
        style={{ background: "rgba(167,139,250,0.12)" }}
      />

      <div className="relative mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#2DD4BF]/80">
            <LightningIcon />
            {t("developers.addCreditsKicker")}
          </p>
          <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#F8FAFC]">
            {t("developers.addCredits")}
          </h3>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-[rgba(248,250,252,0.55)]">
            {t("developers.addCreditsDesc")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-[rgba(167,139,250,0.25)] bg-[rgba(167,139,250,0.08)] px-3 py-1.5">
          <StripeBadgeIcon />
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#A78BFA]">
            Stripe
          </span>
        </div>
      </div>

      <div className="relative mb-6 grid grid-cols-3 gap-2 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.25)] p-3">
        {steps.map((step, i) => (
          <div key={step} className="flex flex-col items-center gap-1.5 text-center">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(45,212,191,0.35)] bg-[rgba(45,212,191,0.08)] font-mono text-[10px] font-bold text-[#2DD4BF]">
              {i + 1}
            </span>
            <span className="font-mono text-[9px] uppercase leading-tight tracking-wide text-[rgba(248,250,252,0.45)] md:text-[10px]">
              {step}
            </span>
          </div>
        ))}
      </div>

      <div className="relative grid gap-3 sm:grid-cols-3">
        {TOPUP_AMOUNTS.map((amt) => {
          const meta = tierMeta[amt];
          const loading = checkoutAmount === amt;
          const busy = checkoutAmount !== null;

          return (
            <button
              key={amt}
              type="button"
              disabled={busy}
              onClick={() => onCheckout(amt)}
              className={`group relative flex flex-col overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5 text-left transition duration-300 hover:border-[rgba(45,212,191,0.35)] disabled:cursor-not-allowed disabled:opacity-50 ${meta.glow} ${
                meta.recommended
                  ? "ring-1 ring-[rgba(167,139,250,0.35)] sm:-translate-y-1 sm:shadow-[0_8px_32px_rgba(167,139,250,0.15)]"
                  : ""
              }`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${meta.accent} opacity-80`}
              />
              {meta.recommended && (
                <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-[#A78BFA] to-[#2DD4BF] px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-[#050508]">
                  {t("developers.addCreditsPopular")}
                </span>
              )}
              <div className="relative">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[rgba(248,250,252,0.45)]">
                  {t(meta.labelKey)}
                </p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold leading-none text-[#F8FAFC]">
                  ${amt}
                </p>
                <p className="mt-1 font-mono text-[11px] text-[#2DD4BF]/80">
                  {t("developers.addCreditsUsdCredits")}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-[rgba(248,250,252,0.4)]">
                  {t("developers.addCreditsInstant")}
                </p>
                <div
                  className={`mt-5 flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.35)] px-3 py-2.5 font-mono text-[11px] uppercase tracking-wider transition group-hover:border-[rgba(45,212,191,0.4)] group-hover:bg-[rgba(45,212,191,0.08)] group-hover:text-[#2DD4BF] ${
                    loading ? "animate-pulse text-[#2DD4BF]" : "text-[rgba(248,250,252,0.7)]"
                  }`}
                >
                  {loading ? t("developers.checkoutLoading") : t("developers.addCreditsBtn")}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="relative mt-5 flex items-center justify-center gap-2 font-mono text-[10px] text-[rgba(248,250,252,0.35)]">
        <span className="inline-block h-1 w-1 rounded-full bg-[#2DD4BF]/60" />
        {t("developers.addCreditsSecure")}
      </p>
    </div>
  );
}

export default function DevelopersPage() {
  const router = useRouter();
  const { t, dateLocale } = useLanguage();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [plainKey, setPlainKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billingNotice, setBillingNotice] = useState<"success" | "cancel" | null>(
    null
  );
  const [checkoutAmount, setCheckoutAmount] = useState<number | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [origin, setOrigin] = useState("https://your-domain");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [keysRes, usageRes, billingRes] = await Promise.all([
      fetch("/api/v1/keys"),
      fetch("/api/v1/usage"),
      fetch("/api/v1/billing"),
    ]);

    if (keysRes.status === 401 || usageRes.status === 401) {
      setNeedsLogin(true);
      setError(t("developers.loginError"));
      setLoading(false);
      return;
    }

    setNeedsLogin(false);

    const keysData = await keysRes.json();
    const usageData = await usageRes.json();

    if (keysRes.ok) setKeys(keysData.keys ?? []);
    else setError(keysData.error ?? t("developers.loadKeysError"));

    if (usageRes.ok) setUsage(usageData);
    else setError((prev) => prev ?? usageData.error ?? t("developers.loadUsageError"));

    if (billingRes.ok) setBilling(await billingRes.json());

    setLoading(false);
  }, [router]);

  useEffect(() => {
    setOrigin(window.location.origin);

    const params = new URLSearchParams(window.location.search);
    const billing = params.get("billing");
    if (billing === "success") {
      setBillingNotice("success");
      params.delete("billing");
      const next = params.toString();
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${next ? `?${next}` : ""}`
      );
    } else if (billing === "cancel") {
      setBillingNotice("cancel");
      params.delete("billing");
      const next = params.toString();
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${next ? `?${next}` : ""}`
      );
    }

    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    setPlainKey(null);

    const res = await fetch("/api/v1/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName.trim() || "Default" }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? t("developers.createError"));
      setCreating(false);
      return;
    }

    setPlainKey(data.plainKey);
    setNewKeyName("");
    await loadData();
    setCreating(false);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm(t("developers.revokeConfirm"))) return;
    await fetch(`/api/v1/keys?id=${id}`, { method: "DELETE" });
    await loadData();
  };

  return (
    <div
      className="dev-terminal theme-surface relative min-h-screen bg-[#050508] text-[#F8FAFC] transition-[background-color,color] duration-300"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(45,212,191,0.04) 0%, transparent 50%),
          radial-gradient(circle at 100% 80%, rgba(167,139,250,0.03) 0%, transparent 40%)
        `,
      }}
    >
      <div
        className="dev-scanline pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)",
        }}
      />
      <div
        className="dev-scanline pointer-events-none fixed inset-0 z-0 opacity-[0.02]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <style>{`
        @keyframes dev-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dev-num-in {
          from { opacity: 0; transform: translateY(10px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dev-border-hue {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        .dev-section-in { animation: dev-fade-up 0.55s ease-out both; }
        .dev-num-in { animation: dev-num-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .dev-border-glow { animation: dev-border-hue 10s linear infinite; }
      `}</style>

      <header className="dev-header theme-nav relative z-10 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(5,5,8,0.85)] px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-lg font-bold text-[#F8FAFC] dev-text-primary"
            >
              Gercep AI
            </Link>
            <p className="font-mono text-xs text-[rgba(248,250,252,0.5)] dev-text-secondary">
              {t("developers.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
            <PhantomOpenButton
              className="rounded-[10px] bg-[#AB9FF2] px-3 py-1.5 text-xs font-medium text-[#050508]"
              label="Phantom"
            />
            <Link
              href="/models"
              className="text-sm text-[rgba(248,250,252,0.5)] transition hover:text-[#F8FAFC]"
            >
              Models
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-[rgba(248,250,252,0.5)] transition hover:text-[#F8FAFC]"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="text-sm text-[rgba(248,250,252,0.5)] transition hover:text-[#F8FAFC]"
            >
              {t("common.docs")}
            </Link>
            <Link href="/playground">
              <Button
                variant="secondary"
                size="sm"
                className="!rounded-[10px] border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] hover:border-[rgba(45,212,191,0.3)]"
              >
                {t("common.openPlayground")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl space-y-8 px-6 py-8 pb-20">
        {billingNotice === "success" && (
          <div className="dev-section-in rounded-[20px] border border-[rgba(45,212,191,0.3)] bg-[rgba(45,212,191,0.08)] px-4 py-3 text-sm text-[#2DD4BF]">
            {t("developers.billingSuccess")}
          </div>
        )}
        {billingNotice === "cancel" && (
          <div className="dev-section-in rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-sm text-[rgba(248,250,252,0.5)]">
            {t("developers.billingCancel")}
          </div>
        )}
        {needsLogin && (
          <div className="dev-section-in rounded-[20px] border border-[rgba(167,139,250,0.3)] bg-[rgba(167,139,250,0.08)] p-4">
            <p className="text-sm text-[rgba(248,250,252,0.8)]">{t("developers.needsLogin")}</p>
            <Link
              href="/login?next=/developers&wallet=1"
              className="mt-3 inline-block rounded-[10px] bg-[#F8FAFC] px-4 py-2 text-xs font-medium text-[#050508]"
            >
              {t("developers.loginCta")}
            </Link>
          </div>
        )}
        <Card
          title={t("developers.createKeyTitle")}
          description={t("developers.createKeyDesc")}
          className={`${DEV_CARD} dev-section-in mb-6 !p-6`}
          style={{ animationDelay: "160ms" }}
        >
          <div className="flex gap-2">
            <input
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder={t("developers.keyNamePlaceholder")}
              className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2 text-sm text-[#F8FAFC] outline-none placeholder:text-[rgba(248,250,252,0.3)] focus:border-[rgba(45,212,191,0.4)] focus:shadow-[0_0_20px_rgba(45,212,191,0.15)]"
            />
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="!rounded-[10px]"
            >
              {creating ? "..." : t("developers.createKey")}
            </Button>
          </div>

          {plainKey && (
            <div className="mt-4 rounded-[20px] border border-[rgba(45,212,191,0.3)] bg-[rgba(45,212,191,0.08)] p-4">
              <p className="font-mono text-xs uppercase tracking-wider text-[#2DD4BF]">
                {t("developers.saveKeyNow")}
              </p>
              <code className="mt-2 block break-all font-mono text-sm text-[#F8FAFC]">
                {plainKey}
              </code>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 !rounded-[10px]"
                onClick={() => navigator.clipboard.writeText(plainKey)}
              >
                {t("common.copy")}
              </Button>
            </div>
          )}
        </Card>

        <Card
          title={t("developers.yourKeys")}
          className={`${DEV_CARD} dev-section-in !p-6`}
          style={{ animationDelay: "200ms" }}
        >
          {loading ? (
            <p className="text-sm text-[rgba(248,250,252,0.5)]">{t("common.loading")}</p>
          ) : keys.length === 0 ? (
            <p className="text-sm text-[rgba(248,250,252,0.5)]">{t("developers.noKeys")}</p>
          ) : (
            <ul className="divide-y divide-[rgba(255,255,255,0.04)]">
              {keys.map((k) => (
                <li
                  key={k.id}
                  className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-[#F8FAFC]">{k.name}</p>
                    <p className="font-mono text-xs text-[rgba(248,250,252,0.4)]">
                      {k.keyPrefix}
                    </p>
                    {k.lastUsedAt && (
                      <p className="mt-0.5 font-mono text-xs text-[rgba(248,250,252,0.3)]">
                        {t("developers.lastUsed")} {formatDate(k.lastUsedAt, dateLocale)}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    className="!rounded-[10px]"
                    onClick={() => handleRevoke(k.id)}
                  >
                    {t("common.revoke")}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Billing */}
        {!needsLogin && (
          <section className="dev-section-in">
            <SectionHeading
              kicker="// BALANCE & BILLING"
              title={t("developers.billingTitle")}
            />
            {loading ? (
              <p className="text-sm text-[rgba(248,250,252,0.5)]">{t("common.loading")}</p>
            ) : billing ? (
              <>
                <div className="relative overflow-hidden rounded-[20px] p-[1px]">
                  <div className="dev-border-glow absolute inset-0 bg-[conic-gradient(from_0deg,#2DD4BF,#A78BFA,#F472B6,#2DD4BF)] opacity-50" />
                  <div className="relative overflow-hidden rounded-[19px] bg-[#050508] p-6 md:p-8 dev-balance-inner">
                    <div
                      className="pointer-events-none absolute inset-0 opacity-[0.04]"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, #fff 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                      }}
                    />
                    <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[rgba(248,250,252,0.5)]">
                          {t("developers.billingBalance")}
                        </p>
                        <p
                          className="mt-2 font-[family-name:var(--font-display)] text-[48px] font-bold leading-none text-[#2DD4BF] dev-num-in"
                          style={{ textShadow: "0 0 30px rgba(45,212,191,0.4)" }}
                        >
                          {formatUsd(billing.balanceUsd)}
                        </p>
                      </div>
                      <div className="rounded-full bg-gradient-to-r from-[#A78BFA] to-[#2DD4BF] p-[1px]">
                        <div className="rounded-full bg-[rgba(167,139,250,0.1)] px-5 py-3">
                          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[rgba(167,139,250,0.8)]">
                            {t("developers.billingPlan")}
                          </p>
                          <p className="mt-0.5 font-[family-name:var(--font-display)] text-base font-semibold text-[#F8FAFC]">
                            {billing.plan?.name ?? "—"}
                          </p>
                          {billing.plan?.slug && (
                            <p className="mt-0.5 font-mono text-[10px] text-[rgba(248,250,252,0.4)]">
                              {billing.plan.slug}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="relative mt-5 font-mono text-[11px] text-[rgba(248,250,252,0.4)]">
                      {billing.plan?.payAsYouGo
                        ? t("developers.billingPaygHint")
                        : t("developers.billingBetaHint")}
                    </p>
                  </div>
                </div>
                {billing.transactions.length > 0 && (
                  <div className={`${DEV_CARD} mt-4 overflow-hidden p-0`}>
                    <ul className="text-sm">
                      {billing.transactions.slice(0, 8).map((tx) => (
                        <li
                          key={tx.id}
                          className="group flex items-center justify-between border-b border-[rgba(255,255,255,0.04)] py-3.5 pl-4 pr-5 transition hover:border-l-2 hover:border-l-[#2DD4BF] hover:bg-[rgba(45,212,191,0.03)] last:border-b-0"
                        >
                          <span className="flex min-w-0 items-center gap-3 text-[rgba(248,250,252,0.5)]">
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                tx.type === "charge" ? "bg-[#F472B6]" : "bg-[#2DD4BF]"
                              }`}
                            />
                            <span className="min-w-0">
                              <span className="text-[rgba(248,250,252,0.7)]">
                                {tx.type === "charge"
                                  ? t("developers.billingCharge")
                                  : t("developers.billingTopup")}
                              </span>
                              {tx.note && (
                                <span className="text-[rgba(248,250,252,0.4)]">
                                  {" "}
                                  · {tx.note.slice(0, 40)}
                                </span>
                              )}
                              <span className="mt-0.5 block font-mono text-[10px] text-[rgba(248,250,252,0.4)]">
                                {tx.id.slice(0, 8)}…
                              </span>
                            </span>
                          </span>
                          <span
                            className={`shrink-0 font-mono text-sm tabular-nums ${
                              tx.type === "charge" ? "text-[#F472B6]" : "text-[#2DD4BF]"
                            }`}
                          >
                            {tx.type === "charge" ? "−" : "+"}
                            {formatUsd(tx.amountUsd)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {billing.stripeEnabled && (
                  <TopUpCreditsPanel
                    t={t}
                    checkoutAmount={checkoutAmount}
                    onCheckout={async (amt) => {
                      setCheckoutAmount(amt);
                      setError(null);
                      try {
                        const res = await fetch("/api/v1/billing/checkout", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ amountUsd: amt }),
                        });
                        const data = await res.json();
                        if (data.url) {
                          window.location.href = data.url;
                          return;
                        }
                        setError(data.error ?? "Checkout failed");
                      } catch {
                        setError("Checkout failed");
                      } finally {
                        setCheckoutAmount(null);
                      }
                    }}
                  />
                )}
              </>
            ) : (
              <p className="text-sm text-[rgba(248,250,252,0.5)]">{t("developers.billingNoTx")}</p>
            )}
          </section>
        )}
        {/* Usage summary */}
        <section className="dev-section-in" style={{ animationDelay: "80ms" }}>
          <SectionHeading
            kicker="// TOKEN USAGE"
            title={t("developers.tokenUsage")}
          />
          {loading ? (
            <p className="text-sm text-[rgba(248,250,252,0.5)]">{t("common.loading")}</p>
          ) : usage ? (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <UsageStatBox
                  label={t("developers.today")}
                  value={formatTokens(usage.summary.today.totalTokens, dateLocale)}
                  sub={`${usage.summary.today.requests} ${t("common.requests")}`}
                  accent="teal"
                  icon={<StatIconToday />}
                  animDelay="0ms"
                />
                <UsageStatBox
                  label={t("developers.costToday")}
                  value={formatUsd(usage.summary.today.totalCostUsd ?? 0)}
                  sub={t("developers.costSub")}
                  accent="purple"
                  icon={<StatIconCost />}
                  animDelay="80ms"
                />
                <UsageStatBox
                  label={t("developers.thisMonth")}
                  value={formatTokens(usage.summary.month.totalTokens, dateLocale)}
                  sub={`${usage.summary.month.requests} ${t("common.requests")}`}
                  accent="pink"
                  icon={<StatIconMonth />}
                  animDelay="160ms"
                />
                <UsageStatBox
                  label={t("developers.total")}
                  value={formatTokens(usage.summary.allTime.totalTokens, dateLocale)}
                  sub={`${usage.summary.allTime.requests} ${t("common.requests")}`}
                  accent="white"
                  icon={<StatIconTotal />}
                  animDelay="240ms"
                />
              </div>

              {usage.byKey.length > 0 && (
                <Card
                  title={t("developers.perKey")}
                  className={`${DEV_CARD} mt-4 !border-[rgba(255,255,255,0.06)] !bg-[rgba(255,255,255,0.02)] !p-6 hover:!border-[rgba(45,212,191,0.3)]`}
                >
                  <ul className="divide-y divide-[rgba(255,255,255,0.04)]">
                    {usage.byKey.map((k) => (
                      <li
                        key={k.apiKeyId}
                        className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium text-[#F8FAFC]">{k.keyName}</p>
                          <p className="font-mono text-xs text-[rgba(248,250,252,0.4)]">
                            {k.keyPrefix}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm font-medium text-[#2DD4BF]">
                            {formatTokens(k.totalTokens, dateLocale)} {t("common.tokens")}
                          </p>
                          <p className="font-mono text-xs text-[rgba(248,250,252,0.4)]">
                            {k.requests} {t("common.requests")}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <Card
                title={t("developers.history")}
                className={`${DEV_CARD} mt-4 !border-[rgba(255,255,255,0.06)] !bg-[rgba(255,255,255,0.02)] !p-6 hover:!border-[rgba(45,212,191,0.3)]`}
              >
                {usage.recent.length === 0 ? (
                  <p className="text-sm text-[rgba(248,250,252,0.5)]">
                    {t("developers.noRequestsPrefix")}
                    <Link href="/playground" className="text-[#2DD4BF] hover:underline">
                      Playground
                    </Link>
                    .
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.06)] font-mono text-[10px] uppercase tracking-wider text-[rgba(248,250,252,0.3)]">
                          <th className="pb-2 pr-4 font-medium">{t("developers.time")}</th>
                          <th className="pb-2 pr-4 font-medium">{t("developers.model")}</th>
                          <th className="pb-2 pr-4 font-medium">{t("developers.key")}</th>
                          <th className="pb-2 pr-4 font-medium text-right">
                            {t("developers.prompt")}
                          </th>
                          <th className="pb-2 pr-4 font-medium text-right">
                            {t("developers.completion")}
                          </th>
                          <th className="pb-2 pr-4 font-medium text-right">
                            {t("developers.total")}
                          </th>
                          <th className="pb-2 font-medium text-right">{t("developers.cost")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                        {usage.recent.map((entry) => (
                          <tr
                            key={entry.id}
                            className="text-[rgba(248,250,252,0.8)] transition hover:bg-[rgba(45,212,191,0.03)]"
                          >
                            <td className="py-2.5 pr-4 whitespace-nowrap font-mono text-xs text-[rgba(248,250,252,0.4)]">
                              {formatDate(entry.createdAt, dateLocale)}
                            </td>
                            <td className="py-2.5 pr-4 font-mono text-xs text-[#A78BFA]">
                              {entry.model}
                            </td>
                            <td className="py-2.5 pr-4">{entry.keyName}</td>
                            <td className="py-2.5 pr-4 text-right font-mono tabular-nums">
                              {formatTokens(entry.promptTokens, dateLocale)}
                            </td>
                            <td className="py-2.5 pr-4 text-right font-mono tabular-nums">
                              {formatTokens(entry.completionTokens, dateLocale)}
                            </td>
                            <td className="py-2.5 pr-4 text-right font-mono tabular-nums font-medium text-[#2DD4BF]">
                              {formatTokens(entry.totalTokens, dateLocale)}
                            </td>
                            <td className="py-2.5 text-right font-mono tabular-nums text-[#F472B6]">
                              {entry.costUsd != null ? formatUsd(entry.costUsd) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </>
          ) : null}
        </section>

        <div className="dev-section-in" style={{ animationDelay: "120ms" }}>
          <button
            type="button"
            onClick={() => setShowWallet((v) => !v)}
            className="mb-3 rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-[rgba(248,250,252,0.5)] transition hover:border-[rgba(45,212,191,0.3)] hover:text-[#F8FAFC]"
          >
            ⚙ Wallet Settings
          </button>
          {showWallet && <WalletLinkCard />}
        </div>

        {error && (
          <p className="font-mono text-sm text-[#F472B6]">{error}</p>
        )}

        <Card
          className={`${DEV_CARD} dev-section-in mt-2 !p-6`}
          title={t("developers.quickstart")}
          style={{ animationDelay: "240ms" }}
        >
          <pre className="overflow-x-auto rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.4)] p-4 font-mono text-xs text-[rgba(248,250,252,0.7)]">
{`curl ${origin}/api/v1/chat/completions \\
  -H "Authorization: Bearer sk-gercep-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hello"}]}'`}
          </pre>
        </Card>
      </main>
    </div>
  );
}
