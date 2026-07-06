"use client";

import Link from "next/link";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function DocsHeaderActions() {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <LanguageToggle />
      <Link
        href="/playground"
        className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
      >
        {t("common.playground")}
      </Link>
      <Link
        href="/whitepaper"
        className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
      >
        {t("common.whitepaper")}
      </Link>
      <Link
        href="/developers"
        className="rounded-full border border-[var(--border-default)] px-3 py-1.5 text-sm text-[var(--text-primary)] transition hover:border-[var(--border-hover)]"
      >
        {t("common.apiKeys")}
      </Link>
    </div>
  );
}
