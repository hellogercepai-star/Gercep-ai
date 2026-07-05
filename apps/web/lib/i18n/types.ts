export type Locale = "id" | "en";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "id", label: "ID" },
  { code: "en", label: "EN" },
];

export const DEFAULT_LOCALE: Locale = "id";
export const LOCALE_STORAGE_KEY = "gercep_locale";

export type Messages = typeof import("./messages/id").messages;
