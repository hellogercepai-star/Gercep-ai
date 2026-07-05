const stats = [
  { label: "Total Revenue", value: "Rp 42.8jt", change: "+12.4%", accent: "#2DD4BF" },
  { label: "Active Businesses", value: "3", change: "+1 bulan ini", accent: "#A78BFA" },
  { label: "Pending Orders", value: "18", change: "-4 dari kemarin", accent: "#F472B6" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#070711] px-6 py-10 md:px-12">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Ringkasan bisnis kamu hari ini.
          </p>
        </div>
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#2DD4BF] via-[#A78BFA] to-[#F472B6]" />
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">{s.label}</span>
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: s.accent }}
              />
            </div>
            <p className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-white/40">{s.change}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Modul akan tampil di sini
        </h2>
        <p className="mt-2 text-sm text-white/50">
          Inventory, Keuangan, Produksi, dan modul lainnya akan terhubung ke
          dashboard ini.
        </p>
      </section>
    </div>
  );
}
