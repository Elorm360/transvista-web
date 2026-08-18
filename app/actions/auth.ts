"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";

export interface SignInState {
  /** Friendly error message to display (null when no error) */
  error: string | null;
  /** Whether the previous attempt failed */
  failed: boolean;
}

/**
 * signIn
 *
 * Server Action responsible only for authentication.
 *
 * Responsibilities:
 *   1. Validate the input (email format + password present).
 *   2. Call `supabase.auth.signInWithPassword()`.
 *   3. Return a friendly error to the UI (never expose technical details).
 *   4. Redirect to /admin on success.
 *
 * This keeps authentication logic out of the UI component.
 */
export async function signIn(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  /* ── Validate input ── */
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      error: "Please enter a valid email address.",
      failed: true,
    };
  }

  if (!password) {
    return {
      error: "Please enter your password.",
      failed: true,
    };
  }

  /* ── Authenticate with Supabase ── */
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Never expose the raw error message — it can leak implementation
    // details about the auth provider.
    console.error("[auth] Sign-in failed:", {
      message: error.message,
      code: error.code ?? "unknown",
    });

    return {
      error:
        error.code === "invalid_credentials"
          ? "Invalid email or password. Please try again."
          : "We couldn't sign you in. Please try again.",
      failed: true,
    };
  }

  /* ── Success: check authorization before redirecting ── */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Authenticated but not authorized → /unauthorized (never /admin)
  if (!(await isAdmin(user))) {
    redirect("/unauthorized");
  }

  /* ── Authorized → /admin ── */
  redirect("/admin");
}
