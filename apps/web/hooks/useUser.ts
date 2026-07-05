"use client";

import { useState } from "react";
import type { User } from "@/types";

/**
 * MOCK USER (sementara sebelum auth real)
 * nanti tinggal diganti fetch dari Supabase / NextAuth
 */
const mockUser: User = {
  id: "user_1",

  // AUTH IDENTITY (REAL NANTI)
  email: "hellogercepai@gmail.com",

  // DISPLAY NAME (boleh disembunyikan / branding)
  name: "Gercep User",

  image: "",

  role: "owner",

  businesses: [
    {
      businessId: "biz_1",
      businessName: "Henima Collection",
      role: "owner",
    },
  ],

  createdAt: new Date(),
  updatedAt: new Date(),
};

export function useUser() {
  const [user] = useState<User | null>(mockUser);
  const [loading] = useState(false);

  return {
    user,
    loading,

    // helper future-proof (biar nanti gampang upgrade ke auth real)
    isAuthenticated: !!user,
  };
}
