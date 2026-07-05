import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product, TrackingType } from "@/types";
import type { NewProductInput, UpdateProductInput } from "@/types/inventory";

interface ProductRow {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  sku: string | null;
  tracking_type: TrackingType;
  buy_price: number;
  sell_price: number;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories: { name: string } | null;
}

const PRODUCT_SELECT_WITH_CATEGORY = "*, categories(name)";

function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    businessId: row.business_id,
    categoryId: row.category_id ?? undefined,
    categoryName: row.categories?.name,
    name: row.name,
    sku: row.sku ?? undefined,
    trackingType: row.tracking_type,
    buyPrice: Number(row.buy_price),
    sellPrice: Number(row.sell_price),
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export const productRepository = {
  async findByBusiness(
    supabase: SupabaseClient,
    businessId: string
  ): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_WITH_CATEGORY)
      .eq("business_id", businessId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return ((data ?? []) as ProductRow[]).map(mapProductRow);
  },

  async create(
    supabase: SupabaseClient,
    businessId: string,
    input: NewProductInput
  ): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .insert({
        business_id: businessId,
        category_id: input.categoryId ?? null,
        name: input.name.trim(),
        sku: input.sku?.trim() || null,
        tracking_type: input.trackingType,
        buy_price: input.buyPrice,
        sell_price: input.sellPrice,
        description: input.description?.trim() || null,
      })
      .select(PRODUCT_SELECT_WITH_CATEGORY)
      .single();

    if (error) throw new Error(error.message);
    return mapProductRow(data as ProductRow);
  },

  async update(
    supabase: SupabaseClient,
    productId: string,
    input: UpdateProductInput
  ): Promise<void> {
    const { error } = await supabase
      .from("products")
      .update({
        name: input.name.trim(),
        category_id: input.categoryId ?? null,
        buy_price: input.buyPrice,
        sell_price: input.sellPrice,
        description: input.description?.trim() || null,
      })
      .eq("id", productId);

    if (error) throw new Error(error.message);
  },

  async remove(supabase: SupabaseClient, productId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .select("id");

    if (error) throw new Error(error.message);
    return ((data ?? []) as { id: string }[]).map((row) => row.id);
  },
};
