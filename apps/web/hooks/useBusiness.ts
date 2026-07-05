"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createBusinessService } from "@/lib/services/business.service";
import type { Business } from "@/types";

export function useBusiness() {
  const supabase = useMemo(() => createClient(), []);
  const businessService = useMemo(
    () => createBusinessService(supabase),
    [supabase]
  );

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBusinesses = useCallback(
    async (preferredActiveId?: string) => {
      const list = await businessService.loadBusinesses();
      setBusinesses(list);

      // pertahankan bisnis aktif jika masih ada, kalau tidak fallback ke yang pertama
      setActiveBusiness((current) => {
        const targetId = preferredActiveId ?? current?.id;
        return list.find((b) => b.id === targetId) ?? list[0] ?? null;
      });
    },
    [businessService]
  );

  useEffect(() => {
    async function initialLoad() {
      setLoading(true);
      try {
        await loadBusinesses();
      } catch (err) {
        console.error("Gagal memuat businesses:", err);
      } finally {
        setLoading(false);
      }
    }
    initialLoad();
  }, [loadBusinesses]);

  const switchBusiness = (businessId: string) => {
    const found = businesses.find((b) => b.id === businessId);
    if (found) setActiveBusiness(found);
  };

  const createBusiness = async (
    name: string,
    description?: string
  ): Promise<Business> => {
    const business = await businessService.createBusiness(name, description);
    await loadBusinesses(business.id);
    return business;
  };

  return {
    businesses,
    activeBusiness,
    loading,
    switchBusiness,
    createBusiness,
    refreshBusinesses: loadBusinesses,
    hasBusinesses: businesses.length > 0,
  };
}
