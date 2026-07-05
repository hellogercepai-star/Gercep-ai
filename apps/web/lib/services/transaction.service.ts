import type { SupabaseClient } from "@supabase/supabase-js";
import { transactionRepository } from "@/lib/repositories/transaction.repository";
import type { Transaction } from "@/types";
import type { NewTransactionInput } from "@/types/transaction";

export interface TransactionSummaryTotals {
  totalIncome: number;
  totalExpense: number;
  kasBalance: number;
}

export function createTransactionService(supabase: SupabaseClient) {
  async function getSnapshot(businessId: string): Promise<Transaction[]> {
    return transactionRepository.findByBusiness(supabase, businessId);
  }

  function computeSummary(transactions: Transaction[]): TransactionSummaryTotals {
    const completed = transactions.filter((t) => t.status === "completed");
    const totalIncome = completed
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = completed
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      kasBalance: totalIncome - totalExpense,
    };
  }

  async function createTransaction(
    businessId: string,
    input: NewTransactionInput
  ): Promise<Transaction> {
    if (input.amount <= 0) throw new Error("Jumlah harus lebih dari 0.");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Kamu harus login.");

    return transactionRepository.create(supabase, {
      businessId,
      userId: user.id,
      type: input.type,
      amount: input.amount,
      description: input.description,
      category: input.category,
    });
  }

  return { getSnapshot, computeSummary, createTransaction };
}
