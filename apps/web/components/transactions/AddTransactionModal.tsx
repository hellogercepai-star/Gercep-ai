"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { TransactionType } from "@/types";
import type { NewTransactionInput } from "@/types/transaction";

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewTransactionInput) => Promise<unknown>;
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#2DD4BF]/50";

export function AddTransactionModal({
  open,
  onClose,
  onCreate,
}: AddTransactionModalProps) {
  const { t } = useLanguage();
  const [type, setType] = useState<TransactionType>("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const parsedAmount = Number(amount);
  const isValidAmount = parsedAmount > 0;

  const typeOptions = [
    {
      value: "income" as const,
      label: t("business.income"),
      hint: t("business.incomeHint"),
      activeClass: "border-[#2DD4BF]/60 bg-[#2DD4BF]/10 text-white",
    },
    {
      value: "expense" as const,
      label: t("business.expense"),
      hint: t("business.expenseHint"),
      activeClass: "border-[#F472B6]/60 bg-[#F472B6]/10 text-white",
    },
  ];

  const resetForm = () => {
    setType("income");
    setAmount("");
    setCategory("");
    setDescription("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidAmount || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await onCreate({
        type,
        amount: parsedAmount,
        category: category.trim() || undefined,
        description: description.trim() || undefined,
      });
      resetForm();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("business.transactionError")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070711]/80 p-4 backdrop-blur-sm">
      <Card
        title={t("business.recordTransaction")}
        description={t("business.recordTransactionDesc")}
        className="w-full max-w-md bg-[#070711]"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <span className="mb-1.5 block text-sm text-white/70">
              {t("business.type")}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {typeOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`cursor-pointer rounded-lg border px-3 py-2.5 text-sm transition ${
                    type === opt.value
                      ? opt.activeClass
                      : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="transaction-type"
                    value={opt.value}
                    checked={type === opt.value}
                    onChange={() => setType(opt.value)}
                    className="sr-only"
                  />
                  <span className="block font-medium">{opt.label}</span>
                  <span className="mt-0.5 block text-xs text-white/40">
                    {opt.hint}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="transaction-amount"
              className="mb-1.5 block text-sm text-white/70"
            >
              {t("business.amount")}{" "}
              <span className="text-[#F472B6]">*</span>
            </label>
            <input
              id="transaction-amount"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder={t("business.amountPlaceholder")}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="transaction-category"
              className="mb-1.5 block text-sm text-white/70"
            >
              {t("business.category")}
            </label>
            <input
              id="transaction-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={t("business.transactionCategoryPlaceholder")}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="transaction-description"
              className="mb-1.5 block text-sm text-white/70"
            >
              {t("business.notes")}{" "}
              <span className="text-white/40">({t("business.optional")})</span>
            </label>
            <textarea
              id="transaction-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder={t("business.transactionDescPlaceholder")}
              className={`${inputClass} resize-none`}
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
            <Button type="submit" disabled={!isValidAmount || submitting}>
              {submitting ? t("business.saving") : t("business.saveTransaction")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
