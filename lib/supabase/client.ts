"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Browser Supabase client.
 *
 * Used in Client Components — creates a Supabase client bound to the
 * browser's cookies so auth sessions work seamlessly on the client.
 *
 * Every client-side Supabase call should use this client.
 *
 * @example
 * ```ts
 * import { supabase } from "@/lib/supabase/client";
 *
 * const { data } = await supabase.auth.getSession();
 * ```
 */
export function createClient() {
  const env = getSupabasePublicEnv();

  if (!env) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local and restart the dev server.",
    );
  }

  return createBrowserClient(env.url, env.anonKey);
}
