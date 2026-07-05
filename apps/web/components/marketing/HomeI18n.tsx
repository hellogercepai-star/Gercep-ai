"use client";

import Link from "next/link";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const navHrefs = [
  { key: "nav.models", href: "#models" },
  { key: "common.playground", href: "/playground" },
  { key: "nav.pricing", href: "#pricing" },
  { key: "common.docs", href: "/docs" },
  { key: "common.whitepaper", href: "/whitepaper" },
];

export function HomeNavBar() {
  const { t } = useLanguage();

  return (
    <nav className="relative z-20 border-b border-[#00fff0]/10 bg-[#030308]/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-lg font-semibold"
        >
          Gercep AI
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {navHrefs.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-white/60 transition hover:text-white"
            >
              {t(l.key)}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link
            href="/docs"
            className="hidden text-sm text-white/60 transition hover:text-white sm:inline"
          >
            {t("common.docs")}
          </Link>
          <Link
            href="/login"
            className="hidden text-sm text-white/60 transition hover:text-white sm:inline"
          >
            {t("common.signIn")}
          </Link>
          <Link
            href="/developers"
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white/80 transition hover:border-white/30 sm:border-0 sm:bg-white sm:text-[#070711] sm:hover:bg-white/90"
          >
            {t("common.apiKeys")}
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function HomeHeroText() {
  const { t } = useLanguage();

  return (
    <div>
      <span className="mb-6 inline-block rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-3 py-1 text-xs font-medium tracking-wide text-[#2DD4BF]">
        {t("home.badge")}
      </span>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl lg:text-6xl">
        {t("home.heroLine1")}
        <br />
        <span className="bg-gradient-to-r from-[#2DD4BF] via-[#A78BFA] to-[#F472B6] bg-clip-text text-transparent">
          {t("home.heroLine2")}
        </span>
      </h1>
      <p className="mt-5 max-w-lg text-base leading-relaxed text-white/60">
        {t("home.heroDesc")}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/playground"
          className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[#070711] transition hover:bg-white/90"
        >
          {t("common.openPlayground")}
        </Link>
        <Link
          href="/developers"
          className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/30"
        >
          {t("common.createApiKey")}
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-white/50 transition hover:text-white"
        >
          {t("home.businessOs")}
        </Link>
      </div>
    </div>
  );
}
