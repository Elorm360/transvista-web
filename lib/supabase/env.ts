/**
 * Public Supabase env used by the browser, server, and proxy clients.
 *
 * Returns null when `.env.local` is missing the project URL or anon key,
 * so callers can fail clearly instead of letting `createServerClient`
 * throw "Your project's URL and Key are required".
 */
export function getSupabasePublicEnv(): {
  url: string;
  anonKey: string;
} | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}
