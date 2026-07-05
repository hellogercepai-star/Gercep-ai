export type JourneyChapter =
  | "hero"
  | "ecosystem"
  | "models"
  | "compute"
  | "pricing"
  | "horizon";

export const JOURNEY_ORDER: JourneyChapter[] = [
  "hero",
  "ecosystem",
  "models",
  "compute",
  "pricing",
  "horizon",
];

export const CHAPTER_META: Record<
  JourneyChapter,
  { label: string; color: string; accent: string }
> = {
  hero: { label: "LAUNCH", color: "#00fff0", accent: "#2DD4BF" },
  ecosystem: { label: "MESH", color: "#A78BFA", accent: "#c084fc" },
  models: { label: "ORBIT", color: "#60A5FA", accent: "#38bdf8" },
  compute: { label: "FABRIC", color: "#2DD4BF", accent: "#00fff0" },
  pricing: { label: "WARP", color: "#ff00aa", accent: "#F472B6" },
  horizon: { label: "CITY", color: "#fbbf24", accent: "#fcd34d" },
};
