"use client";

import { SolanaWalletProvider } from "@/components/wallet/SolanaWalletProvider";

export default function DevelopersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SolanaWalletProvider>{children}</SolanaWalletProvider>;
}
