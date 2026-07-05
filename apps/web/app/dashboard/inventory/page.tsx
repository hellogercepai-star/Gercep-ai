"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AddProductModal } from "@/components/inventory/AddProductModal";
import { AddStockModal } from "@/components/inventory/AddStockModal";
import { AddUnitModal } from "@/components/inventory/AddUnitModal";
import { DeleteProductModal } from "@/components/inventory/DeleteProductModal";
import { useBusiness } from "@/hooks/useBusiness";
import { useUser } from "@/hooks/useUser";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types";

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function InventoryPage() {
  const { activeBusiness, loading: businessLoading } = useBusiness();
  const { user } = useUser();
  const {
    products,
    categories,
    stockByProduct,
    loading,
    createProduct,
    createCategory,
    addStock,
    addUnit,
    updateProduct,
    deleteProduct,
  } = useProducts(activeBusiness);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [unitProduct, setUnitProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // tombol hapus hanya untuk owner, sesuai RLS products_delete_owner_only
  const isOwner =
    !!user && !!activeBusiness && activeBusiness.ownerId === user.id;

  return (
    <div className="flex min-h-screen bg-[#070711]">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Header
          title="Inventory"
          subtitle="Kelola produk dan stok bisnis kamu."
          businessName={activeBusiness?.name ?? "Bisnis Saya"}
        />

        <main className="px-8 py-8 pb-20">
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
                            <div className="flex items-center justify-end gap-1.5">
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditProduct(product)}
                                aria-label={`Edit ${product.name}`}
                              >
                                <Pencil size={14} />
                              </Button>
                              {isOwner && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteTarget(product)}
                                  aria-label={`Hapus ${product.name}`}
                                  className="text-[#F472B6]/70 hover:text-[#F472B6]"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              )}
                            </div>
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
        key={editProduct?.id ?? "new"}
        open={showAddModal || !!editProduct}
        editProduct={editProduct}
        onClose={() => {
          setShowAddModal(false);
          setEditProduct(null);
        }}
        categories={categories}
        onCreateProduct={createProduct}
        onCreateCategory={createCategory}
        onUpdateProduct={updateProduct}
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

      <DeleteProductModal
        product={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDelete={deleteProduct}
      />
    </div>
  );
}
