import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/siteUrl";

/**
 * Auth callback
 *
 * Exchanges a Supabase invite/recovery token for a cookie session.
 *
 * Branded invitation emails point here with:
 *   /auth/callback?token_hash=...&type=invite&next=/admin/setup
 *
 * Also accepts `code` from the PKCE redirect flow.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = safeInternalPath(
    searchParams.get("next"),
    "/admin/setup",
  );

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      redirect(next);
    }

    console.error("[auth/callback] verifyOtp failed:", error.message);
    redirect("/auth/error?reason=invalid_invite");
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      redirect(next);
    }

    console.error("[auth/callback] code exchange failed:", error.message);
    redirect("/auth/error?reason=invalid_invite");
  }

  redirect("/auth/error?reason=missing_token");
}
