export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070711]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-[#2DD4BF]/10 blur-[120px]" />
        <div className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-[#A78BFA]/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-[#F472B6]/10 blur-[120px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          Gercep AI
        </span>
        <div className="flex items-center gap-3">
          <a
            href="/playground"
            className="text-sm text-white/70 transition hover:text-white"
          >
            Playground
          </a>
          <a
            href="/developers"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
          >
            API Keys
          </a>
        </div>
      </nav>

      <section className="relative z-10 mx-auto flex max-w-4xl flex-col items-start px-6 pt-24 pb-32 md:px-12 md:pt-32">
        <span className="mb-6 rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-3 py-1 text-xs font-medium tracking-wide text-[#2DD4BF]">
          OpenAI-compatible inference gateway
        </span>

        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
          Leading models behind
          <br />
          <span className="bg-gradient-to-r from-[#2DD4BF] via-[#A78BFA] to-[#F472B6] bg-clip-text text-transparent">
            one Gercep gateway
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base text-white/60 md:text-lg">
          Test fast in the Playground, create your{" "}
          <code className="text-[#2DD4BF]">sk-gercep-</code> API key, and ship
          with the same compatible request shape. Token usage tracked — ready
          for billing and $GERCEP ecosystem.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="/playground"
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[#070711] transition hover:bg-white/90"
          >
            Open Playground
          </a>
          <a
            href="/developers"
            className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white"
          >
            Create API Key
          </a>
          <a
            href="/dashboard"
            className="text-sm font-medium text-white/50 transition hover:text-white"
          >
            Business OS →
          </a>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-6 md:mx-12 md:grid-cols-3 md:px-0">
        {[
          {
            title: "Multi-model routing",
            desc: "DeepSeek today — more providers tomorrow. One base URL, one key.",
          },
          {
            title: "Your API key",
            desc: "Developers hold sk-gercep- keys. Usage logged per request.",
          },
          {
            title: "Business OS (dogfood)",
            desc: "Inventory, keuangan, dashboard — built on our own gateway.",
          },
        ].map((f) => (
          <div key={f.title} className="bg-[#070711] p-8">
            <h3 className="font-[family-name:var(--font-display)] text-base font-semibold">
              {f.title}
            </h3>
            <p className="mt-2 text-sm text-white/50">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
