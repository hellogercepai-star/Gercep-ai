"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { Product } from "@/types";

interface DeleteProductModalProps {
  product: Product | null;
  onClose: () => void;
  onDelete: (productId: string) => Promise<unknown>;
}

export function DeleteProductModal({
  product,
  onClose,
  onDelete,
}: DeleteProductModalProps) {
  const { t } = useLanguage();
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
        err instanceof Error ? err.message : t("business.deleteProductError")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070711]/80 p-4 backdrop-blur-sm">
      <Card
        title={t("business.deleteProductTitle")}
        className="w-full max-w-sm bg-[#070711]"
      >
        <p className="text-sm text-white/70">
          {t("business.deleteProductConfirm", { name: product.name })}
        </p>

        {error && <p className="mt-3 text-sm text-[#F472B6]">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={submitting}
          >
            {t("business.cancel")}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={submitting}
          >
            {submitting ? t("business.deleting") : t("business.deleteProductBtn")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
