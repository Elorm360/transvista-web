/** Presence rules shared by the server and the browser. */

/** Heartbeats arrive about once a minute; allow for one late beat. */
export const ONLINE_WINDOW_MS = 150_000;
/** Matches the idle time in PresenceHeartbeat. */
export const AWAY_AFTER_MS = 5 * 60_000;

export type Presence = "online" | "away" | "offline" | "invited" | "inactive";

export function presenceOf(
  member: { status: string; firstSignedInAt: string | null; lastSeenAt: string | null; lastActiveAt: string | null },
  now: number,
): Presence {
  if (member.status !== "active") return "inactive";
  if (!member.firstSignedInAt) return "invited";
  const seen = member.lastSeenAt ? now - new Date(member.lastSeenAt).getTime() : Infinity;
  if (seen > ONLINE_WINDOW_MS) return "offline";
  const active = member.lastActiveAt ? now - new Date(member.lastActiveAt).getTime() : Infinity;
  return active > AWAY_AFTER_MS ? "away" : "online";
}

/** "1h 25m", "12m", "Under a minute" */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return seconds > 0 ? "Under a minute" : "None";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (!hours) return `${minutes}m`;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

/** "just now", "5 min ago", "3 h ago", "yesterday at 18:40", "12 Nov at 09:15" */
export function formatAgo(iso: string | null, now: number): string {
  if (!iso) return "never";
  const then = new Date(iso);
  const diff = Math.max(0, now - then.getTime());
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  const time = then.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Accra" });
  const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Africa/Accra" });
  const today = new Date(now);
  const yesterday = new Date(now - 86_400_000);
  if (dayKey(then) === dayKey(today)) return hours < 6 ? `${hours} h ago` : `today at ${time}`;
  if (dayKey(then) === dayKey(yesterday)) return `yesterday at ${time}`;
  return `${then.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Accra" })} at ${time}`;
}
