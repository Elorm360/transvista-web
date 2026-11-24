import { Activity } from "lucide-react";
import { formatDuration } from "@/lib/team/presence";

/** Each person's own active time, plus a plain note on what's recorded (transparency). */
export default function MyActivityCard({ activity, isOwner }: { activity: { today: number; week: number; month: number }; isOwner: boolean }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-brand-blue-50 p-2.5"><Activity className="h-5 w-5 text-brand-blue-700" aria-hidden="true" /></span>
        <div>
          <h2 className="font-semibold text-slate-900">Your activity</h2>
          <p className="mt-1 text-sm text-slate-500">Time you&apos;ve spent actively using the dashboard.</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3">
        {([["Today", activity.today], ["This week", activity.week], ["This month", activity.month]] as const).map(([label, seconds]) => (
          <div key={label} className="rounded-lg bg-slate-50 px-3 py-3">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{formatDuration(seconds)}</dd>
          </div>
        ))}
      </dl>
      {!isOwner && (
        <p className="mt-4 text-xs leading-5 text-slate-500">
          The Founder &amp; CEO can see when you&apos;re online, when you were last seen, your active time and your task progress.
          Only whether you&apos;re active is recorded, never what you type or view.
        </p>
      )}
    </section>
  );
}
