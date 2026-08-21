import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Server Supabase client.
 *
 * Used in Server Components, Server Actions, and Route Handlers.
 * Reads/writes auth cookies via the Next.js `cookies()` API so the
 * session stays in sync with the request.
 *
 * Every server-side Supabase call should use this client.
 *
 * @example
 * ```ts
 * import { createClient } from "@/lib/supabase/server";
 *
 * const supabase = await createClient();
 * const { data: { session } } = await supabase.auth.getSession();
 * ```
 */
export async function createClient() {
  const env = getSupabasePublicEnv();

  if (!env) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local and restart the dev server.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    env.url,
    env.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
