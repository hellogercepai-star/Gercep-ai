"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";

export function LoadingFallback() {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070711]">
      <p className="text-sm text-white/50">{t("common.loading")}</p>
    </main>
  );
}
