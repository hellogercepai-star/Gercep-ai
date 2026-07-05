import type { SupabaseClient } from "@supabase/supabase-js";

export const orderRepository = {
  async countPending(
    supabase: SupabaseClient,
    businessId: string
  ): Promise<number> {
    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("status", "pending");

    if (error) throw new Error(error.message);
    return count ?? 0;
  },
};
