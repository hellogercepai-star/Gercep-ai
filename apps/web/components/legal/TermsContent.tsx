"use client";

import { LegalLayout } from "@/components/legal/LegalLayout";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function TermsContent() {
  const { t } = useLanguage();

  return (
    <LegalLayout title={t("legal.termsTitle")} updated="5 July 2026">
      <p>{t("legal.termsIntro")}</p>

      <h2 className="text-lg font-semibold text-white">
        {t("legal.termsServiceTitle")}
      </h2>
      <p>{t("legal.termsServiceDesc")}</p>

      <h2 className="text-lg font-semibold text-white">
        {t("legal.termsResponsibilitiesTitle")}
      </h2>
      <ul className="list-inside list-disc space-y-1">
        <li>{t("legal.termsResponsibility1")}</li>
        <li>{t("legal.termsResponsibility2")}</li>
        <li>{t("legal.termsResponsibility3")}</li>
        <li>{t("legal.termsResponsibility4")}</li>
      </ul>

      <h2 className="text-lg font-semibold text-white">
        {t("legal.termsKeysTitle")}
      </h2>
      <p>{t("legal.termsKeysDesc")}</p>

      <h2 className="text-lg font-semibold text-white">
        {t("legal.termsTokenTitle")}
      </h2>
      <p>{t("legal.termsTokenDesc")}</p>

      <h2 className="text-lg font-semibold text-white">
        {t("legal.termsDisclaimerTitle")}
      </h2>
      <p>{t("legal.termsDisclaimerDesc")}</p>

      <h2 className="text-lg font-semibold text-white">
        {t("legal.termsChangesTitle")}
      </h2>
      <p>{t("legal.termsChangesDesc")}</p>
    </LegalLayout>
  );
}
