"use client";

import { useEffect, useRef, useState } from "react";
import { getLocaleMeta, LOCALES, type Locale } from "@/lib/i18n/types";
import { useLanguage } from "./LanguageProvider";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = getLocaleMeta(locale);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function pick(next: Locale) {
    setLocale(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("common.language")}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--text-primary)] transition hover:border-[var(--border-hover)]"
      >
        <span className="text-sm leading-none" aria-hidden>
          {current.flag}
        </span>
        <span className="max-w-[5.5rem] truncate">{current.nativeName}</span>
        <svg
          className={`h-3 w-3 shrink-0 opacity-60 transition ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label={t("common.selectLanguage")}
          className="absolute right-0 z-50 mt-2 max-h-72 w-52 overflow-y-auto rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] py-1 shadow-xl"
        >
          {LOCALES.map(({ code, flag, nativeName }) => {
            const active = locale === code;
            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => pick(code)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12px] transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className="text-base leading-none" aria-hidden>
                  {flag}
                </span>
                <span className="min-w-0 flex-1 truncate">{nativeName}</span>
                {active ? (
                  <span className="text-[10px] text-emerald-400">✓</span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
