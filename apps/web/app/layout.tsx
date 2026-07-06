import type { Metadata } from "next";
import Script from "next/script";
import { Space_Grotesk, Inter } from "next/font/google";
import { AppProviders } from "@/components/i18n/AppProviders";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/theme/types";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Gercep AI — OpenAI-compatible inference gateway",
  description:
    "Multi-model LLM gateway for developers. Test in the playground, create sk-gercep API keys, and ship with one compatible request shape.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable}`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <body className="min-h-screen overflow-x-hidden bg-[var(--bg-page)] font-[family-name:var(--font-body)] text-[var(--text-primary)] antialiased transition-[background-color,color] duration-300">
        <Script id="gercep-theme-init" strategy="beforeInteractive">
          {`(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t!=='dark'&&t!=='light')t=${JSON.stringify(DEFAULT_THEME)};document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;}catch(e){}})();`}
        </Script>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
