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
        "mx-auto max-w-3xl",
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
        {badge}
      </span>

      <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-900 lg:text-5xl">
        {title}
      </h2>

      <p className="mt-6 text-lg leading-8 text-slate-600">
        {description}
      </p>
    </div>
  );
}

