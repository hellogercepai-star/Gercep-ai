"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { WalletLinkCard } from "@/components/wallet/WalletLinkCard";
import { PhantomOpenButton } from "@/components/wallet/PhantomOpenButton";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
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

function StatBox({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-[#2DD4BF]">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-white/40">{sub}</p>}
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
  const [needsLogin, setNeedsLogin] = useState(false);
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
    <div className="bg-[#070711] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-lg font-bold"
            >
              Gercep AI
            </Link>
            <p className="text-sm text-white/50">{t("developers.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <PhantomOpenButton
              className="rounded-full bg-[#AB9FF2] px-3 py-1.5 text-xs font-medium text-[#070711]"
              label="Phantom"
            />
            <Link
              href="/docs"
              className="text-sm text-white/60 transition hover:text-white"
            >
              {t("common.docs")}
            </Link>
            <Link href="/playground">
              <Button variant="secondary" size="sm">
                {t("common.openPlayground")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 pb-20">
        {needsLogin && (
          <div className="mb-6 rounded-xl border border-[#A78BFA]/30 bg-[#A78BFA]/10 p-4">
            <p className="text-sm text-white/80">{t("developers.needsLogin")}</p>
            <Link
              href="/login?next=/developers&wallet=1"
              className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-xs font-medium text-[#070711]"
            >
              {t("developers.loginCta")}
            </Link>
          </div>
        )}
        {/* Billing */}
        {!needsLogin && (
          <section className="mb-8">
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold">
              {t("developers.billingTitle")}
            </h2>
            {loading ? (
              <p className="text-sm text-white/50">{t("common.loading")}</p>
            ) : billing ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <StatBox
                    label={t("developers.billingBalance")}
                    value={formatUsd(billing.balanceUsd)}
                  />
                  <StatBox
                    label={t("developers.billingPlan")}
                    value={billing.plan?.name ?? "—"}
                    sub={billing.plan?.slug}
                  />
                </div>
                <p className="mt-3 text-xs text-white/45">
                  {billing.plan?.payAsYouGo
                    ? t("developers.billingPaygHint")
                    : t("developers.billingBetaHint")}
                </p>
                {billing.transactions.length > 0 && (
                  <Card className="mt-4">
                    <ul className="divide-y divide-white/5 text-sm">
                      {billing.transactions.slice(0, 8).map((tx) => (
                        <li
                          key={tx.id}
                          className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                        >
                          <span className="text-white/60">
                            {tx.type === "charge"
                              ? t("developers.billingCharge")
                              : t("developers.billingTopup")}
                            {tx.note ? ` · ${tx.note.slice(0, 40)}` : ""}
                          </span>
                          <span className="font-mono text-[#2DD4BF]">
                            {tx.type === "charge" ? "−" : "+"}
                            {formatUsd(tx.amountUsd)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </>
            ) : (
              <p className="text-sm text-white/50">{t("developers.billingNoTx")}</p>
            )}
          </section>
        )}
        {/* Usage summary */}
        <section className="mb-8">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold">
            {t("developers.tokenUsage")}
          </h2>
          {loading ? (
            <p className="text-sm text-white/50">{t("common.loading")}</p>
          ) : usage ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatBox
                  label={t("developers.today")}
                  value={formatTokens(usage.summary.today.totalTokens, dateLocale)}
                  sub={`${usage.summary.today.requests} ${t("common.requests")}`}
                />
                <StatBox
                  label={t("developers.thisMonth")}
                  value={formatTokens(usage.summary.month.totalTokens, dateLocale)}
                  sub={`${usage.summary.month.requests} ${t("common.requests")}`}
                />
                <StatBox
                  label={t("developers.total")}
                  value={formatTokens(usage.summary.allTime.totalTokens, dateLocale)}
                  sub={`${usage.summary.allTime.requests} ${t("common.requests")}`}
                />
              </div>

              {usage.byKey.length > 0 && (
                <Card title={t("developers.perKey")} className="mt-4">
                  <ul className="divide-y divide-white/5">
                    {usage.byKey.map((k) => (
                      <li
                        key={k.apiKeyId}
                        className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium">{k.keyName}</p>
                          <p className="text-xs text-white/40">{k.keyPrefix}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#2DD4BF]">
                            {formatTokens(k.totalTokens, dateLocale)} {t("common.tokens")}
                          </p>
                          <p className="text-xs text-white/40">
                            {k.requests} {t("common.requests")}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <Card title={t("developers.history")} className="mt-4">
                {usage.recent.length === 0 ? (
                  <p className="text-sm text-white/50">
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
                        <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                          <th className="pb-2 pr-4 font-medium">{t("developers.time")}</th>
                          <th className="pb-2 pr-4 font-medium">{t("developers.model")}</th>
                          <th className="pb-2 pr-4 font-medium">{t("developers.key")}</th>
                          <th className="pb-2 pr-4 font-medium text-right">
                            {t("developers.prompt")}
                          </th>
                          <th className="pb-2 pr-4 font-medium text-right">
                            {t("developers.completion")}
                          </th>
                          <th className="pb-2 font-medium text-right">{t("developers.total")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {usage.recent.map((entry) => (
                          <tr key={entry.id} className="text-white/80">
                            <td className="py-2.5 pr-4 whitespace-nowrap text-white/50">
                              {formatDate(entry.createdAt, dateLocale)}
                            </td>
                            <td className="py-2.5 pr-4 font-mono text-xs">
                              {entry.model}
                            </td>
                            <td className="py-2.5 pr-4">{entry.keyName}</td>
                            <td className="py-2.5 pr-4 text-right tabular-nums">
                              {formatTokens(entry.promptTokens, dateLocale)}
                            </td>
                            <td className="py-2.5 pr-4 text-right tabular-nums">
                              {formatTokens(entry.completionTokens, dateLocale)}
                            </td>
                            <td className="py-2.5 text-right tabular-nums font-medium text-[#2DD4BF]">
                              {formatTokens(entry.totalTokens, dateLocale)}
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

        <WalletLinkCard />

        <Card
          title={t("developers.createKeyTitle")}
          description={t("developers.createKeyDesc")}
          className="mb-6"
        >
          <div className="flex gap-2">
            <input
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder={t("developers.keyNamePlaceholder")}
              className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-[#2DD4BF]/50"
            />
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "..." : t("developers.createKey")}
            </Button>
          </div>

          {plainKey && (
            <div className="mt-4 rounded-lg border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 p-4">
              <p className="text-xs uppercase text-[#2DD4BF]">
                {t("developers.saveKeyNow")}
              </p>
              <code className="mt-2 block break-all text-sm">{plainKey}</code>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => navigator.clipboard.writeText(plainKey)}
              >
                {t("common.copy")}
              </Button>
            </div>
          )}
        </Card>

        <Card title={t("developers.yourKeys")}>
          {loading ? (
            <p className="text-sm text-white/50">{t("common.loading")}</p>
          ) : keys.length === 0 ? (
            <p className="text-sm text-white/50">{t("developers.noKeys")}</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {keys.map((k) => (
                <li
                  key={k.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{k.name}</p>
                    <p className="text-xs text-white/40">{k.keyPrefix}</p>
                    {k.lastUsedAt && (
                      <p className="mt-0.5 text-xs text-white/30">
                        {t("developers.lastUsed")} {formatDate(k.lastUsedAt, dateLocale)}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRevoke(k.id)}
                  >
                    {t("common.revoke")}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {error && <p className="mt-4 text-sm text-[#F472B6]">{error}</p>}

        <Card className="mt-6" title={t("developers.quickstart")}>
          <pre className="overflow-x-auto rounded-lg bg-black/40 p-4 text-xs text-white/80">
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
