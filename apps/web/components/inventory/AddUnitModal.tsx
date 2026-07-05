"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Product } from "@/types";
import type { NewUnitInput } from "@/hooks/useProducts";

interface AddUnitModalProps {
  /** produk target; null berarti modal tertutup */
  product: Product | null;
  onClose: () => void;
  /** teruskan addUnit dari useProducts() milik parent */
  onAddUnit: (input: NewUnitInput) => Promise<unknown>;
}

const CONDITIONS: { value: string; label: string }[] = [
  { value: "new", label: "Baru" },
  { value: "used_like_new", label: "Bekas Like New" },
  { value: "used_good", label: "Bekas Baik" },
  { value: "used_fair", label: "Bekas Cukup" },
];

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#2DD4BF]/50";

export function AddUnitModal({
  product,
  onClose,
  onAddUnit,
}: AddUnitModalProps) {
  const [serialNumber, setSerialNumber] = useState("");
  const [condition, setCondition] = useState(CONDITIONS[0].value);
  const [buyPrice, setBuyPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const handleClose = () => {
    setSerialNumber("");
    setCondition(CONDITIONS[0].value);
    setBuyPrice("");
    setNotes("");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!serialNumber.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await onAddUnit({
        productId: product.id,
        serialNumber: serialNumber.trim(),
        condition,
        // kosong = pakai harga beli produk
        buyPrice: buyPrice ? Number(buyPrice) : product.buyPrice,
        notes: notes.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menambah unit. Coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070711]/80 p-4 backdrop-blur-sm">
      <Card
        title="Tambah Unit"
        description={product.name}
        className="max-h-[90vh] w-full max-w-sm overflow-y-auto bg-[#070711]"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="unit-serial"
              className="mb-1.5 block text-sm text-white/70"
            >
              Serial number / IMEI <span className="text-[#F472B6]">*</span>
            </label>
            <input
              id="unit-serial"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              required
              placeholder="cth. 356789104312345"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="unit-condition"
              className="mb-1.5 block text-sm text-white/70"
            >
              Kondisi
            </label>
            <select
              id="unit-condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className={`${inputClass} bg-[#070711]`}
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="unit-buy-price"
              className="mb-1.5 block text-sm text-white/70"
            >
              Harga beli unit ini{" "}
              <span className="text-white/40">(opsional)</span>
            </label>
            <input
              id="unit-buy-price"
              type="number"
              min="0"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              placeholder={`Default: ${product.buyPrice.toLocaleString(
                "id-ID"
              )}`}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="unit-notes"
              className="mb-1.5 block text-sm text-white/70"
            >
              Catatan <span className="text-white/40">(opsional)</span>
            </label>
            <textarea
              id="unit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="cth. Garansi resmi sampai 2027"
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
              Batal
            </Button>
            <Button type="submit" disabled={!serialNumber.trim() || submitting}>
              {submitting ? "Menyimpan..." : "Tambah Unit"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
