import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category } from "@/types";

interface CategoryRow {
  id: string;
  business_id: string;
  name: string;
  created_at: string;
}

function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    createdAt: new Date(row.created_at),
  };
}

export const categoryRepository = {
  async findByBusiness(
    supabase: SupabaseClient,
    businessId: string
  ): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("business_id", businessId)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return ((data ?? []) as CategoryRow[]).map(mapCategoryRow);
  },

  async create(
    supabase: SupabaseClient,
    businessId: string,
    name: string
  ): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .insert({ business_id: businessId, name: name.trim() })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapCategoryRow(data as CategoryRow);
  },
};
