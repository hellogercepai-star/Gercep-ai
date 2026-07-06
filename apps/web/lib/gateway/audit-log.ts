import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAdminAudit(
  db: SupabaseClient,
  input: {
    action: string;
    resourceType?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    actor?: string;
  }
): Promise<void> {
  await db.from("audit_logs").insert({
    actor: input.actor ?? "admin",
    action: input.action,
    resource_type: input.resourceType ?? null,
    resource_id: input.resourceId ?? null,
    metadata: input.metadata ?? {},
  });
}
