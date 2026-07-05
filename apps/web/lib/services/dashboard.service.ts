import type { SupabaseClient } from "@supabase/supabase-js";
import { transactionRepository } from "@/lib/repositories/transaction.repository";
import { orderRepository } from "@/lib/repositories/order.repository";

export interface DashboardStats {
  revenue: number;
  expense: number;
  profit: number;
  margin: number;
  pendingOrders: number;
}

/**
 * Reuse transactionRepository yang sama dengan Transactions module —
 * revenue/expense dashboard dan kas Transactions harus selalu konsisten
 * karena dihitung dari sumber data yang sama.
 */
export function createDashboardService(supabase: SupabaseClient) {
  async function getStats(businessId: string): Promise<DashboardStats> {
    const [transactions, pendingOrders] = await Promise.all([
      transactionRepository.findByBusiness(supabase, businessId),
      orderRepository.countPending(supabase, businessId),
    ]);

    // revenue & expense dihitung dari transaksi yang sudah completed
    const completed = transactions.filter((t) => t.status === "completed");
    const revenue = completed
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = completed
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const profit = revenue - expense;

    return {
      revenue,
      expense,
      profit,
      margin: revenue ? (profit / revenue) * 100 : 0,
      pendingOrders,
    };
  }

  return { getStats };
}
