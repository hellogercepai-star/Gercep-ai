"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#070711] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-lg font-bold"
          >
            Gercep AI
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <LanguageToggle />
            <Link href="/privacy" className="text-white/60 hover:text-white">
              {t("common.privacy")}
            </Link>
            <Link href="/terms" className="text-white/60 hover:text-white">
              {t("common.terms")}
            </Link>
            <Link
              href="/developers"
              className="rounded-full border border-white/10 px-3 py-1.5 text-white/80"
            >
              {t("common.developers")}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10 pb-20">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          {title}
        </h1>
        <p className="mt-2 text-sm text-white/40">
          {t("common.lastUpdated")}: {updated}
        </p>
        <div className="prose prose-invert mt-8 max-w-none space-y-4 text-sm leading-relaxed text-white/65">
          {children}
        </div>
      </main>
    </div>
  );
}
