"use client";

export interface TimeSeriesPoint {
  date: string;
  requests: number;
  tokens: number;
  revenueUsd: number;
  providerCostUsd: number;
  profitUsd: number;
}

export function TimeSeriesChart({
  data,
  dataKey,
  label,
  color,
  formatValue,
}: {
  data: TimeSeriesPoint[];
  dataKey: keyof Pick<
    TimeSeriesPoint,
    "requests" | "tokens" | "revenueUsd" | "providerCostUsd" | "profitUsd"
  >;
  label: string;
  color: string;
  formatValue?: (n: number) => string;
}) {
  const values = data.map((d) => d[dataKey] as number);
  const max = Math.max(...values, 1);
  const w = 100;
  const h = 48;
  const barW = w / Math.max(data.length, 1);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
        {label}
      </p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-32 w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        {data.map((point, i) => {
          const v = point[dataKey] as number;
          const barH = (v / max) * (h - 4);
          return (
            <rect
              key={point.date}
              x={i * barW + 0.5}
              y={h - barH}
              width={Math.max(barW - 1, 0.5)}
              height={barH}
              fill={color}
              opacity={0.85}
            />
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between text-[9px] text-white/35">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
      <p className="mt-1 text-xs text-white/50">
        Peak: {formatValue ? formatValue(max) : max.toLocaleString()}
      </p>
    </div>
  );
}

export function DualTrendChart({
  data,
}: {
  data: TimeSeriesPoint[];
}) {
  const max = Math.max(
    ...data.flatMap((d) => [d.revenueUsd, d.providerCostUsd, d.profitUsd]),
    0.0000001
  );
  const w = 100;
  const h = 56;
  const step = w / Math.max(data.length - 1, 1);

  const line = (key: "revenueUsd" | "providerCostUsd" | "profitUsd") =>
    data
      .map((d, i) => {
        const y = h - (d[key] / max) * (h - 8) - 4;
        return `${i === 0 ? "M" : "L"}${i * step},${y}`;
      })
      .join(" ");

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
        Revenue vs Cost vs Profit
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-36 w-full" aria-hidden>
        <path d={line("revenueUsd")} fill="none" stroke="#2DD4BF" strokeWidth="0.8" />
        <path d={line("providerCostUsd")} fill="none" stroke="#F472B6" strokeWidth="0.8" />
        <path d={line("profitUsd")} fill="none" stroke="#A78BFA" strokeWidth="0.8" />
      </svg>
      <div className="mt-2 flex flex-wrap gap-3 text-[10px]">
        <span className="text-[#2DD4BF]">● Revenue</span>
        <span className="text-[#F472B6]">● AI Cost</span>
        <span className="text-[#A78BFA]">● Profit</span>
      </div>
    </div>
  );
}
