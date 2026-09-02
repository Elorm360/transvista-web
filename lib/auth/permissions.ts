export type AdminRole =
  | "owner"
  | "admin"
  | "community_manager"
  | "support";

export type AdminArea =
  | "dashboard"
  | "community"
  | "requests"
  | "analytics"
  | "settings";

/**
 * Check whether a role can access a particular admin area.
 *
 * Hiding a menu item is not enough — pages and server actions must
 * call this as well.
 */
export function canAccess(
  role: AdminRole | null,
  area: AdminArea,
): boolean {
  if (!role) return false;

  switch (area) {
    case "dashboard":
      return true;

    case "community":
      return (
        role === "owner" ||
        role === "admin" ||
        role === "community_manager"
      );

    case "requests":
      return role === "owner" || role === "admin" || role === "support";

    case "analytics":
      return role === "owner" || role === "admin";

    case "settings":
      return role === "owner";

    default:
      return false;
  }
}

export function formatAdminRole(role: AdminRole): string {
  switch (role) {
    case "owner":
      return "Owner";
    case "admin":
      return "Admin";
    case "community_manager":
      return "Community Manager";
    case "support":
      return "Support";
  }
}
