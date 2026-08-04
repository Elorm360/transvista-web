import Link from "next/link";
import { navigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  className?: string;
  onNavigate?: () => void;
}

export function NavLinks({ className, onNavigate }: NavLinksProps) {
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
          className="rounded-full px-2 py-1 text-sm font-medium text-slate-700 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}