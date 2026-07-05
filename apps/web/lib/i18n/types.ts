export type Locale =
  | "id"
  | "bn"
  | "zh"
  | "en"
  | "fr"
  | "de"
  | "ha"
  | "hi"
  | "ja"
  | "ko"
  | "fil"
  | "pt"
  | "ru"
  | "es"
  | "tr"
  | "ur"
  | "vi";

export type LocaleMeta = {
  code: Locale;
  flag: string;
  label: string;
  nativeName: string;
};

export const LOCALES: LocaleMeta[] = [
  { code: "id", flag: "🇮🇩", label: "ID", nativeName: "Indonesia" },
  { code: "bn", flag: "🇧🇩", label: "BN", nativeName: "বাংলা" },
  { code: "zh", flag: "🇨🇳", label: "ZH", nativeName: "中文" },
  { code: "en", flag: "🇬🇧", label: "EN", nativeName: "English" },
  { code: "fr", flag: "🇫🇷", label: "FR", nativeName: "Français" },
  { code: "de", flag: "🇩🇪", label: "DE", nativeName: "Deutsch" },
  { code: "ha", flag: "🇳🇬", label: "HA", nativeName: "Hausa" },
  { code: "hi", flag: "🇮🇳", label: "HI", nativeName: "हिन्दी" },
  { code: "ja", flag: "🇯🇵", label: "JA", nativeName: "日本語" },
  { code: "ko", flag: "🇰🇷", label: "KO", nativeName: "한국어" },
  { code: "fil", flag: "🇵🇭", label: "FIL", nativeName: "Filipino" },
  { code: "pt", flag: "🇵🇹", label: "PT", nativeName: "Português" },
  { code: "ru", flag: "🇷🇺", label: "RU", nativeName: "Русский" },
  { code: "es", flag: "🇪🇸", label: "ES", nativeName: "Español" },
  { code: "tr", flag: "🇹🇷", label: "TR", nativeName: "Türkçe" },
  { code: "ur", flag: "🇵🇰", label: "UR", nativeName: "اردو" },
  { code: "vi", flag: "🇻🇳", label: "VI", nativeName: "Tiếng Việt" },
];

export const LOCALE_CODES = new Set<Locale>(LOCALES.map((l) => l.code));

export const DEFAULT_LOCALE: Locale = "id";
export const LOCALE_STORAGE_KEY = "gercep_locale";

type StringifyLeaves<T> = {
  [K in keyof T]: T[K] extends string ? string : StringifyLeaves<T[K]>;
};

export type Messages = StringifyLeaves<
  typeof import("./messages/en").messages
>;

export const LOCALE_TAGS: Record<Locale, string> = {
  id: "id-ID",
  bn: "bn-BD",
  zh: "zh-CN",
  en: "en-US",
  fr: "fr-FR",
  de: "de-DE",
  ha: "ha-NG",
  hi: "hi-IN",
  ja: "ja-JP",
  ko: "ko-KR",
  fil: "fil-PH",
  pt: "pt-PT",
  ru: "ru-RU",
  es: "es-ES",
  tr: "tr-TR",
  ur: "ur-PK",
  vi: "vi-VN",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && LOCALE_CODES.has(value as Locale);
}

export function getLocaleMeta(code: Locale): LocaleMeta {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}
