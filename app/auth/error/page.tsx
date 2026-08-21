import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

/**
 * Shown when an invitation or auth callback token cannot be verified.
 */
export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  const message =
    reason === "missing_token"
      ? "This invitation link is incomplete. Please use the button in your most recent TransVista email."
      : "This invitation link is invalid or has expired. Ask the TransVista owner to send a new invitation.";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="mb-8 text-center">
        <Logo
          width={80}
          height={80}
          className="justify-center"
          imageClassName="h-20 w-auto"
        />
      </div>

      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <ShieldAlert className="h-7 w-7 text-red-500" aria-hidden="true" />
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
          Invitation could not be opened
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>

        <Link
          href="/login"
          className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-700 px-6 text-sm font-semibold text-white shadow-md transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
        >
          Go to sign in
        </Link>
      </div>
    </main>
  );
}
