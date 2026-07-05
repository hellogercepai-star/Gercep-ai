import type { SupabaseClient } from "@supabase/supabase-js";
import type { Transaction, TransactionType } from "@/types";

interface TransactionRow {
  id: string;
  business_id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string | null;
  category: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionRow {
  businessId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description?: string;
  category?: string;
}

function mapTransactionRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    businessId: row.business_id,
    userId: row.user_id,
    type: row.type,
    amount: Number(row.amount),
    currency: row.currency,
    description: row.description ?? undefined,
    category: row.category ?? undefined,
    status: row.status as Transaction["status"],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export const transactionRepository = {
  async findByBusiness(
    supabase: SupabaseClient,
    businessId: string
  ): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return ((data ?? []) as TransactionRow[]).map(mapTransactionRow);
  },

  async create(
    supabase: SupabaseClient,
    input: CreateTransactionRow
  ): Promise<Transaction> {
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        business_id: input.businessId,
        user_id: input.userId,
        type: input.type,
        amount: input.amount,
        currency: "IDR",
        description: input.description?.trim() || null,
        category: input.category?.trim() || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapTransactionRow(data as TransactionRow);
  },
};
