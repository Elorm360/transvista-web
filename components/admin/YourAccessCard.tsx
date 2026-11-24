"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, ShieldCheck, UserRound, X } from "lucide-react";
import { GRANTABLE_AREAS, type AdminArea } from "@/lib/auth/permissions";

const STORAGE_KEY = "tv-admin-access-card-hidden";

/**
 * Welcome card on the Overview for team members: what their role can open,
 * with one-click links, plus first-day steps. Hidden per browser once dismissed.
 */
export default function YourAccessCard({ name, roleLabel, areas }: { name: string; roleLabel: string; areas: AdminArea[] }) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read a per-browser preference after hydration
      setHidden(window.localStorage.getItem(STORAGE_KEY) === roleLabel);
    } catch {
      setHidden(false);
    }
  }, [roleLabel]);

  if (hidden) return null;

  const sections = [
    { area: "tasks", label: "Tasks", description: "Your to-dos and deadlines; escalate anything stuck to the CEO", href: "/admin/tasks" },
    { area: "tasks-approvals", label: "Approvals", description: "Ask the CEO to approve an expense or a decision", href: "/admin/approvals" },
    ...GRANTABLE_AREAS.filter((item) => areas.includes(item.area)),
  ];
  const firstName = name.split(/\s+/)[0] || name;

  function dismiss() {
    setHidden(true);
    try {
      // Remember per role, so the card comes back if their role changes.
      window.localStorage.setItem(STORAGE_KEY, roleLabel);
    } catch {
      /* storage unavailable: hide for this visit only */
    }
  }

  return (
    <section className="rounded-xl border border-brand-blue-100 bg-white p-5 shadow-sm" aria-labelledby="your-access-title">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-brand-blue-50 p-2.5"><Compass className="h-5 w-5 text-brand-blue-700" aria-hidden="true" /></span>
          <div>
            <h2 id="your-access-title" className="font-semibold text-slate-900">Welcome, {firstName}. You&apos;re signed in as {roleLabel}.</h2>
            <p className="mt-1 text-sm text-slate-500">These are the parts of the workspace your role can use. Anything else stays hidden.</p>
          </div>
        </div>
        <button type="button" onClick={dismiss} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Hide this guide">
          <X className="h-4 w-4" />
        </button>
      </div>

      {sections.length ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((item) => (
            <Link key={item.area} href={item.href} className="group flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:border-brand-blue-200 hover:bg-brand-blue-50/40">
              <span>
                <span className="block text-sm font-semibold text-slate-900">{item.label}</span>
                <span className="mt-0.5 block text-xs leading-5 text-slate-500">{item.description}</span>
              </span>
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 group-hover:text-brand-blue-600" aria-hidden="true" />
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Your role currently includes the Overview only. Ask the Super Admin if you need more access.</p>
      )}

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6">
        <p className="font-semibold text-slate-700">First steps:</p>
        <Link href="/admin/account" className="inline-flex items-center gap-1.5 text-brand-blue-700 hover:underline"><UserRound className="h-4 w-4" aria-hidden="true" />Add your profile photo</Link>
        <Link href="/admin/account" className="inline-flex items-center gap-1.5 text-brand-blue-700 hover:underline"><ShieldCheck className="h-4 w-4" aria-hidden="true" />Turn on two-step sign-in</Link>
      </div>
    </section>
  );
}
