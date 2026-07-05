"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface HeaderProps {
  title: string;
  subtitle?: string;
  businessName?: string;
}

export function Header({ title, subtitle, businessName }: HeaderProps) {
  const { t } = useLanguage();
  const displayBusiness = businessName ?? t("common.myBusiness");

  return (
    <header className="flex items-center justify-between border-b border-white/10 px-8 py-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 text-sm text-white/50">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <LanguageToggle />
        <button className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:text-white">
          {displayBusiness} ▾
        </button>
        <LogoutButton />
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#2DD4BF] via-[#A78BFA] to-[#F472B6]" />
      </div>
    </header>
  );
}
