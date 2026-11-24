import { createClient } from "@/lib/supabase/server";

export type AuditEntry = {
  id: number;
  createdAt: string;
  actorName: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  summary: string;
  metadata: Record<string, unknown>;
};

/** Areas of the log the page can filter by (prefix of the action name). */
export const AUDIT_CATEGORIES = [
  { value: "team", label: "Team & access" },
  { value: "role", label: "Roles" },
  { value: "payment", label: "Payments" },
  { value: "booking", label: "Bookings" },
  { value: "sms", label: "Messages" },
  { value: "event", label: "Events" },
  { value: "community", label: "Community" },
  { value: "account", label: "Own account" },
] as const;

/** Latest audit entries (owner-only page). */
export async function getAuditLog(options: { category?: string; limit?: number } = {}): Promise<AuditEntry[]> {
  // Read as the signed-in owner (RLS: owner-only), not with the service-role key.
  let query = (await createClient())
    .from("audit_log")
    .select("id, created_at, actor_name, action, target_type, target_id, summary, metadata")
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(options.limit ?? 200, 1), 500));

  if (options.category && AUDIT_CATEGORIES.some((c) => c.value === options.category)) {
    query = query.like("action", `${options.category}.%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getAuditLog]", error);
    throw new Error("The audit log could not be loaded.");
  }
  return (data ?? []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    actorName: row.actor_name,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    summary: row.summary,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
  }));
}
