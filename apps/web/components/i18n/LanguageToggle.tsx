"use client";

import { LOCALES } from "@/lib/i18n/types";
import { useLanguage } from "./LanguageProvider";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={`inline-flex rounded-full border border-white/10 bg-white/[0.04] p-0.5 ${className}`}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
            locale === code
              ? "bg-white text-[#070711]"
              : "text-white/50 hover:text-white"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
