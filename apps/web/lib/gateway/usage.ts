import type { SupabaseClient } from "@supabase/supabase-js";

export async function logUsage(
  supabase: SupabaseClient,
  input: {
    apiKeyId: string;
    userId: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  }
): Promise<void> {
  const { error } = await supabase.from("usage_logs").insert({
    api_key_id: input.apiKeyId,
    user_id: input.userId,
    model: input.model,
    prompt_tokens: input.promptTokens,
    completion_tokens: input.completionTokens,
    total_tokens: input.totalTokens,
  });

  if (error) {
    console.error("Gagal log usage:", error.message);
  }
}
