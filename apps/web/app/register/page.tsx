"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070711] px-6">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Daftar ke Gercep AI
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Buat akun baru untuk mulai kelola bisnis kamu.
        </p>

        <form onSubmit={handleRegister} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs text-white/60">Nama</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/30"
            />
          </div>

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
              minLength={6}
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
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/50">
          Sudah punya akun?{" "}
          <a href="/login" className="text-white underline">
            Masuk
          </a>
        </p>
      </div>
    </main>
  );
}
