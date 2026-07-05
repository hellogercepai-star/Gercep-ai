"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { hasInjectedSolanaWallet } from "@/lib/wallet/device";

import "@solana/wallet-adapter-react-ui/styles.css";

const DEFAULT_RPC = "https://api.mainnet-beta.solana.com";

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const [autoConnect, setAutoConnect] = useState(false);

  useEffect(() => {
    setAutoConnect(hasInjectedSolanaWallet());
  }, []);

  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? DEFAULT_RPC;

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={autoConnect}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
