"use client";

import Link from "next/link";
import { HomeNavBar } from "@/components/marketing/HomeI18n";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const TIERS = [
  {
    key: "lanePlayground",
    titleKey: "homeSections.lanePlaygroundTitle",
    descKey: "homeSections.lanePlaygroundDesc",
    ctaKey: "homeSections.lanePlaygroundCta",
    href: "/playground",
    live: true,
    price: "Free",
    priceNote: "Test models before you ship",
  },
  {
    key: "laneBuilder",
    titleKey: "homeSections.laneBuilderTitle",
    descKey: "homeSections.laneBuilderDesc",
    ctaKey: "homeSections.laneBuilderCta",
    href: "/developers",
    live: true,
    price: "Pay as you go",
    priceNote: "Top up credits · charged per token",
  },
  {
    key: "laneNetwork",
    titleKey: "homeSections.laneNetworkTitle",
    descKey: "homeSections.laneNetworkDesc",
    ctaKey: "homeSections.laneNetworkCta",
    href: null,
    live: false,
    price: "Custom",
    priceNote: "Reserved capacity · roadmap",
  },
] as const;

export default function PricingPage() {
  const { t } = useLanguage();

  return (
    <div
      className="relative min-h-screen text-white"
      style={{
        backgroundColor: "#050508",
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#2DD4BF]/[0.03] via-transparent to-[#A78BFA]/[0.04]"
        aria-hidden
      />

      <HomeNavBar />

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12 md:py-16">
        <header className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#2DD4BF]/70">
            {t("homeSections.pricingAccess")}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight md:text-5xl">
            Pricing
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/55">
            {t("homeSections.pricingHeadline")}
          </p>
        </header>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.key}
              className="flex flex-col rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 transition hover:border-[rgba(45,212,191,0.3)]"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A78BFA]">
                {t(`homeSections.${tier.key}`)}
              </span>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-lg font-semibold">
                {t(tier.titleKey)}
              </h2>
              <p className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold text-[#2DD4BF]">
                {tier.price}
              </p>
              <p className="mt-1 font-mono text-[11px] text-white/40">
                {tier.priceNote}
              </p>
              <p className="mt-4 flex-1 text-sm text-white/50">
                {t(tier.descKey)}
              </p>
              {tier.live && tier.href ? (
                <Link
                  href={tier.href}
                  className="mt-6 inline-block text-sm font-medium text-[#2DD4BF] transition hover:text-[#2DD4BF]/80"
                >
                  {t(tier.ctaKey)} →
                </Link>
              ) : (
                <span className="mt-6 inline-block text-sm font-medium text-white/30">
                  {t(tier.ctaKey)}
                </span>
              )}
            </div>
          ))}
        </div>

        <section className="mt-16 rounded-2xl border border-white/10 bg-black/30 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            How billing works
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold">
            One gateway · pay per token · top up anytime
          </h2>
          <ul className="mt-6 space-y-3 text-sm text-white/55">
            <li>
              <span className="font-mono text-[#2DD4BF]">01</span> Create an API
              key at{" "}
              <Link href="/developers" className="text-[#2DD4BF] hover:underline">
                /developers
              </Link>
            </li>
            <li>
              <span className="font-mono text-[#2DD4BF]">02</span> Top up credits
              via Stripe ($5 / $10 / $25)
            </li>
            <li>
              <span className="font-mono text-[#2DD4BF]">03</span> Every
              completion deducts from your balance automatically
            </li>
            <li>
              <span className="font-mono text-[#2DD4BF]">04</span> Browse live
              model routes at{" "}
              <Link href="/models" className="text-[#2DD4BF] hover:underline">
                /models
              </Link>
            </li>
          </ul>
        </section>

        <section className="mt-16 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center md:p-12">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold md:text-3xl">
            Ready to build?
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/developers"
              className="rounded-full bg-[#2DD4BF] px-6 py-3 text-sm font-medium text-[#050508] transition hover:bg-[#2DD4BF]/90"
            >
              {t("common.createApiKey")}
            </Link>
            <Link
              href="/docs"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/30"
            >
              {t("common.docs")}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
