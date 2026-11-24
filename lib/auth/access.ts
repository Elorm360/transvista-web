import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { effectiveAreas, formatAdminRole, type AdminArea, type AdminRole } from "@/lib/auth/permissions";

export type AdminAccess = {
  user: User;
  memberId: string;
  memberName: string;
  /** Base role: the database's ceiling for this person. */
  role: AdminRole;
  /** What to show as their role (custom role name if they have one). */
  roleLabel: string;
  customRole: { key: string; name: string } | null;
  /** Sections they may use, enforced on every page and server action. */
  areas: AdminArea[];
  /** Two-step sign-in: set up on the account, and verified this session? */
  mfa: { enrolled: boolean; verified: boolean };
};

export type AccessResult =
  | { status: "signed-out" }
  | { status: "no-access"; user: User }
  | { status: "mfa-required"; user: User }
  | { status: "ok"; access: AdminAccess };

/**
 * Resolve the signed-in person's admin access once per request.
 * Single source of truth for pages (requireAdminArea) and actions (hasAdminArea).
 */
export const resolveAdminAccess = cache(async (): Promise<AccessResult> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "signed-out" };

  // Read as the signed-in person (RLS: "Team members can view themselves"),
  // so access never depends on the service-role key being configured.
  const { data: member, error } = await supabase
    .from("admin_team_members")
    .select("id, full_name, role, status, custom_role_key")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) console.error("[resolveAdminAccess] member:", error);
  if (!member || member.status !== "active") return { status: "no-access", user };

  // Two-step sign-in: if they've set it up, this session must have passed it.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const enrolled = aal?.nextLevel === "aal2";
  const verified = aal?.currentLevel === "aal2";
  if (enrolled && !verified) return { status: "mfa-required", user };

  const role = member.role as AdminRole;
  let customRole: { key: string; name: string; permissions: string[] } | null = null;
  if (member.custom_role_key && role !== "owner") {
    const { data } = await supabase
      .from("admin_roles")
      .select("key, name, permissions, base_role")
      .eq("key", member.custom_role_key)
      .maybeSingle();
    // Only honour a custom role whose base still matches the member's base role.
    if (data && data.base_role === role) customRole = data;
  }

  return {
    status: "ok",
    access: {
      user,
      memberId: member.id,
      memberName: member.full_name,
      role,
      roleLabel: customRole?.name ?? formatAdminRole(role),
      customRole: customRole ? { key: customRole.key, name: customRole.name } : null,
      areas: effectiveAreas(role, customRole?.permissions ?? null),
      mfa: { enrolled, verified },
    },
  };
});

/**
 * For server actions: may the current person use this section right now?
 * False when signed out, inactive, two-step sign-in pending, or not granted.
 */
export async function hasAdminArea(area: AdminArea): Promise<boolean> {
  const result = await resolveAdminAccess();
  return result.status === "ok" && result.access.areas.includes(area);
}

/** Message actions return when hasAdminArea() is false. */
export const NO_ACCESS_MESSAGE = "Your role doesn't include this section. Ask the owner if you need access.";
