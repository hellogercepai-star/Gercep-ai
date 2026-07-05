"use client";

import Link from "next/link";
import { ModelMarquee } from "@/components/marketing/ModelMarquee";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { SHOWCASE_MODELS, TRUSTED_BY } from "@/lib/gateway/marketing-models";

export function HomeSections() {
  const { t } = useLanguage();

  const featureCards = [
    {
      titleKey: "homeSections.featureRoutingTitle",
      descKey: "homeSections.featureRoutingDesc",
      href: "/playground",
    },
    {
      titleKey: "homeSections.featureKeyTitle",
      descKey: "homeSections.featureKeyDesc",
      href: "/developers",
    },
    {
      titleKey: "homeSections.featureBizTitle",
      descKey: "homeSections.featureBizDesc",
      href: "/dashboard",
    },
  ];

  const computeCards = [
    {
      titleKey: "homeSections.computePooledTitle",
      descKey: "homeSections.computePooledDesc",
      tags: [
        "homeSections.tagGpuPools",
        "homeSections.tagNodeLanes",
        "homeSections.tagBurstCapacity",
      ],
    },
    {
      titleKey: "homeSections.computeRoutingTitle",
      descKey: "homeSections.computeRoutingDesc",
      tags: [
        "homeSections.tagDeepSeek",
        "homeSections.tagGpt",
        "homeSections.tagClaude",
        "homeSections.tagQwen",
      ],
    },
    {
      titleKey: "homeSections.computeGercepTitle",
      descKey: "homeSections.computeGercepDesc",
      tags: [
        "homeSections.tagWalletSoon",
        "homeSections.tagDailyQuota",
        "homeSections.tagApiKeysLive",
      ],
    },
    {
      titleKey: "homeSections.computeControlTitle",
      descKey: "homeSections.computeControlDesc",
      tags: [
        "homeSections.tagSimpleApi",
        "homeSections.tagProprietaryFabric",
      ],
    },
  ];

  const accessLanes = [
    {
      tierKey: "homeSections.tierPlayground",
      titleKey: "homeSections.lanePlaygroundTitle",
      descKey: "homeSections.lanePlaygroundDesc",
      ctaKey: "common.openPlayground",
      href: "/playground",
      live: true,
    },
    {
      tierKey: "homeSections.tierBuilder",
      titleKey: "homeSections.laneBuilderTitle",
      descKey: "homeSections.laneBuilderDesc",
      ctaKey: "common.createApiKey",
      href: "/developers",
      live: true,
    },
    {
      tierKey: "homeSections.tierNetwork",
      titleKey: "homeSections.laneNetworkTitle",
      descKey: "homeSections.laneNetworkDesc",
      ctaKey: "homeSections.comingSoon",
      href: null,
      live: false,
    },
  ];

  const gatewayEndpoints = [
    {
      labelKey: "homeSections.endpointChatLabel",
      path: "/api/v1/chat/completions",
      descKey: "homeSections.endpointChatDesc",
      href: "/docs",
    },
    {
      labelKey: "homeSections.endpointModelsLabel",
      path: "/api/v1/models",
      descKey: "homeSections.endpointModelsDesc",
      href: "/docs",
    },
    {
      labelKey: "homeSections.endpointUsageLabel",
      path: "/developers",
      descKey: "homeSections.endpointUsageDesc",
      href: "/developers",
    },
  ];

  const faqs = [
    { qKey: "homeSections.faq1Q", aKey: "homeSections.faq1A" },
    { qKey: "homeSections.faq2Q", aKey: "homeSections.faq2A" },
    { qKey: "homeSections.faq3Q", aKey: "homeSections.faq3A" },
    { qKey: "homeSections.faq4Q", aKey: "homeSections.faq4A" },
    { qKey: "homeSections.faq5Q", aKey: "homeSections.faq5A" },
  ];

  const footerCols = [
    {
      titleKey: "homeSections.footerPlatform",
      links: [
        { lKey: "nav.models", h: "#models" },
        { lKey: "nav.pricing", h: "#pricing" },
        { lKey: "common.playground", h: "/playground" },
        { lKey: "common.developers", h: "/developers" },
      ],
    },
    {
      titleKey: "homeSections.footerDevelopers",
      links: [
        { lKey: "common.docs", h: "/docs" },
        { lKey: "common.whitepaper", h: "/whitepaper" },
        { lKey: "homeSections.apiQuickstart", h: "/docs" },
        { lKey: "common.dashboard", h: "/dashboard" },
      ],
    },
    {
      titleKey: "homeSections.footerLegal",
      links: [
        { lKey: "common.privacy", h: "/privacy" },
        { lKey: "common.terms", h: "/terms" },
        { lKey: "common.whitepaper", h: "/whitepaper" },
      ],
    },
  ];

  return (
    <>
      <section className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-6 md:mx-6 lg:mx-auto lg:grid-cols-3 lg:px-0">
        {featureCards.map((f) => (
          <Link
            key={f.titleKey}
            href={f.href}
            className="bg-[#070711] p-8 transition hover:bg-white/[0.03]"
          >
            <h3 className="font-[family-name:var(--font-display)] text-base font-semibold">
              {t(f.titleKey)}
            </h3>
            <p className="mt-2 text-sm text-white/50">{t(f.descKey)}</p>
            <span className="mt-3 inline-block text-xs text-[#2DD4BF]">
              {t("home.explore")}
            </span>
          </Link>
        ))}
      </section>

      <section className="relative z-10 border-y border-white/5 py-6">
        <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30">
          {t("homeSections.trustedBy")}
        </p>
        <div className="overflow-hidden">
          <div className="flex w-max animate-marquee-slow gap-8 px-4">
            {[...TRUSTED_BY, ...TRUSTED_BY].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="shrink-0 text-sm text-white/40"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="models" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              {t("homeSections.modelAccess")}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl">
              {t("home.heroLine1")}
              <br />
              {t("homeSections.modelAccessHeadline")}
            </h2>
            <p className="mt-3 max-w-xl text-sm text-white/50">
              {t("homeSections.modelAccessDesc")}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/docs"
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/70 transition hover:border-white/30"
            >
              {t("homeSections.browseModels")}
            </Link>
            <Link
              href="/developers"
              className="rounded-full bg-white px-4 py-2 text-xs font-medium text-[#070711] transition hover:bg-white/90"
            >
              {t("homeSections.createKey")}
            </Link>
          </div>
        </div>
        <ModelMarquee />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SHOWCASE_MODELS.filter((m) => m.status === "live").map((m) => (
            <Link
              key={m.id}
              href={`/playground?model=${m.id}`}
              className="rounded-xl border border-[#2DD4BF]/20 bg-[#2DD4BF]/5 p-4 transition hover:border-[#2DD4BF]/40 hover:bg-[#2DD4BF]/10"
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#2DD4BF]">
                {t("common.live")}
              </span>
              <p className="mt-2 font-[family-name:var(--font-display)] text-sm font-semibold">
                {m.label}
              </p>
              <p className="mt-1 font-mono text-[10px] text-white/40">{m.id}</p>
              <span className="mt-2 inline-block text-[10px] text-[#2DD4BF]">
                {t("homeSections.testInPlayground")}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative z-10 border-t border-white/5 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            {t("homeSections.computeNetwork")}
          </p>
          <h2 className="mt-2 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl">
            {t("homeSections.computeHeadline")}
          </h2>
          <p className="mt-3 max-w-xl text-sm text-white/50">
            {t("homeSections.computeDesc")}
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {computeCards.map((card) => (
              <div
                key={card.titleKey}
                className="rounded-2xl border border-white/10 bg-[#070711] p-6"
              >
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
                  {t(card.titleKey)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {t(card.descKey)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {card.tags.map((tagKey) => (
                    <span
                      key={tagKey}
                      className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] text-white/40"
                    >
                      {t(tagKey)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          {t("homeSections.pricingAccess")}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl">
          {t("homeSections.pricingHeadline")}
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {accessLanes.map((lane) => (
            <div
              key={lane.tierKey}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A78BFA]">
                {t(lane.tierKey)}
              </span>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg font-semibold">
                {t(lane.titleKey)}
              </h3>
              <p className="mt-2 flex-1 text-sm text-white/50">
                {t(lane.descKey)}
              </p>
              {lane.live && lane.href ? (
                <Link
                  href={lane.href}
                  className="mt-6 inline-block text-sm font-medium text-[#2DD4BF] transition hover:text-[#2DD4BF]/80"
                >
                  {t(lane.ctaKey)} →
                </Link>
              ) : (
                <span className="mt-6 inline-block text-sm font-medium text-white/30">
                  {t(lane.ctaKey)}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-white/10 bg-black/30 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            {t("homeSections.gatewaySurface")}
          </p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold">
            {t("homeSections.gatewaySurfaceHeadline")}
          </h3>
          <div className="mt-6 flex flex-wrap gap-4 text-xs">
            <span className="rounded-lg border border-white/10 px-3 py-2 font-mono text-white/60">
              BASE <span className="text-[#2DD4BF]">/api/v1</span>
            </span>
            <span className="rounded-lg border border-white/10 px-3 py-2 font-mono text-white/60">
              KEYS <span className="text-[#2DD4BF]">sk-gercep-...</span>
            </span>
            <span className="rounded-lg border border-white/10 px-3 py-2 font-mono text-white/60">
              QUOTA <span className="text-[#A78BFA]">$GERCEP</span>
            </span>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {gatewayEndpoints.map((ep) => (
              <Link
                key={ep.path}
                href={ep.href}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-[#2DD4BF]/20 hover:bg-white/[0.04]"
              >
                <p className="text-sm font-medium">{t(ep.labelKey)}</p>
                <p className="mt-1 font-mono text-xs text-[#2DD4BF]">
                  {ep.path}
                </p>
                <p className="mt-2 text-xs text-white/40">{t(ep.descKey)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-white/5 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            {t("homeSections.faqTitle")}
          </h2>
          <dl className="mt-8 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.qKey} className="border-b border-white/5 pb-6">
                <dt className="font-medium text-white/90">{t(faq.qKey)}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-white/50">
                  {t(faq.aKey)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="relative z-10 border-t border-white/5 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            {t("homeSections.ctaTitle")}
          </h2>
          <p className="mt-3 text-white/50">{t("homeSections.ctaDesc")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/playground"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[#070711] transition hover:bg-white/90"
            >
              {t("homeSections.openPlaygroundCta")}
            </Link>
            <Link
              href="/docs"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/30"
            >
              {t("homeSections.readQuickstart")}
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-4">
          <div>
            <p className="font-[family-name:var(--font-display)] font-semibold">
              Gercep AI
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/40">
              {t("homeSections.footerTagline")}
            </p>
          </div>
          {footerCols.map((col) => (
            <div key={col.titleKey}>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                {t(col.titleKey)}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.lKey}>
                    <Link
                      href={link.h}
                      className="text-sm text-white/40 transition hover:text-white"
                    >
                      {t(link.lKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-6xl px-6 text-center text-[10px] text-white/25">
          {t("homeSections.footerVersion")}
        </p>
      </footer>
    </>
  );
}
