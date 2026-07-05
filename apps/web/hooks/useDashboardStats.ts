"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Business, TransactionType } from "@/types";

export interface DashboardStats {
  revenue: number;
  expense: number;
  profit: number;
  margin: number;
  pendingOrders: number;
}

const emptyStats: DashboardStats = {
  revenue: 0,
  expense: 0,
  profit: 0,
  margin: 0,
  pendingOrders: 0,
};

/**
 * Statistik dashboard untuk bisnis aktif, dihitung dari Supabase.
 * Terima activeBusiness dari useBusiness() milik parent
 * supaya tidak ada dua instance useBusiness yang fetch ganda.
 */
export function useDashboardStats(activeBusiness: Business | null) {
  const supabase = createClient();

  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [loading, setLoading] = useState(true);

  const businessId = activeBusiness?.id ?? null;

  useEffect(() => {
    if (!businessId) return;

    let cancelled = false;

    async function loadStats() {
      const [txResult, orderResult] = await Promise.all([
        // revenue & expense dihitung dari transaksi yang sudah completed
        supabase
          .from("transactions")
          .select("type, amount")
          .eq("business_id", businessId)
          .eq("status", "completed"),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("business_id", businessId)
          .eq("status", "pending"),
      ]);

      if (cancelled) return;

      if (txResult.error) {
        console.error("Gagal memuat transactions:", txResult.error.message);
      }
      if (orderResult.error) {
        console.error("Gagal memuat orders:", orderResult.error.message);
      }

      const rows = (txResult.data ?? []) as {
        type: TransactionType;
        amount: number;
      }[];

      const revenue = rows
        .filter((r) => r.type === "income")
        .reduce((sum, r) => sum + Number(r.amount), 0);
      const expense = rows
        .filter((r) => r.type === "expense")
        .reduce((sum, r) => sum + Number(r.amount), 0);
      const profit = revenue - expense;

      setStats({
        revenue,
        expense,
        profit,
        margin: revenue ? (profit / revenue) * 100 : 0,
        pendingOrders: orderResult.count ?? 0,
      });
      setLoading(false);
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [businessId, supabase]);

  return {
    stats: businessId ? stats : emptyStats,
    loading: businessId ? loading : false,
  };
}
