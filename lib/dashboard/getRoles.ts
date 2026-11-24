import { createClient } from "@/lib/supabase/server";
import type { AdminArea, AdminRole } from "@/lib/auth/permissions";

export type CustomRole = {
  key: string;
  name: string;
  description: string | null;
  baseRole: Exclude<AdminRole, "owner">;
  permissions: AdminArea[];
  memberCount: number;
};

/** Custom roles with how many active team members use each. Owner pages only. */
export async function getCustomRoles(): Promise<CustomRole[]> {
  // Read as the signed-in owner (RLS), not with the service-role key.
  const admin = await createClient();
  const [{ data: roles, error }, { data: members }] = await Promise.all([
    admin.from("admin_roles").select("key, name, description, base_role, permissions").order("name"),
    admin.from("admin_team_members").select("custom_role_key").neq("status", "removed").not("custom_role_key", "is", null),
  ]);
  if (error) {
    console.error("[getCustomRoles]", error);
    throw new Error("Roles could not be loaded.");
  }
  const counts = new Map<string, number>();
  for (const row of members ?? []) counts.set(row.custom_role_key, (counts.get(row.custom_role_key) ?? 0) + 1);

  return (roles ?? []).map((role) => ({
    key: role.key,
    name: role.name,
    description: role.description,
    baseRole: role.base_role,
    permissions: role.permissions as AdminArea[],
    memberCount: counts.get(role.key) ?? 0,
  }));
}
