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
          className="text-sm font-medium text-slate-700 transition-colors hover:text-blue-700"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}