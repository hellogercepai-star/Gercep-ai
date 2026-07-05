"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";

interface HeaderProps {
  title: string;
  subtitle?: string;
  businessName?: string;
}

export function Header({ title, subtitle, businessName = "Bisnis Saya" }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-white/10 px-8 py-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 text-sm text-white/50">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:text-white">
          {businessName} ▾
        </button>
        <LogoutButton />
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#2DD4BF] via-[#A78BFA] to-[#F472B6]" />
      </div>
    </header>
  );
}
