"use server";

import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";

/**
 * deleteMember
 *
 * Server Action that deletes a waitlist member from the leads table.
 *
 * Architecture:
 *   Admin Dashboard ──► deleteMember (Server Action) ──► Supabase ──► Dashboard refreshes
 *
 * Security:
 *   The admin layout already guards the page, but this action re-checks
 *   that the caller is an admin so authorization is enforced at the
 *   data layer too — never trust the browser alone.
 *
 * @param memberId - The id of the lead row to delete
 * @returns `{ success: true }` on success
 */
export async function deleteMember(memberId: string) {
  // Re-verify the caller is an authenticated admin (defense-in-depth).
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user)) {
    throw new Error("You are not authorized to delete community members.");
  }

  if (!memberId) {
    throw new Error("Member id is required.");
  }

  const { error } = await supabase.from("leads").delete().eq("id", memberId);

  if (error) {
    console.error("[deleteMember] Supabase error:", error);
    throw new Error("Failed to delete this member. Please try again.");
  }

  return { success: true };
}
