"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ secret: secret.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Login gagal.");
      }

      router.replace(next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030308] px-6 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(167,139,250,0.12),transparent)]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A78BFA]">
            GercepAI Gateway
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold">
            Admin Login
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Masukkan{" "}
            <span className="font-mono text-white/70">GATEWAY_ADMIN_SECRET</span>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="cyber-panel space-y-4 rounded-2xl p-6"
        >
          <div>
            <label
              htmlFor="admin-secret"
              className="mb-1.5 block text-xs font-medium text-white/50"
            >
              Admin Secret
            </label>
            <input
              id="admin-secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Paste dari Vercel env..."
              className="w-full rounded-lg border border-[#00fff0]/20 bg-[#030308]/80 px-3 py-2.5 font-mono text-sm text-white outline-none placeholder:text-white/25 focus:border-[#00fff0]/50"
              autoComplete="off"
              required
            />
          </div>

          {error && <p className="text-sm text-[#F472B6]">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Enter Dashboard"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-white/35">
          <Link href="/" className="underline hover:text-white/55">
            ← Back to Gercep AI
          </Link>
        </p>
      </div>
    </div>
  );
}
