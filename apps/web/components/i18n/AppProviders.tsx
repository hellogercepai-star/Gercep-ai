"use client";

import { LanguageProvider } from "./LanguageProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
