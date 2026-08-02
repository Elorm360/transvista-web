import Link from "next/link";
import { navigation } from "@/constants/navigation";

export function NavLinks() {
  return (
    <nav
      className="hidden items-center gap-8 lg:flex"
      aria-label="Primary Navigation"
    >
      {navigation.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="rounded-full text-sm font-medium text-slate-700 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}