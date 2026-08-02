"use client";

import { createBrowserClient } from "@supabase/ssr";

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
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
