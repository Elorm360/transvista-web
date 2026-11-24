import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared admin building blocks. Use these instead of one-off markup so every
 * page has the same cards, numbers, badges, buttons and empty states.
 */

/* ── Buttons ─────────────────────────────────────────────────────────── */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-brand-blue-600 px-4 py-2 text-white hover:bg-brand-blue-700",
  secondary: "border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50",
  ghost: "px-3 py-2 text-brand-blue-700 hover:bg-brand-blue-50",
  danger: "border border-red-200 bg-white px-4 py-2 text-red-700 hover:bg-red-50",
};

/** Class names for a button or link styled as a button. */
export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cn(buttonBase, buttonVariants[variant], className);
}

/* ── Cards ───────────────────────────────────────────────────────────── */

export function Card({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Usually a small link or button, top-right. */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/* ── Numbers ─────────────────────────────────────────────────────────── */

const toneStyles = {
  neutral: "bg-slate-100 text-slate-600",
  blue: "bg-brand-blue-50 text-brand-blue-700",
  orange: "bg-brand-orange-50 text-brand-orange-800",
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-700",
} as const;

export type Tone = keyof typeof toneStyles;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: Tone;
  /** Makes the whole card a link to the related list. */
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", toneStyles[tone])}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </>
  );
  const className = "block rounded-xl border border-slate-200 bg-white p-4 shadow-sm";
  return href ? (
    <Link href={href} className={cn(className, "transition-colors hover:border-slate-300 hover:bg-slate-50")}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

/* ── Status badges ───────────────────────────────────────────────────── */

/** One colour per meaning, used for every status across the admin. */
const statusTone: Record<string, Tone> = {
  // done / good
  paid: "green", "deposit-paid": "green", confirmed: "green", completed: "green", approved: "green",
  published: "green", verified: "green", active: "green", ready: "green",
  // waiting on someone
  new: "orange", pending: "orange", "pending-review": "orange", "confirmed-awaiting-deposit": "orange",
  "payment-requested": "orange", "deposit-requested": "orange", "awaiting-payment": "orange", reviewing: "orange",
  quoted: "orange", contacted: "orange", draft: "orange", planning: "orange",
  // in motion
  "in-progress": "blue", underway: "blue", "registration_closed": "blue", scheduled: "blue",
  // stopped / problem
  cancelled: "red", canceled: "red", rejected: "red", refunded: "red", hidden: "red", failed: "red",
  // neutral
  "not-requested": "neutral", closed: "neutral", archived: "neutral", inactive: "neutral", waitlisted: "neutral",
};

export function statusLabel(status: string) {
  const text = status.replaceAll("_", " ").replaceAll("-", " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone = statusTone[status.toLowerCase()] ?? "neutral";
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", toneStyles[tone])}>
      {label ?? statusLabel(status)}
    </span>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────── */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-6 py-12 text-center">
      {Icon && (
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <p className="mt-3 text-sm font-semibold text-slate-800">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
