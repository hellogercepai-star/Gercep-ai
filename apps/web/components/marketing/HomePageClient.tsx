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

export function HomePageClient() {
  return (
    <ScrollJourneyProvider>
      <div className="relative min-h-screen bg-[#030308] text-white">
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
  );
}
