"use client";

import { useState } from "react";
import type { Business } from "@/types";

/**
 * MOCK BUSINESSES
 * nanti tinggal ganti ke database (Supabase / Prisma)
 */
const mockBusinesses: Business[] = [
  {
    id: "biz_1",
    name: "Henima Collection",
    description: "Business utama parfum & retail",
    ownerId: "user_1",

    totalRevenue: 42800000,
    totalExpense: 12000000,
    profit: 30800000,

    isActive: true,

    members: [],
    transactions: [],

    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "biz_2",
    name: "Henima Scent Lab",
    description: "Produksi parfum premium",
    ownerId: "user_1",

    totalRevenue: 18000000,
    totalExpense: 9000000,
    profit: 9000000,

    isActive: true,

    members: [],
    transactions: [],

    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function useBusiness() {
  const [businesses] = useState<Business[]>(mockBusinesses);

  const [activeBusiness, setActiveBusiness] = useState<Business>(
    mockBusinesses[0]
  );

  // switch antar bisnis
  const switchBusiness = (businessId: string) => {
    const found = businesses.find((b) => b.id === businessId);
    if (found) setActiveBusiness(found);
  };

  return {
    businesses,
    activeBusiness,
    switchBusiness,

    // helper future-proof
    hasBusinesses: businesses.length > 0,
  };
}
