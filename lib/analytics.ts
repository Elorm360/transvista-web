import { track as vercelTrack } from "@vercel/analytics";

type EventName =
  | "whatsapp_click"
  | "plan_submit"
  | "trip_reserve"
  | "community_join";

/**
 * Cookieless Vercel Web Analytics events. Safe to call anywhere on the
 * client; it is a no-op until Web Analytics is enabled in Vercel.
 */
export function track(name: EventName, properties?: Record<string, string | number>) {
  try {
    vercelTrack(name, properties);
  } catch {
    // Analytics must never break the page.
  }
}
