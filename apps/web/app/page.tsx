import Link from "next/link";
import { HeroPlayground } from "@/components/marketing/HeroPlayground";
import { ModelMarquee } from "@/components/marketing/ModelMarquee";
import { SHOWCASE_MODELS, TRUSTED_BY } from "@/lib/gateway/marketing-models";

const navLinks = [
  { label: "Models", href: "#models" },
  { label: "Playground", href: "/playground" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Whitepaper", href: "/whitepaper" },
];

const computeCards = [
  {
    title: "Pooled compute",
    desc: "Package nodes, GPU clusters, and provider capacity into one access layer for model workloads.",
    tags: ["GPU pools", "node lanes", "burst capacity"],
  },
  {
    title: "Multi-model routing",
    desc: "Serve premium, open, and regional models through a single gateway without changing client code.",
    tags: ["DeepSeek", "GPT", "Claude", "Qwen"],
  },
  {
    title: "$GERCEP-backed access",
    desc: "Wallet-linked daily quota on the roadmap. API keys live today via Developers.",
    tags: ["Wallet proof — soon", "daily quota", "API keys — live"],
  },
  {
    title: "Private control plane",
    desc: "Keep balancing logic, pool selection, and capacity orchestration inside Gercep.",
    tags: ["Simple API outside", "proprietary fabric inside"],
  },
];

const accessLanes = [
  {
    tier: "Playground",
    title: "Live model testing",
    desc: "Try prompts against hosted models before creating an application key.",
    cta: "Open Playground",
    href: "/playground",
    live: true,
  },
  {
    tier: "Builder",
    title: "API key + usage dashboard",
    desc: "Create a scoped sk-gercep- key and track token usage per request.",
    cta: "Create Key",
    href: "/developers",
    live: true,
  },
  {
    tier: "Network",
    title: "Reserved capacity",
    desc: "Private pools and dedicated lanes — on the roadmap.",
    cta: "Coming soon",
    href: null,
    live: false,
  },
];

const featureCards = [
  {
    title: "Multi-model routing",
    desc: "DeepSeek today — more providers tomorrow. One base URL, one key.",
    href: "/playground",
  },
  {
    title: "Your API key",
    desc: "Developers hold sk-gercep- keys. Usage logged per request.",
    href: "/developers",
  },
  {
    title: "Business OS (dogfood)",
    desc: "Inventory, keuangan, dashboard — built on our own gateway.",
    href: "/dashboard",
  },
];

const gatewayEndpoints = [
  { label: "Realtime chat", path: "/api/v1/chat/completions", desc: "Standard messages request shape.", href: "/docs" },
  { label: "Model discovery", path: "/api/v1/models", desc: "List models available to your key.", href: "/docs" },
  { label: "Usage tracking", path: "/developers", desc: "Token stats per key from dashboard session.", href: "/developers" },
];

const faqs = [
  {
    q: "What is Gercep AI?",
    a: "Gercep AI is an OpenAI-compatible inference gateway that turns multiple model providers into one API for applications.",
  },
  {
    q: "Do I need to change SDKs?",
    a: "No. Use a compatible client, set the Gercep base URL to /api/v1, and send the same chat payload your app already uses.",
  },
  {
    q: "Which models can I test?",
    a: "DeepSeek Chat and DeepSeek Reasoner are live today. More providers coming soon.",
  },
  {
    q: "How does $GERCEP access work?",
    a: "Wallet-linked access will unlock daily request capacity. Application keys stay scoped while Gercep handles quota and routing.",
  },
  {
    q: "What should I try first?",
    a: "Start with the playground hero or /playground, then create a dashboard key when the flow is ready for users.",
  },
];

export default function HomePage() {
  return (
    <div className="relative bg-[#070711] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-[#2DD4BF]/10 blur-[120px]" />
        <div className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-[#A78BFA]/10 blur-[120px]" />
        <div className="absolute bottom-1/3 left-0 h-[350px] w-[350px] rounded-full bg-[#F472B6]/8 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-20 border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-lg font-semibold"
          >
            Gercep AI
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm text-white/60 transition hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/docs"
              className="hidden text-sm text-white/60 transition hover:text-white sm:inline"
            >
              Docs
            </Link>
            <Link
              href="/login"
              className="hidden text-sm text-white/60 transition hover:text-white sm:inline"
            >
              Sign in
            </Link>
            <Link
              href="/developers"
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white/80 transition hover:border-white/30 sm:border-0 sm:bg-white sm:text-[#070711] sm:hover:bg-white/90"
            >
              API Keys
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <span className="mb-6 inline-block rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-3 py-1 text-xs font-medium tracking-wide text-[#2DD4BF]">
            OpenAI-compatible inference gateway
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl lg:text-6xl">
            Leading models behind
            <br />
            <span className="bg-gradient-to-r from-[#2DD4BF] via-[#A78BFA] to-[#F472B6] bg-clip-text text-transparent">
              one Gercep gateway
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/60">
            Test fast in the Playground, create your{" "}
            <code className="text-[#2DD4BF]">sk-gercep-</code> API key, and ship
            with the same compatible request shape. Token usage tracked — ready
            for billing and{" "}
            <span className="font-medium text-[#A78BFA]">$GERCEP</span> ecosystem.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/playground"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[#070711] transition hover:bg-white/90"
            >
              Open Playground
            </Link>
            <Link
              href="/developers"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/30"
            >
              Create API Key
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-white/50 transition hover:text-white"
            >
              Business OS →
            </Link>
          </div>
        </div>
        <HeroPlayground />
      </section>

      {/* Core value props — copy asli Gercep, tetap di homepage */}
      <section className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-6 md:mx-6 lg:mx-auto lg:grid-cols-3 lg:px-0">
        {featureCards.map((f) => (
          <Link
            key={f.title}
            href={f.href}
            className="bg-[#070711] p-8 transition hover:bg-white/[0.03]"
          >
            <h3 className="font-[family-name:var(--font-display)] text-base font-semibold">
              {f.title}
            </h3>
            <p className="mt-2 text-sm text-white/50">{f.desc}</p>
            <span className="mt-3 inline-block text-xs text-[#2DD4BF]">
              Explore →
            </span>
          </Link>
        ))}
      </section>

      {/* Trusted by */}
      <section className="relative z-10 border-y border-white/5 py-6">
        <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30">
          Trusted by
        </p>
        <div className="overflow-hidden">
          <div className="flex w-max animate-marquee-slow gap-8 px-4">
            {[...TRUSTED_BY, ...TRUSTED_BY].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="shrink-0 text-sm text-white/40"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Model access */}
      <section id="models" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Model access
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl">
              Leading models behind
              <br />
              one Gercep gateway.
            </h2>
            <p className="mt-3 max-w-xl text-sm text-white/50">
              Test fast hosted models in the playground and graduate to API keys
              with the same compatible request shape.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/docs"
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/70 transition hover:border-white/30"
            >
              Browse models
            </Link>
            <Link
              href="/developers"
              className="rounded-full bg-white px-4 py-2 text-xs font-medium text-[#070711] transition hover:bg-white/90"
            >
              Create key
            </Link>
          </div>
        </div>
        <ModelMarquee />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SHOWCASE_MODELS.filter((m) => m.status === "live").map((m) => (
            <Link
              key={m.id}
              href={`/playground?model=${m.id}`}
              className="rounded-xl border border-[#2DD4BF]/20 bg-[#2DD4BF]/5 p-4 transition hover:border-[#2DD4BF]/40 hover:bg-[#2DD4BF]/10"
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#2DD4BF]">
                Live
              </span>
              <p className="mt-2 font-[family-name:var(--font-display)] text-sm font-semibold">
                {m.label}
              </p>
              <p className="mt-1 font-mono text-[10px] text-white/40">{m.id}</p>
              <span className="mt-2 inline-block text-[10px] text-[#2DD4BF]">
                Test in Playground →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Compute network */}
      <section className="relative z-10 border-t border-white/5 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            Compute network
          </p>
          <h2 className="mt-2 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl">
            The clean public API hides the messy compute fabric.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-white/50">
            Gercep makes distributed model capacity feel like one product: one
            base URL, one key, and one operational surface for builders.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {computeCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-white/10 bg-[#070711] p-6"
              >
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {card.desc}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] text-white/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          Pricing and access
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl">
          Start in the playground. Scale through gateway keys.
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {accessLanes.map((lane) => (
            <div
              key={lane.tier}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A78BFA]">
                {lane.tier}
              </span>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg font-semibold">
                {lane.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-white/50">{lane.desc}</p>
              {lane.live && lane.href ? (
                <Link
                  href={lane.href}
                  className="mt-6 inline-block text-sm font-medium text-[#2DD4BF] transition hover:text-[#2DD4BF]/80"
                >
                  {lane.cta} →
                </Link>
              ) : (
                <span className="mt-6 inline-block text-sm font-medium text-white/30">
                  {lane.cta}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Gateway surface */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-black/30 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            Gateway surface
          </p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold">
            One public API surface for model traffic, usage tracking, and quota
            enforcement.
          </h3>
          <div className="mt-6 flex flex-wrap gap-4 text-xs">
            <span className="rounded-lg border border-white/10 px-3 py-2 font-mono text-white/60">
              BASE <span className="text-[#2DD4BF]">/api/v1</span>
            </span>
            <span className="rounded-lg border border-white/10 px-3 py-2 font-mono text-white/60">
              KEYS <span className="text-[#2DD4BF]">sk-gercep-...</span>
            </span>
            <span className="rounded-lg border border-white/10 px-3 py-2 font-mono text-white/60">
              QUOTA <span className="text-[#A78BFA]">$GERCEP</span>
            </span>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {gatewayEndpoints.map((ep) => (
              <Link
                key={ep.path}
                href={ep.href}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-[#2DD4BF]/20 hover:bg-white/[0.04]"
              >
                <p className="text-sm font-medium">{ep.label}</p>
                <p className="mt-1 font-mono text-xs text-[#2DD4BF]">{ep.path}</p>
                <p className="mt-2 text-xs text-white/40">{ep.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 border-t border-white/5 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            Questions builders ask first
          </h2>
          <dl className="mt-8 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="border-b border-white/5 pb-6">
                <dt className="font-medium text-white/90">{faq.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-white/50">
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 border-t border-white/5 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Bring real model capacity into your next AI product.
          </h2>
          <p className="mt-3 text-white/50">
            Test the model lane in the playground, then ship against one
            compatible Gercep gateway.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/playground"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[#070711] transition hover:bg-white/90"
            >
              Open playground
            </Link>
            <Link
              href="/docs"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/30"
            >
              Read quickstart
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-4">
          <div>
            <p className="font-[family-name:var(--font-display)] font-semibold">
              Gercep AI
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/40">
              Multi-model LLM gateway for teams routing traffic across supported
              inference routes.
            </p>
          </div>
          {[
            {
              title: "Platform",
              links: [
                { l: "Models", h: "#models" },
                { l: "Pricing", h: "#pricing" },
                { l: "Playground", h: "/playground" },
                { l: "Developers", h: "/developers" },
              ],
            },
            {
              title: "Developers",
              links: [
                { l: "Docs", h: "/docs" },
                { l: "Whitepaper", h: "/whitepaper" },
                { l: "API quickstart", h: "/docs" },
                { l: "Dashboard", h: "/dashboard" },
              ],
            },
            {
              title: "Legal",
              links: [
                { l: "Privacy", h: "/privacy" },
                { l: "Terms", h: "/terms" },
                { l: "Whitepaper", h: "/whitepaper" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.l}>
                    <Link
                      href={link.h}
                      className="text-sm text-white/40 transition hover:text-white"
                    >
                      {link.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-6xl px-6 text-center text-[10px] text-white/25">
          local preview · v0.1
        </p>
      </footer>
    </div>
  );
}
