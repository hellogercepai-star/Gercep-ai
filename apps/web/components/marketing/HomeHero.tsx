"use client";

import dynamic from "next/dynamic";
import { HeroPlayground } from "@/components/marketing/HeroPlayground";
import { HomeHeroText } from "@/components/marketing/HomeI18n";
import { JourneySection } from "@/components/marketing/scroll-journey/JourneySection";

const HeroGateway3D = dynamic(
  () =>
    import("@/components/marketing/HeroGateway3D").then((m) => m.HeroGateway3D),
  {
    ssr: false,
    loading: () => (
      <div className="theme-dark-panel h-[380px] w-full animate-pulse rounded-2xl border border-[#00fff0]/20 bg-[#030308]/80 md:h-[500px]" />
    ),
  }
);

export function HomeHero() {
  return (
    <JourneySection chapter="hero" className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <HomeHeroText />
        <div className="relative flex flex-col gap-6">
          <HeroGateway3D className="w-full" />
          <HeroPlayground />
        </div>
      </div>
    </JourneySection>
  );
}
