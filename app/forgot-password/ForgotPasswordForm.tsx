"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { requestPasswordReset, type PasswordResetState } from "@/app/actions/password-reset";

const initialState: PasswordResetState = { status: "idle", message: "" };

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialState);

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900">Reset your password</h1>
      <p className="mt-2 text-center text-sm text-slate-500">
        Enter your work email and we&apos;ll send you a link to choose a new password.
      </p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {state.status === "sent" ? (
          <p role="status" className="rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-800">{state.message}</p>
        ) : (
          <form action={action} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@transvistaafrica.com"
                  className="h-11 w-full rounded-full border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100"
                />
              </span>
            </label>
            {state.status === "error" && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{state.message}</p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="h-11 w-full rounded-full bg-brand-blue-600 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-700 disabled:opacity-60"
            >
              {pending ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-medium text-brand-blue-700 hover:underline">Back to sign in</Link>
      </p>
    </div>
  );
}
