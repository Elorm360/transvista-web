"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * signOut
 *
 * Server Action that signs the current user out of Supabase
 * and redirects to the login page.
 */
export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}
