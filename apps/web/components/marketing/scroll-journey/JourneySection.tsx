"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useScrollJourney } from "./ScrollJourneyProvider";
import type { JourneyChapter } from "./types";

export function JourneySection({
  chapter,
  id,
  className = "",
  children,
}: {
  chapter: JourneyChapter;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { registerSection, activeChapter } = useScrollJourney();
  const active = activeChapter === chapter;

  useEffect(() => {
    registerSection(chapter, ref.current);
    return () => registerSection(chapter, null);
  }, [chapter, registerSection]);

  return (
    <section
      ref={ref}
      id={id}
      data-journey={chapter}
      className={`relative transition-[filter] duration-700 ${className} ${
        active ? "journey-section-active" : ""
      }`}
    >
      {/* Section-local accent glow */}
      <div
        className="pointer-events-none absolute -inset-x-8 top-0 -z-10 h-32 opacity-0 transition-opacity duration-1000 journey-glow"
        aria-hidden
      />
      {children}
    </section>
  );
}
