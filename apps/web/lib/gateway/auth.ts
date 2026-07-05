import type { SupabaseClient } from "@supabase/supabase-js";
import { hashApiKey, isGercepApiKey } from "./api-key";
import type { ValidatedApiKey } from "@/types/gateway";

interface ApiKeyRow {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  revoked_at: string | null;
}

export async function validateApiKey(
  supabase: SupabaseClient,
  plainKey: string
): Promise<ValidatedApiKey | null> {
  if (!isGercepApiKey(plainKey)) return null;

  const keyHash = hashApiKey(plainKey);

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, user_id, name, key_prefix, revoked_at")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as ApiKeyRow;
  if (row.revoked_at) return null;

  // update last_used_at (fire-and-forget)
  supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", row.id)
    .then(() => {});

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    keyPrefix: row.key_prefix,
  };
}

export function openAiUnauthorized(message = "API key tidak valid atau sudah dicabut.") {
  return {
    error: { message, type: "invalid_api_key" as const },
  };
}
