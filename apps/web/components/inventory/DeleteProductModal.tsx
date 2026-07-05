"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Product } from "@/types";

interface DeleteProductModalProps {
  /** produk target; null berarti modal tertutup */
  product: Product | null;
  onClose: () => void;
  /** teruskan deleteProduct dari useProducts() milik parent */
  onDelete: (productId: string) => Promise<unknown>;
}

export function DeleteProductModal({
  product,
  onClose,
  onDelete,
}: DeleteProductModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleDelete = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      await onDelete(product.id);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus produk. Coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070711]/80 p-4 backdrop-blur-sm">
      <Card title="Hapus Produk" className="w-full max-w-sm bg-[#070711]">
        <p className="text-sm text-white/70">
          Yakin hapus{" "}
          <span className="font-medium text-white">{product.name}</span>?
          Semua data stok dan unit terkait ikut terhapus. Tindakan ini tidak
          bisa dibatalkan.
        </p>

        {error && <p className="mt-3 text-sm text-[#F472B6]">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={submitting}
          >
            {submitting ? "Menghapus..." : "Hapus Produk"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
