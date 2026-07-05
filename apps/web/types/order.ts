export type OrderStatus =
  | "pending"
  | "processing"
  | "completed"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  businessId: string;
  userId: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string; // "IDR"
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Versi ringkasan untuk dashboard
export interface OrderSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  period: "today" | "week" | "month" | "year";
}
