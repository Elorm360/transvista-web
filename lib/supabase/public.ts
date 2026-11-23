import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-less Supabase client for public, cacheable pages.
 *
 * It always queries as the anonymous role, so results are identical for
 * every visitor and only include rows that public RLS allows (e.g.
 * published travel events). Because it never reads request cookies, pages
 * that use it can be statically generated and revalidated (ISR) instead of
 * hitting the database on every request.
 *
 * Do not use it for anything that depends on who is signed in — use
 * `@/lib/supabase/server` for that.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
