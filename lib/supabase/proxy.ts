import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/auth/isAdmin";

/**
 * updateSession
 *
 * Refreshes the Supabase auth session on every protected request,
 * then applies authorization.
 *
 * Authentication (who are you?):
 *   - Missing/expired session on a protected route → redirect /login
 *
 * Authorization (what are you allowed to do?):
 *   - Signed-in but NOT an admin on /admin/* → redirect /unauthorized
 *   - Signed-in admin visiting /login → redirect /admin
 *
 * This keeps cookies synchronized between the browser and Supabase.
 *
 * Imported by the root `proxy.ts` file (Next.js 16 convention —
 * previously named `middleware.ts`).
 *
 * @param request - The incoming Next.js request
 * @returns The response (possibly redirected)
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not run code between `createServerClient` and
  // `supabase.auth.getUser()`. A simple mistake could make it very
  // hard to debug security issues.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === "/login";

  // Signed in + visiting /login → go to /admin
  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // Not signed in + visiting a protected route → go to /login
  if (!user && request.nextUrl.pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Signed in but NOT authorized + visiting a protected route →
  // go to /unauthorized (they are authenticated, just not permitted)
  if (
    user &&
    !isAdmin(user) &&
    request.nextUrl.pathname.startsWith("/admin")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

