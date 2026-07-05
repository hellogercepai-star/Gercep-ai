import type { SupabaseClient } from "@supabase/supabase-js";
import type { StockMovementType } from "@/types";
import { RepositoryUniqueViolationError } from "./errors";

interface MovementRow {
  product_id: string;
  type: StockMovementType;
  quantity: number;
}

export interface StockMovementInput {
  productId: string;
  businessId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  createdBy: string;
}

export interface AddUnitInput {
  productId: string;
  businessId: string;
  serialNumber: string;
  condition: string;
  buyPrice?: number;
  notes?: string;
}

export const stockRepository = {
  async getMovementsForProduct(supabase: SupabaseClient, productId: string) {
    const { data, error } = await supabase
      .from("stock_movements")
      .select("product_id, type, quantity")
      .eq("product_id", productId);

    if (error) throw new Error(error.message);
    return ((data ?? []) as MovementRow[]).map((m) => ({
      productId: m.product_id,
      type: m.type,
      quantity: Number(m.quantity),
    }));
  },

  async getMovementsForProducts(supabase: SupabaseClient, productIds: string[]) {
    const { data, error } = await supabase
      .from("stock_movements")
      .select("product_id, type, quantity")
      .in("product_id", productIds);

    if (error) throw new Error(error.message);
    return ((data ?? []) as MovementRow[]).map((m) => ({
      productId: m.product_id,
      type: m.type,
      quantity: Number(m.quantity),
    }));
  },

  async countAvailableUnits(
    supabase: SupabaseClient,
    productId: string
  ): Promise<number> {
    const { count, error } = await supabase
      .from("product_units")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId)
      .eq("status", "available");

    if (error) throw new Error(error.message);
    return count ?? 0;
  },

  async getAvailableUnitsForProducts(supabase: SupabaseClient, productIds: string[]) {
    const { data, error } = await supabase
      .from("product_units")
      .select("product_id")
      .eq("status", "available")
      .in("product_id", productIds);

    if (error) throw new Error(error.message);
    return ((data ?? []) as { product_id: string }[]).map((u) => ({
      productId: u.product_id,
    }));
  },

  async addMovement(supabase: SupabaseClient, input: StockMovementInput): Promise<void> {
    const { error } = await supabase.from("stock_movements").insert({
      product_id: input.productId,
      business_id: input.businessId,
      type: input.type,
      quantity: input.quantity,
      reason: input.reason?.trim() || null,
      created_by: input.createdBy,
    });

    if (error) throw new Error(error.message);
  },

  async addUnit(supabase: SupabaseClient, input: AddUnitInput): Promise<void> {
    const { error } = await supabase.from("product_units").insert({
      product_id: input.productId,
      business_id: input.businessId,
      serial_number: input.serialNumber,
      condition: input.condition,
      buy_price: input.buyPrice ?? null,
      status: "available",
      notes: input.notes?.trim() || null,
    });

    if (error) {
      if (error.code === "23505") {
        throw new RepositoryUniqueViolationError();
      }
      throw new Error(error.message);
    }
  },
};
