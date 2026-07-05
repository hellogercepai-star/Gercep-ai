"use client";

import { LegalLayout } from "@/components/legal/LegalLayout";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function PrivacyContent() {
  const { t } = useLanguage();

  return (
    <LegalLayout title={t("legal.privacyTitle")} updated="5 July 2026">
      <p>{t("legal.privacyIntro")}</p>

      <h2 className="text-lg font-semibold text-white">
        {t("legal.privacyDataTitle")}
      </h2>
      <ul className="list-inside list-disc space-y-1">
        <li>{t("legal.privacyData1")}</li>
        <li>{t("legal.privacyData2")}</li>
        <li>{t("legal.privacyData3")}</li>
        <li>{t("legal.privacyData4")}</li>
        <li>{t("legal.privacyData5")}</li>
      </ul>

      <h2 className="text-lg font-semibold text-white">
        {t("legal.privacyUseTitle")}
      </h2>
      <ul className="list-inside list-disc space-y-1">
        <li>{t("legal.privacyUse1")}</li>
        <li>{t("legal.privacyUse2")}</li>
        <li>{t("legal.privacyUse3")}</li>
        <li>{t("legal.privacyUse4")}</li>
      </ul>

      <h2 className="text-lg font-semibold text-white">
        {t("legal.privacyThirdTitle")}
      </h2>
      <p>{t("legal.privacyThirdDesc")}</p>

      <h2 className="text-lg font-semibold text-white">
        {t("legal.privacyRetentionTitle")}
      </h2>
      <p>{t("legal.privacyRetentionDesc")}</p>

      <h2 className="text-lg font-semibold text-white">
        {t("legal.privacyContactTitle")}
      </h2>
      <p>{t("legal.privacyContactDesc")}</p>
    </LegalLayout>
  );
}
