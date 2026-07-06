"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useTheme } from "@/components/theme/ThemeProvider";

function SunIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M21 14.5A8.5 8.5 0 1112.5 3a6.5 6.5 0 009.5 11.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`inline-flex h-8 w-[4.25rem] rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] ${className}`}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] p-0.5 ${className}`}
      role="group"
      aria-label={t("common.theme")}
    >
      <button
        type="button"
        aria-label={t("common.lightMode")}
        aria-pressed={theme === "light"}
        onClick={() => setTheme("light")}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
          theme === "light"
            ? "bg-[#A78BFA] text-white shadow-[0_0_12px_rgba(167,139,250,0.45)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        }`}
      >
        <SunIcon />
      </button>
      <button
        type="button"
        aria-label={t("common.darkMode")}
        aria-pressed={theme === "dark"}
        onClick={() => setTheme("dark")}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
          theme === "dark"
            ? "bg-[#A78BFA] text-white shadow-[0_0_12px_rgba(167,139,250,0.45)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        }`}
      >
        <MoonIcon />
      </button>
    </div>
  );
}
