/**
 * Add new UI strings here first (English), then mirror in sections-id.ts (Indonesian).
 * Other locales (bn, zh, …) fall back to English until translated.
 *
 * Usage in components:
 *   const { t } = useLanguage();
 *   t("section.key")
 */
export { useLanguage as useT, useLanguage } from "@/components/i18n/LanguageProvider";
