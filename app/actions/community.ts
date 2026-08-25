"use server";

import { createClient } from "@/lib/supabase/server";
import { roleFor } from "@/lib/auth/isAdmin";
import { canAccess } from "@/lib/auth/permissions";

export async function deleteMember(memberId: string) {
  console.log("[deleteMember] Starting deletion");
  console.log("[deleteMember] memberId:", memberId);

  if (!memberId) {
    throw new Error("Member id is required.");
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("[deleteMember] user:", user?.email);
  console.log("[deleteMember] auth error:", userError);

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

  console.log("[deleteMember] Deleted rows:", data);

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
