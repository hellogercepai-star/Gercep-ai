"use client";

import { CyberBackdrop } from "@/components/marketing/CyberBackdrop";
import { HomeHero } from "@/components/marketing/HomeHero";
import { HomeNavBar } from "@/components/marketing/HomeI18n";
import { HomeSections } from "@/components/marketing/HomeSections";
import { EcosystemSky } from "@/components/marketing/scroll-journey/EcosystemSky";
import {
  JourneyProgressRail,
  ScrollJourneyProvider,
} from "@/components/marketing/scroll-journey/ScrollJourneyProvider";
import { ClientErrorBoundary } from "@/components/ui/ClientErrorBoundary";

function HomePageFallback() {
  return (
    <div className="relative min-h-screen bg-[#030308] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-[#00fff0]/70">
          Gercep AI
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">
          OpenAI-compatible inference gateway
        </h1>
        <p className="max-w-lg text-sm text-white/60">
          Interactive visuals could not load in this browser. You can still use
          the playground and developer tools.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <a
            href="/playground"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#070711]"
          >
            Playground
          </a>
          <a
            href="/developers"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80"
          >
            Developers
          </a>
        </div>
      </div>
    </div>
  );
}

export function HomePageClient() {
  return (
    <ClientErrorBoundary fallback={<HomePageFallback />}>
      <ScrollJourneyProvider>
        <div className="theme-surface home-shell relative min-h-screen bg-[var(--home-bg)] text-[var(--text-primary)] transition-[background-color,color] duration-300">
          <CyberBackdrop />
          <EcosystemSky />
          <JourneyProgressRail />

          <div className="relative z-10">
            <HomeNavBar />
            <HomeHero />
            <HomeSections />
          </div>
        </div>
      </ScrollJourneyProvider>
    </ClientErrorBoundary>
  );
}
