import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
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
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="min-h-screen overflow-x-hidden bg-[#070711] font-[family-name:var(--font-body)] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
