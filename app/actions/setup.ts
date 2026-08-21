"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminRole } from "@/lib/auth/getAdminRole";

export interface CompleteSetupState {
  error: string | null;
  failed: boolean;
}

/**
 * completeAdminSetup
 *
 * Invited team members set their password after /auth/callback
 * has established a session. Clears must_set_password so they
 * can enter the admin console.
 */
export async function completeAdminSetup(
  _prevState: CompleteSetupState,
  formData: FormData,
): Promise<CompleteSetupState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return {
      error: "Use a password that is at least 8 characters.",
      failed: true,
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match.",
      failed: true,
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = await getAdminRole(user.email);

  if (!role) {
    redirect("/unauthorized");
  }

  const { error } = await supabase.auth.updateUser({
    password,
    data: {
      must_set_password: false,
      setup_completed: true,
    },
  });

  if (error) {
    console.error("[completeAdminSetup] updateUser failed:", error.message);

    return {
      error: "We could not save your password. Please try again.",
      failed: true,
    };
  }

  redirect("/admin");
}
