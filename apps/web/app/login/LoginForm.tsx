"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const nextPath = searchParams.get("next") || "/dashboard";
  const fromWallet = searchParams.get("wallet") === "1";
  const isDevelopersFlow = nextPath === "/developers" || fromWallet;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070711] px-6">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Masuk ke Gercep AI
        </h1>
        <p className="mt-1 text-sm text-white/50">
          {isDevelopersFlow
            ? "Step 1 dari 2 — buat akun Gercep dulu."
            : "Lanjutkan kelola bisnis kamu."}
        </p>

        {isDevelopersFlow && (
          <div className="mt-4 rounded-lg border border-[#AB9FF2]/30 bg-[#AB9FF2]/10 p-3 text-xs leading-relaxed text-white/70">
            <p className="font-medium text-[#AB9FF2]">
              Phantom connect ≠ login Gercep
            </p>
            <p className="mt-1">
              Wallet Phantom buat verifikasi &amp; $GERCEP nanti. Akun email/password
              wajib untuk API keys &amp; usage.
            </p>
            <p className="mt-2 text-white/50">
              Setelah masuk → Connect Wallet → Sign &amp; Link
            </p>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs text-white/60">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/60">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/30"
            />
          </div>

          {error && <p className="text-xs text-[#F472B6]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#070711] transition hover:bg-white/90 disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/50">
          Belum punya akun?{" "}
          <a
            href={`/register${isDevelopersFlow ? `?next=${encodeURIComponent(nextPath)}&wallet=1` : nextPath !== "/dashboard" ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
            className="text-white underline"
          >
            Daftar
          </a>
        </p>
      </div>
    </main>
  );
}
