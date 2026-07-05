export interface Category {
  id: string;
  businessId: string;
  name: string;
  createdAt: Date;
}

export type TrackingType = "bulk" | "serial";

export interface Product {
  id: string;
  businessId: string;
  categoryId?: string;
  categoryName?: string; // hasil join dengan categories, bukan kolom tabel
  name: string;
  sku?: string;
  trackingType: TrackingType;
  buyPrice: number;
  sellPrice: number;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type StockMovementType = "in" | "out" | "adjustment";

// untuk produk trackingType='bulk'
export interface StockMovement {
  id: string;
  productId: string;
  businessId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  createdBy: string;
  createdAt: Date;
}

export type ProductUnitStatus =
  | "available"
  | "sold"
  | "reserved"
  | "defective";

// untuk produk trackingType='serial' (contoh: HP dengan IMEI)
export interface ProductUnit {
  id: string;
  productId: string;
  businessId: string;
  serialNumber: string;
  condition?: string;
  buyPrice?: number;
  status: ProductUnitStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewProductInput {
  name: string;
  categoryId?: string;
  trackingType: TrackingType;
  buyPrice: number;
  sellPrice: number;
  sku?: string;
  description?: string;
}

export interface NewUnitInput {
  productId: string;
  serialNumber: string;
  condition: string;
  buyPrice?: number;
  notes?: string;
}

export interface UpdateProductInput {
  name: string;
  categoryId?: string;
  buyPrice: number;
  sellPrice: number;
  description?: string;
}
