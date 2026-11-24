import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Invitation link expired",
  robots: { index: false, follow: false },
};

/** Shown when an emailed invite link is invalid, expired or already used. */
export default function InviteLinkExpiredPage() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">This invitation link can&apos;t be used</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Invitation links work once and expire after a while. If you already set your password, sign in below.
          Otherwise, ask the TransVista owner to send you a new invitation.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-700"
          >
            Go to sign in
          </Link>
          <a
            href="mailto:info@transvistaafrica.com?subject=New%20admin%20invitation"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Ask for a new invite
          </a>
        </div>
      </div>
    </main>
  );
}
