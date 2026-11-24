import { createAdminClient } from "@/lib/supabase/admin";
import { resolveAdminAccess } from "@/lib/auth/access";

export type AuditTarget = { type: string; id?: string | number | null };

/** Pick a few safe, short fields from a submitted form for audit metadata. */
export function formFields(formData: FormData, keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value === "string" && value.trim()) out[key] = value.trim().slice(0, 200);
  }
  return out;
}

/**
 * Record a sensitive admin action in the append-only audit log.
 *
 * The actor is the signed-in team member. Never throws: an audit failure is
 * logged to the server console but doesn't undo the action that happened.
 * Don't put passwords, tokens or full payment details in `metadata`.
 */
export async function logAudit(
  action: string,
  summary: string,
  target?: AuditTarget,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    const result = await resolveAdminAccess();
    const actor = result.status === "ok" ? result.access : null;
    const { error } = await createAdminClient()
      .from("audit_log")
      .insert({
        actor_member_id: actor?.memberId ?? null,
        actor_name: actor?.memberName ?? null,
        action,
        target_type: target?.type ?? null,
        target_id: target?.id != null ? String(target.id) : null,
        summary: summary.slice(0, 500),
        metadata,
      });
    if (error) console.error("[logAudit] insert failed:", action, error);
  } catch (error) {
    console.error("[logAudit] failed:", action, error);
  }
}
