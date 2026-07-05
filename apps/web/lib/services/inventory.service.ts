import type { SupabaseClient } from "@supabase/supabase-js";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { productRepository } from "@/lib/repositories/product.repository";
import { stockRepository } from "@/lib/repositories/stock.repository";
import { RepositoryUniqueViolationError } from "@/lib/repositories/errors";
import type { Category, Product, TrackingType } from "@/types";
import type {
  NewProductInput,
  NewUnitInput,
  UpdateProductInput,
} from "@/types/inventory";

export interface InventorySnapshot {
  products: Product[];
  categories: Category[];
  stockByProduct: Record<string, number>;
}

export function createInventoryService(supabase: SupabaseClient) {
  async function getProductStock(
    productId: string,
    trackingType: TrackingType
  ): Promise<number> {
    if (trackingType === "serial") {
      return stockRepository.countAvailableUnits(supabase, productId);
    }

    const movements = await stockRepository.getMovementsForProduct(supabase, productId);
    return movements.reduce(
      (total, m) => (m.type === "out" ? total - m.quantity : total + m.quantity),
      0
    );
  }

  async function getSnapshot(businessId: string): Promise<InventorySnapshot> {
    const [products, categories] = await Promise.all([
      productRepository.findByBusiness(supabase, businessId),
      categoryRepository.findByBusiness(supabase, businessId),
    ]);

    const bulkIds = products.filter((p) => p.trackingType === "bulk").map((p) => p.id);
    const serialIds = products.filter((p) => p.trackingType === "serial").map((p) => p.id);

    const stockByProduct: Record<string, number> = {};
    products.forEach((p) => {
      stockByProduct[p.id] = 0;
    });

    if (bulkIds.length > 0) {
      const movements = await stockRepository.getMovementsForProducts(supabase, bulkIds);
      movements.forEach((m) => {
        stockByProduct[m.productId] += m.type === "out" ? -m.quantity : m.quantity;
      });
    }

    if (serialIds.length > 0) {
      const units = await stockRepository.getAvailableUnitsForProducts(supabase, serialIds);
      units.forEach((u) => {
        stockByProduct[u.productId] += 1;
      });
    }

    return { products, categories, stockByProduct };
  }

  async function createCategory(businessId: string, name: string): Promise<Category> {
    return categoryRepository.create(supabase, businessId, name);
  }

  async function createProduct(
    businessId: string,
    input: NewProductInput
  ): Promise<Product> {
    return productRepository.create(supabase, businessId, input);
  }

  async function updateProduct(
    productId: string,
    input: UpdateProductInput
  ): Promise<void> {
    await productRepository.update(supabase, productId, input);
  }

  async function deleteProduct(productId: string): Promise<void> {
    const deletedIds = await productRepository.remove(supabase, productId);
    if (deletedIds.length === 0) {
      throw new Error(
        "Produk tidak terhapus. Hanya owner bisnis yang bisa menghapus produk."
      );
    }
  }

  async function addStock(
    businessId: string,
    productId: string,
    quantity: number,
    reason?: string
  ): Promise<void> {
    if (quantity <= 0) throw new Error("Jumlah harus lebih dari 0.");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Kamu harus login.");

    await stockRepository.addMovement(supabase, {
      productId,
      businessId,
      type: "in",
      quantity,
      reason,
      createdBy: user.id,
    });
  }

  async function addUnit(businessId: string, input: NewUnitInput): Promise<void> {
    const serialNumber = input.serialNumber.trim();
    if (!serialNumber) throw new Error("Serial number wajib diisi.");

    try {
      await stockRepository.addUnit(supabase, {
        productId: input.productId,
        businessId,
        serialNumber,
        condition: input.condition,
        buyPrice: input.buyPrice,
        notes: input.notes,
      });
    } catch (err) {
      if (err instanceof RepositoryUniqueViolationError) {
        throw new Error(
          `Serial number "${serialNumber}" sudah terdaftar di bisnis ini. Cek lagi, mungkin unit ini sudah pernah diinput.`
        );
      }
      throw err;
    }
  }

  return {
    getSnapshot,
    getProductStock,
    createCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    addStock,
    addUnit,
  };
}
