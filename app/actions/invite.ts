"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";

export interface SetPasswordState {
  error: string | null;
}

export async function setInvitePassword(
  _prevState: SetPasswordState,
  formData: FormData,
): Promise<SetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters.",
    };
  }

  if (password !== confirm) {
    return {
      error: "Passwords do not match.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error("[setInvitePassword]", error);
    return {
      error: "We couldn't save your password. Please try again.",
    };
  }

  if (!(await isAdmin(user))) {
    redirect("/unauthorized");
  }

  redirect("/admin");
}
