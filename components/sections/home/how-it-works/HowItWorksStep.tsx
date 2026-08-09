interface HowItWorksStepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

/**
 * HowItWorksStep
 *
 * Renders a single step in the "How TransVista Works" timeline.
 *
 * The icon circle carries a small pulsing number badge — a lightweight
 * way to read the section as a sequence without a heavy connecting-line
 * illustration. Pure CSS pulse (`.pulse-ring`), no JS per-card.
 */
export function HowItWorksStep({
  number,
  title,
  description,
  icon,
}: HowItWorksStepProps) {
  return (
    <article className="group relative rounded-[24px] border border-slate-200 bg-white p-7 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-orange-200 hover:shadow-[0_20px_50px_-20px_rgba(244,123,32,0.2)]">
      <div className="relative inline-flex">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange-50 text-brand-orange-700 transition-colors duration-300 group-hover:bg-brand-orange-100"
          aria-hidden="true"
        >
          {icon}
        </div>

        <span
          className="pulse-ring absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue-700 text-xs font-bold text-white"
          aria-hidden="true"
        >
          {number}
        </span>
      </div>

      <h3 className="font-display mt-5 text-xl font-semibold tracking-tight text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-[15px] leading-7 text-slate-600">
        {description}
      </p>
    </article>
  );
}
