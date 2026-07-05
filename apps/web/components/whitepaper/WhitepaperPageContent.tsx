"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { GERCEP_TIERS } from "@/lib/wallet/tiers";
import {
  GERCEP_ALLOCATION,
  GERCEP_SUPPLY,
  GERCEP_VESTING,
  formatTokenAmount,
} from "@/lib/tokenomics/gercep";

const sectionKeys = [
  { id: "abstract", labelKey: "whitepaper.sectionAbstract" },
  { id: "vision", labelKey: "whitepaper.sectionVision" },
  { id: "problem", labelKey: "whitepaper.sectionProblem" },
  { id: "solution", labelKey: "whitepaper.sectionSolution" },
  { id: "architecture", labelKey: "whitepaper.sectionArchitecture" },
  { id: "token", labelKey: "whitepaper.sectionToken" },
  { id: "tokenomics", labelKey: "whitepaper.sectionTokenomics" },
  { id: "tiers", labelKey: "whitepaper.sectionTiers" },
  { id: "roadmap", labelKey: "whitepaper.sectionRoadmap" },
] as const;

const navLinkKeys = [
  { labelKey: "whitepaper.navHome", href: "/" },
  { labelKey: "common.playground", href: "/playground" },
  { labelKey: "common.developers", href: "/developers" },
  { labelKey: "common.docs", href: "/docs" },
  { labelKey: "common.whitepaper", href: "/whitepaper" },
] as const;

const solutionCards = [
  { titleKey: "whitepaper.solutionUnifiedTitle", descKey: "whitepaper.solutionUnifiedDesc" },
  { titleKey: "whitepaper.solutionKeysTitle", descKey: "whitepaper.solutionKeysDesc" },
  { titleKey: "whitepaper.solutionUsageTitle", descKey: "whitepaper.solutionUsageDesc" },
  { titleKey: "whitepaper.solutionWalletTitle", descKey: "whitepaper.solutionWalletDesc" },
] as const;

const supplyStats = [
  { labelKey: "whitepaper.statTotalSupply", valueKey: "whitepaper.statTotalSupplyValue", subKey: "whitepaper.statTotalSupplySub" },
  { labelKey: "whitepaper.statDecimals", valueKey: "whitepaper.statDecimalsValue", subKey: "whitepaper.statDecimalsSub" },
  { labelKey: "whitepaper.statChain", valueKey: "whitepaper.statChainValue", subKey: "whitepaper.statChainSub" },
  { labelKey: "whitepaper.statTge", valueKey: "whitepaper.statTgeValue", subKey: "whitepaper.statTgeSub" },
] as const;

const roadmapBlocks = [
  {
    phaseKey: "whitepaper.roadmapPhase1",
    items: [
      "whitepaper.roadmapPhase1Item1",
      "whitepaper.roadmapPhase1Item2",
      "whitepaper.roadmapPhase1Item3",
      "whitepaper.roadmapPhase1Item4",
    ],
  },
  {
    phaseKey: "whitepaper.roadmapPhase2",
    items: [
      "whitepaper.roadmapPhase2Item1",
      "whitepaper.roadmapPhase2Item2",
      "whitepaper.roadmapPhase2Item3",
    ],
  },
  {
    phaseKey: "whitepaper.roadmapPhase3",
    items: [
      "whitepaper.roadmapPhase3Item1",
      "whitepaper.roadmapPhase3Item2",
      "whitepaper.roadmapPhase3Item3",
      "whitepaper.roadmapPhase3Item4",
    ],
  },
] as const;

const ARCH_DIAGRAM = `┌─────────────┐     sk-gercep-*      ┌──────────────────┐
│  Your App   │ ──────────────────► │  Gercep Gateway  │
│  (OpenAI    │   /api/v1/chat/      │  Auth · Quota ·  │
│   SDK)      │   completions        │  Usage log       │
└─────────────┘                      └────────┬─────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
             ┌────────────┐           ┌────────────┐           ┌────────────┐
             │  DeepSeek  │           │  Supabase  │           │   Solana   │
             │  (live)    │           │  keys ·    │           │  $GERCEP   │
             │            │           │  usage ·   │           │  balance   │
             └────────────┘           │  wallets   │           └────────────┘
                                      └────────────┘`;

export function WhitepaperPageContent() {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen bg-[#070711] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/3 h-[600px] w-[600px] rounded-full bg-[#A78BFA]/12 blur-[140px]" />
        <div className="absolute top-1/2 right-0 h-[400px] w-[400px] rounded-full bg-[#2DD4BF]/8 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-full bg-gradient-to-t from-[#0a0a18] to-transparent" />
      </div>

      <nav className="relative z-20 border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-lg font-semibold"
          >
            Gercep AI
          </Link>
          <div className="hidden items-center gap-5 md:flex">
            {navLinkKeys.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm transition hover:text-white ${
                  l.href === "/whitepaper" ? "text-[#A78BFA]" : "text-white/60"
                }`}
              >
                {t(l.labelKey)}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link
              href="/developers"
              className="hidden rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white/80 transition hover:border-white/30 sm:inline"
            >
              {t("common.apiKeys")}
            </Link>
            <Link
              href="/developers"
              className="rounded-full bg-gradient-to-r from-[#A78BFA] to-[#2DD4BF] px-4 py-2 text-xs font-medium text-[#070711] transition hover:opacity-90"
            >
              {t("whitepaper.getStarted")}
            </Link>
          </div>
        </div>
      </nav>

      <header className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-20 text-center md:pt-28">
        <span className="mb-6 inline-block rounded-full border border-[#A78BFA]/40 bg-[#A78BFA]/10 px-4 py-1.5 text-xs font-medium tracking-widest text-[#A78BFA] uppercase">
          {t("whitepaper.versionBadge")}
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
          {t("whitepaper.heroTitle1")}
          <br />
          <span className="bg-gradient-to-r from-[#2DD4BF] via-[#A78BFA] to-[#F472B6] bg-clip-text text-transparent">
            {t("whitepaper.heroTitle2")}
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
          {t("whitepaper.heroDesc")}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#abstract"
            className="rounded-full bg-white px-8 py-3 text-sm font-medium text-[#070711] transition hover:bg-white/90"
          >
            {t("whitepaper.readWhitepaper")}
          </a>
          <Link
            href="/playground"
            className="rounded-full border border-white/15 px-8 py-3 text-sm font-medium text-white/80 transition hover:border-white/30"
          >
            {t("whitepaper.tryPlayground")}
          </Link>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-white/40">
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#2DD4BF]">
              {t("common.live")}
            </p>
            <p>{t("whitepaper.statGateway")}</p>
          </div>
          <div className="hidden h-8 w-px bg-white/10 sm:block" />
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#A78BFA]">
              Phantom
            </p>
            <p>{t("whitepaper.statWallet")}</p>
          </div>
          <div className="hidden h-8 w-px bg-white/10 sm:block" />
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#F472B6]">
              DeepSeek
            </p>
            <p>{t("whitepaper.statModels")}</p>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pb-24 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-8 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
              {t("whitepaper.contents")}
            </p>
            <ul className="mt-3 space-y-2">
              {sectionKeys.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-white/50 transition hover:text-[#2DD4BF]"
                  >
                    {t(s.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <article className="min-w-0 space-y-16">
          <WhitepaperSection id="abstract" title={t("whitepaper.abstractTitle")}>
            <p>{t("whitepaper.abstractP1")}</p>
            <p className="mt-4">{t("whitepaper.abstractP2")}</p>
          </WhitepaperSection>

          <WhitepaperSection id="vision" title={t("whitepaper.visionTitle")}>
            <p>{t("whitepaper.visionP1")}</p>
            <blockquote className="mt-6 border-l-2 border-[#A78BFA] pl-4 text-lg italic text-white/70">
              {t("whitepaper.visionQuote")}
            </blockquote>
          </WhitepaperSection>

          <WhitepaperSection id="problem" title={t("whitepaper.problemTitle")}>
            <ul className="list-inside list-disc space-y-2 text-white/70">
              <li>{t("whitepaper.problem1")}</li>
              <li>{t("whitepaper.problem2")}</li>
              <li>{t("whitepaper.problem3")}</li>
              <li>{t("whitepaper.problem4")}</li>
            </ul>
          </WhitepaperSection>

          <WhitepaperSection id="solution" title={t("whitepaper.solutionTitle")}>
            <div className="grid gap-4 sm:grid-cols-2">
              {solutionCards.map((card) => (
                <div
                  key={card.titleKey}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <p className="font-medium text-[#2DD4BF]">{t(card.titleKey)}</p>
                  <p className="mt-2 text-sm text-white/55">{t(card.descKey)}</p>
                </div>
              ))}
            </div>
          </WhitepaperSection>

          <WhitepaperSection id="architecture" title={t("whitepaper.architectureTitle")}>
            <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-relaxed text-white/70">
              {ARCH_DIAGRAM}
            </pre>
            <p className="mt-4 text-sm text-white/50">
              {t("whitepaper.architectureNote")}
            </p>
          </WhitepaperSection>

          <WhitepaperSection id="token" title={t("whitepaper.tokenTitle")}>
            <p>{t("whitepaper.tokenP1")}</p>
            <div className="mt-6 rounded-xl border border-[#A78BFA]/30 bg-[#A78BFA]/5 p-5">
              <p className="text-xs uppercase tracking-wider text-[#A78BFA]">
                {t("whitepaper.tokenUtilityLabel")}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-white/65">
                <li>• {t("whitepaper.tokenUtility1")}</li>
                <li>• {t("whitepaper.tokenUtility2")}</li>
                <li>• {t("whitepaper.tokenUtility3")}</li>
                <li>• {t("whitepaper.tokenUtility4")}</li>
              </ul>
            </div>
            <p className="mt-4 text-sm text-white/45">{t("whitepaper.tokenNote")}</p>
          </WhitepaperSection>

          <WhitepaperSection id="tokenomics" title={t("whitepaper.tokenomicsTitle")}>
            <div className="rounded-xl border border-[#F472B6]/20 bg-[#F472B6]/5 p-4 text-sm text-white/60">
              <strong className="text-[#F472B6]">
                {t("whitepaper.tokenomicsDraftLabel")}
              </strong>{" "}
              — {t("whitepaper.tokenomicsDraftDesc")}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {supplyStats.map((stat, i) => (
                <div
                  key={stat.labelKey}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <p className="text-xs uppercase text-white/40">
                    {t(stat.labelKey)}
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-[#2DD4BF]">
                    {i === 0
                      ? formatTokenAmount(GERCEP_SUPPLY.total)
                      : i === 1
                        ? String(GERCEP_SUPPLY.decimals)
                        : i === 2
                          ? t(stat.valueKey)
                          : t(stat.valueKey)}
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    {i === 0
                      ? t(stat.subKey)
                      : i === 1
                        ? GERCEP_SUPPLY.standard
                        : i === 2
                          ? GERCEP_SUPPLY.chain
                          : t(stat.subKey)}
                  </p>
                </div>
              ))}
            </div>

            <h3 className="mt-10 text-lg font-semibold text-white">
              {t("whitepaper.allocationTitle")}
            </h3>
            <div className="mt-3 flex h-4 overflow-hidden rounded-full">
              {GERCEP_ALLOCATION.map((bucket, i) => {
                const colors = [
                  "bg-[#2DD4BF]",
                  "bg-[#A78BFA]",
                  "bg-[#F472B6]",
                  "bg-[#60A5FA]",
                  "bg-[#FBBF24]",
                  "bg-[#94A3B8]",
                ];
                return (
                  <div
                    key={bucket.id}
                    className={colors[i % colors.length]}
                    style={{ width: `${bucket.percent}%` }}
                    title={`${bucket.label} ${bucket.percent}%`}
                  />
                );
              })}
            </div>
            <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-xs uppercase text-white/40">
                    <th className="px-4 py-3 font-medium">
                      {t("whitepaper.tableBucket")}
                    </th>
                    <th className="px-4 py-3 font-medium text-right">%</th>
                    <th className="px-4 py-3 font-medium text-right">
                      {t("whitepaper.tableTokens")}
                    </th>
                    <th className="px-4 py-3 font-medium">
                      {t("whitepaper.tablePurpose")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {GERCEP_ALLOCATION.map((bucket) => (
                    <tr key={bucket.id} className="text-white/75">
                      <td className="px-4 py-3 font-medium">{bucket.label}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {bucket.percent}%
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[#A78BFA]">
                        {formatTokenAmount(bucket.tokens)}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/50">
                        {bucket.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="mt-10 text-lg font-semibold text-white">
              {t("whitepaper.vestingTitle")}
            </h3>
            <p className="text-sm text-white/50">{t("whitepaper.vestingDesc")}</p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-xs uppercase text-white/40">
                    <th className="px-4 py-3 font-medium">
                      {t("whitepaper.tableBucket")}
                    </th>
                    <th className="px-4 py-3 font-medium">
                      {t("whitepaper.vestingTge")}
                    </th>
                    <th className="px-4 py-3 font-medium">
                      {t("whitepaper.vestingCliff")}
                    </th>
                    <th className="px-4 py-3 font-medium">
                      {t("whitepaper.vestingDuration")}
                    </th>
                    <th className="px-4 py-3 font-medium">
                      {t("whitepaper.vestingNotes")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {GERCEP_VESTING.map((row) => (
                    <tr key={row.bucket} className="text-white/70">
                      <td className="px-4 py-3 font-medium text-[#2DD4BF]">
                        {row.bucket}
                      </td>
                      <td className="px-4 py-3 text-xs">{row.tgeUnlock}</td>
                      <td className="px-4 py-3 text-xs">{row.cliff}</td>
                      <td className="px-4 py-3 text-xs">{row.vestingDuration}</td>
                      <td className="px-4 py-3 text-xs text-white/45">
                        {row.release}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#2DD4BF]/20 bg-[#2DD4BF]/5 p-4">
                <p className="text-xs uppercase text-[#2DD4BF]">
                  {t("whitepaper.deflationTitle")}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-white/60">
                  <li>• {t("whitepaper.deflation1")}</li>
                  <li>• {t("whitepaper.deflation2")}</li>
                  <li>• {t("whitepaper.deflation3")}</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[#A78BFA]/20 bg-[#A78BFA]/5 p-4">
                <p className="text-xs uppercase text-[#A78BFA]">
                  {t("whitepaper.earlyAccessTitle")}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-white/60">
                  <li>• {t("whitepaper.earlyAccess1")}</li>
                  <li>• {t("whitepaper.earlyAccess2")}</li>
                  <li>• {t("whitepaper.earlyAccess3")}</li>
                </ul>
              </div>
            </div>
          </WhitepaperSection>

          <WhitepaperSection id="tiers" title={t("whitepaper.tiersTitle")}>
            <p className="mb-4 text-white/60">{t("whitepaper.tiersDesc")}</p>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-xs uppercase text-white/40">
                    <th className="px-4 py-3 font-medium">
                      {t("whitepaper.tiersTableTier")}
                    </th>
                    <th className="px-4 py-3 font-medium">
                      {t("whitepaper.tiersTableMin")}
                    </th>
                    <th className="px-4 py-3 font-medium text-right">
                      {t("whitepaper.tiersTableDaily")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {GERCEP_TIERS.map((tier) => (
                    <tr key={tier.id} className="text-white/75">
                      <td className="px-4 py-3 font-medium text-[#2DD4BF]">
                        {tier.label}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {tier.minBalance === 0
                          ? t("whitepaper.tiersLinkedWallet")
                          : tier.minBalance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {tier.dailyRequests.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </WhitepaperSection>

          <WhitepaperSection id="roadmap" title={t("whitepaper.roadmapTitle")}>
            <div className="space-y-6">
              {roadmapBlocks.map((block) => (
                <div
                  key={block.phaseKey}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <p className="font-[family-name:var(--font-display)] font-semibold text-[#A78BFA]">
                    {t(block.phaseKey)}
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm text-white/60">
                    {block.items.map((itemKey) => (
                      <li key={itemKey} className="flex gap-2">
                        <span className="text-[#2DD4BF]">→</span>
                        {t(itemKey)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </WhitepaperSection>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#A78BFA]/10 to-[#2DD4BF]/10 p-8 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
              {t("whitepaper.ctaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/55">
              {t("whitepaper.ctaDesc")}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/developers"
                className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-[#070711]"
              >
                {t("common.createApiKey")}
              </Link>
              <Link
                href="/docs"
                className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-white/80"
              >
                {t("whitepaper.readApiDocs")}
              </Link>
            </div>
          </div>

          <p className="text-center text-[10px] text-white/25">
            {t("whitepaper.footerNote")}
          </p>
        </article>
      </div>
    </div>
  );
}

function WhitepaperSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold md:text-3xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-white/65">{children}</div>
    </section>
  );
}
