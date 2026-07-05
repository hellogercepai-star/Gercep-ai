"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { t } = useLanguage();

  const nextPath = searchParams.get("next") || "/developers";
  const fromWallet = searchParams.get("wallet") === "1";
  const isDevelopersFlow = nextPath === "/developers" || fromWallet;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const registerHref = `/register${
    isDevelopersFlow
      ? `?next=${encodeURIComponent(nextPath)}&wallet=1`
      : nextPath !== "/developers"
        ? `?next=${encodeURIComponent(nextPath)}`
        : ""
  }`;

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

    router.push(nextPath.startsWith("/") ? nextPath : "/developers");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#070711] px-6">
      <div className="absolute right-6 top-6">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          {t("auth.loginTitle")}
        </h1>
        <p className="mt-1 text-sm text-white/50">
          {isDevelopersFlow
            ? t("auth.loginSubtitleDev")
            : t("auth.loginSubtitleBiz")}
        </p>

        {isDevelopersFlow && (
          <div className="mt-4 rounded-lg border border-[#AB9FF2]/30 bg-[#AB9FF2]/10 p-3 text-xs leading-relaxed text-white/70">
            <p className="font-medium text-[#AB9FF2]">{t("auth.phantomNote")}</p>
            <p className="mt-1">{t("auth.phantomDesc")}</p>
            <p className="mt-2 text-white/50">{t("auth.phantomSteps")}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs text-white/60">
              {t("auth.email")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/60">
              {t("auth.password")}
            </label>
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
            {loading ? t("auth.processing") : t("auth.loginBtn")}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/50">
          {t("auth.noAccount")}{" "}
          <Link href={registerHref} className="text-white underline">
            {t("common.signUp")}
          </Link>
        </p>
      </div>
    </main>
  );
}
