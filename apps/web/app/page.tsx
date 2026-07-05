import { HeroPlayground } from "@/components/marketing/HeroPlayground";
import { HomeHeroText, HomeNavBar } from "@/components/marketing/HomeI18n";
import { HomeSections } from "@/components/marketing/HomeSections";

export default function HomePage() {
  return (
    <div className="relative bg-[#070711] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-[#2DD4BF]/10 blur-[120px]" />
        <div className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-[#A78BFA]/10 blur-[120px]" />
        <div className="absolute bottom-1/3 left-0 h-[350px] w-[350px] rounded-full bg-[#F472B6]/8 blur-[120px]" />
      </div>

      <HomeNavBar />

      <section className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
        <HomeHeroText />
        <HeroPlayground />
      </section>

      <HomeSections />
    </div>
  );
}
