import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES: readonly EmailOtpType[] = ["invite", "recovery", "magiclink", "email", "signup"];

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/admin";
  return next;
}

/**
 * Server-side confirmation for emailed auth links (team invites).
 *
 * Supabase's default links return the session in the URL fragment (#...),
 * which a server never receives, so invitees landed on /login. Links built
 * with the token hash come here instead; verifyOtp() creates the session and
 * sets the auth cookies, then we redirect without the secret in the URL.
 * See: Supabase docs, "Server-side auth > Confirmation endpoint".
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"));

  const destination = request.nextUrl.clone();
  destination.search = "";

  if (tokenHash && type && ALLOWED_TYPES.includes(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      destination.pathname = next;
      return NextResponse.redirect(destination);
    }

    console.error("[auth/confirm] verifyOtp failed:", { type, code: error.code, message: error.message });
  }

  destination.pathname = "/invite/link-expired";
  return NextResponse.redirect(destination);
}
