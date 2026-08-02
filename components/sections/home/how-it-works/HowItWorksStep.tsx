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
    <article className="rounded-[28px] border border-slate-200 bg-white p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700" aria-hidden="true">
        {icon}
      </div>

      <h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
        {title}
      </h3>

      <p className="mt-4 leading-7 text-slate-600">
        {description}
      </p>
    </article>
  );
}

