"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { adminFetch, formatNum, formatUsd } from "@/lib/admin/api";
import type { AdminMetrics } from "@/components/admin/AdminDashboard";
import {
  DualTrendChart,
  TimeSeriesChart,
  type TimeSeriesPoint,
} from "@/components/admin/TimeSeriesChart";

type Tab =
  | "overview"
  | "pricing"
  | "plans"
  | "customers"
  | "keys"
  | "settings"
  | "alerts"
  | "audit"
  | "export";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "pricing", label: "Pricing" },
  { id: "plans", label: "Plans" },
  { id: "customers", label: "Customers" },
  { id: "keys", label: "API Keys" },
  { id: "settings", label: "Settings" },
  { id: "alerts", label: "Alerts" },
  { id: "audit", label: "Audit" },
  { id: "export", label: "Export" },
];

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
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
        {label}
      </p>
      <p
        className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold"
        style={{ color: accent }}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-white/45">{sub}</p>}
    </div>
  );
}

export function AdminControlCenter() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [days, setDays] = useState(30);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [series, setSeries] = useState<TimeSeriesPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Panel data
  const [pricing, setPricing] = useState<{
    providers: Record<string, unknown>[];
    models: Record<string, unknown>[];
  } | null>(null);
  const [plans, setPlans] = useState<Record<string, unknown>[]>([]);
  const [customers, setCustomers] = useState<Record<string, unknown>[]>([]);
  const [keys, setKeys] = useState<Record<string, unknown>[]>([]);
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [alertsData, setAlertsData] = useState<Record<string, unknown> | null>(
    null
  );
  const [auditLogs, setAuditLogs] = useState<Record<string, unknown>[]>([]);
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<Record<string, unknown> | null>(null);

  const loadCore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, ts, h] = await Promise.all([
        adminFetch<AdminMetrics>("/api/v1/admin/metrics"),
        adminFetch<{ series: TimeSeriesPoint[] }>(
          `/api/v1/admin/timeseries?days=${days}`
        ),
        adminFetch<Record<string, unknown>>("/api/v1/admin/health"),
      ]);
      setMetrics(m);
      setSeries(ts.series);
      setHealth(h);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [days]);

  const loadTab = useCallback(async (t: Tab) => {
    setMsg(null);
    try {
      if (t === "pricing") {
        setPricing(await adminFetch("/api/v1/admin/pricing"));
      } else if (t === "plans") {
        const d = await adminFetch<{ plans: Record<string, unknown>[] }>(
          "/api/v1/admin/plans"
        );
        setPlans(d.plans);
      } else if (t === "customers") {
        const d = await adminFetch<{ customers: Record<string, unknown>[] }>(
          "/api/v1/admin/customers"
        );
        setCustomers(d.customers);
      } else if (t === "keys") {
        const d = await adminFetch<{ keys: Record<string, unknown>[] }>(
          "/api/v1/admin/keys"
        );
        setKeys(d.keys);
      } else if (t === "settings") {
        setSettings(await adminFetch("/api/v1/admin/settings"));
      } else if (t === "alerts") {
        setAlertsData(await adminFetch("/api/v1/admin/alerts"));
      } else if (t === "audit") {
        const d = await adminFetch<{ logs: Record<string, unknown>[] }>(
          "/api/v1/admin/audit"
        );
        setAuditLogs(d.logs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    }
  }, []);

  useEffect(() => {
    loadCore();
  }, [loadCore]);

  useEffect(() => {
    if (tab !== "overview") loadTab(tab);
  }, [tab, loadTab]);

  const handleLogout = async () => {
    await fetch("/api/v1/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
  };

  const marginToday =
    metrics && metrics.revenueTodayUsd > 0
      ? ((metrics.profitTodayUsd / metrics.revenueTodayUsd) * 100).toFixed(1)
      : "0";

  return (
    <div className="min-h-screen bg-[#030308] text-white">
      <header className="sticky top-0 z-20 border-b border-[#00fff0]/10 bg-[#030308]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#00fff0]/60">
              GercepAI · Control Center
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-lg font-semibold md:text-xl">
              Enterprise Admin
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/developers" className="text-xs text-white/50 underline">
              Developers
            </Link>
            <Button variant="secondary" size="sm" onClick={() => loadCore()}>
              Refresh
            </Button>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 md:px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                tab === t.id
                  ? "bg-[#00fff0]/15 text-[#00fff0]"
                  : "text-white/45 hover:text-white/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {error && (
          <div className="mb-4 rounded-xl border border-[#F472B6]/30 bg-[#F472B6]/10 p-3 text-sm text-[#F472B6]">
            {error}
          </div>
        )}
        {msg && (
          <div className="mb-4 rounded-xl border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 p-3 text-sm text-[#2DD4BF]">
            {msg}
          </div>
        )}

        {tab === "overview" && metrics && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-white/40">Chart range</span>
              {[7, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  className={`rounded-full px-3 py-1 text-xs ${
                    days === d ? "bg-white/10 text-white" : "text-white/40"
                  }`}
                >
                  {d}d
                </button>
              ))}
              {health && (
                <span className="ml-auto text-xs text-white/40">
                  DeepSeek:{" "}
                  <span
                    className={
                      (health.deepseek as { status?: string })?.status === "ok"
                        ? "text-[#2DD4BF]"
                        : "text-[#F472B6]"
                    }
                  >
                    {(health.deepseek as { status?: string })?.status ?? "?"}
                  </span>
                </span>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Revenue Today" value={formatUsd(metrics.revenueTodayUsd)} sub={`Month ${formatUsd(metrics.revenueMonthUsd)}`} />
              <StatCard label="AI Cost" value={formatUsd(metrics.providerCostTodayUsd)} accent="#F472B6" />
              <StatCard label="Gross Profit" value={formatUsd(metrics.profitTodayUsd)} sub={`Margin ${marginToday}%`} accent="#A78BFA" />
              <StatCard label="Requests Today" value={formatNum(metrics.requestsToday)} sub={`${formatNum(metrics.tokensToday)} tokens`} accent="#fbbf24" />
            </div>

            {series.length > 0 && (
              <div className="grid gap-4 lg:grid-cols-2">
                <DualTrendChart data={series} />
                <TimeSeriesChart data={series} dataKey="requests" label="Daily Requests" color="#2DD4BF" />
                <TimeSeriesChart data={series} dataKey="tokens" label="Daily Tokens" color="#60A5FA" formatValue={formatNum} />
                <TimeSeriesChart data={series} dataKey="revenueUsd" label="Daily Revenue" color="#2DD4BF" formatValue={formatUsd} />
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <Card title="Top Models Today">
                {metrics.topModelsToday.map((r) => (
                  <div key={r.model} className="flex justify-between py-2 text-sm">
                    <span className="font-mono">{r.model}</span>
                    <span className="text-[#2DD4BF]">{r.requests} req</span>
                  </div>
                ))}
              </Card>
              <Card title="Top Customers Today">
                {metrics.topCustomersToday.map((r) => (
                  <div key={r.userId} className="flex justify-between py-2 text-sm">
                    <span className="font-mono text-xs">{r.userId.slice(0, 12)}…</span>
                    <span className="text-[#A78BFA]">{r.requests} req</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {tab === "pricing" && pricing && (
          <PricingPanel
            data={pricing}
            onSaved={() => {
              setMsg("Pricing updated.");
              loadTab("pricing");
            }}
          />
        )}

        {tab === "plans" && (
          <PlansPanel
            plans={plans}
            onSaved={() => {
              setMsg("Plan updated.");
              loadTab("plans");
            }}
          />
        )}

        {tab === "customers" && (
          <CustomersPanel
            customers={customers}
            selectedId={selectedCustomer}
            detail={customerDetail}
            onSelect={async (id) => {
              setSelectedCustomer(id);
              setCustomerDetail(
                await adminFetch<Record<string, unknown>>(
                  `/api/v1/admin/customers/${id}`
                )
              );
            }}
            onSaved={() => {
              setMsg("Customer updated.");
              loadTab("customers");
              if (selectedCustomer) {
                adminFetch<Record<string, unknown>>(
                  `/api/v1/admin/customers/${selectedCustomer}`
                ).then(setCustomerDetail);
              }
            }}
          />
        )}

        {tab === "keys" && (
          <KeysPanel
            keys={keys}
            onRevoke={async (id) => {
              await adminFetch(`/api/v1/admin/keys?id=${id}`, {
                method: "DELETE",
              });
              setMsg("Key revoked.");
              loadTab("keys");
            }}
          />
        )}

        {tab === "settings" && settings && (
          <SettingsPanel
            settings={settings}
            onSaved={() => {
              setMsg("Settings saved.");
              loadTab("settings");
            }}
          />
        )}

        {tab === "alerts" && alertsData && (
          <AlertsPanel data={alertsData} health={health} />
        )}

        {tab === "audit" && (
          <Card title="Audit Log">
            <div className="max-h-96 overflow-auto">
              {auditLogs.map((log) => (
                <div
                  key={String(log.id)}
                  className="border-b border-white/5 py-2 text-xs"
                >
                  <span className="text-[#2DD4BF]">{String(log.action)}</span>
                  <span className="mx-2 text-white/30">·</span>
                  <span className="text-white/50">
                    {new Date(String(log.created_at)).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === "export" && <ExportPanel />}
      </main>
    </div>
  );
}

function PricingPanel({
  data,
  onSaved,
}: {
  data: { providers: Record<string, unknown>[]; models: Record<string, unknown>[] };
  onSaved: () => void;
}) {
  const models = data.models as Array<Record<string, unknown>>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#fbbf24]/30 bg-[#fbbf24]/10 p-4 text-sm text-white/70">
        <p className="font-medium text-[#fbbf24]">Cara verifikasi Save Pricing</p>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-xs">
          <li>Save di sini → cek tabel Supabase <strong>model_pricing</strong> (bukan usage_logs)</li>
          <li>Buka <strong>Playground</strong> → kirim 1 chat baru</li>
          <li>Supabase <strong>usage_logs</strong> → sort <strong>created_at DESC</strong> → row paling atas harus punya customer_charge</li>
        </ol>
        <p className="mt-2 text-[11px] text-white/45">
          Row lama dengan NULL tidak akan berubah — itu request sebelum billing pipeline.
        </p>
      </div>
      <Card title="Providers">
        {data.providers.map((p) => (
          <div key={String(p.id)} className="flex items-center justify-between py-2">
            <span>{String(p.name)}</span>
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-xs ${p.enabled ? "bg-[#2DD4BF]/20 text-[#2DD4BF]" : "bg-white/10 text-white/40"}`}
              onClick={async () => {
                await adminFetch("/api/v1/admin/pricing", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "toggle_provider",
                    id: p.id,
                    enabled: !p.enabled,
                  }),
                });
                onSaved();
              }}
            >
              {p.enabled ? "Enabled" : "Disabled"}
            </button>
          </div>
        ))}
      </Card>

      <Card title="Models · Pricing & Costs">
        <div className="space-y-6">
          {models.map((m) => (
              <ModelPricingRow
                key={String(m.id)}
                model={m}
                pricing={m.active_pricing as Record<string, unknown> | undefined}
                costs={m.active_costs as Record<string, unknown> | undefined}
                onSaved={onSaved}
              />
            ))}
        </div>
      </Card>
    </div>
  );
}

function ModelPricingRow({
  model,
  pricing,
  costs,
  onSaved,
}: {
  model: Record<string, unknown>;
  pricing?: Record<string, unknown>;
  costs?: Record<string, unknown>;
  onSaved: () => void;
}) {
  const [inP, setInP] = useState(String(pricing?.input_price_per_1m ?? ""));
  const [outP, setOutP] = useState(String(pricing?.output_price_per_1m ?? ""));
  const [inC, setInC] = useState(String(costs?.input_cost_per_1m ?? ""));
  const [outC, setOutC] = useState(String(costs?.output_cost_per_1m ?? ""));
  const [saving, setSaving] = useState(false);
  const [rowMsg, setRowMsg] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-white/10 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-sm">{String(model.model_id)}</span>
        <button
          type="button"
          className={`rounded-full px-3 py-1 text-xs ${model.enabled ? "bg-[#2DD4BF]/20 text-[#2DD4BF]" : "bg-white/10"}`}
          onClick={async () => {
            await adminFetch("/api/v1/admin/pricing", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "toggle_model",
                id: model.id,
                enabled: !model.enabled,
              }),
            });
            onSaved();
          }}
        >
          {model.enabled ? "Live" : "Off"}
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-white/50">
          Customer $/1M in
          <input value={inP} onChange={(e) => setInP(e.target.value)} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-1 font-mono text-sm" />
        </label>
        <label className="text-xs text-white/50">
          Customer $/1M out
          <input value={outP} onChange={(e) => setOutP(e.target.value)} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-1 font-mono text-sm" />
        </label>
        <label className="text-xs text-white/50">
          Provider $/1M in
          <input value={inC} onChange={(e) => setInC(e.target.value)} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-1 font-mono text-sm" />
        </label>
        <label className="text-xs text-white/50">
          Provider $/1M out
          <input value={outC} onChange={(e) => setOutC(e.target.value)} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-1 font-mono text-sm" />
        </label>
      </div>
      <Button
        size="sm"
        className="mt-3"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          setRowMsg(null);
          try {
            await adminFetch("/api/v1/admin/pricing", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "update_pricing",
                providerModelId: model.id,
                inputPricePer1M: Number(inP),
                outputPricePer1M: Number(outP),
              }),
            });
            await adminFetch("/api/v1/admin/pricing", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "update_costs",
                providerModelId: model.id,
                inputCostPer1M: Number(inC),
                outputCostPer1M: Number(outC),
              }),
            });
            setRowMsg("Saved! Kirim chat baru di Playground untuk update usage_logs.");
            onSaved();
          } catch (err) {
            setRowMsg(err instanceof Error ? err.message : "Save gagal.");
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving ? "Saving..." : "Save pricing"}
      </Button>
      {rowMsg && (
        <p className={`mt-2 text-xs ${rowMsg.includes("gagal") ? "text-[#F472B6]" : "text-[#2DD4BF]"}`}>
          {rowMsg}
        </p>
      )}
    </div>
  );
}

function PlansPanel({
  plans,
  onSaved,
}: {
  plans: Record<string, unknown>[];
  onSaved: () => void;
}) {
  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <PlanRow key={String(plan.id)} plan={plan} onSaved={onSaved} />
      ))}
    </div>
  );
}

function PlanRow({
  plan,
  onSaved,
}: {
  plan: Record<string, unknown>;
  onSaved: () => void;
}) {
  const [daily, setDaily] = useState(String(plan.daily_request_limit));
  const [rpm, setRpm] = useState(String(plan.requests_per_minute));

  return (
    <div className="rounded-xl border border-white/10 p-4">
      <p className="font-semibold">{String(plan.name)}</p>
      <p className="font-mono text-xs text-white/40">{String(plan.slug)}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-white/50">
          Daily requests
          <input value={daily} onChange={(e) => setDaily(e.target.value)} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-1" />
        </label>
        <label className="text-xs text-white/50">
          RPM
          <input value={rpm} onChange={(e) => setRpm(e.target.value)} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-1" />
        </label>
      </div>
      <Button
        size="sm"
        className="mt-3"
        onClick={async () => {
          await adminFetch("/api/v1/admin/plans", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: plan.id,
              daily_request_limit: Number(daily),
              requests_per_minute: Number(rpm),
            }),
          });
          onSaved();
        }}
      >
        Save plan
      </Button>
    </div>
  );
}

function CustomersPanel({
  customers,
  selectedId,
  detail,
  onSelect,
  onSaved,
}: {
  customers: Record<string, unknown>[];
  selectedId: string | null;
  detail: Record<string, unknown> | null;
  onSelect: (id: string) => void;
  onSaved: () => void;
}) {
  const [topup, setTopup] = useState("1.00");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Customers">
        {customers.map((c) => (
          <button
            key={String(c.userId)}
            type="button"
            onClick={() => onSelect(String(c.userId))}
            className={`mb-2 w-full rounded-lg border px-3 py-2 text-left text-sm ${
              selectedId === c.userId
                ? "border-[#2DD4BF]/40 bg-[#2DD4BF]/10"
                : "border-white/10"
            }`}
          >
            <span className="font-mono text-xs">{String(c.userId).slice(0, 16)}…</span>
            <span className="float-right text-[#2DD4BF]">
              {String((c.plan as { name?: string })?.name ?? "—")}
            </span>
          </button>
        ))}
      </Card>

      {detail && (
        <Card title="Customer Detail">
          <p className="font-mono text-xs break-all text-white/50">{selectedId}</p>
          <p className="mt-2 text-sm">
            Balance:{" "}
            <span className="text-[#2DD4BF]">
              {formatUsd(Number(detail.balanceUsd ?? 0))}
            </span>
          </p>
          <div className="mt-4 flex gap-2">
            <input
              value={topup}
              onChange={(e) => setTopup(e.target.value)}
              className="rounded border border-white/10 bg-black/30 px-2 py-1 text-sm"
            />
            <Button
              size="sm"
              onClick={async () => {
                await adminFetch("/api/v1/admin/customers", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "topup",
                    userId: selectedId,
                    amountUsd: Number(topup),
                    note: "Admin manual top-up",
                  }),
                });
                onSaved();
              }}
            >
              Top-up USD
            </Button>
          </div>
          <p className="mt-4 text-xs text-white/40">Recent transactions</p>
          {(detail.transactions as Record<string, unknown>[])?.slice(0, 5).map((tx) => (
            <div key={String(tx.id)} className="text-xs text-white/50">
              {String(tx.type)} {formatUsd(Number(tx.amount_usd))}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function KeysPanel({
  keys,
  onRevoke,
}: {
  keys: Record<string, unknown>[];
  onRevoke: (id: string) => void;
}) {
  return (
    <Card title="All API Keys">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-white/40">
            <tr>
              <th className="py-2">Name</th>
              <th>Prefix</th>
              <th>User</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={String(k.id)} className="border-t border-white/5">
                <td className="py-2">{String(k.name)}</td>
                <td className="font-mono">{String(k.key_prefix)}</td>
                <td className="font-mono">{String(k.user_id).slice(0, 8)}…</td>
                <td>{k.revoked_at ? "Revoked" : "Active"}</td>
                <td>
                  {!k.revoked_at && (
                    <button
                      type="button"
                      className="text-[#F472B6] underline"
                      onClick={() => onRevoke(String(k.id))}
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SettingsPanel({
  settings,
  onSaved,
}: {
  settings: Record<string, unknown>;
  onSaved: () => void;
}) {
  const cp = settings.costProtection as Record<string, unknown>;
  const [enabled, setEnabled] = useState(Boolean(cp?.enabled));
  const [maxCost, setMaxCost] = useState(String(cp?.maxEstimatedCostPerRequestUsd ?? 1));
  const [slack, setSlack] = useState(
    String((settings.alertConfig as Record<string, unknown>)?.slack_webhook_url ?? "")
  );

  return (
    <div className="space-y-6">
      <Card title="AI Cost Protection">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Enabled
        </label>
        <label className="mt-3 block text-xs text-white/50">
          Max estimated cost per request (USD)
          <input value={maxCost} onChange={(e) => setMaxCost(e.target.value)} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-1" />
        </label>
        <Button
          size="sm"
          className="mt-3"
          onClick={async () => {
            await adminFetch("/api/v1/admin/settings", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                costProtection: {
                  enabled,
                  maxEstimatedCostPerRequestUsd: Number(maxCost),
                  blockOnNegativeBalance: true,
                },
                alertConfig: { slack_webhook_url: slack },
              }),
            });
            onSaved();
          }}
        >
          Save settings
        </Button>
      </Card>
      <Card title="Stripe" description="Connect Stripe when ready for automated billing.">
        <p className="text-sm text-white/50">
          Status:{" "}
          {(settings.stripeConfig as { enabled?: boolean })?.enabled
            ? "Enabled"
            : "Not configured — manual top-up available in Customers tab"}
        </p>
      </Card>
    </div>
  );
}

function AlertsPanel({
  data,
  health,
}: {
  data: Record<string, unknown>;
  health: Record<string, unknown> | null;
}) {
  const alerts = (data.alerts as { level: string; message: string }[]) ?? [];
  return (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <Card title="Alerts">
          <p className="text-sm text-[#2DD4BF]">No active alerts.</p>
        </Card>
      ) : (
        alerts.map((a, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 text-sm ${
              a.level === "critical"
                ? "border-[#F472B6]/40 bg-[#F472B6]/10 text-[#F472B6]"
                : "border-[#fbbf24]/30 bg-[#fbbf24]/10 text-[#fbbf24]"
            }`}
          >
            {a.message}
          </div>
        ))
      )}
      {health && (
        <Card title="Provider Health">
          <p className="text-sm">
            DeepSeek latency:{" "}
            {(health.deepseek as { latencyMs?: number })?.latencyMs ?? "—"} ms
          </p>
        </Card>
      )}
    </div>
  );
}

function ExportPanel() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <Card title="Export Usage & Revenue">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-white/50">
          From (ISO date)
          <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="2026-07-01" className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-1" />
        </label>
        <label className="text-xs text-white/50">
          To
          <input value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-1" />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={`/api/v1/admin/export?format=csv${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`}
          className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-[#070711]"
        >
          Download CSV
        </a>
        <a
          href={`/api/v1/admin/export?format=json${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`}
          className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/70"
        >
          JSON preview
        </a>
      </div>
    </Card>
  );
}
