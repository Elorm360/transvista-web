import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client with the service-role key.
 *
 * Used for privileged Auth Admin operations such as inviting users.
 * Never import this module from Client Components.
 * Never expose SUPABASE_SERVICE_ROLE_KEY with a NEXT_PUBLIC_ prefix.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
