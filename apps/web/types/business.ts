export interface Business {
  id: string;
  name: string;
  description?: string;
  // owner
  ownerId: string;
  // financial summary (dashboard)
  totalRevenue: number;
  totalExpense: number;
  profit: number;
  // status
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // relations
  members: BusinessMember[];
  transactions: TransactionEntry[];
}

export interface BusinessMember {
  userId: string;
  name: string;
  role: "owner" | "admin" | "staff";
  joinedAt: Date;
}

export interface TransactionEntry {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  createdAt: Date;
}
