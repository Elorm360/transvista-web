interface HowItWorksStepProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

/**
 * HowItWorksStep
 *
 * Renders a single step in the "How TransVista Works" section.
 *
 * Intentionally distinct from Experience cards — no large image
 * placeholder, more whitespace, icon at the top inside a soft
 * circular brand-blue background. The icon supports the content,
 * it doesn't compete with it.
 */
export function HowItWorksStep({
  title,
  description,
  icon,
}: HowItWorksStepProps) {
  return (
    <article className="group rounded-[24px] border border-slate-200 bg-white p-7 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_20px_50px_-20px_rgba(180,83,9,0.15)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700 transition-colors duration-300 group-hover:bg-amber-100" aria-hidden="true">
        {icon}
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

