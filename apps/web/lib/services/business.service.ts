import type { SupabaseClient } from "@supabase/supabase-js";
import { businessRepository } from "@/lib/repositories/business.repository";
import type { Business } from "@/types";

export function createBusinessService(supabase: SupabaseClient) {
  async function getCurrentUserId(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  }

  async function loadBusinesses(): Promise<Business[]> {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const memberBusinessIds = await businessRepository.findMemberBusinessIds(
      supabase,
      userId
    );
    return businessRepository.findForUser(supabase, userId, memberBusinessIds);
  }

  async function createBusiness(
    name: string,
    description?: string
  ): Promise<Business> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Kamu harus login untuk membuat bisnis.");

    return businessRepository.create(supabase, {
      name,
      description,
      ownerId: userId,
    });
  }

  return { loadBusinesses, createBusiness, getCurrentUserId };
}
