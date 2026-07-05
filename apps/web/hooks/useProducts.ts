"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createInventoryService } from "@/lib/services/inventory.service";
import type { Business, Category, Product, TrackingType } from "@/types";
import type {
  NewProductInput,
  NewUnitInput,
  UpdateProductInput,
} from "@/types/inventory";

export function useProducts(activeBusiness: Business | null) {
  const supabase = useMemo(() => createClient(), []);
  const inventoryService = useMemo(
    () => createInventoryService(supabase),
    [supabase]
  );
  const businessId = activeBusiness?.id ?? null;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockByProduct, setStockByProduct] = useState<Record<string, number>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  const loadInventory = useCallback(async () => {
    if (!businessId) return;
    const snapshot = await inventoryService.getSnapshot(businessId);
    setProducts(snapshot.products);
    setCategories(snapshot.categories);
    setStockByProduct(snapshot.stockByProduct);
  }, [businessId, inventoryService]);

  useEffect(() => {
    async function initialLoad() {
      if (!businessId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        await loadInventory();
      } catch (err) {
        console.error("Gagal memuat inventory:", err);
      } finally {
        setLoading(false);
      }
    }
    initialLoad();
  }, [businessId, loadInventory]);

  const getProductStock = useCallback(
    (productId: string, trackingType: TrackingType) =>
      inventoryService.getProductStock(productId, trackingType),
    [inventoryService]
  );

  const createCategory = async (name: string): Promise<Category> => {
    if (!businessId) throw new Error("Pilih bisnis dulu.");
    const category = await inventoryService.createCategory(businessId, name);
    setCategories((prev) =>
      [...prev, category].sort((a, b) => a.name.localeCompare(b.name))
    );
    return category;
  };

  const createProduct = async (input: NewProductInput): Promise<Product> => {
    if (!businessId) throw new Error("Pilih bisnis dulu.");
    const product = await inventoryService.createProduct(businessId, input);
    await loadInventory();
    return product;
  };

  const addStock = async (
    productId: string,
    quantity: number,
    reason?: string
  ): Promise<void> => {
    if (!businessId) throw new Error("Pilih bisnis dulu.");
    await inventoryService.addStock(businessId, productId, quantity, reason);
    await loadInventory();
  };

  const addUnit = async (input: NewUnitInput): Promise<void> => {
    if (!businessId) throw new Error("Pilih bisnis dulu.");
    await inventoryService.addUnit(businessId, input);
    await loadInventory();
  };

  const updateProduct = async (
    productId: string,
    input: UpdateProductInput
  ): Promise<void> => {
    if (!businessId) throw new Error("Pilih bisnis dulu.");
    await inventoryService.updateProduct(productId, input);
    await loadInventory();
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    if (!businessId) throw new Error("Pilih bisnis dulu.");
    await inventoryService.deleteProduct(productId);
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
    addUnit,
    updateProduct,
    deleteProduct,
    refreshInventory: loadInventory,
  };
}
