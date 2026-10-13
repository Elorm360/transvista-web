import Link from "next/link";
import { ShieldAlert, Home } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

/**
 * Unauthorized
 *
 * Shown when a signed-in user tries to access the admin area but
 * their account is not authorized. Friendlier than a generic 403.
 */
export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      {/* Brand */}
      <div className="mb-8 text-center">
        <Logo className="justify-center" imageClassName="h-16 w-auto" />
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <ShieldAlert className="h-7 w-7 text-red-500" aria-hidden="true" />
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
          Access Restricted
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          You are signed in, but your account doesn&apos;t have permission
          to access the TransVista Admin Dashboard.
        </p>

        {/* Return to Home */}
        <Link
          href="/"
          className="mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 text-sm font-semibold text-white shadow-md transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Return to Home
        </Link>
      </div>

      {/* Note */}
      <p className="mt-6 text-xs text-slate-400">
        Need access? Contact your TransVista administrator.
      </p>
    </main>
  );
}
