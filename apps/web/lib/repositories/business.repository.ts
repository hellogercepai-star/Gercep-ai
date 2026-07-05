import type { SupabaseClient } from "@supabase/supabase-js";
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

export interface CreateBusinessInput {
  name: string;
  description?: string;
  ownerId: string;
}

function mapBusinessRow(row: BusinessRow): Business {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    ownerId: row.owner_id,
    // ringkasan finansial dihitung dari transactions (tugas DashboardService)
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

export const businessRepository = {
  async findMemberBusinessIds(
    supabase: SupabaseClient,
    userId: string
  ): Promise<string[]> {
    const { data, error } = await supabase
      .from("business_members")
      .select("business_id")
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return ((data ?? []) as { business_id: string }[]).map(
      (r) => r.business_id
    );
  },

  async findForUser(
    supabase: SupabaseClient,
    userId: string,
    memberBusinessIds: string[]
  ): Promise<Business[]> {
    // bisnis milik user (owner) ATAU user adalah member
    let query = supabase.from("businesses").select("*");
    query =
      memberBusinessIds.length > 0
        ? query.or(
            `owner_id.eq.${userId},id.in.(${memberBusinessIds.join(",")})`
          )
        : query.eq("owner_id", userId);

    const { data, error } = await query.order("created_at", {
      ascending: true,
    });

    if (error) throw new Error(error.message);
    return ((data ?? []) as BusinessRow[]).map(mapBusinessRow);
  },

  async create(
    supabase: SupabaseClient,
    input: CreateBusinessInput
  ): Promise<Business> {
    const { data, error } = await supabase
      .from("businesses")
      .insert({
        name: input.name.trim(),
        description: input.description?.trim() || null,
        owner_id: input.ownerId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapBusinessRow(data as BusinessRow);
  },
};
