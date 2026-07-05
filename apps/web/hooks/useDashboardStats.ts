"use client";

import { useMemo } from "react";
import { useBusiness } from "./useBusiness";

/**
 * DASHBOARD STATS AGGREGATOR
 * Semua data dashboard dihitung di sini
 * nanti tinggal ganti source dari API / Supabase
 */

export function useDashboardStats() {
  const { activeBusiness, businesses } = useBusiness();

  const stats = useMemo(() => {
    const revenue = activeBusiness.totalRevenue;
    const expense = activeBusiness.totalExpense;
    const profit = activeBusiness.profit;

    return {
      revenue,
      expense,
      profit,

      activeBusinesses: businesses.filter((b) => b.isActive).length,

      // dummy sementara (nanti dari orders table)
      pendingOrders: 18,

      // extra insight (siap AI nanti)
      margin: revenue ? (profit / revenue) * 100 : 0,
    };
  }, [activeBusiness, businesses]);

  return {
    stats,
    activeBusiness,
  };
}
