"use client";

import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { Sidebar } from "@/components/shared/Sidebar";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function SettingsPage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen bg-[#070711] text-white">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title={t("settings.title")} />
        <main className="flex-1 p-6">
          <Card
            title={t("settings.businessTitle")}
            description={t("settings.comingSoon")}
          >
            <p className="text-sm text-white/60">
              {t("settings.businessDesc")}{" "}
              <Link href="/developers" className="text-[#2DD4BF] underline">
                {t("common.developers")}
              </Link>
              .
            </p>
          </Card>
        </main>
      </div>
    </div>
  );
}
