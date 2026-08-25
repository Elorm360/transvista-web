import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Proxy (Next.js 16 — the middleware convention was renamed to `proxy`).
 *
 * Protects admin routes and keeps the Supabase auth session
 * synchronized with browser cookies on every request.
 *
 * - `/admin/*` requires a signed-in session → redirect to `/login`
 * - `/login` while signed in → redirect to `/admin`
 * - Everything else passes through (public pages are unaffected)
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Only run the proxy on routes that need it:
 * - `/admin/:path*` — the protected admin area
 * - `/login` — redirects signed-in users straight to `/admin`
 *
 * This keeps the proxy efficient by skipping public pages, static
 * assets, images, fonts, and API routes entirely.
 */
export const config = {
  matcher: ["/admin/:path*", "/login", "/invite/:path*", "/auth/callback"],
};

