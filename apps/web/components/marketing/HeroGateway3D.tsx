"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { GatewayScene } from "./hero-gateway/GatewayScene";

function HudCorner({ className }: { className: string }) {
  return (
    <div
      className={`pointer-events-none absolute h-8 w-8 border-[#00fff0]/60 ${className}`}
      aria-hidden
    />
  );
}

function GatewayFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#030308]">
      <div className="absolute inset-0 bg-gradient-to-t from-[#00fff0]/10 via-transparent to-[#ff00aa]/10" />
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(90deg,rgba(0,255,240,0.3) 1px,transparent 1px),linear-gradient(rgba(0,255,240,0.15) 1px,transparent 1px)",
          backgroundSize: "32px 32px",
          transform: "perspective(400px) rotateX(65deg)",
          transformOrigin: "bottom",
        }}
      />
    </div>
  );
}

export function HeroGateway3D({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`relative min-h-[340px] md:min-h-[460px] ${className}`}>
        <GatewayFallback />
      </div>
    );
  }

  return (
    <div className={`relative min-h-[340px] md:min-h-[460px] ${className}`}>
      {/* Outer neon glow */}
      <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#00fff0]/30 via-[#A78BFA]/20 to-[#ff00aa]/25 blur-xl opacity-70" />

      <div className="relative h-full min-h-[340px] overflow-hidden rounded-2xl border border-[#00fff0]/25 bg-[#030308]/90 shadow-[0_0_60px_-10px_rgba(0,255,240,0.45),inset_0_0_40px_rgba(0,255,240,0.05)] md:min-h-[460px]">
        {/* HUD corners */}
        <HudCorner className="left-3 top-3 border-l-2 border-t-2" />
        <HudCorner className="right-3 top-3 border-r-2 border-t-2" />
        <HudCorner className="bottom-3 left-3 border-b-2 border-l-2" />
        <HudCorner className="bottom-3 right-3 border-b-2 border-r-2" />

        {/* Scanlines overlay */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.12)_2px,rgba(0,0,0,0.12)_4px)] opacity-40" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#00fff0]/60 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-gradient-to-r from-transparent via-[#ff00aa]/50 to-transparent" />

        <Suspense fallback={<GatewayFallback />}>
          <Canvas
            className="!h-full !w-full"
            camera={{ position: [0, 0.3, 5.5], fov: 48 }}
            dpr={[1, 2]}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
            }}
          >
            <GatewayScene />
          </Canvas>
        </Suspense>

        {/* HUD readouts */}
        <div className="pointer-events-none absolute left-4 top-4 z-20 font-mono text-[9px] uppercase tracking-[0.25em] text-[#00fff0]/70">
          <div>SYS::GERCEP_GATEWAY</div>
          <div className="mt-0.5 text-[#ff00aa]/60">v0.2 · NEURAL_MESH</div>
        </div>
        <div className="pointer-events-none absolute right-4 top-4 z-20 text-right font-mono text-[9px] text-white/30">
          <div>LATENCY 12ms</div>
          <div className="text-[#00fff0]/50">NODES 847</div>
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded border border-[#00fff0]/30 bg-[#030308]/80 px-3 py-1.5 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00fff0] opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00fff0] shadow-[0_0_8px_#00fff0]" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00fff0]/80">
            Gateway Core · Online
          </span>
        </div>

        <div className="pointer-events-none absolute bottom-4 right-4 z-20 font-mono text-[9px] text-[#ff00aa]/50">
          $GERCEP · SOLANA
        </div>
      </div>
    </div>
  );
}
