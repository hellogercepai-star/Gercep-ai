"use client";

import { useScrollJourney } from "./ScrollJourneyProvider";
import {
  CHAPTER_META,
  JOURNEY_ORDER,
  type JourneyChapter,
} from "./types";

function ShipCruiser({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 120 40"
      className={className}
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M8 20 L45 12 L95 18 L112 20 L95 22 L45 28 Z"
        fill="url(#shipGrad)"
        stroke="#00fff0"
        strokeWidth="0.5"
        opacity="0.9"
      />
      <path d="M45 12 L55 20 L45 28 Z" fill="#00fff0" opacity="0.3" />
      <ellipse cx="20" cy="20" rx="8" ry="3" fill="#ff00aa" opacity="0.6" />
      <path d="M95 18 L112 20 L95 22" stroke="#00fff0" strokeWidth="1" opacity="0.8" />
      <defs>
        <linearGradient id="shipGrad" x1="8" y1="20" x2="112" y2="20">
          <stop stopColor="#00fff0" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="#A78BFA" stopOpacity="0.25" />
          <stop offset="1" stopColor="#ff00aa" stopOpacity="0.15" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ShipScout({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 60 24" className={className} style={style} aria-hidden>
      <path
        d="M4 12 L30 6 L56 12 L30 18 Z"
        fill="#A78BFA"
        fillOpacity="0.2"
        stroke="#c084fc"
        strokeWidth="0.5"
      />
      <circle cx="48" cy="12" r="2" fill="#00fff0" opacity="0.8" />
    </svg>
  );
}

function Satellite({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} aria-hidden>
      <rect x="12" y="14" width="8" height="4" fill="#60A5FA" opacity="0.8" />
      <rect x="2" y="15" width="8" height="2" fill="#00fff0" opacity="0.5" />
      <rect x="22" y="15" width="8" height="2" fill="#00fff0" opacity="0.5" />
      <circle cx="16" cy="16" r="3" fill="#38bdf8" opacity="0.9" />
    </svg>
  );
}

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function ChapterLayer({
  chapter,
  opacity,
  children,
}: {
  chapter: JourneyChapter;
  opacity: number;
  children: React.ReactNode;
}) {
  const meta = CHAPTER_META[chapter];
  const visible = opacity > 0.02;
  return (
    <div
      className="absolute inset-0 transition-opacity duration-500 ease-out"
      style={{
        opacity,
        pointerEvents: "none",
        visibility: visible ? "visible" : "hidden",
      }}
      aria-hidden
    >
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: visible ? 1 : 0,
          background: `radial-gradient(ellipse 80% 50% at 50% 80%, ${meta.accent}18 0%, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}

export function EcosystemSky() {
  const { activeChapter, scrollProgress, chapterProgress, chapterOpacities } =
    useScrollJourney();
  const parallax = scrollProgress * 120;

  return (
    <div className="cyber-fx pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
      {/* Persistent flight path — connects all sectors */}
      <svg
        className="absolute inset-0 h-full w-full opacity-25"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="flightPathGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00fff0" />
            <stop offset="35%" stopColor="#A78BFA" />
            <stop offset="65%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <path
          d="M -2 22 Q 18 8, 35 28 T 58 18 T 82 32 T 105 42"
          fill="none"
          stroke="url(#flightPathGrad)"
          strokeWidth="0.15"
          strokeDasharray="1.2 2"
          pathLength={100}
          style={{
            strokeDashoffset: 100 - scrollProgress * 100,
          }}
          className="animate-dash-flow"
        />
        <circle
          cx={2 + scrollProgress * 98}
          cy={22 + Math.sin(scrollProgress * Math.PI * 2) * 8}
          r="0.6"
          fill="#00fff0"
          opacity={0.5 + scrollProgress * 0.5}
        />
      </svg>
      {/* Global warp streaks — intensify on pricing */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-1000"
        style={{
          opacity: activeChapter === "pricing" ? 0.7 : activeChapter === "horizon" ? 0.3 : 0,
          background: `repeating-linear-gradient(
            105deg,
            transparent,
            transparent 40px,
            rgba(255,0,170,0.03) 40px,
            rgba(255,0,170,0.03) 41px
          )`,
          transform: `translateX(${-parallax * 2}px)`,
        }}
      />

      {/* HERO — cruiser launch */}
      <ChapterLayer chapter="hero" opacity={chapterOpacities.hero}>
        <ShipCruiser
          className="absolute left-[5%] top-[18%] h-16 w-48 animate-ship-fly md:h-20 md:w-64"
          style={{ filter: "drop-shadow(0 0 20px #00fff0)" }}
        />
        <div className="absolute right-[10%] top-[28%] h-px w-32 bg-gradient-to-r from-transparent via-[#00fff0] to-transparent animate-ship-trail" />
        <div className="absolute bottom-[30%] left-1/2 h-64 w-64 -translate-x-1/2 rounded-full border border-[#00fff0]/10 animate-orbit-slow" />
      </ChapterLayer>

      {/* ECOSYSTEM — drone swarm */}
      <ChapterLayer chapter="ecosystem" opacity={chapterOpacities.ecosystem}>
        {[0, 1, 2, 3, 4].map((i) => (
          <ShipScout
            key={i}
            className="absolute h-8 w-20 animate-swarm"
            style={{
              top: `${15 + i * 12}%`,
              left: `${10 + i * 15}%`,
              animationDelay: `${i * 0.8}s`,
              opacity: 0.5 + i * 0.1,
            }}
          />
        ))}
        <svg className="absolute inset-0 h-full w-full opacity-20">
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={`${20 + i * 20}%`}
              y1="20%"
              x2={`${40 + i * 15}%`}
              y2="60%"
              stroke="#A78BFA"
              strokeWidth="0.5"
              strokeDasharray="4 8"
              className="animate-dash-flow"
            />
          ))}
        </svg>
      </ChapterLayer>

      {/* MODELS — orbital ring */}
      <ChapterLayer chapter="models" opacity={chapterOpacities.models}>
        <div className="absolute left-1/2 top-[25%] -translate-x-1/2">
          <div className="relative h-72 w-72 md:h-96 md:w-96">
            <div className="absolute inset-0 rounded-full border border-[#60A5FA]/20 animate-orbit-slow" />
            <div
              className="absolute inset-4 rounded-full border border-[#00fff0]/15 animate-orbit-reverse"
              style={{ animationDuration: "25s" }}
            />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 h-full w-full animate-orbit-sat"
                style={{
                  animationDuration: `${18 + i * 4}s`,
                  animationDelay: `${-i * 3}s`,
                }}
              >
                <Satellite
                  className="absolute left-1/2 top-0 h-8 w-8 -translate-x-1/2"
                  style={{ filter: "drop-shadow(0 0 8px #38bdf8)" }}
                />
              </div>
            ))}
          </div>
        </div>
      </ChapterLayer>

      {/* COMPUTE — neural fabric */}
      <ChapterLayer chapter="compute" opacity={chapterOpacities.compute}>
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-px animate-data-stream"
              style={{
                left: `${8 + i * 8}%`,
                height: "40%",
                top: "10%",
                background: `linear-gradient(to bottom, transparent, #00fff0, transparent)`,
                animationDelay: `${i * 0.3}s`,
                opacity: 0.4 + (i % 3) * 0.15,
              }}
            />
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-[20%] flex justify-center gap-8 opacity-40">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 w-16 animate-neural-pulse rounded-lg border border-[#2DD4BF]/30"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </div>
      </ChapterLayer>

      {/* PRICING — hyperspace */}
      <ChapterLayer chapter="pricing" opacity={chapterOpacities.pricing}>
        <ShipCruiser
          className="absolute left-1/2 top-[20%] h-12 w-36 -translate-x-1/2 animate-warp-ship"
          style={{ filter: "drop-shadow(0 0 30px #ff00aa)" }}
        />
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 h-px origin-left animate-warp-streak"
            style={{
              width: `${80 + pseudoRandom(i + 1) * 200}px`,
              ["--r" as string]: `${i * 18}deg`,
              transform: `rotate(${i * 18}deg)`,
              background: `linear-gradient(90deg, ${i % 2 ? "#ff00aa" : "#00fff0"}, transparent)`,
              animationDelay: `${i * 0.05}s`,
              opacity: 0.3 + chapterProgress * 0.4,
            }}
          />
        ))}
      </ChapterLayer>

      {/* HORIZON — megacity + landing */}
      <ChapterLayer chapter="horizon" opacity={chapterOpacities.horizon}>
        <div className="absolute inset-x-0 bottom-0 h-[45vh]">
          <div
            className="absolute inset-x-0 bottom-0 h-full opacity-60"
            style={{
              background: `linear-gradient(to top, #030308 0%, transparent 100%)`,
            }}
          />
          {/* City skyline */}
          <svg
            className="absolute bottom-0 w-full opacity-50"
            viewBox="0 0 1200 200"
            preserveAspectRatio="none"
            aria-hidden
          >
            {Array.from({ length: 40 }).map((_, i) => {
              const h = 30 + ((i * 17) % 120);
              const w = 20 + (i % 5) * 8;
              return (
                <rect
                  key={i}
                  x={i * 30}
                  y={200 - h}
                  width={w}
                  height={h}
                  fill="#0a0a14"
                  stroke="#00fff0"
                  strokeWidth="0.3"
                  strokeOpacity="0.3"
                />
              );
            })}
            {Array.from({ length: 60 }).map((_, i) => (
              <rect
                key={`w-${i}`}
                x={(i * 19) % 1180}
                y={200 - (40 + (i * 13) % 80) + ((i * 7) % 20)}
                width="2"
                height="2"
                fill="#fbbf24"
                opacity={0.3 + (i % 5) * 0.12}
              />
            ))}
          </svg>
          <ShipScout
            className="absolute bottom-[35%] left-[20%] h-10 w-24 animate-landing-ship opacity-70"
          />
        </div>
      </ChapterLayer>

      {/* Chapter label HUD */}
      <div className="absolute bottom-8 left-6 font-mono text-[10px] tracking-[0.3em] transition-all duration-700 md:left-10">
        <span className="text-white/30">SECTOR · </span>
        <span
          className="transition-colors duration-700"
          style={{ color: CHAPTER_META[activeChapter].color }}
        >
          {CHAPTER_META[activeChapter].label}
        </span>
        <span className="ml-3 text-white/20">
          {String(JOURNEY_ORDER.indexOf(activeChapter) + 1).padStart(2, "0")}/
          {String(JOURNEY_ORDER.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
