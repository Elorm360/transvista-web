"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasAdminArea, NO_ACCESS_MESSAGE, resolveAdminAccess } from "@/lib/auth/access";
import { BASE_ROLE_AREAS, GRANTABLE_AREAS, type AdminRole } from "@/lib/auth/permissions";
import { toActionResult } from "@/lib/actions/result";
import { logAudit } from "@/lib/audit";

type RoleInput = {
  /** Omit to create a new role. */
  key?: string;
  name: string;
  description: string;
  baseRole: string;
  permissions: string[];
};

const BASES: Array<Exclude<AdminRole, "owner">> = ["admin", "support", "community_manager"];

function slugify(name: string) {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 36);
  return /^[a-z]/.test(slug) ? slug : `role_${slug}`.slice(0, 40);
}

async function saveCustomRoleUnsafe(input: RoleInput) {
  if (!(await hasAdminArea("settings"))) throw new Error(NO_ACCESS_MESSAGE);

  const name = input.name.trim();
  const description = input.description.trim();
  if (name.length < 2 || name.length > 60) throw new Error("Give the role a name (2–60 characters).");
  if (description.length > 300) throw new Error("Keep the description under 300 characters.");
  const baseRole = input.baseRole as Exclude<AdminRole, "owner">;
  if (!BASES.includes(baseRole)) throw new Error("Choose a base access level.");

  // Only grantable sections that the base level already allows.
  const allowed = new Set(BASE_ROLE_AREAS[baseRole]);
  const grantable = new Set(GRANTABLE_AREAS.map((entry) => entry.area));
  const permissions = Array.from(new Set(input.permissions)).filter(
    (area) => grantable.has(area as never) && allowed.has(area as never),
  );
  if (!permissions.length) throw new Error("Tick at least one section this role can use.");

  const admin = createAdminClient();
  const access = await resolveAdminAccess();
  const now = new Date().toISOString();

  if (input.key) {
    const { data: existing } = await admin.from("admin_roles").select("key, base_role").eq("key", input.key).maybeSingle();
    if (!existing) throw new Error("This role no longer exists. Refresh the page.");
    const { error } = await admin
      .from("admin_roles")
      .update({ name, description: description || null, base_role: baseRole, permissions, updated_at: now })
      .eq("key", input.key);
    if (error) throw new Error("The role could not be saved.");
    // Members on this role follow its base level (the database's ceiling).
    if (existing.base_role !== baseRole) {
      const { error: memberError } = await admin
        .from("admin_team_members")
        .update({ role: baseRole, updated_at: now })
        .eq("custom_role_key", input.key)
        .neq("status", "removed");
      if (memberError) throw new Error("The role was saved, but its members' access level could not be updated.");
    }
    revalidatePath("/admin", "layout");
    return { key: input.key, name, created: false };
  }

  let key = slugify(name);
  const { data: clash } = await admin.from("admin_roles").select("key").eq("key", key).maybeSingle();
  if (clash) key = `${key.slice(0, 33)}_${Math.random().toString(36).slice(2, 6)}`;

  const { error } = await admin.from("admin_roles").insert({
    key,
    name,
    description: description || null,
    base_role: baseRole,
    permissions,
    created_by: access.status === "ok" ? access.access.memberId : null,
  });
  if (error) {
    console.error("[saveCustomRole]", error);
    throw new Error("The role could not be created.");
  }
  revalidatePath("/admin", "layout");
  return { key, name, created: true };
}

async function deleteCustomRoleUnsafe(key: string) {
  if (!(await hasAdminArea("settings"))) throw new Error(NO_ACCESS_MESSAGE);
  const admin = createAdminClient();
  const { data: role } = await admin.from("admin_roles").select("key, name").eq("key", key).maybeSingle();
  if (!role) throw new Error("This role no longer exists.");
  // Members on this role keep their base access level (FK sets their custom role to null).
  const { error } = await admin.from("admin_roles").delete().eq("key", key);
  if (error) throw new Error("The role could not be deleted.");
  revalidatePath("/admin", "layout");
  return { name: role.name };
}

export async function saveCustomRole(input: RoleInput) {
  const result = await toActionResult(() => saveCustomRoleUnsafe(input));
  if (result.ok) {
    await logAudit(
      result.data.created ? "role.created" : "role.updated",
      `${result.data.created ? "Created" : "Updated"} the role "${result.data.name}"`,
      { type: "admin_role", id: result.data.key },
      { baseRole: input.baseRole, permissions: input.permissions },
    );
  }
  return result;
}

export async function deleteCustomRole(key: string) {
  const result = await toActionResult(() => deleteCustomRoleUnsafe(key));
  if (result.ok) await logAudit("role.deleted", `Deleted the role "${result.data.name}"`, { type: "admin_role", id: key });
  return result;
}
