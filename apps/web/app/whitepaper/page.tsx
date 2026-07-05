import Link from "next/link";
import { GERCEP_TIERS } from "@/lib/wallet/tiers";
import {
  GERCEP_ALLOCATION,
  GERCEP_SUPPLY,
  GERCEP_VESTING,
  formatTokenAmount,
} from "@/lib/tokenomics/gercep";

const sections = [
  { id: "abstract", label: "Abstract" },
  { id: "vision", label: "Vision" },
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Solution" },
  { id: "architecture", label: "Architecture" },
  { id: "token", label: "$GERCEP" },
  { id: "tokenomics", label: "Tokenomics" },
  { id: "tiers", label: "Quota Tiers" },
  { id: "roadmap", label: "Roadmap" },
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Playground", href: "/playground" },
  { label: "Developers", href: "/developers" },
  { label: "Docs", href: "/docs" },
  { label: "Whitepaper", href: "/whitepaper" },
];

const roadmap = [
  {
    phase: "Phase 1 — Live",
    items: [
      "OpenAI-compatible gateway (/api/v1/chat/completions)",
      "API keys (sk-gercep-...) + usage logging",
      "Playground + Developers dashboard",
      "Phantom wallet link (signature verification)",
    ],
  },
  {
    phase: "Phase 2 — In progress",
    items: [
      "$GERCEP SPL token balance → quota tiers",
      "Daily request limits enforced on gateway",
      "Phantom in-app browser + mobile deeplink",
    ],
  },
  {
    phase: "Phase 3 — Planned",
    items: [
      "$GERCEP token launch on Solana mainnet",
      "Airdrop & holder rewards",
      "Multi-provider routing (GPT, Claude, Qwen)",
      "Reserved capacity & private pools",
    ],
  },
];

export default function WhitepaperPage() {
  return (
    <div className="relative min-h-screen bg-[#070711] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/3 h-[600px] w-[600px] rounded-full bg-[#A78BFA]/12 blur-[140px]" />
        <div className="absolute top-1/2 right-0 h-[400px] w-[400px] rounded-full bg-[#2DD4BF]/8 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-full bg-gradient-to-t from-[#0a0a18] to-transparent" />
      </div>

      <nav className="relative z-20 border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-lg font-semibold"
          >
            Gercep AI
          </Link>
          <div className="hidden items-center gap-5 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className={`text-sm transition hover:text-white ${
                  l.href === "/whitepaper" ? "text-[#A78BFA]" : "text-white/60"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/developers"
              className="hidden rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white/80 transition hover:border-white/30 sm:inline"
            >
              API Keys
            </Link>
            <Link
              href="/developers"
              className="rounded-full bg-gradient-to-r from-[#A78BFA] to-[#2DD4BF] px-4 py-2 text-xs font-medium text-[#070711] transition hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-20 text-center md:pt-28">
        <span className="mb-6 inline-block rounded-full border border-[#A78BFA]/40 bg-[#A78BFA]/10 px-4 py-1.5 text-xs font-medium tracking-widest text-[#A78BFA] uppercase">
          Whitepaper v0.2
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
          DEVELOPER GATEWAY
          <br />
          <span className="bg-gradient-to-r from-[#2DD4BF] via-[#A78BFA] to-[#F472B6] bg-clip-text text-transparent">
            In the age of AI
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
          Gercep AI is building an OpenAI-compatible inference gateway with
          wallet-linked access powered by{" "}
          <span className="font-medium text-[#A78BFA]">$GERCEP</span> on Solana.
          One API surface. Multiple models. Transparent quota for every builder.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#abstract"
            className="rounded-full bg-white px-8 py-3 text-sm font-medium text-[#070711] transition hover:bg-white/90"
          >
            Read whitepaper
          </a>
          <Link
            href="/playground"
            className="rounded-full border border-white/15 px-8 py-3 text-sm font-medium text-white/80 transition hover:border-white/30"
          >
            Try Playground
          </Link>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-white/40">
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#2DD4BF]">
              Live
            </p>
            <p>Gateway + API keys</p>
          </div>
          <div className="hidden h-8 w-px bg-white/10 sm:block" />
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#A78BFA]">
              Phantom
            </p>
            <p>Wallet verified</p>
          </div>
          <div className="hidden h-8 w-px bg-white/10 sm:block" />
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#F472B6]">
              DeepSeek
            </p>
            <p>Models routed</p>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pb-24 lg:grid-cols-[220px_1fr]">
        {/* TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Contents
            </p>
            <ul className="mt-3 space-y-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-white/50 transition hover:text-[#2DD4BF]"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Content */}
        <article className="min-w-0 space-y-16">
          <Section id="abstract" title="1. Abstract">
            <p>
              Gercep AI packages multi-model LLM inference behind a single
              OpenAI-compatible API. Developers create scoped{" "}
              <code className="text-[#2DD4BF]">sk-gercep-</code> keys, route
              traffic through our gateway, and track token usage per request.
            </p>
            <p className="mt-4">
              Access capacity is designed to scale with{" "}
              <strong className="text-white">$GERCEP</strong> — an SPL token on
              Solana. Wallet ownership is proven via Phantom signature; daily
              request quotas map directly to on-chain balance tiers.
            </p>
          </Section>

          <Section id="vision" title="2. Vision">
            <p>
              AI inference should be as simple as HTTP: one base URL, one key,
              predictable limits. Gercep removes provider fragmentation while
              keeping keys and usage under developer control.
            </p>
            <blockquote className="mt-6 border-l-2 border-[#A78BFA] pl-4 text-lg italic text-white/70">
              Make model access programmable, metered, and wallet-native — so
              every builder in Southeast Asia and beyond can ship AI features
              without managing five different provider dashboards.
            </blockquote>
          </Section>

          <Section id="problem" title="3. Problem">
            <ul className="list-inside list-disc space-y-2 text-white/70">
              <li>Each LLM provider exposes different SDKs, keys, and billing.</li>
              <li>Teams waste engineering time on routing, retries, and usage tracking.</li>
              <li>Token-gated communities lack a native way to unlock API capacity.</li>
              <li>Mobile-first users (Phantom, Solana) are underserved by traditional API billing.</li>
            </ul>
          </Section>

          <Section id="solution" title="4. Solution">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Unified gateway",
                  desc: "POST /api/v1/chat/completions — same shape as OpenAI. Swap base URL, keep your client.",
                },
                {
                  title: "Scoped API keys",
                  desc: "Hashed at rest. Prefix sk-gercep-. Revocable from Developers dashboard.",
                },
                {
                  title: "Usage metering",
                  desc: "Prompt, completion, and total tokens logged per key — ready for billing.",
                },
                {
                  title: "Wallet-linked quota",
                  desc: "Link Phantom → sign message → tier unlocks daily request capacity via $GERCEP.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <p className="font-medium text-[#2DD4BF]">{card.title}</p>
                  <p className="mt-2 text-sm text-white/55">{card.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="architecture" title="5. Architecture">
            <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-relaxed text-white/70">
{`┌─────────────┐     sk-gercep-*      ┌──────────────────┐
│  Your App   │ ──────────────────► │  Gercep Gateway  │
│  (OpenAI    │   /api/v1/chat/      │  Auth · Quota ·  │
│   SDK)      │   completions        │  Usage log       │
└─────────────┘                      └────────┬─────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
             ┌────────────┐           ┌────────────┐           ┌────────────┐
             │  DeepSeek  │           │  Supabase  │           │   Solana   │
             │  (live)    │           │  keys ·    │           │  $GERCEP   │
             │            │           │  usage ·   │           │  balance   │
             └────────────┘           │  wallets   │           └────────────┘
                                      └────────────┘`}
            </pre>
            <p className="mt-4 text-sm text-white/50">
              Provider keys stay server-side. Developers never hold DeepSeek or
              other provider credentials — only Gercep application keys.
            </p>
          </Section>

          <Section id="token" title="6. $GERCEP Token">
            <p>
              <strong className="text-[#A78BFA]">$GERCEP</strong> is the
              ecosystem token for unlocking gateway quota tiers. It is designed
              as an SPL token on Solana mainnet (launch pending).
            </p>
            <div className="mt-6 rounded-xl border border-[#A78BFA]/30 bg-[#A78BFA]/5 p-5">
              <p className="text-xs uppercase tracking-wider text-[#A78BFA]">
                Utility (planned)
              </p>
              <ul className="mt-3 space-y-2 text-sm text-white/65">
                <li>• Daily API request capacity scales with wallet balance</li>
                <li>• Holder tiers: Beta → Holder → Supporter → Whale</li>
                <li>• Phantom wallet link proves ownership (no gas for sign)</li>
                <li>• Future: airdrop, staking boosts, reserved compute lanes</li>
              </ul>
            </div>
            <p className="mt-4 text-sm text-white/45">
              Token contract address will be published at TGE. Until launch, all
              linked wallets receive Beta tier (1,000 requests/day).
            </p>
          </Section>

          <Section id="tokenomics" title="7. Tokenomics">
            <div className="rounded-xl border border-[#F472B6]/20 bg-[#F472B6]/5 p-4 text-sm text-white/60">
              <strong className="text-[#F472B6]">Proposed model</strong> —
              figures below are draft allocations for community review. Final
              numbers may change before token generation event (TGE).
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Total supply",
                  value: formatTokenAmount(GERCEP_SUPPLY.total),
                  sub: "Fixed — no inflation mint",
                },
                {
                  label: "Decimals",
                  value: String(GERCEP_SUPPLY.decimals),
                  sub: GERCEP_SUPPLY.standard,
                },
                {
                  label: "Chain",
                  value: "Solana",
                  sub: GERCEP_SUPPLY.chain,
                },
                {
                  label: "TGE unlock (circ.)",
                  value: "~12%",
                  sub: "Community slice + LP only",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <p className="text-xs uppercase text-white/40">{stat.label}</p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-[#2DD4BF]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-white/45">{stat.sub}</p>
                </div>
              ))}
            </div>

            <h3 className="mt-10 text-lg font-semibold text-white">
              Allocation
            </h3>
            <div className="mt-3 flex h-4 overflow-hidden rounded-full">
              {GERCEP_ALLOCATION.map((bucket, i) => {
                const colors = [
                  "bg-[#2DD4BF]",
                  "bg-[#A78BFA]",
                  "bg-[#F472B6]",
                  "bg-[#60A5FA]",
                  "bg-[#FBBF24]",
                  "bg-[#94A3B8]",
                ];
                return (
                  <div
                    key={bucket.id}
                    className={colors[i % colors.length]}
                    style={{ width: `${bucket.percent}%` }}
                    title={`${bucket.label} ${bucket.percent}%`}
                  />
                );
              })}
            </div>
            <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-xs uppercase text-white/40">
                    <th className="px-4 py-3 font-medium">Bucket</th>
                    <th className="px-4 py-3 font-medium text-right">%</th>
                    <th className="px-4 py-3 font-medium text-right">Tokens</th>
                    <th className="px-4 py-3 font-medium">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {GERCEP_ALLOCATION.map((bucket) => (
                    <tr key={bucket.id} className="text-white/75">
                      <td className="px-4 py-3 font-medium">{bucket.label}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {bucket.percent}%
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[#A78BFA]">
                        {formatTokenAmount(bucket.tokens)}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/50">
                        {bucket.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="mt-10 text-lg font-semibold text-white">
              Vesting schedule
            </h3>
            <p className="text-sm text-white/50">
              Designed to limit sell pressure at launch and align long-term
              contributors with gateway adoption.
            </p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-xs uppercase text-white/40">
                    <th className="px-4 py-3 font-medium">Bucket</th>
                    <th className="px-4 py-3 font-medium">TGE unlock</th>
                    <th className="px-4 py-3 font-medium">Cliff</th>
                    <th className="px-4 py-3 font-medium">Vesting</th>
                    <th className="px-4 py-3 font-medium">Release notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {GERCEP_VESTING.map((row) => (
                    <tr key={row.bucket} className="text-white/70">
                      <td className="px-4 py-3 font-medium text-[#2DD4BF]">
                        {row.bucket}
                      </td>
                      <td className="px-4 py-3 text-xs">{row.tgeUnlock}</td>
                      <td className="px-4 py-3 text-xs">{row.cliff}</td>
                      <td className="px-4 py-3 text-xs">{row.vestingDuration}</td>
                      <td className="px-4 py-3 text-xs text-white/45">
                        {row.release}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#2DD4BF]/20 bg-[#2DD4BF]/5 p-4">
                <p className="text-xs uppercase text-[#2DD4BF]">Deflationary levers</p>
                <ul className="mt-2 space-y-1 text-sm text-white/60">
                  <li>• Optional gateway fee buyback (future governance)</li>
                  <li>• No mint authority after TGE</li>
                  <li>• LP lock 6 months minimum</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[#A78BFA]/20 bg-[#A78BFA]/5 p-4">
                <p className="text-xs uppercase text-[#A78BFA]">Early access priority</p>
                <ul className="mt-2 space-y-1 text-sm text-white/60">
                  <li>• Wallet linked before TGE → airdrop eligibility</li>
                  <li>• Active API keys weighted in snapshot</li>
                  <li>• Beta tier holders grandfathered into Holder min.</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section id="tiers" title="8. Quota Tiers">
            <p className="mb-4 text-white/60">
              Daily request limits per linked wallet, based on $GERCEP balance:
            </p>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-xs uppercase text-white/40">
                    <th className="px-4 py-3 font-medium">Tier</th>
                    <th className="px-4 py-3 font-medium">Min $GERCEP</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Daily requests
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {GERCEP_TIERS.map((tier) => (
                    <tr key={tier.id} className="text-white/75">
                      <td className="px-4 py-3 font-medium text-[#2DD4BF]">
                        {tier.label}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {tier.minBalance === 0
                          ? "0 (linked wallet)"
                          : tier.minBalance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {tier.dailyRequests.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="roadmap" title="9. Roadmap">
            <div className="space-y-6">
              {roadmap.map((block) => (
                <div
                  key={block.phase}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <p className="font-[family-name:var(--font-display)] font-semibold text-[#A78BFA]">
                    {block.phase}
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm text-white/60">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-[#2DD4BF]">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#A78BFA]/10 to-[#2DD4BF]/10 p-8 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
              Start building today
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/55">
              Gateway is live. Link your Phantom wallet, create an API key, and
              ship your first AI feature in minutes.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/developers"
                className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-[#070711]"
              >
                Create API Key
              </Link>
              <Link
                href="/docs"
                className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-white/80"
              >
                Read API Docs
              </Link>
            </div>
          </div>

          <p className="text-center text-[10px] text-white/25">
            Gercep AI Whitepaper v0.2 · July 2026 · Tokenomics draft — subject
            to change before TGE
          </p>
        </article>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold md:text-3xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-white/65">{children}</div>
    </section>
  );
}
