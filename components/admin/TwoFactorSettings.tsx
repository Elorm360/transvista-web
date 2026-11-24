"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { buttonClass, Card } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/client";
import { recordTwoFactorChange } from "@/app/actions/account";

type Enrolment = { factorId: string; qrCode: string; secret: string };

/**
 * Two-step sign-in with an authenticator app (TOTP, via Supabase Auth MFA).
 * Once on, every admin page and action requires the 6-digit code for the
 * session (enforced server-side in lib/auth/access.ts).
 */
export default function TwoFactorSettings() {
  const [loading, setLoading] = useState(true);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [enrolment, setEnrolment] = useState<Enrolment | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    createClient().auth.mfa.listFactors().then(({ data, error: listError }) => {
      if (cancelled) return;
      if (listError) setError("Two-step sign-in status could not be loaded.");
      setFactorId(data?.totp?.[0]?.id ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function start() {
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();
    // Clear any half-finished setup from before.
    const { data: factors } = await supabase.auth.mfa.listFactors();
    for (const factor of factors?.all ?? []) {
      if (factor.factor_type === "totp" && factor.status !== "verified") {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
    }
    const { data, error: enrolError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Authenticator app",
    });
    setBusy(false);
    if (enrolError || !data) {
      setError("Two-step sign-in couldn't be started. Please try again.");
      return;
    }
    setEnrolment({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
  }

  async function confirm(event: React.FormEvent) {
    event.preventDefault();
    if (!enrolment) return;
    setBusy(true);
    setError(null);
    const { error: verifyError } = await createClient().auth.mfa.challengeAndVerify({
      factorId: enrolment.factorId,
      code: code.trim(),
    });
    setBusy(false);
    if (verifyError) {
      setError("That code didn't match. Check the time on your phone is correct and try the newest code.");
      return;
    }
    await recordTwoFactorChange(true);
    setFactorId(enrolment.factorId);
    setEnrolment(null);
    setCode("");
    setNotice("Two-step sign-in is on. You'll enter a code from your app each time you sign in.");
  }

  async function turnOff() {
    if (!factorId) return;
    if (!window.confirm("Turn off two-step sign-in? Your account will be protected by your password only.")) return;
    setBusy(true);
    setError(null);
    const { error: removeError } = await createClient().auth.mfa.unenroll({ factorId });
    setBusy(false);
    if (removeError) {
      setError("Two-step sign-in couldn't be turned off. Sign out, sign back in with your code, and try again.");
      return;
    }
    await recordTwoFactorChange(false);
    setFactorId(null);
    setNotice("Two-step sign-in is off.");
  }

  const on = Boolean(factorId);

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          {on ? <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <ShieldOff className="h-4 w-4 text-slate-400" aria-hidden="true" />}
          Two-step sign-in
        </span>
      }
      description="Ask for a 6-digit code from an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password…) when signing in. Strongly recommended for the owner and anyone handling payments."
      bodyClassName="p-5"
    >
      {loading ? (
        <p className="text-sm text-slate-500">Checking…</p>
      ) : enrolment ? (
        <form onSubmit={confirm} className="space-y-4">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
            <li>Open your authenticator app and add a new account.</li>
            <li>Scan this QR code, or type the key below.</li>
            <li>Enter the 6-digit code the app shows.</li>
          </ol>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {/* Supabase returns the QR code as an SVG data URL. Keep a white backing so it scans in dark mode. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={enrolment.qrCode} alt="QR code for your authenticator app" className="h-40 w-40 rounded-lg border border-slate-200 bg-white p-2" />
            <div className="min-w-0 text-sm">
              <p className="text-slate-500">Can&apos;t scan? Enter this key:</p>
              <code className="mt-1 block break-all rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs text-slate-800">{enrolment.secret}</code>
            </div>
          </div>
          <label className="block max-w-xs text-sm font-medium text-slate-700">
            6-digit code
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              pattern="\d{6}"
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 font-mono text-lg tracking-[0.3em] outline-none focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100"
            />
          </label>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy || code.length !== 6} className={buttonClass("primary")}>{busy ? "Checking…" : "Turn on"}</button>
            <button type="button" onClick={() => { setEnrolment(null); setCode(""); setError(null); }} className={buttonClass("secondary")}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Status: <span className={`font-semibold ${on ? "text-emerald-700" : "text-slate-900"}`}>{on ? "On" : "Off"}</span>
          </p>
          {notice && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
          {on ? (
            <button type="button" onClick={turnOff} disabled={busy} className={buttonClass("danger")}>Turn off</button>
          ) : (
            <button type="button" onClick={start} disabled={busy} className={buttonClass("primary")}>{busy ? "Starting…" : "Set up two-step sign-in"}</button>
          )}
        </div>
      )}
    </Card>
  );
}
