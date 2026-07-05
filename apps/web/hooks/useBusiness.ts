"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Business } from "@/types";

interface BusinessRow {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function mapBusinessRow(row: BusinessRow): Business {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    ownerId: row.owner_id,

    // ringkasan finansial dihitung dari transactions nanti (tugas useDashboardStats)
    totalRevenue: 0,
    totalExpense: 0,
    profit: 0,

    isActive: row.is_active,

    members: [],
    transactions: [],

    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function useBusiness() {
  const supabase = createClient();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  // loading hanya untuk load awal; refresh berikutnya berjalan tanpa flicker
  const loadBusinesses = useCallback(
    async (preferredActiveId?: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setBusinesses([]);
        setActiveBusiness(null);
        setLoading(false);
        return;
      }

      // bisnis di mana user terdaftar sebagai member
      const { data: memberRows } = await supabase
        .from("business_members")
        .select("business_id")
        .eq("user_id", user.id);

      const memberBusinessIds = (memberRows ?? []).map((r) => r.business_id);

      // bisnis milik user (owner) ATAU user adalah member
      let query = supabase.from("businesses").select("*");
      query =
        memberBusinessIds.length > 0
          ? query.or(
              `owner_id.eq.${user.id},id.in.(${memberBusinessIds.join(",")})`
            )
          : query.eq("owner_id", user.id);

      const { data, error } = await query.order("created_at", {
        ascending: true,
      });

      if (error) {
        console.error("Gagal memuat businesses:", error.message);
        setLoading(false);
        return;
      }

      const list = (data as BusinessRow[]).map(mapBusinessRow);
      setBusinesses(list);

      // pertahankan bisnis aktif jika masih ada, kalau tidak fallback ke yang pertama
      setActiveBusiness((current) => {
        const targetId = preferredActiveId ?? current?.id;
        return list.find((b) => b.id === targetId) ?? list[0] ?? null;
      });

      setLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    async function initialLoad() {
      await loadBusinesses();
    }
    initialLoad();
  }, [loadBusinesses]);

  // switch antar bisnis
  const switchBusiness = (businessId: string) => {
    const found = businesses.find((b) => b.id === businessId);
    if (found) setActiveBusiness(found);
  };

  const createBusiness = async (name: string, description?: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Kamu harus login untuk membuat bisnis.");

    const { data, error } = await supabase
      .from("businesses")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // refresh dan jadikan bisnis baru sebagai bisnis aktif
    await loadBusinesses(data.id);
    return mapBusinessRow(data as BusinessRow);
  };

  return {
    businesses,
    activeBusiness,
    loading,
    switchBusiness,
    createBusiness,
    refreshBusinesses: loadBusinesses,

    // helper future-proof
    hasBusinesses: businesses.length > 0,
  };
}
