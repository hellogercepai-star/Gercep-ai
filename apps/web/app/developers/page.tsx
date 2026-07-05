"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { WalletLinkCard } from "@/components/wallet/WalletLinkCard";

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

function formatTokens(n: number) {
  return n.toLocaleString("id-ID");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
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
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [usage, setUsage] = useState<UsageStats | null>(null);
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

    const [keysRes, usageRes] = await Promise.all([
      fetch("/api/v1/keys"),
      fetch("/api/v1/usage"),
    ]);

    if (keysRes.status === 401 || usageRes.status === 401) {
      setNeedsLogin(true);
      setError("Login dulu untuk kelola API keys dan usage.");
      setLoading(false);
      return;
    }

    setNeedsLogin(false);

    const keysData = await keysRes.json();
    const usageData = await usageRes.json();

    if (keysRes.ok) setKeys(keysData.keys ?? []);
    else setError(keysData.error ?? "Gagal memuat keys.");

    if (usageRes.ok) setUsage(usageData);
    else setError((prev) => prev ?? usageData.error ?? "Gagal memuat usage.");

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
      setError(data.error ?? "Gagal membuat key.");
      setCreating(false);
      return;
    }

    setPlainKey(data.plainKey);
    setNewKeyName("");
    await loadData();
    setCreating(false);
  };

  const handleRevoke = async (id: string) => {
    if (
      !confirm(
        "Revoke API key ini? Aplikasi yang pakai key ini akan berhenti jalan."
      )
    )
      return;
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
            <p className="text-sm text-white/50">Developers — API Keys & Usage</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/docs"
              className="text-sm text-white/60 transition hover:text-white"
            >
              Docs
            </Link>
            <Link href="/playground">
              <Button variant="secondary" size="sm">
                Open Playground
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 pb-20">
        {needsLogin && (
          <div className="mb-6 rounded-xl border border-[#A78BFA]/30 bg-[#A78BFA]/10 p-4">
            <p className="text-sm text-white/80">
              Kamu belum login. Masuk dulu untuk API keys, usage, dan wallet.
            </p>
            <Link
              href="/login?next=/developers&wallet=1"
              className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-xs font-medium text-[#070711]"
            >
              Masuk / Daftar
            </Link>
          </div>
        )}
        {/* Usage summary */}
        <section className="mb-8">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold">
            Token Usage
          </h2>
          {loading ? (
            <p className="text-sm text-white/50">Memuat usage...</p>
          ) : usage ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatBox
                  label="Hari ini"
                  value={formatTokens(usage.summary.today.totalTokens)}
                  sub={`${usage.summary.today.requests} request`}
                />
                <StatBox
                  label="Bulan ini"
                  value={formatTokens(usage.summary.month.totalTokens)}
                  sub={`${usage.summary.month.requests} request`}
                />
                <StatBox
                  label="Total"
                  value={formatTokens(usage.summary.allTime.totalTokens)}
                  sub={`${usage.summary.allTime.requests} request`}
                />
              </div>

              {usage.byKey.length > 0 && (
                <Card title="Per API Key (bulan ini)" className="mt-4">
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
                            {formatTokens(k.totalTokens)} tokens
                          </p>
                          <p className="text-xs text-white/40">
                            {k.requests} request
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <Card title="Riwayat Request" className="mt-4">
                {usage.recent.length === 0 ? (
                  <p className="text-sm text-white/50">
                    Belum ada request. Coba kirim prompt di{" "}
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
                          <th className="pb-2 pr-4 font-medium">Waktu</th>
                          <th className="pb-2 pr-4 font-medium">Model</th>
                          <th className="pb-2 pr-4 font-medium">Key</th>
                          <th className="pb-2 pr-4 font-medium text-right">
                            Prompt
                          </th>
                          <th className="pb-2 pr-4 font-medium text-right">
                            Completion
                          </th>
                          <th className="pb-2 font-medium text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {usage.recent.map((entry) => (
                          <tr key={entry.id} className="text-white/80">
                            <td className="py-2.5 pr-4 whitespace-nowrap text-white/50">
                              {formatDate(entry.createdAt)}
                            </td>
                            <td className="py-2.5 pr-4 font-mono text-xs">
                              {entry.model}
                            </td>
                            <td className="py-2.5 pr-4">{entry.keyName}</td>
                            <td className="py-2.5 pr-4 text-right tabular-nums">
                              {formatTokens(entry.promptTokens)}
                            </td>
                            <td className="py-2.5 pr-4 text-right tabular-nums">
                              {formatTokens(entry.completionTokens)}
                            </td>
                            <td className="py-2.5 text-right tabular-nums font-medium text-[#2DD4BF]">
                              {formatTokens(entry.totalTokens)}
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
          title="Create API Key"
          description="Key format: sk-gercep-... — user pegang & simpan sendiri. Plain key hanya ditampilkan sekali."
          className="mb-6"
        >
          <div className="flex gap-2">
            <input
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Nama key (cth. Production App)"
              className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-[#2DD4BF]/50"
            />
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "..." : "Create Key"}
            </Button>
          </div>

          {plainKey && (
            <div className="mt-4 rounded-lg border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 p-4">
              <p className="text-xs uppercase text-[#2DD4BF]">
                Simpan key ini sekarang — tidak akan ditampilkan lagi
              </p>
              <code className="mt-2 block break-all text-sm">{plainKey}</code>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => navigator.clipboard.writeText(plainKey)}
              >
                Copy
              </Button>
            </div>
          )}
        </Card>

        <Card title="Your API Keys">
          {loading ? (
            <p className="text-sm text-white/50">Memuat...</p>
          ) : keys.length === 0 ? (
            <p className="text-sm text-white/50">Belum ada API key.</p>
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
                        Last used {formatDate(k.lastUsedAt)}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRevoke(k.id)}
                  >
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {error && <p className="mt-4 text-sm text-[#F472B6]">{error}</p>}

        <Card className="mt-6" title="Quickstart">
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
