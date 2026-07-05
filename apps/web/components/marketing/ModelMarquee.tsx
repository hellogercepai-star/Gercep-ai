import Link from "next/link";
import { SHOWCASE_MODELS, type ShowcaseModel } from "@/lib/gateway/marketing-models";

function ModelCard({ model }: { model: ShowcaseModel }) {
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span
          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
            model.status === "live"
              ? "bg-[#2DD4BF]/15 text-[#2DD4BF]"
              : "bg-white/5 text-white/40"
          }`}
        >
          {model.status === "live" ? "Live" : "Soon"}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-white/30">
          Chat
        </span>
      </div>
      <p className="font-[family-name:var(--font-display)] text-sm font-semibold leading-tight">
        {model.label}
      </p>
    </>
  );

  if (model.status === "live") {
    return (
      <Link
        href={`/playground?model=${model.id}`}
        className="mx-2 flex w-44 shrink-0 flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/5"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div
      title="Coming soon — belum tersedia di gateway"
      className="mx-2 flex w-44 shrink-0 cursor-not-allowed flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 opacity-60"
    >
      {inner}
    </div>
  );
}

export function ModelMarquee() {
  const track = [...SHOWCASE_MODELS, ...SHOWCASE_MODELS];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#070711] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#070711] to-transparent" />
      <div className="flex w-max animate-marquee">
        {track.map((m, i) => (
          <ModelCard key={`${m.id}-${i}`} model={m} />
        ))}
      </div>
    </div>
  );
}
