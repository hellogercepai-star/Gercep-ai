import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/Card";

interface StatItem {
  label: string;
  value: string;
  change: string;
  accent: string;
}

const stats: StatItem[] = [
  {
    label: "Total Revenue",
    value: "Rp 42.8jt",
    change: "+12.4%",
    accent: "#2DD4BF",
  },
  {
    label: "Active Businesses",
    value: "3",
    change: "+1 bulan ini",
    accent: "#A78BFA",
  },
  {
    label: "Pending Orders",
    value: "18",
    change: "-4 dari kemarin",
    accent: "#F472B6",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#070711]">
      <Sidebar />

      <div className="flex-1">
        <Header
          title="Dashboard"
          subtitle="Ringkasan bisnis kamu hari ini."
        />

        <main className="px-8 py-8">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">{stat.label}</span>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: stat.accent }}
                  />
                </div>
                <p className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-white/40">{stat.change}</p>
              </Card>
            ))}
          </section>

          <Card
            className="mt-6"
            title="Modul akan tampil di sini"
            description="Inventory, Keuangan, Produksi, dan modul lainnya akan terhubung ke dashboard ini."
          />
        </main>
      </div>
    </div>
  );
}