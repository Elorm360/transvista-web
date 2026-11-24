/**
 * Admin access model.
 *
 * Every team member has a BASE role (owner / admin / support /
 * community_manager). The database's row-level security understands only
 * these, so the base role is the hard ceiling on what anyone can do.
 *
 * The owner can also create CUSTOM roles in Settings (e.g. "COO",
 * "Finance Manager"). A custom role picks a base role and then narrows it to
 * chosen sections — it can never grant more than its base. The narrowed
 * section list is enforced on the server by lib/auth/access.ts for every page
 * and every server action.
 */

export type AdminRole = "owner" | "admin" | "community_manager" | "support";

export type AdminArea =
  | "dashboard"
  | "requests"
  | "departures"
  | "messages"
  | "payments"
  | "events"
  | "community"
  | "reviews"
  | "feedback"
  | "analytics"
  | "settings"
  | "audit";

/** What each base role can reach (its ceiling). */
export const BASE_ROLE_AREAS: Record<AdminRole, readonly AdminArea[]> = {
  owner: [
    "dashboard", "requests", "departures", "messages", "payments", "events",
    "community", "reviews", "feedback", "analytics", "settings", "audit",
  ],
  admin: [
    "dashboard", "requests", "departures", "messages", "payments", "events",
    "community", "reviews", "feedback", "analytics",
  ],
  support: ["dashboard", "requests", "departures", "messages", "payments"],
  community_manager: ["dashboard", "community", "reviews", "feedback"],
};

/** Sections a custom role can switch on or off (Settings and Audit stay owner-only). */
export const GRANTABLE_AREAS: Array<{ area: AdminArea; label: string; description: string; href: string }> = [
  { area: "requests", label: "Requests", description: "Booking requests, quotes, assignments and follow-ups", href: "/admin/requests" },
  { area: "departures", label: "Departures", description: "Trip schedules, transport, guides and checklists", href: "/admin/trips" },
  { area: "messages", label: "Messages", description: "SMS to travellers", href: "/admin/messages" },
  { area: "payments", label: "Payments", description: "Payment ledger, receipts, balances and money figures", href: "/admin/payments" },
  { area: "events", label: "Events", description: "Create, price and publish group trips", href: "/admin/events" },
  { area: "community", label: "Community", description: "Waitlist sign-ups and community members", href: "/admin/community" },
  { area: "reviews", label: "Reviews", description: "Approve testimonials and traveller reviews", href: "/admin/reviews" },
  { area: "feedback", label: "Feedback", description: "Post-trip feedback and satisfaction scores", href: "/admin/event-feedback" },
  { area: "analytics", label: "Reports", description: "Booking performance, demand and team workload", href: "/admin/analytics" },
];

/** Base levels a custom role can be built on (never the owner). */
export const CUSTOM_ROLE_BASES: Array<{ role: Exclude<AdminRole, "owner">; label: string; description: string }> = [
  { role: "admin", label: "Admin", description: "Bookings, payments, events, community and reports" },
  { role: "support", label: "Support", description: "Bookings, departures, messages and payments" },
  { role: "community_manager", label: "Community Manager", description: "Community, reviews and feedback" },
];

/** Does a BASE role reach this area? (Custom roles: use lib/auth/access.ts.) */
export function canAccess(role: AdminRole | null, area: AdminArea): boolean {
  return Boolean(role && BASE_ROLE_AREAS[role].includes(area));
}

/** Effective areas for a member: their base, narrowed by a custom role if they have one. */
export function effectiveAreas(role: AdminRole, customPermissions?: readonly string[] | null): AdminArea[] {
  const base = BASE_ROLE_AREAS[role];
  if (!customPermissions) return [...base];
  const allowed = new Set(customPermissions);
  // The Overview is always available; everything else must be granted and within the base.
  return base.filter((area) => area === "dashboard" || allowed.has(area));
}

export function formatAdminRole(role: AdminRole): string {
  switch (role) {
    case "owner":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "community_manager":
      return "Community Manager";
    case "support":
      return "Support";
  }
}
