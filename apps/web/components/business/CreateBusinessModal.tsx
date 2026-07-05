"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface CreateBusinessModalProps {
  open: boolean;
  onClose?: () => void;
  onCreate: (name: string, description?: string) => Promise<unknown>;
}

export function CreateBusinessModal({
  open,
  onClose,
  onCreate,
}: CreateBusinessModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await onCreate(name.trim(), description.trim() || undefined);
      setName("");
      setDescription("");
      onClose?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("business.createError")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070711]/80 p-4 backdrop-blur-sm">
      <Card
        title={t("business.createTitle")}
        description={t("business.createDesc")}
        className="w-full max-w-md bg-[#070711]"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="business-name"
              className="mb-1.5 block text-sm text-white/70"
            >
              {t("business.nameLabel")} <span className="text-[#F472B6]">*</span>
            </label>
            <input
              id="business-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={t("business.namePlaceholder")}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#2DD4BF]/50"
            />
          </div>

          <div>
            <label
              htmlFor="business-description"
              className="mb-1.5 block text-sm text-white/70"
            >
              {t("business.descriptionLabel")}{" "}
              <span className="text-white/40">({t("business.optional")})</span>
            </label>
            <textarea
              id="business-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={t("business.descriptionPlaceholder")}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#2DD4BF]/50"
            />
          </div>

          {error && <p className="text-sm text-[#F472B6]">{error}</p>}

          <div className="flex justify-end gap-2">
            {onClose && (
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={submitting}
              >
                {t("business.cancel")}
              </Button>
            )}
            <Button type="submit" disabled={!name.trim() || submitting}>
              {submitting ? t("business.creating") : t("business.createBtn")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
