"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { ClientErrorBoundary } from "@/components/ui/ClientErrorBoundary";
import { canUseWebGL } from "@/lib/webgl";
import { GatewayScene } from "./hero-gateway/GatewayScene";

function HudCorner({ className }: { className: string }) {
  return (
    <div
      className={`pointer-events-none absolute h-8 w-8 border-[#00fff0]/60 ${className}`}
      aria-hidden
    />
  );
}

function GatewayFallbackArt() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#030308]">
      <div className="absolute inset-0 bg-gradient-to-t from-[#00fff0]/10 via-transparent to-[#ff00aa]/10" />
      <div className="absolute left-1/2 top-[38%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00fff0]/30 bg-[#00fff0]/5 shadow-[0_0_60px_rgba(0,255,240,0.25)] animate-pulse md:h-52 md:w-52" />
      <div className="absolute left-1/2 top-[38%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ff00aa]/20 md:h-72 md:w-72" />
      <div className="absolute left-1/2 top-[38%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#A78BFA]/15 md:h-96 md:w-96" />
      <div
        className="absolute inset-x-0 bottom-0 h-[55%] opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(90deg,rgba(0,255,240,0.35) 1px,transparent 1px),linear-gradient(rgba(0,255,240,0.2) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
          transform: "perspective(500px) rotateX(72deg)",
          transformOrigin: "bottom",
        }}
      />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="absolute left-1/2 top-[38%] h-px w-32 origin-left bg-gradient-to-r from-[#00fff0]/50 to-transparent md:w-40"
          style={{ transform: `rotate(${i * 60}deg)` }}
        />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`col-${i}`}
          className="absolute bottom-0 w-px animate-data-stream bg-gradient-to-t from-[#00fff0]/60 to-transparent"
          style={{
            left: `${10 + i * 11}%`,
            height: `${35 + (i % 3) * 12}%`,
            animationDelay: `${i * 0.25}s`,
            opacity: 0.35,
          }}
        />
      ))}
    </div>
  );
}

function GatewayFrame({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`relative h-[380px] w-full md:h-[500px] ${className}`}>
      <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#00fff0]/30 via-[#A78BFA]/20 to-[#ff00aa]/25 blur-xl opacity-70" />

      <div className="theme-dark-panel relative h-full overflow-hidden rounded-2xl border border-[#00fff0]/25 bg-[#030308]/90 shadow-[0_0_60px_-10px_rgba(0,255,240,0.45),inset_0_0_40px_rgba(0,255,240,0.05)]">
        <HudCorner className="left-3 top-3 border-l-2 border-t-2" />
        <HudCorner className="right-3 top-3 border-r-2 border-t-2" />
        <HudCorner className="bottom-3 left-3 border-b-2 border-l-2" />
        <HudCorner className="bottom-3 right-3 border-b-2 border-r-2" />

        <div className="pointer-events-none absolute inset-0 z-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.12)_2px,rgba(0,0,0,0.12)_4px)] opacity-40" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#00fff0]/60 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-gradient-to-r from-transparent via-[#ff00aa]/50 to-transparent" />

        {children}

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

export function HeroGateway3D({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWebglReady(canUseWebGL());
  }, []);

  if (!mounted) {
    return (
      <GatewayFrame className={className}>
        <GatewayFallbackArt />
      </GatewayFrame>
    );
  }

  if (!webglReady) {
    return (
      <GatewayFrame className={className}>
        <GatewayFallbackArt />
      </GatewayFrame>
    );
  }

  return (
    <GatewayFrame className={className}>
      <ClientErrorBoundary fallback={<GatewayFallbackArt />}>
        <Suspense fallback={<GatewayFallbackArt />}>
          <Canvas
            className="absolute inset-0 !h-full !w-full"
            style={{ position: "absolute", inset: 0 }}
            camera={{ position: [0, 0.15, 4.8], fov: 52 }}
            dpr={[1, 1.5]}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "default",
            }}
            onCreated={({ gl }) => {
              gl.setClearColor("#030308");
            }}
          >
            <GatewayScene />
          </Canvas>
        </Suspense>
      </ClientErrorBoundary>
    </GatewayFrame>
  );
}
