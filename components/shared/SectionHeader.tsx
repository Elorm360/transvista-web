import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  /** The badge label displayed above the title */
  badge: string;
  /** The main section heading */
  title: string;
  /** A supporting description below the title */
  description: string;
  /** Horizontal alignment — center for homepage sections, left for internal pages */
  align?: "left" | "center";
  /** Optional className override */
  className?: string;
}

/**
 * SectionHeader
 *
 * A reusable section heading composed of a badge, title, and description.
 * This is the visual anchor for every major section on the site.
 *
 * Every section header answers three questions:
 *   Badge       → "What am I reading?"
 *   Title       → "Why should I continue reading?"
 *   Description → "Explain it in one concise paragraph."
 *
 * @example
 * ```tsx
 * <SectionHeader
 *   badge="Why TransVista"
 *   title="Everything you need to explore Ghana in one trusted platform."
 *   description="Planning your trip shouldn't mean juggling..."
 *   align="center"
 * />
 * ```
 */
export function SectionHeader({
  badge,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-2xl",
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand-orange-600">
        {badge}
      </p>

      <h2 className="font-display mt-3 text-[2rem] font-semibold leading-[1.1] tracking-tight text-slate-950 sm:text-[2.6rem]">
        {title}
      </h2>

      <p className="mt-4 text-base leading-7 text-slate-600 sm:text-[17px] sm:leading-8">
        {description}
      </p>
    </div>
  );
}
