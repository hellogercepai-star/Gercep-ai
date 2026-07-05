"use client";

import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { Sidebar } from "@/components/shared/Sidebar";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function ProduksiPage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen bg-[#070711] text-white">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title={t("produksi.title")} />
        <main className="flex-1 p-6">
          <Card
            title={t("produksi.moduleTitle")}
            description={t("produksi.comingSoon")}
          >
            <p className="text-sm text-white/60">
              {t("produksi.moduleDesc")}{" "}
              <Link href="/developers" className="text-[#2DD4BF] underline">
                {t("produksi.gatewayLink")}
              </Link>
              .
            </p>
            <Link
              href="/developers"
              className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-xs font-medium text-[#070711]"
            >
              {t("produksi.openDevelopers")}
            </Link>
          </Card>
        </main>
      </div>
    </div>
  );
}
