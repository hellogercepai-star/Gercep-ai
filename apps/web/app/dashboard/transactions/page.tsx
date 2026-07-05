"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useBusiness } from "@/hooks/useBusiness";
import { useTransactions } from "@/hooks/useTransactions";

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TransactionsPage() {
  const { t, dateLocale } = useLanguage();
  const { activeBusiness, loading: businessLoading } = useBusiness();
  const {
    transactions,
    loading,
    totalIncome,
    totalExpense,
    kasBalance,
    createTransaction,
  } = useTransactions(activeBusiness);
  const [showAddModal, setShowAddModal] = useState(false);

  const summaryCards = [
    {
      label: t("transactions.currentCash"),
      value: formatRupiah(kasBalance),
      accent: "#A78BFA",
    },
    {
      label: t("transactions.totalIncome"),
      value: formatRupiah(totalIncome),
      accent: "#2DD4BF",
    },
    {
      label: t("transactions.totalExpense"),
      value: formatRupiah(totalExpense),
      accent: "#F472B6",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#070711]">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Header
          title={t("transactions.title")}
          subtitle={t("transactions.subtitle")}
          businessName={activeBusiness?.name}
        />

        <main className="px-8 py-8 pb-20">
          {businessLoading ? (
            <Card>
              <p className="text-sm text-white/50">
                {t("transactions.loadingBusiness")}
              </p>
            </Card>
          ) : !activeBusiness ? (
            <Card
              title={t("transactions.noBusiness")}
              description={t("transactions.noBusinessDesc")}
              className="mx-auto max-w-lg"
            >
              <Link href="/dashboard">
                <Button>{t("transactions.goToDashboard")}</Button>
              </Link>
            </Card>
          ) : (
            <>
              <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {summaryCards.map((card) => (
                  <Card key={card.label}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">
                        {card.label}
                      </span>
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: card.accent }}
                      />
                    </div>
                    <p className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold">
                      {loading ? "—" : card.value}
                    </p>
                  </Card>
                ))}
              </section>

              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-white/50">
                  {loading
                    ? t("transactions.loadingTransactions")
                    : t("transactions.transactionCount", {
                        count: transactions.length,
                      })}
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  {t("transactions.addTransaction")}
                </Button>
              </div>

              {loading ? (
                <Card>
                  <p className="text-sm text-white/50">
                    {t("transactions.loadingTransactions")}
                  </p>
                </Card>
              ) : transactions.length === 0 ? (
                <Card
                  title={t("transactions.noTransactions")}
                  description={t("transactions.noTransactionsDesc")}
                >
                  <Button onClick={() => setShowAddModal(true)}>
                    {t("transactions.addFirstTransaction")}
                  </Button>
                </Card>
              ) : (
                <Card className="overflow-x-auto p-0">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wide text-white/40">
                        <th className="px-6 py-4 font-medium">
                          {t("transactions.table.date")}
                        </th>
                        <th className="px-6 py-4 font-medium">
                          {t("transactions.table.type")}
                        </th>
                        <th className="px-6 py-4 font-medium">
                          {t("transactions.table.category")}
                        </th>
                        <th className="px-6 py-4 font-medium">
                          {t("transactions.table.description")}
                        </th>
                        <th className="px-6 py-4 text-right font-medium">
                          {t("transactions.table.amount")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-t border-white/5 transition hover:bg-white/[0.02]"
                        >
                          <td className="px-6 py-4 text-white/60">
                            {formatDate(tx.createdAt, dateLocale)}
                          </td>
                          <td className="px-6 py-4">
                            {tx.type === "income" ? (
                              <span className="rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-2.5 py-1 text-xs text-[#2DD4BF]">
                                {t("transactions.type.income")}
                              </span>
                            ) : (
                              <span className="rounded-full border border-[#F472B6]/30 bg-[#F472B6]/10 px-2.5 py-1 text-xs text-[#F472B6]">
                                {t("transactions.type.expense")}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-white/60">
                            {tx.category ?? "—"}
                          </td>
                          <td className="px-6 py-4 text-white/60">
                            {tx.description ?? "—"}
                          </td>
                          <td
                            className={`px-6 py-4 text-right font-medium ${
                              tx.type === "income"
                                ? "text-[#2DD4BF]"
                                : "text-[#F472B6]"
                            }`}
                          >
                            {tx.type === "income" ? "+" : "−"}
                            {formatRupiah(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </>
          )}
        </main>
      </div>

      <AddTransactionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreate={createTransaction}
      />
    </div>
  );
}
