"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Wallet,
  Factory,
  Settings,
} from "lucide-react";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const navItems = [
  {
    key: "sidebar.dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    match: "/dashboard",
  },
  {
    key: "sidebar.inventory",
    href: "/dashboard/inventory",
    icon: Package,
    match: "/dashboard/inventory",
  },
  {
    key: "sidebar.finance",
    href: "/dashboard/transactions",
    icon: Wallet,
    match: "/dashboard/transactions",
  },
  {
    key: "sidebar.production",
    href: "/dashboard/produksi",
    icon: Factory,
    match: "/dashboard/produksi",
  },
  {
    key: "sidebar.settings",
    href: "/dashboard/settings",
    icon: Settings,
    match: "/dashboard/settings",
  },
] as const;

function isActive(pathname: string, match: string) {
  if (match === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(match);
}

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="group sticky top-0 flex h-screen w-16 shrink-0 flex-col items-center gap-1 border-r border-white/10 bg-[#070711] py-6 transition-all duration-200 hover:w-56">
      <div className="mb-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#2DD4BF] via-[#A78BFA] to-[#F472B6] font-[family-name:var(--font-display)] text-sm font-bold text-[#070711]">
        G
      </div>

      <nav className="flex w-full flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const active = isActive(pathname, item.match);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 overflow-hidden whitespace-nowrap rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-white/[0.08] text-white"
                  : "text-white/50 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {t(item.key)}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden w-full flex-col gap-2 px-3 pb-2 opacity-0 transition-opacity group-hover:opacity-100">
        <LanguageToggle className="w-full [&>button]:w-full [&>button]:justify-center" />
        <Link
          href="/developers"
          className="block rounded-lg border border-[#2DD4BF]/20 px-3 py-2 text-xs text-[#2DD4BF]"
        >
          {t("sidebar.gateway")}
        </Link>
      </div>
    </aside>
  );
}
