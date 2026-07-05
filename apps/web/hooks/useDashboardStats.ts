"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  createDashboardService,
  type DashboardStats,
} from "@/lib/services/dashboard.service";
import type { Business } from "@/types";

const emptyStats: DashboardStats = {
  revenue: 0,
  expense: 0,
  profit: 0,
  margin: 0,
  pendingOrders: 0,
};

/**
 * Statistik dashboard untuk bisnis aktif. Hook ini HANYA mengelola state
 * React — semua query & kalkulasi ada di DashboardService.
 */
export function useDashboardStats(activeBusiness: Business | null) {
  const supabase = useMemo(() => createClient(), []);
  const dashboardService = useMemo(
    () => createDashboardService(supabase),
    [supabase]
  );
  const businessId = activeBusiness?.id ?? null;

  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;

    let cancelled = false;

    async function loadStats() {
      try {
        const result = await dashboardService.getStats(businessId as string);
        if (!cancelled) {
          setStats(result);
          setLoading(false);
        }
      } catch (err) {
        console.error("Gagal memuat dashboard stats:", err);
        if (!cancelled) setLoading(false);
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [businessId, dashboardService]);

  return {
    stats: businessId ? stats : emptyStats,
    loading: businessId ? loading : false,
  };
}
