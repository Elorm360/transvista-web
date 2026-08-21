/**
 * Public site origin used in invite emails and Auth redirectTo.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

/**
 * Allow only in-app relative paths so invite `next` cannot open
 * an external URL.
 */
export function safeInternalPath(
  next: string | null,
  fallback: string,
): string {
  if (
    next &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.includes("://")
  ) {
    return next;
  }

  return fallback;
}
