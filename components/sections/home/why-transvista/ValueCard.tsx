/**
 * ValueCard
 *
 * A value proposition card for the Why TransVista grid. On hover, a
 * brand-gradient fill rises from the bottom of the card (pure CSS height
 * transition) while the icon and copy crossfade to white in sync — the
 * "color fill" effect without needing to mask/clip text separately.
 */
interface ValueCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function ValueCard({
  title,
  description,
  icon,
}: ValueCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-7 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-transparent hover:shadow-[0_25px_60px_-20px_rgba(26,58,156,0.35)]">
      {/* Bottom-up color fill */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-brand-blue-700 via-brand-blue-600 to-brand-orange-500 transition-[height] duration-500 ease-out group-hover:h-full"
      />

      <div className="relative">
        <div
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange-50 text-brand-orange-700 transition-colors duration-300 group-hover:bg-white/15 group-hover:text-white"
          aria-hidden="true"
        >
          {icon}
        </div>

        <h3 className="font-display text-xl font-semibold tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-white">
          {title}
        </h3>

        <p className="mt-3 text-[15px] leading-7 text-slate-600 transition-colors duration-300 group-hover:text-white/90">
          {description}
        </p>
      </div>
    </article>
  );
}
