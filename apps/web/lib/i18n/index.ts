import type { Locale } from "./types";
import { messages as en } from "./messages/en";
import { messages as id } from "./messages/id";

const catalogs = { id, en } as const;

export type MessageKey = string;

function getNested(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>
): string {
  const raw = getNested(catalogs[locale] as Record<string, unknown>, key);
  const fallback = getNested(catalogs.id as Record<string, unknown>, key);
  let text =
    typeof raw === "string"
      ? raw
      : typeof fallback === "string"
        ? fallback
        : key;

  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}

export function localeTag(locale: Locale): string {
  return locale === "id" ? "id-ID" : "en-US";
}
