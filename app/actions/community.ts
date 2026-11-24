"use server";

import { logAudit } from "@/lib/audit";
import { hasAdminArea, NO_ACCESS_MESSAGE } from "@/lib/auth/access";
import { createClient } from "@/lib/supabase/server";
import { toActionResult } from "@/lib/actions/result";
import { roleFor } from "@/lib/auth/isAdmin";
import { canAccess } from "@/lib/auth/permissions";

async function deleteMemberUnsafe(memberId: string) {
  if (!(await hasAdminArea("community"))) throw new Error(NO_ACCESS_MESSAGE);

  if (!memberId) {
    throw new Error("Member id is required.");
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();


  if (userError) {
    console.error("[deleteMember] Auth error:", userError);
    throw new Error("Your admin session could not be verified.");
  }

  if (!user) {
    throw new Error("You are not authenticated.");
  }

  const role = await roleFor(user);

  if (!canAccess(role, "community")) {
    console.error("[deleteMember] Unauthorized user:", user.email);
    throw new Error("You are not authorized to delete community members.");
  }

  const { data, error } = await supabase
    .from("leads")
    .delete()
    .eq("id", memberId)
    .select("id, full_name, email");

  if (error) {
    console.error("[deleteMember] Supabase DELETE error:", error);
    throw new Error(
      `Failed to delete this member: ${error.message}`,
    );
  }


  if (!data || data.length === 0) {
    throw new Error(
      "The member could not be deleted because no matching record was found.",
    );
  }

  return {
    success: true,
    deletedMember: data[0],
  };
}

// Returned (not thrown) so the message reaches the UI in production.
async function deleteMemberImpl(memberId: string) {
  return toActionResult(() => deleteMemberUnsafe(memberId));
}

/** Audited entry point: runs deleteMemberImpl and records it in the audit log on success. */
export async function deleteMember(...args: Parameters<typeof deleteMemberImpl>) {
  const result = await deleteMemberImpl(...args);
  if (result.ok) await logAudit("community.member_deleted", "Deleted a community member", { type: "lead", id: args[0] });
  return result;
}
