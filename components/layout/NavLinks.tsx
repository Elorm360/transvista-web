import Link from "next/link";
import { navigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  className?: string;
  onNavigate?: () => void;
  /** "light" text for solid/white bars (default), "dark" (white text) for the transparent glass navbar over the hero. */
  tone?: "light" | "dark";
}

export function NavLinks({ className, onNavigate, tone = "light" }: NavLinksProps) {
  return (
    <nav
      className={cn("items-center gap-8", className)}
      aria-label="Primary Navigation"
    >
      {navigation.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "rounded-full px-2 py-1 text-sm font-medium transition-all duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-blue-600",
            tone === "dark"
              ? "text-white/90 hover:text-brand-orange-300"
              : "text-slate-700 hover:text-brand-blue-700",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
