"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AddProductModal } from "@/components/inventory/AddProductModal";
import { AddStockModal } from "@/components/inventory/AddStockModal";
import { AddUnitModal } from "@/components/inventory/AddUnitModal";
import { useBusiness } from "@/hooks/useBusiness";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types";

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function InventoryPage() {
  const { activeBusiness, loading: businessLoading } = useBusiness();
  const {
    products,
    categories,
    stockByProduct,
    loading,
    createProduct,
    createCategory,
    addStock,
    addUnit,
  } = useProducts(activeBusiness);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [unitProduct, setUnitProduct] = useState<Product | null>(null);

  return (
    <div className="flex min-h-screen bg-[#070711]">
      <Sidebar />

      <div className="flex-1">
        <Header
          title="Inventory"
          subtitle="Kelola produk dan stok bisnis kamu."
          businessName={activeBusiness?.name ?? "Bisnis Saya"}
        />

        <main className="px-8 py-8">
          {businessLoading ? (
            <Card>
              <p className="text-sm text-white/50">Memuat data bisnis...</p>
            </Card>
          ) : !activeBusiness ? (
            <Card
              title="Belum ada bisnis"
              description="Buat bisnis dulu di dashboard sebelum mengelola inventory."
              className="mx-auto max-w-lg"
            >
              <Link href="/dashboard">
                <Button>Ke Dashboard</Button>
              </Link>
            </Card>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-white/50">
                  {loading ? "Memuat produk..." : `${products.length} produk`}
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  + Tambah Produk
                </Button>
              </div>

              {loading ? (
                <Card>
                  <p className="text-sm text-white/50">Memuat produk...</p>
                </Card>
              ) : products.length === 0 ? (
                <Card
                  title="Belum ada produk"
                  description="Tambahkan produk pertamamu untuk mulai mengelola stok."
                >
                  <Button onClick={() => setShowAddModal(true)}>
                    + Tambah Produk Pertama
                  </Button>
                </Card>
              ) : (
                <Card className="overflow-x-auto p-0">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wide text-white/40">
                        <th className="px-6 py-4 font-medium">Produk</th>
                        <th className="px-6 py-4 font-medium">Kategori</th>
                        <th className="px-6 py-4 font-medium">Tipe</th>
                        <th className="px-6 py-4 text-right font-medium">
                          Stok
                        </th>
                        <th className="px-6 py-4 text-right font-medium">
                          Harga Jual
                        </th>
                        <th className="px-6 py-4 text-right font-medium">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr
                          key={product.id}
                          className="border-t border-white/5 transition hover:bg-white/[0.02]"
                        >
                          <td className="px-6 py-4">
                            <p className="font-medium text-white">
                              {product.name}
                            </p>
                            {product.sku && (
                              <p className="mt-0.5 text-xs text-white/40">
                                SKU: {product.sku}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-white/60">
                            {product.categoryName ?? "—"}
                          </td>
                          <td className="px-6 py-4">
                            {product.trackingType === "serial" ? (
                              <span className="rounded-full border border-[#A78BFA]/30 bg-[#A78BFA]/10 px-2.5 py-1 text-xs text-[#A78BFA]">
                                Serial
                              </span>
                            ) : (
                              <span className="rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-2.5 py-1 text-xs text-[#2DD4BF]">
                                Stok
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-white">
                            {stockByProduct[product.id] ?? 0}
                          </td>
                          <td className="px-6 py-4 text-right text-white/80">
                            {formatRupiah(product.sellPrice)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {product.trackingType === "bulk" ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setStockProduct(product)}
                              >
                                + Stok
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setUnitProduct(product)}
                              >
                                + Unit
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </>
          )}
        </main>
      </div>

      <AddProductModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        categories={categories}
        onCreateProduct={createProduct}
        onCreateCategory={createCategory}
      />

      <AddStockModal
        product={stockProduct}
        onClose={() => setStockProduct(null)}
        onAddStock={addStock}
      />

      <AddUnitModal
        product={unitProduct}
        onClose={() => setUnitProduct(null)}
        onAddUnit={addUnit}
      />
    </div>
  );
}
