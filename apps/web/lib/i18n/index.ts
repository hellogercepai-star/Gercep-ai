import { catalogs } from "./messages/catalog";
import { EXTRAS_EN } from "./messages/extras-en";
import { EXTRAS_ID } from "./messages/extras-id";
import { resolveMessageKey } from "./key-aliases";
import type { Locale } from "./types";
import { LOCALE_TAGS } from "./types";

export type MessageKey = string;

const EXTRAS_BY_LOCALE: Partial<Record<Locale, Record<string, string>>> = {
  en: EXTRAS_EN,
  id: EXTRAS_ID,
};

function getNested(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

function applyVars(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  let out = text;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{${k}}`, String(v));
  }
  return out;
}

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>
): string {
  const resolved = resolveMessageKey(key);
  const fallbackChain: Locale[] = [locale, "en", "id"];

  for (const code of fallbackChain) {
    const extra = EXTRAS_BY_LOCALE[code]?.[key] ?? EXTRAS_BY_LOCALE[code]?.[resolved];
    if (extra) return applyVars(extra, vars);

    const raw = getNested(catalogs[code] as Record<string, unknown>, resolved);
    if (typeof raw === "string" && raw.length > 0) {
      return applyVars(raw, vars);
    }
  }

  return applyVars(key, vars);
}

export function localeTag(locale: Locale): string {
  return LOCALE_TAGS[locale] ?? "en-US";
}
