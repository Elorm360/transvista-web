"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/actions/signout";

export default function VerifyCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
    const factorId = factors?.totp?.[0]?.id;
    if (listError || !factorId) {
      setBusy(false);
      setError("Your authenticator couldn't be found. Sign out and sign in again.");
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() });
    if (verifyError) {
      setBusy(false);
      setError("That code didn't match. Use the newest code in your app and try again.");
      setCode("");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue-50 text-brand-blue-700">
        <ShieldCheck className="h-6 w-6" aria-hidden="true" />
      </div>
      <h1 className="mt-4 text-center text-2xl font-semibold tracking-tight text-slate-900">Enter your sign-in code</h1>
      <p className="mt-2 text-center text-sm text-slate-500">Open your authenticator app and enter the 6-digit code for TransVista.</p>

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">
          6-digit code
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
            pattern="\d{6}"
            className="mt-1.5 h-12 w-full rounded-lg border border-slate-200 px-3 text-center font-mono text-2xl tracking-[0.4em] outline-none focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100"
          />
        </label>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        <button
          type="submit"
          disabled={busy || code.length !== 6}
          className="h-11 w-full rounded-full bg-brand-blue-600 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-700 disabled:opacity-60"
        >
          {busy ? "Checking…" : "Continue"}
        </button>
      </form>

      <form action={signOut} className="mt-6 text-center">
        <button type="submit" className="text-sm font-medium text-slate-500 hover:text-slate-800">Use a different account</button>
      </form>
      <p className="mt-2 text-center text-xs text-slate-500">Lost your phone? Ask the TransVista owner to reset your two-step sign-in.</p>
    </div>
  );
}
