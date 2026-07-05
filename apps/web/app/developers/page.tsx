"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export default function DevelopersPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [plainKey, setPlainKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/keys");
    if (res.status === 401) {
      router.push("/login?next=/developers");
      return;
    }
    const data = await res.json();
    if (res.ok) setKeys(data.keys ?? []);
    else setError(data.error ?? "Gagal memuat keys.");
    setLoading(false);
  }, [router]);

  useEffect(() => {
    async function init() {
      await loadKeys();
    }
    init();
  }, [loadKeys]);

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
    await loadKeys();
    setCreating(false);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke API key ini? Aplikasi yang pakai key ini akan berhenti jalan."))
      return;
    await fetch(`/api/v1/keys?id=${id}`, { method: "DELETE" });
    await loadKeys();
  };

  return (
    <div className="min-h-screen bg-[#070711] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-lg font-bold"
            >
              Gercep AI
            </Link>
            <p className="text-sm text-white/50">Developers — API Keys</p>
          </div>
          <Link href="/playground">
            <Button variant="secondary" size="sm">
              Open Playground
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
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
{`curl https://your-domain/api/v1/chat/completions \\
  -H "Authorization: Bearer sk-gercep-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hello"}]}'`}
          </pre>
        </Card>
      </main>
    </div>
  );
}
