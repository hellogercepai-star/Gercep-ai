"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { Product } from "@/types";

interface AddStockModalProps {
  product: Product | null;
  onClose: () => void;
  onAddStock: (
    productId: string,
    quantity: number,
    reason?: string
  ) => Promise<unknown>;
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#2DD4BF]/50";

export function AddStockModal({
  product,
  onClose,
  onAddStock,
}: AddStockModalProps) {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const parsedQuantity = Number(quantity);
  const isValidQuantity =
    Number.isInteger(parsedQuantity) && parsedQuantity > 0;

  const handleClose = () => {
    setQuantity("");
    setReason("");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidQuantity || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await onAddStock(product.id, parsedQuantity, reason.trim() || undefined);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("business.stockAddError")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070711]/80 p-4 backdrop-blur-sm">
      <Card
        title={t("business.addStockTitle")}
        description={product.name}
        className="w-full max-w-sm bg-[#070711]"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="stock-quantity"
              className="mb-1.5 block text-sm text-white/70"
            >
              {t("business.quantity")}{" "}
              <span className="text-[#F472B6]">*</span>
            </label>
            <input
              id="stock-quantity"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              placeholder={t("business.quantityPlaceholder")}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="stock-reason"
              className="mb-1.5 block text-sm text-white/70"
            >
              {t("business.notes")}{" "}
              <span className="text-white/40">({t("business.optional")})</span>
            </label>
            <input
              id="stock-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("business.stockReasonPlaceholder")}
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-[#F472B6]">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={submitting}
            >
              {t("business.cancel")}
            </Button>
            <Button type="submit" disabled={!isValidQuantity || submitting}>
              {submitting ? t("business.saving") : t("business.addStockBtn")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
