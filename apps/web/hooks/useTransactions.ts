"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createTransactionService } from "@/lib/services/transaction.service";
import type { Business, Transaction } from "@/types";
import type { NewTransactionInput } from "@/types/transaction";

export function useTransactions(activeBusiness: Business | null) {
  const supabase = useMemo(() => createClient(), []);
  const transactionService = useMemo(
    () => createTransactionService(supabase),
    [supabase]
  );
  const businessId = activeBusiness?.id ?? null;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    if (!businessId) return;
    const list = await transactionService.getSnapshot(businessId);
    setTransactions(list);
  }, [businessId, transactionService]);

  useEffect(() => {
    async function initialLoad() {
      if (!businessId) {
        setTransactions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        await loadTransactions();
      } catch (err) {
        console.error("Gagal memuat transactions:", err);
      } finally {
        setLoading(false);
      }
    }
    initialLoad();
  }, [businessId, loadTransactions]);

  const { totalIncome, totalExpense, kasBalance } = useMemo(
    () => transactionService.computeSummary(transactions),
    [transactions, transactionService]
  );

  const createTransaction = async (
    input: NewTransactionInput
  ): Promise<Transaction> => {
    if (!businessId) throw new Error("Pilih bisnis dulu.");
    const transaction = await transactionService.createTransaction(businessId, input);
    await loadTransactions();
    return transaction;
  };

  return {
    transactions,
    loading,
    totalIncome,
    totalExpense,
    kasBalance,
    createTransaction,
    refreshTransactions: loadTransactions,
  };
}
