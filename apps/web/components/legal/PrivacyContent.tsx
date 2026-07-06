"use client";

import { LegalLayout } from "@/components/legal/LegalLayout";
import { LegalNav, LegalSection } from "@/components/legal/LegalSection";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const PRIVACY_SECTIONS = [
  { id: "overview", titleKey: "legal.privacyOverviewTitle" },
  { id: "ai-processing", titleKey: "legal.privacyAiTitle" },
  { id: "no-training", titleKey: "legal.privacyNoTrainingTitle" },
  { id: "collect", titleKey: "legal.privacyCollectTitle" },
  { id: "prompts", titleKey: "legal.privacyPromptsTitle" },
  { id: "use", titleKey: "legal.privacyUseTitle" },
  { id: "providers", titleKey: "legal.privacyProvidersTitle" },
  { id: "sensitive", titleKey: "legal.privacySensitiveTitle" },
  { id: "cross-border", titleKey: "legal.privacyCrossBorderTitle" },
  { id: "retention", titleKey: "legal.privacyRetentionTitle" },
  { id: "security", titleKey: "legal.privacySecurityTitle" },
  { id: "rights", titleKey: "legal.privacyRightsTitle" },
  { id: "changes", titleKey: "legal.privacyChangesTitle" },
  { id: "contact", titleKey: "legal.privacyContactTitle" },
] as const;

export function PrivacyContent() {
  const { t } = useLanguage();

  const navItems = PRIVACY_SECTIONS.map((s) => ({
    id: s.id,
    label: t(s.titleKey),
  }));

  return (
    <LegalLayout
      title={t("legal.privacyTitle")}
      subtitle={t("legal.privacySubtitle")}
      updated={t("legal.privacyUpdated")}
    >
      <p className="text-[var(--text-secondary)]">{t("legal.privacyIntro")}</p>
      <p className="text-sm text-[var(--text-muted)]">{t("legal.privacyDocsNote")}</p>

      <LegalNav items={navItems} />

      <LegalSection id="overview" title={t("legal.privacyOverviewTitle")}>
        <p>{t("legal.privacyOverview1")}</p>
        <p>{t("legal.privacyOverview2")}</p>
      </LegalSection>

      <LegalSection id="ai-processing" title={t("legal.privacyAiTitle")}>
        <p>{t("legal.privacyAi1")}</p>
        <p>{t("legal.privacyAi2")}</p>
      </LegalSection>

      <LegalSection id="no-training" title={t("legal.privacyNoTrainingTitle")}>
        <p>{t("legal.privacyNoTrainingBody")}</p>
      </LegalSection>

      <LegalSection id="collect" title={t("legal.privacyCollectTitle")}>
        <p>{t("legal.privacyCollect1")}</p>
        <p>{t("legal.privacyCollect2")}</p>
        <p>{t("legal.privacyCollect3")}</p>
      </LegalSection>

      <LegalSection id="prompts" title={t("legal.privacyPromptsTitle")}>
        <p>{t("legal.privacyPrompts1")}</p>
        <p>{t("legal.privacyPrompts2")}</p>
      </LegalSection>

      <LegalSection id="use" title={t("legal.privacyUseTitle")}>
        <p>{t("legal.privacyUse1")}</p>
        <p>{t("legal.privacyUse2")}</p>
      </LegalSection>

      <LegalSection id="providers" title={t("legal.privacyProvidersTitle")}>
        <p>{t("legal.privacyProviders1")}</p>
        <p>{t("legal.privacyProviders2")}</p>
        <p>{t("legal.privacyProviders3")}</p>
      </LegalSection>

      <LegalSection id="sensitive" title={t("legal.privacySensitiveTitle")}>
        <p>{t("legal.privacySensitive1")}</p>
        <p>{t("legal.privacySensitive2")}</p>
      </LegalSection>

      <LegalSection id="cross-border" title={t("legal.privacyCrossBorderTitle")}>
        <p>{t("legal.privacyCrossBorder1")}</p>
        <p>{t("legal.privacyCrossBorder2")}</p>
      </LegalSection>

      <LegalSection id="retention" title={t("legal.privacyRetentionTitle")}>
        <p>{t("legal.privacyRetention1")}</p>
        <p>{t("legal.privacyRetention2")}</p>
      </LegalSection>

      <LegalSection id="security" title={t("legal.privacySecurityTitle")}>
        <p>{t("legal.privacySecurity1")}</p>
        <p>{t("legal.privacySecurity2")}</p>
      </LegalSection>

      <LegalSection id="rights" title={t("legal.privacyRightsTitle")}>
        <p>{t("legal.privacyRights1")}</p>
        <p>{t("legal.privacyRights2")}</p>
      </LegalSection>

      <LegalSection id="changes" title={t("legal.privacyChangesTitle")}>
        <p>{t("legal.privacyChangesBody")}</p>
      </LegalSection>

      <LegalSection id="contact" title={t("legal.privacyContactTitle")}>
        <p>{t("legal.privacyContactBody")}</p>
      </LegalSection>
    </LegalLayout>
  );
}
