"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { Category, Product, TrackingType } from "@/types";
import type { NewProductInput, UpdateProductInput } from "@/types/inventory";

interface AddProductModalProps {
  open: boolean;
  editProduct?: Product | null;
  onClose: () => void;
  categories: Category[];
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
  const { t } = useLanguage();
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

  const trackingOptions = [
    {
      value: "bulk" as const,
      label: t("business.trackingBulk"),
      hint: t("business.trackingBulkHint"),
    },
    {
      value: "serial" as const,
      label: t("business.trackingSerial"),
      hint: t("business.trackingSerialHint"),
    },
  ];

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
      setError(t("business.categoryRequired"));
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
        err instanceof Error ? err.message : t("business.productCreateError")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070711]/80 p-4 backdrop-blur-sm">
      <Card
        title={isEdit ? t("business.editProduct") : t("business.addProduct")}
        description={
          isEdit ? editProduct.name : t("business.addProductDesc")
        }
        className="max-h-[90vh] w-full max-w-md overflow-y-auto bg-[#070711]"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="product-name"
              className="mb-1.5 block text-sm text-white/70"
            >
              {t("business.productName")}{" "}
              <span className="text-[#F472B6]">*</span>
            </label>
            <input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={t("business.productNamePlaceholder")}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="product-category"
              className="mb-1.5 block text-sm text-white/70"
            >
              {t("business.category")}
            </label>
            <select
              id="product-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`${inputClass} bg-[#070711]`}
            >
              <option value="">{t("business.noCategory")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value={NEW_CATEGORY}>{t("business.newCategory")}</option>
            </select>
            {isNewCategory && (
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={t("business.newCategoryPlaceholder")}
                className={`${inputClass} mt-2`}
              />
            )}
          </div>

          <div>
            <span className="mb-1.5 block text-sm text-white/70">
              {t("business.trackingType")}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {trackingOptions.map((opt) => (
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
                {t("business.trackingLocked")}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="product-description"
              className="mb-1.5 block text-sm text-white/70"
            >
              {t("business.descriptionLabel")}{" "}
              <span className="text-white/40">({t("business.optional")})</span>
            </label>
            <textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder={t("business.productDescPlaceholder")}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="buy-price"
                className="mb-1.5 block text-sm text-white/70"
              >
                {t("business.buyPrice")}
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
                {t("business.sellPrice")}
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
              {t("business.cancel")}
            </Button>
            <Button type="submit" disabled={!name.trim() || submitting}>
              {submitting
                ? t("business.saving")
                : isEdit
                  ? t("business.saveChanges")
                  : t("business.saveProduct")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
