import type { User } from "@supabase/supabase-js";

/* ──────────────────────────────────────────────────────────────
 * Authorization layer
 *
 * Separates authentication ("who are you?") from authorization
 * ("what are you allowed to do?").
 *
 * v1.0 has a single Owner. To scale into a role-based system
 * (Owner / Admin / Support / Editor), extend `roles` below without
 * changing any call site — `roleFor(user)` already returns the
 * role for a given user.
 * ────────────────────────────────────────────────────────────── */

/**
 * Allowed admin roles. For v1.0 there is a single Owner.
 *
 * To add roles later:
 *   - extend this type
 *   - add a case in `roles`
 *   - add the user's email under the new role
 */
export type AdminRole = "owner";

/**
 * The single source of truth for role membership.
 * Map an email address to its role.
 */
const roles: Record<string, AdminRole> = {
  "info@transvistaafrica.com": "owner",
};

/**
 * Return the admin role for an authenticated user, or null if the
 * user has no admin access.
 *
 * @param user - The authenticated Supabase user
 * @returns The user's admin role, or null if they are not authorized
 */
export function roleFor(user: Pick<User, "email"> | null): AdminRole | null {
  if (!user?.email) return null;
  return roles[user.email.toLowerCase()] ?? null;
}

/**
 * Check whether an authenticated user is authorized to access the
 * admin area.
 *
 * Centralize all authorization decisions here — never duplicate
 * email checks elsewhere in the application.
 *
 * @param user - The authenticated Supabase user
 * @returns true if the user is an admin, false otherwise
 */
export function isAdmin(user: Pick<User, "email"> | null): boolean {
  return roleFor(user) !== null;
}

