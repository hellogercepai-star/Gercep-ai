"use client";

/** Full-page cyberpunk atmosphere — grid horizon, neon fog, scanlines, grain */
export function CyberBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* Base void */}
      <div className="absolute inset-0 bg-[#030308]" />

      {/* Horizon neon city glow */}
      <div className="absolute inset-x-0 bottom-0 h-[55vh] bg-gradient-to-t from-[#2DD4BF]/12 via-[#A78BFA]/6 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[35vh] bg-gradient-to-t from-[#F472B6]/8 via-transparent to-transparent" />

      {/* Top aurora */}
      <div className="absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-[#2DD4BF]/14 blur-[100px] animate-cyber-pulse" />
      <div className="absolute top-0 right-0 h-[380px] w-[480px] rounded-full bg-[#A78BFA]/12 blur-[110px] animate-cyber-pulse-slow" />
      <div className="absolute top-1/3 -left-20 h-[300px] w-[300px] rounded-full bg-[#F472B6]/10 blur-[90px] animate-cyber-drift" />

      {/* Perspective grid floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[70vh] opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, transparent 0%, #030308 88%),
            linear-gradient(90deg, rgba(45,212,191,0.35) 1px, transparent 1px),
            linear-gradient(rgba(45,212,191,0.2) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px, 48px 48px",
          transform: "perspective(500px) rotateX(68deg)",
          transformOrigin: "center bottom",
          maskImage: "linear-gradient(to top, black 20%, transparent 95%)",
        }}
      />

      {/* Secondary violet grid layer */}
      <div
        className="absolute inset-x-0 bottom-0 h-[50vh] opacity-25 animate-cyber-grid-scroll"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(167,139,250,0.5) 1px, transparent 1px),
            linear-gradient(rgba(167,139,250,0.25) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          transform: "perspective(600px) rotateX(72deg)",
          transformOrigin: "center bottom",
          maskImage: "linear-gradient(to top, black 10%, transparent 90%)",
        }}
      />

      {/* Hex mesh overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%232DD4BF' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Scanlines */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.15)_2px,rgba(0,0,0,0.15)_4px)] opacity-30" />

      {/* Moving scan beam */}
      <div className="absolute inset-x-0 h-24 animate-cyber-scan bg-gradient-to-b from-[#2DD4BF]/0 via-[#2DD4BF]/8 to-transparent opacity-60" />

      {/* Film grain */}
      <div className="absolute inset-0 opacity-[0.035] mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#030308_75%)] opacity-80" />
    </div>
  );
}
