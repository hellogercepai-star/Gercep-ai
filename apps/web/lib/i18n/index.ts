import { catalogs } from "./messages/catalog";
import type { Locale } from "./types";
import { LOCALE_TAGS } from "./types";

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
  const fallbackChain: Locale[] = [locale, "en", "id"];
  let text = key;

  for (const code of fallbackChain) {
    const raw = getNested(catalogs[code] as Record<string, unknown>, key);
    if (typeof raw === "string") {
      text = raw;
      break;
    }
  }

  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}

export function localeTag(locale: Locale): string {
  return LOCALE_TAGS[locale] ?? "en-US";
}
