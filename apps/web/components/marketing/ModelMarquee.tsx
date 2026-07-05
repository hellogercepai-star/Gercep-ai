import { SHOWCASE_MODELS } from "@/lib/gateway/marketing-models";

function ModelCard({
  label,
  status,
}: {
  label: string;
  status: "live" | "coming_soon";
}) {
  return (
    <div className="mx-2 flex w-44 shrink-0 flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <span
          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
            status === "live"
              ? "bg-[#2DD4BF]/15 text-[#2DD4BF]"
              : "bg-white/5 text-white/40"
          }`}
        >
          {status === "live" ? "Live" : "Soon"}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-white/30">
          Chat
        </span>
      </div>
      <p className="font-[family-name:var(--font-display)] text-sm font-semibold leading-tight">
        {label}
      </p>
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
          <ModelCard key={`${m.id}-${i}`} label={m.label} status={m.status} />
        ))}
      </div>
    </div>
  );
}
