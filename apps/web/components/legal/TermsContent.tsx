"use client";

import { LegalLayout } from "@/components/legal/LegalLayout";
import { LegalNav, LegalSection } from "@/components/legal/LegalSection";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const TERMS_SECTIONS = [
  { id: "overview", titleKey: "legal.termsOverviewTitle" },
  { id: "acceptance", titleKey: "legal.termsAcceptTitle" },
  { id: "service", titleKey: "legal.termsServiceTitle" },
  { id: "account", titleKey: "legal.termsAccountTitle" },
  { id: "acceptable-use", titleKey: "legal.termsAcceptableUseTitle" },
  { id: "api-keys", titleKey: "legal.termsApiTitle" },
  { id: "billing", titleKey: "legal.termsBillingTitle" },
  { id: "token", titleKey: "legal.termsTokenTitle" },
  { id: "ip", titleKey: "legal.termsIpTitle" },
  { id: "disclaimer", titleKey: "legal.termsLimitTitle" },
  { id: "indemnity", titleKey: "legal.termsIndemnityTitle" },
  { id: "termination", titleKey: "legal.termsTerminationTitle" },
  { id: "governing-law", titleKey: "legal.termsGoverningTitle" },
  { id: "changes", titleKey: "legal.termsChangesTitle" },
  { id: "contact", titleKey: "legal.termsContactTitle" },
] as const;

export function TermsContent() {
  const { t } = useLanguage();

  const navItems = TERMS_SECTIONS.map((s) => ({
    id: s.id,
    label: t(s.titleKey),
  }));

  return (
    <LegalLayout
      title={t("legal.termsTitle")}
      subtitle={t("legal.termsSubtitle")}
      updated={t("legal.termsUpdated")}
    >
      <p className="text-[var(--text-secondary)]">{t("legal.termsIntro")}</p>

      <LegalNav items={navItems} />

      <LegalSection id="overview" title={t("legal.termsOverviewTitle")}>
        <p>{t("legal.termsOverviewBody")}</p>
      </LegalSection>

      <LegalSection id="acceptance" title={t("legal.termsAcceptTitle")}>
        <p>{t("legal.termsAcceptBody")}</p>
      </LegalSection>

      <LegalSection id="service" title={t("legal.termsServiceTitle")}>
        <p>{t("legal.termsServiceBody")}</p>
      </LegalSection>

      <LegalSection id="account" title={t("legal.termsAccountTitle")}>
        <p>{t("legal.termsAccount1")}</p>
        <p>{t("legal.termsAccount2")}</p>
      </LegalSection>

      <LegalSection id="acceptable-use" title={t("legal.termsAcceptableUseTitle")}>
        <p>{t("legal.termsAcceptableUseIntro")}</p>
        <ul className="list-inside list-disc space-y-1">
          <li>{t("legal.termsAcceptableUse1")}</li>
          <li>{t("legal.termsAcceptableUse2")}</li>
          <li>{t("legal.termsAcceptableUse3")}</li>
          <li>{t("legal.termsAcceptableUse4")}</li>
          <li>{t("legal.termsAcceptableUse5")}</li>
        </ul>
      </LegalSection>

      <LegalSection id="api-keys" title={t("legal.termsApiTitle")}>
        <p>{t("legal.termsApiBody1")}</p>
        <p>{t("legal.termsApiBody2")}</p>
      </LegalSection>

      <LegalSection id="billing" title={t("legal.termsBillingTitle")}>
        <p>{t("legal.termsBilling1")}</p>
        <p>{t("legal.termsBilling2")}</p>
        <p>{t("legal.termsBilling3")}</p>
      </LegalSection>

      <LegalSection id="token" title={t("legal.termsTokenTitle")}>
        <p>{t("legal.termsTokenBody1")}</p>
        <p>{t("legal.termsTokenBody2")}</p>
      </LegalSection>

      <LegalSection id="ip" title={t("legal.termsIpTitle")}>
        <p>{t("legal.termsIpBody")}</p>
      </LegalSection>

      <LegalSection id="disclaimer" title={t("legal.termsLimitTitle")}>
        <p>{t("legal.termsLimitBody1")}</p>
        <p>{t("legal.termsLimitBody2")}</p>
      </LegalSection>

      <LegalSection id="indemnity" title={t("legal.termsIndemnityTitle")}>
        <p>{t("legal.termsIndemnityBody")}</p>
      </LegalSection>

      <LegalSection id="termination" title={t("legal.termsTerminationTitle")}>
        <p>{t("legal.termsTermination1")}</p>
        <p>{t("legal.termsTermination2")}</p>
      </LegalSection>

      <LegalSection id="governing-law" title={t("legal.termsGoverningTitle")}>
        <p>{t("legal.termsGoverningBody")}</p>
      </LegalSection>

      <LegalSection id="changes" title={t("legal.termsChangesTitle")}>
        <p>{t("legal.termsChangesBody")}</p>
      </LegalSection>

      <LegalSection id="contact" title={t("legal.termsContactTitle")}>
        <p>{t("legal.termsContactBody")}</p>
      </LegalSection>
    </LegalLayout>
  );
}
