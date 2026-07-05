"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Category, Product, TrackingType } from "@/types";
import type { NewProductInput, UpdateProductInput } from "@/hooks/useProducts";

interface AddProductModalProps {
  open: boolean;
  /** jika diisi, form jadi mode edit; parent wajib memberi key={editProduct?.id ?? "new"} */
  editProduct?: Product | null;
  onClose: () => void;
  categories: Category[];
  /** teruskan createProduct & createCategory dari useProducts() milik parent */
  onCreateProduct: (input: NewProductInput) => Promise<unknown>;
  onCreateCategory: (name: string) => Promise<Category>;
  onUpdateProduct?: (
    productId: string,
    input: UpdateProductInput
  ) => Promise<unknown>;
}

const NEW_CATEGORY = "__new__";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#2DD4BF]/50";

export function AddProductModal({
  open,
  editProduct,
  onClose,
  categories,
  onCreateProduct,
  onCreateCategory,
  onUpdateProduct,
}: AddProductModalProps) {
  const isEdit = !!editProduct;
  const [name, setName] = useState(editProduct?.name ?? "");
  const [categoryId, setCategoryId] = useState(editProduct?.categoryId ?? "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [trackingType, setTrackingType] = useState<TrackingType>(
    editProduct?.trackingType ?? "bulk"
  );
  const [buyPrice, setBuyPrice] = useState(
    editProduct ? String(editProduct.buyPrice) : ""
  );
  const [sellPrice, setSellPrice] = useState(
    editProduct ? String(editProduct.sellPrice) : ""
  );
  const [description, setDescription] = useState(
    editProduct?.description ?? ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const isNewCategory = categoryId === NEW_CATEGORY;

  const resetForm = () => {
    setName("");
    setCategoryId("");
    setNewCategoryName("");
    setTrackingType("bulk");
    setBuyPrice("");
    setSellPrice("");
    setDescription("");
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    if (!name.trim()) return;
    if (isNewCategory && !newCategoryName.trim()) {
      setError("Isi nama kategori baru dulu.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let finalCategoryId = categoryId || undefined;
      if (isNewCategory) {
        const created = await onCreateCategory(newCategoryName.trim());
        finalCategoryId = created.id;
      }

      if (isEdit && onUpdateProduct) {
        await onUpdateProduct(editProduct.id, {
          name: name.trim(),
          categoryId: finalCategoryId,
          buyPrice: Number(buyPrice) || 0,
          sellPrice: Number(sellPrice) || 0,
          description: description.trim() || undefined,
        });
      } else {
        await onCreateProduct({
          name: name.trim(),
          categoryId: finalCategoryId,
          trackingType,
          buyPrice: Number(buyPrice) || 0,
          sellPrice: Number(sellPrice) || 0,
          description: description.trim() || undefined,
        });
      }

      resetForm();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menambah produk. Coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070711]/80 p-4 backdrop-blur-sm">
      <Card
        title={isEdit ? "Edit Produk" : "Tambah Produk"}
        description={
          isEdit ? editProduct.name : "Produk baru untuk bisnis aktif kamu."
        }
        className="max-h-[90vh] w-full max-w-md overflow-y-auto bg-[#070711]"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="product-name"
              className="mb-1.5 block text-sm text-white/70"
            >
              Nama produk <span className="text-[#F472B6]">*</span>
            </label>
            <input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="cth. Parfum Ocean Breeze 50ml"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="product-category"
              className="mb-1.5 block text-sm text-white/70"
            >
              Kategori
            </label>
            <select
              id="product-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`${inputClass} bg-[#070711]`}
            >
              <option value="">Tanpa kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value={NEW_CATEGORY}>+ Buat kategori baru</option>
            </select>
            {isNewCategory && (
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nama kategori baru"
                className={`${inputClass} mt-2`}
              />
            )}
          </div>

          <div>
            <span className="mb-1.5 block text-sm text-white/70">
              Tipe tracking
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  {
                    value: "bulk",
                    label: "Stok Biasa",
                    hint: "dihitung per jumlah",
                  },
                  {
                    value: "serial",
                    label: "Serial Number",
                    hint: "per unit, cth. IMEI",
                  },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={`rounded-lg border px-3 py-2.5 text-sm transition ${
                    isEdit ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  } ${
                    trackingType === opt.value
                      ? "border-[#2DD4BF]/60 bg-[#2DD4BF]/10 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="tracking-type"
                    value={opt.value}
                    checked={trackingType === opt.value}
                    onChange={() => setTrackingType(opt.value)}
                    disabled={isEdit}
                    className="sr-only"
                  />
                  <span className="block font-medium">{opt.label}</span>
                  <span className="mt-0.5 block text-xs text-white/40">
                    {opt.hint}
                  </span>
                </label>
              ))}
            </div>
            {isEdit && (
              <p className="mt-1.5 text-xs text-white/40">
                Tipe tracking tidak bisa diubah setelah produk dibuat karena
                akan merusak konsistensi data stok yang sudah tercatat.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="product-description"
              className="mb-1.5 block text-sm text-white/70"
            >
              Deskripsi <span className="text-white/40">(opsional)</span>
            </label>
            <textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Deskripsi singkat produk..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="buy-price"
                className="mb-1.5 block text-sm text-white/70"
              >
                Harga beli
              </label>
              <input
                id="buy-price"
                type="number"
                min="0"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="sell-price"
                className="mb-1.5 block text-sm text-white/70"
              >
                Harga jual
              </label>
              <input
                id="sell-price"
                type="number"
                min="0"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
          </div>

          {error && <p className="text-sm text-[#F472B6]">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={!name.trim() || submitting}>
              {submitting
                ? "Menyimpan..."
                : isEdit
                ? "Simpan Perubahan"
                : "Simpan Produk"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
