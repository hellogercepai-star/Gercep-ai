export type TransactionType = "income" | "expense";
export type TransactionStatus = "pending" | "completed" | "failed";

export interface Transaction {
  id: string;
  businessId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string; // contoh: "IDR"
  description?: string;
  category?: string; // contoh: "sales", "operational", "marketing"
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Versi ringkasan untuk dashboard
export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  period: "today" | "week" | "month" | "year";
}

export interface NewTransactionInput {
  type: TransactionType;
  amount: number;
  description?: string;
  category?: string;
}
