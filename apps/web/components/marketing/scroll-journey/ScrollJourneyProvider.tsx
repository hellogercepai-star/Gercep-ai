"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CHAPTER_META,
  JOURNEY_ORDER,
  type JourneyChapter,
} from "./types";

const DEFAULT_OPACITIES = Object.fromEntries(
  JOURNEY_ORDER.map((ch) => [ch, ch === "hero" ? 1 : 0])
) as Record<JourneyChapter, number>;

type ScrollJourneyContextValue = {
  activeChapter: JourneyChapter;
  chapterProgress: number;
  chapterOpacities: Record<JourneyChapter, number>;
  scrollProgress: number;
  registerSection: (chapter: JourneyChapter, el: HTMLElement | null) => void;
};

const ScrollJourneyContext = createContext<ScrollJourneyContextValue | null>(
  null
);

function chapterIndex(ch: JourneyChapter) {
  return JOURNEY_ORDER.indexOf(ch);
}

export function ScrollJourneyProvider({ children }: { children: ReactNode }) {
  const [activeChapter, setActiveChapter] = useState<JourneyChapter>("hero");
  const [chapterProgress, setChapterProgress] = useState(0);
  const [chapterOpacities, setChapterOpacities] =
    useState<Record<JourneyChapter, number>>(DEFAULT_OPACITIES);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionsRef = useRef<Map<JourneyChapter, HTMLElement>>(new Map());

  const registerSection = useCallback(
    (chapter: JourneyChapter, el: HTMLElement | null) => {
      if (el) sectionsRef.current.set(chapter, el);
      else sectionsRef.current.delete(chapter);
    },
    []
  );

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? window.scrollY / max : 0);

      const viewportMid = window.scrollY + window.innerHeight * 0.42;
      const blendRadius = window.innerHeight * 0.55;
      let best: JourneyChapter = "hero";
      let bestDist = Infinity;
      const opacities = { ...DEFAULT_OPACITIES };
      let progressSet = false;

      for (const chapter of JOURNEY_ORDER) {
        const el = sectionsRef.current.get(chapter);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const bottom = top + rect.height;
        const mid = (top + bottom) / 2;
        const dist = Math.abs(viewportMid - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = chapter;
        }
        const blend = Math.max(0, 1 - dist / blendRadius);
        opacities[chapter] = blend * blend;
        if (viewportMid >= top && viewportMid <= bottom) {
          const local = (viewportMid - top) / Math.max(rect.height, 1);
          setChapterProgress(Math.min(1, Math.max(0, local)));
          progressSet = true;
        }
      }
      if (!progressSet) setChapterProgress(0);
      setChapterOpacities(opacities);
      setActiveChapter(best);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const value = useMemo(
    () => ({
      activeChapter,
      chapterProgress,
      chapterOpacities,
      scrollProgress,
      registerSection,
    }),
    [activeChapter, chapterProgress, chapterOpacities, scrollProgress, registerSection]
  );

  return (
    <ScrollJourneyContext.Provider value={value}>
      {children}
    </ScrollJourneyContext.Provider>
  );
}

export function useScrollJourney() {
  const ctx = useContext(ScrollJourneyContext);
  if (!ctx) {
    throw new Error("useScrollJourney must be used within ScrollJourneyProvider");
  }
  return ctx;
}

export function JourneyProgressRail() {
  const { activeChapter, scrollProgress } = useScrollJourney();
  const activeIdx = chapterIndex(activeChapter);

  return (
    <div
      className="pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 md:flex"
      aria-hidden
    >
      <div className="relative h-48 w-px bg-white/10">
        <div
          className="absolute left-0 top-0 w-full origin-top bg-gradient-to-b from-[#00fff0] via-[#A78BFA] to-[#ff00aa] transition-all duration-300"
          style={{ height: `${scrollProgress * 100}%` }}
        />
      </div>
      {JOURNEY_ORDER.map((ch, i) => {
        const meta = CHAPTER_META[ch];
        const active = i === activeIdx;
        return (
          <div
            key={ch}
            className="flex items-center gap-2 transition-opacity duration-500"
            style={{ opacity: active ? 1 : 0.35 }}
          >
            <span
              className="font-mono text-[8px] tracking-[0.2em]"
              style={{ color: active ? meta.color : "rgba(255,255,255,0.4)" }}
            >
              {meta.label}
            </span>
            <span
              className="h-1.5 w-1.5 rounded-full transition-all duration-500"
              style={{
                backgroundColor: meta.color,
                boxShadow: active ? `0 0 10px ${meta.color}` : "none",
                transform: active ? "scale(1.4)" : "scale(1)",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
