"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { signIn, type SignInState } from "@/app/actions/auth";
import { Logo } from "@/components/layout/Logo";

const initialState: SignInState = {
  error: null,
  failed: false,
};

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, formAction, isPending] = useActionState(
    signIn,
    initialState,
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="mb-8 text-center">
        <Logo
          width={80}
          height={80}
          className="justify-center"
          imageClassName="h-20 w-auto"
        />
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back, administrator.
        </p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {!configured && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            Sign-in is not configured. Add{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            and{" "}
            <code className="font-mono text-xs">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            to <code className="font-mono text-xs">.env.local</code>, then
            restart <code className="font-mono text-xs">npm run dev</code>.
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@transvistaafrica.com"
                disabled={isPending || !configured}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={isPending || !configured}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
              />
            </div>
          </div>

          {state.error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !configured}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 text-sm font-semibold text-white shadow-md transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <Lock className="h-3.5 w-3.5" />
        <span>Secure access for TransVista administrators only.</span>
      </div>
    </main>
  );
}
