import type { Locale, Messages } from "../types";
import { messages as bn } from "./bn";
import { messages as de } from "./de";
import { messages as en } from "./en";
import { messages as es } from "./es";
import { messages as fil } from "./fil";
import { messages as fr } from "./fr";
import { messages as ha } from "./ha";
import { messages as hi } from "./hi";
import { messages as id } from "./id";
import { messages as ja } from "./ja";
import { messages as ko } from "./ko";
import { messages as pt } from "./pt";
import { messages as ru } from "./ru";
import { messages as tr } from "./tr";
import { messages as ur } from "./ur";
import { messages as vi } from "./vi";
import { messages as zh } from "./zh";

/** Partial locale files override en at runtime via translate() fallback chain. */
export const catalogs: Record<Locale, Messages> = {
  id,
  en,
  bn: bn as Messages,
  zh: zh as Messages,
  fr: fr as Messages,
  de: de as Messages,
  ha: ha as Messages,
  hi: hi as Messages,
  ja: ja as Messages,
  ko: ko as Messages,
  fil: fil as Messages,
  pt: pt as Messages,
  ru: ru as Messages,
  es: es as Messages,
  tr: tr as Messages,
  ur: ur as Messages,
  vi: vi as Messages,
};
