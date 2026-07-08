"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export interface AdminMetrics {
  generatedAt: string;
  activeApiKeys: number;
  requestsToday: number;
  requestsThisMonth: number;
  revenueTodayUsd: number;
  revenueMonthUsd: number;
  providerCostTodayUsd: number;
  providerCostMonthUsd: number;
  profitTodayUsd: number;
  profitMonthUsd: number;
  tokensToday: number;
  tokensMonth: number;
  avgLatencyMsToday: number;
  topModelsToday: { model: string; requests: number }[];
  topCustomersToday: { userId: string; requests: number }[];
}

function formatUsd(n: number): string {
  if (n === 0) return "$0.00";
  if (n < 0.0001) return `$${n.toFixed(8)}`;
  if (n < 0.01) return `$${n.toFixed(6)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatNum(n: number): string {
  return n.toLocaleString("en-US");
}

function StatCard({
  label,
  value,
  sub,
  accent = "#2DD4BF",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
        {label}
      </p>
      <p
        className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold md:text-3xl"
        style={{ color: accent }}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-white/45">{sub}</p>}
    </div>
  );
}

function BarRow({
  label,
  value,
  max,
  accent,
}: {
  label: string;
  value: number;
  max: number;
  accent: string;
}) {
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
        <span className="truncate font-mono text-white/70">{label}</span>
        <span className="shrink-0 text-white/45">{value} req</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: accent }}
        />
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/metrics", {
        credentials: "same-origin",
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setMetrics(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal load metrics.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  const handleLogout = async () => {
    await fetch("/api/v1/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
  };

  const marginToday =
    metrics && metrics.revenueTodayUsd > 0
      ? ((metrics.profitTodayUsd / metrics.revenueTodayUsd) * 100).toFixed(1)
      : "0";

  const maxModelReq =
    metrics?.topModelsToday.reduce((m, r) => Math.max(m, r.requests), 0) ?? 1;

  return (
    <div className="min-h-screen bg-[#030308] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,255,240,0.08),transparent)]" />

      <header className="relative z-10 border-b border-[#00fff0]/10 bg-[#030308]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#00fff0]/60">
              GercepAI · Admin
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold">
              Gateway Control Center
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/developers"
              className="text-xs text-white/50 underline hover:text-white/70"
            >
              Developers
            </Link>
            <Button variant="secondary" size="sm" onClick={() => load()}>
              Refresh
            </Button>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        {loading && !metrics ? (
          <p className="text-sm text-white/50">Loading metrics...</p>
        ) : error ? (
          <div className="rounded-xl border border-[#F472B6]/30 bg-[#F472B6]/10 p-4 text-sm text-[#F472B6]">
            {error}
          </div>
        ) : metrics ? (
          <div className="space-y-8">
            <p className="text-xs text-white/40">
              Updated{" "}
              {new Date(metrics.generatedAt).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "medium",
              })}
              {" · "}
              auto-refresh 60s
            </p>

            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Revenue & Profit · Today
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Revenue"
                  value={formatUsd(metrics.revenueTodayUsd)}
                  sub={`Month: ${formatUsd(metrics.revenueMonthUsd)}`}
                  accent="#2DD4BF"
                />
                <StatCard
                  label="AI Provider Cost"
                  value={formatUsd(metrics.providerCostTodayUsd)}
                  sub={`Month: ${formatUsd(metrics.providerCostMonthUsd)}`}
                  accent="#F472B6"
                />
                <StatCard
                  label="Gross Profit"
                  value={formatUsd(metrics.profitTodayUsd)}
                  sub={`Margin ${marginToday}% · Month ${formatUsd(metrics.profitMonthUsd)}`}
                  accent="#A78BFA"
                />
                <StatCard
                  label="Active API Keys"
                  value={formatNum(metrics.activeApiKeys)}
                  sub="Non-revoked keys"
                  accent="#fbbf24"
                />
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Usage · Today
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Requests Today"
                  value={formatNum(metrics.requestsToday)}
                  sub={`Month: ${formatNum(metrics.requestsThisMonth)}`}
                />
                <StatCard
                  label="Tokens Today"
                  value={formatNum(metrics.tokensToday)}
                  sub={`Month: ${formatNum(metrics.tokensMonth)}`}
                />
                <StatCard
                  label="Avg Latency"
                  value={
                    metrics.avgLatencyMsToday > 0
                      ? `${(metrics.avgLatencyMsToday / 1000).toFixed(2)}s`
                      : "—"
                  }
                  sub="Provider round-trip"
                  accent="#60A5FA"
                />
                <StatCard
                  label="Requests / Key"
                  value={
                    metrics.activeApiKeys > 0
                      ? (
                          metrics.requestsToday / metrics.activeApiKeys
                        ).toFixed(1)
                      : "0"
                  }
                  sub="Today average"
                />
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card title="Top Models · Today" className="cyber-panel">
                {metrics.topModelsToday.length === 0 ? (
                  <p className="text-sm text-white/45">No requests yet.</p>
                ) : (
                  <div className="space-y-4">
                    {metrics.topModelsToday.map((row) => (
                      <BarRow
                        key={row.model}
                        label={row.model}
                        value={row.requests}
                        max={maxModelReq}
                        accent="#2DD4BF"
                      />
                    ))}
                  </div>
                )}
              </Card>

              <Card title="Top Customers · Today" className="cyber-panel">
                {metrics.topCustomersToday.length === 0 ? (
                  <p className="text-sm text-white/45">No requests yet.</p>
                ) : (
                  <div className="space-y-3">
                    {metrics.topCustomersToday.map((row, i) => (
                      <div
                        key={row.userId}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] text-[#A78BFA]">
                            #{i + 1}
                          </span>
                          <span className="font-mono text-xs text-white/60">
                            {row.userId.slice(0, 8)}…{row.userId.slice(-4)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-[#2DD4BF]">
                          {row.requests} req
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <Card
              title="Cost Protection"
              description="AI requests are blocked pre-flight when quota, balance, or cost cap fails."
              className="cyber-panel border-[#00fff0]/20"
            >
              <div className="grid gap-3 sm:grid-cols-3 text-sm">
                <div className="rounded-lg border border-[#2DD4BF]/20 bg-[#2DD4BF]/5 p-3">
                  <p className="text-[10px] uppercase text-[#2DD4BF]">Status</p>
                  <p className="mt-1 font-medium">Active</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-[10px] uppercase text-white/40">Pricing</p>
                  <p className="mt-1 font-medium">DB-configured</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-[10px] uppercase text-white/40">Provider</p>
                  <p className="mt-1 font-medium">OpenAI · Gemini · Grok · NVIDIA · DeepSeek</p>
                </div>
              </div>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  );
}
