"use client";

import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CreateBusinessModal } from "@/components/business/CreateBusinessModal";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useBusiness } from "@/hooks/useBusiness";
import { useDashboardStats } from "@/hooks/useDashboardStats";

function formatRupiah(value: number): string {
  if (value >= 1_000_000_000)
    return `Rp ${(value / 1_000_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })}M`;
  if (value >= 1_000_000)
    return `Rp ${(value / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })}jt`;
  if (value >= 1_000)
    return `Rp ${(value / 1_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })}rb`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const { businesses, activeBusiness, loading, createBusiness } =
    useBusiness();
  const { stats, loading: statsLoading } = useDashboardStats(activeBusiness);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const statItems = [
    {
      label: t("dashboard.totalRevenue"),
      value: formatRupiah(stats.revenue),
      change: t("dashboard.marginChange", {
        margin: stats.margin.toFixed(1),
      }),
      accent: "#2DD4BF",
    },
    {
      label: t("dashboard.activeBusinesses"),
      value: String(businesses.filter((b) => b.isActive).length),
      change: t("dashboard.inOneAccount"),
      accent: "#A78BFA",
    },
    {
      label: t("dashboard.pendingOrders"),
      value: String(stats.pendingOrders),
      change: t("dashboard.awaitingProcess"),
      accent: "#F472B6",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#070711]">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Header
          title={t("dashboard.title")}
          subtitle={t("dashboard.subtitle")}
          businessName={activeBusiness?.name}
        />

        <main className="px-8 py-8 pb-20">
          {loading ? (
            <Card>
              <p className="text-sm text-white/50">
                {t("dashboard.loadingBusiness")}
              </p>
            </Card>
          ) : businesses.length === 0 ? (
            <Card
              title={t("dashboard.noBusiness")}
              description={t("dashboard.noBusinessDesc")}
              className="mx-auto max-w-lg"
            >
              <Button onClick={() => setShowCreateModal(true)}>
                {t("dashboard.createFirstBusiness")}
              </Button>
            </Card>
          ) : (
            <>
              <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {statItems.map((stat) => (
                  <Card key={stat.label}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">
                        {stat.label}
                      </span>
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: stat.accent }}
                      />
                    </div>
                    <p className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold">
                      {statsLoading ? "—" : stat.value}
                    </p>
                    <p className="mt-1 text-xs text-white/60">
                      {statsLoading ? "" : stat.change}
                    </p>
                  </Card>
                ))}
              </section>

              <Card
                className="mt-6"
                title={t("dashboard.modulesTitle")}
                description={t("dashboard.modulesDesc")}
              />
            </>
          )}
        </main>
      </div>

      <CreateBusinessModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createBusiness}
      />
    </div>
  );
}
