import type { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

/**
 * ServiceCard
 *
 * Premium hover treatment: lifts with a deeper shadow, reveals a
 * brand-gradient border, and washes in a soft animated background —
 * all pure CSS, no JS needed per-card.
 */
export function ServiceCard({ title, description, icon: Icon }: ServiceCardProps) {
  return (
    <article className="group relative rounded-[28px] p-[1.5px] transition-all duration-500 ease-out hover:-translate-y-2">
      {/* Gradient border — transparent at rest, brand gradient on hover */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-brand-orange-500 via-brand-orange-400 to-brand-blue-600 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
      />

      <div className="relative overflow-hidden rounded-[27px] border border-slate-200 bg-white p-8 shadow-sm transition-shadow duration-500 ease-out group-hover:border-transparent group-hover:shadow-[0_30px_70px_-30px_rgba(26,58,156,0.35)]">
        {/* Animated background wash */}
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-brand-orange-100 to-brand-blue-100 opacity-0 blur-2xl transition-all duration-700 ease-out group-hover:scale-125 group-hover:opacity-100"
        />

        <div
          className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue-50 to-brand-orange-50 text-brand-blue-700 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-6"
          aria-hidden="true"
        >
          <Icon className="h-7 w-7" />
        </div>

        <h3 className="font-display relative mt-6 text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h3>

        <p className="relative mt-3 text-[15px] leading-7 text-slate-600">
          {description}
        </p>
      </div>
    </article>
  );
}
