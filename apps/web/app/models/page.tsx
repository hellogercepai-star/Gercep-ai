"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HomeNavBar } from "@/components/marketing/HomeI18n";
import {
  SHOWCASE_MODELS,
  type ShowcaseModel,
} from "@/lib/gateway/marketing-models";

type FilterTab = "all" | "live" | "coming_soon";

const PROVIDER_COLORS: Record<string, string> = {
  deepseek: "#2DD4BF",
  openai: "#10B981",
  anthropic: "#F59E0B",
  google: "#3B82F6",
  alibaba: "#EF4444",
  meta: "#6366F1",
  mistral: "#8B5CF6",
  nvidia: "#22C55E",
  xai: "#F472B6",
};

function providerColor(ownedBy: string) {
  return PROVIDER_COLORS[ownedBy] ?? "#A78BFA";
}

function providerInitial(ownedBy: string) {
  return ownedBy.charAt(0).toUpperCase();
}

function ModelCard({ model }: { model: ShowcaseModel }) {
  const isLive = model.status === "live";
  const color = providerColor(model.ownedBy);

  return (
    <article
      className="group flex flex-col rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 transition hover:border-[rgba(45,212,191,0.3)] hover:bg-[rgba(255,255,255,0.03)]"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-display)] text-sm font-bold text-[#050508]"
          style={{ backgroundColor: color }}
          aria-hidden
        >
          {providerInitial(model.ownedBy)}
        </div>
        {isLive ? (
          <span className="rounded-full border border-[#2DD4BF]/40 bg-[#2DD4BF]/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#2DD4BF] shadow-[0_0_12px_rgba(45,212,191,0.25)]">
            Live
          </span>
        ) : (
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-white/40 opacity-50">
            Coming soon
          </span>
        )}
      </div>

      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
        {model.label}
      </h2>
      <p className="mt-1 break-all font-mono text-xs text-white/45">{model.id}</p>
      <span className="mt-3 inline-flex w-fit rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-white/50">
        {model.ownedBy}
      </span>

      <div className="mt-5 flex-1" />

      {isLive ? (
        <Link
          href={`/playground?model=${encodeURIComponent(model.id)}`}
          className="mt-4 inline-flex items-center justify-center rounded-lg border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-4 py-2.5 text-sm font-medium text-[#2DD4BF] transition group-hover:border-[#2DD4BF]/50 group-hover:bg-[#2DD4BF]/15"
        >
          Try in Playground →
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="mt-4 inline-flex cursor-not-allowed items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/30"
        >
          Notify me
        </button>
      )}
    </article>
  );
}

export default function ModelsPage() {
  const [filter, setFilter] = useState<FilterTab>("all");

  const liveCount = SHOWCASE_MODELS.filter((m) => m.status === "live").length;
  const totalCount = SHOWCASE_MODELS.length;

  const filtered = useMemo(() => {
    if (filter === "live") {
      return SHOWCASE_MODELS.filter((m) => m.status === "live");
    }
    if (filter === "coming_soon") {
      return SHOWCASE_MODELS.filter((m) => m.status === "coming_soon");
    }
    return SHOWCASE_MODELS;
  }, [filter]);

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "live", label: "Live" },
    { id: "coming_soon", label: "Coming Soon" },
  ];

  return (
    <div
      className="relative min-h-screen text-white"
      style={{
        backgroundColor: "#050508",
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#2DD4BF]/[0.03] via-transparent to-[#A78BFA]/[0.04]"
        aria-hidden
      />

      <HomeNavBar />

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12 md:py-16">
        <header className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#2DD4BF]/70">
            Gercep AI Gateway
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight md:text-5xl">
            Model Catalog
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/55">
            Every model route available through one Gercep gateway endpoint.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-[#2DD4BF]/25 bg-[#2DD4BF]/10 px-4 py-1.5 font-mono text-xs text-[#2DD4BF]">
              {liveCount} Live Models
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-xs text-white/60">
              {totalCount} Total Routes
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-xs text-white/60">
              OpenAI-Compatible
            </span>
          </div>
        </header>

        <div
          className="mt-10 flex flex-wrap gap-2 border-b border-white/10 pb-4"
          role="tablist"
          aria-label="Filter models"
        >
          {tabs.map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.id)}
                className={`rounded-lg px-4 py-2 font-mono text-xs uppercase tracking-wider transition ${
                  active
                    ? "border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 text-[#2DD4BF]"
                    : "border border-transparent text-white/45 hover:text-white/70"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-12 text-center text-sm text-white/40">
            No models in this filter.
          </p>
        ) : null}

        <section className="mt-20 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center md:p-12">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold md:text-3xl">
            Ready to build?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/50">
            Create an API key, point your OpenAI SDK at Gercep, and route traffic
            to any live model in this catalog.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/developers"
              className="rounded-full bg-[#2DD4BF] px-6 py-3 text-sm font-medium text-[#050508] transition hover:bg-[#2DD4BF]/90"
            >
              Create API Key
            </Link>
            <Link
              href="/docs"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white"
            >
              Read Docs
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
