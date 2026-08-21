import type { User } from "@supabase/supabase-js";

/**
 * Central authorization layer for the TransVista admin system.
 *
 * Authentication = who is signed in?
 * Authorization = what can that person access?
 */

export type AdminRole =
  | "owner"
  | "admin"
  | "community_manager"
  | "support";

const roles: Record<string, AdminRole> = {
  "info@transvistaafrica.com": "owner",
};

/**
 * Return the role assigned to an authenticated user.
 */
export function roleFor(
  user: Pick<User, "email"> | null,
): AdminRole | null {
  if (!user?.email) return null;

  return roles[user.email.toLowerCase()] ?? null;
}

/**
 * Basic admin check.
 */
export function isAdmin(
  user: Pick<User, "email"> | null,
): boolean {
  return roleFor(user) !== null;
}

/**
 * Check whether the user is the TransVista owner.
 *
 * Kept for the invitation server action until roles are read from
 * admin_team_members.
 */
export function isOwner(
  user: Pick<User, "email"> | null,
): boolean {
  return roleFor(user) === "owner";
}

/**
 * Check whether a role can access a particular admin area.
 */
export function canAccess(
  role: AdminRole | null,
  area:
    | "dashboard"
    | "community"
    | "analytics"
    | "settings",
): boolean {
  if (!role) return false;

  switch (area) {
    case "dashboard":
      return true;

    case "community":
      return (
        role === "owner" ||
        role === "admin" ||
        role === "community_manager" ||
        role === "support"
      );

    case "analytics":
      return (
        role === "owner" ||
        role === "admin"
      );

    case "settings":
      return role === "owner";

    default:
      return false;
  }
}
