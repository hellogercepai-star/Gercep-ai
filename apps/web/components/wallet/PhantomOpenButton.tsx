"use client";

import { useEffect, useState } from "react";
import {
  getPhantomDevelopersUrl,
  hasInjectedSolanaWallet,
  isMobileBrowser,
} from "@/lib/wallet/device";

interface PhantomOpenButtonProps {
  className?: string;
  label?: string;
}

/** Tombol buka Gercep di Phantom app — untuk HP yang belum di in-app browser. */
export function PhantomOpenButton({
  className = "inline-block rounded-full bg-[#AB9FF2] px-5 py-2.5 text-sm font-medium text-[#070711]",
  label = "Buka di Phantom App",
}: PhantomOpenButtonProps) {
  const [href, setHref] = useState("#");
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const inPhantom = hasInjectedSolanaWallet();
    const mobile = isMobileBrowser();
    setHidden(inPhantom || !mobile);
    setHref(getPhantomDevelopersUrl(window.location.origin));
  }, []);

  if (hidden) return null;

  return (
    <a href={href} className={className}>
      {label}
    </a>
  );
}
