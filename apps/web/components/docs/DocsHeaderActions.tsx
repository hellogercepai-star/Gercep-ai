"use client";

import Link from "next/link";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function DocsHeaderActions() {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <LanguageToggle />
      <Link
        href="/playground"
        className="text-sm text-white/60 transition hover:text-white"
      >
        {t("common.playground")}
      </Link>
      <Link
        href="/whitepaper"
        className="text-sm text-white/60 transition hover:text-white"
      >
        {t("common.whitepaper")}
      </Link>
      <Link
        href="/developers"
        className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/80 transition hover:border-white/30"
      >
        {t("common.apiKeys")}
      </Link>
    </div>
  );
}
