/** Team profile photos live in the public `team-avatars` storage bucket. */
export const AVATAR_BUCKET = "team-avatars";

/** Max upload size (the bucket enforces the same limit). */
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const AVATAR_TYPES = ["image/webp", "image/jpeg", "image/png"] as const;

/** Public URL for a stored avatar path, or null. */
export function avatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  return base ? `${base}/storage/v1/object/public/${AVATAR_BUCKET}/${path}` : null;
}

/** Up to two initials for the fallback avatar. */
export function initialsFor(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}
