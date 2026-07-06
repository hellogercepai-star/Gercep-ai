"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function LegalLayout({
  title,
  subtitle,
  updated,
  children,
}: {
  title: string;
  subtitle?: string;
  updated: string;
  children: ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="theme-surface min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] transition-[background-color,color] duration-300">
      <header className="theme-nav border-b border-[var(--border-default)] px-6 py-4">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-lg font-bold"
          >
            Gercep AI
          </Link>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <ThemeToggle />
            <LanguageToggle />
            <Link
              href="/privacy"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              {t("common.privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              {t("common.terms")}
            </Link>
            <Link
              href="/developers"
              className="rounded-full border border-[var(--border-default)] px-3 py-1.5 text-[var(--text-secondary)]"
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
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
            {subtitle}
          </p>
        ) : null}
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          {t("common.lastUpdated")}: {updated}
        </p>
        <div className="mt-8 max-w-none space-y-8 text-sm leading-relaxed">
          {children}
        </div>
      </main>
    </div>
  );
}
