"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Business, Category, Product, TrackingType } from "@/types";

interface CategoryRow {
  id: string;
  business_id: string;
  name: string;
  created_at: string;
}

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
  categories: { name: string } | null; // hasil join
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

function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    createdAt: new Date(row.created_at),
  };
}

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

/**
 * Inventory untuk bisnis aktif.
 * Terima activeBusiness dari useBusiness() milik parent (pola sama
 * dengan useDashboardStats) supaya tidak ada fetch ganda.
 */
export function useProducts(activeBusiness: Business | null) {
  const supabase = createClient();
  const businessId = activeBusiness?.id ?? null;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockByProduct, setStockByProduct] = useState<Record<string, number>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  // stok satu produk: bulk = SUM movements (in - out + adjustment),
  // serial = COUNT product_units yang available
  const getProductStock = useCallback(
    async (productId: string, trackingType: TrackingType): Promise<number> => {
      if (trackingType === "serial") {
        const { count } = await supabase
          .from("product_units")
          .select("id", { count: "exact", head: true })
          .eq("product_id", productId)
          .eq("status", "available");
        return count ?? 0;
      }

      const { data } = await supabase
        .from("stock_movements")
        .select("type, quantity")
        .eq("product_id", productId);

      return ((data ?? []) as { type: string; quantity: number }[]).reduce(
        (total, m) =>
          m.type === "out"
            ? total - Number(m.quantity)
            : total + Number(m.quantity),
        0
      );
    },
    [supabase]
  );

  const loadInventory = useCallback(async () => {
    if (!businessId) return;

    const [productResult, categoryResult] = await Promise.all([
      supabase
        .from("products")
        .select("*, categories(name)")
        .eq("business_id", businessId)
        .order("created_at", { ascending: true }),
      supabase
        .from("categories")
        .select("*")
        .eq("business_id", businessId)
        .order("name", { ascending: true }),
    ]);

    if (productResult.error) {
      console.error("Gagal memuat products:", productResult.error.message);
      setLoading(false);
      return;
    }

    const list = (productResult.data as ProductRow[]).map(mapProductRow);
    setProducts(list);
    setCategories(
      ((categoryResult.data ?? []) as CategoryRow[]).map(mapCategoryRow)
    );

    // stok semua produk dihitung dengan 2 query agregat, bukan per produk (hindari N+1)
    const bulkIds = list
      .filter((p) => p.trackingType === "bulk")
      .map((p) => p.id);
    const serialIds = list
      .filter((p) => p.trackingType === "serial")
      .map((p) => p.id);

    const stock: Record<string, number> = {};
    list.forEach((p) => {
      stock[p.id] = 0;
    });

    if (bulkIds.length > 0) {
      const { data: movements } = await supabase
        .from("stock_movements")
        .select("product_id, type, quantity")
        .in("product_id", bulkIds);

      (movements ?? []).forEach(
        (m: { product_id: string; type: string; quantity: number }) => {
          stock[m.product_id] +=
            m.type === "out" ? -Number(m.quantity) : Number(m.quantity);
        }
      );
    }

    if (serialIds.length > 0) {
      const { data: units } = await supabase
        .from("product_units")
        .select("product_id")
        .eq("status", "available")
        .in("product_id", serialIds);

      (units ?? []).forEach((u: { product_id: string }) => {
        stock[u.product_id] += 1;
      });
    }

    setStockByProduct(stock);
    setLoading(false);
  }, [businessId, supabase]);

  useEffect(() => {
    async function initialLoad() {
      // tanpa bisnis aktif tidak ada yang dimuat — matikan loading
      // supaya halaman tidak stuck di "Memuat produk..." selamanya
      if (!businessId) {
        setLoading(false);
        return;
      }
      await loadInventory();
    }
    initialLoad();
  }, [businessId, loadInventory]);

  const createCategory = async (name: string): Promise<Category> => {
    if (!businessId) throw new Error("Pilih bisnis dulu.");

    const { data, error } = await supabase
      .from("categories")
      .insert({ business_id: businessId, name: name.trim() })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const category = mapCategoryRow(data as CategoryRow);
    setCategories((prev) =>
      [...prev, category].sort((a, b) => a.name.localeCompare(b.name))
    );
    return category;
  };

  const createProduct = async (input: NewProductInput): Promise<Product> => {
    if (!businessId) throw new Error("Pilih bisnis dulu.");

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
      .select("*, categories(name)")
      .single();

    if (error) throw new Error(error.message);

    await loadInventory();
    return mapProductRow(data as ProductRow);
  };

  const addStock = async (
    productId: string,
    quantity: number,
    reason?: string
  ): Promise<void> => {
    if (!businessId) throw new Error("Pilih bisnis dulu.");
    if (quantity <= 0) throw new Error("Jumlah harus lebih dari 0.");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Kamu harus login.");

    const { error } = await supabase.from("stock_movements").insert({
      product_id: productId,
      business_id: businessId,
      type: "in",
      quantity,
      reason: reason?.trim() || null,
      created_by: user.id,
    });

    if (error) throw new Error(error.message);

    // refresh supaya kolom stok di tabel produk ter-update
    await loadInventory();
  };

  return {
    products,
    categories,
    stockByProduct,
    loading,
    getProductStock,
    createProduct,
    createCategory,
    addStock,
    refreshInventory: loadInventory,
  };
}
