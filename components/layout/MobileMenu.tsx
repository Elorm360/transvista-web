import Link from "next/link";
import { navigation } from "@/constants/navigation";
import { WaitlistButton } from "./WaitlistButton";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  if (!open) return null;

  return (
    <div className="border-t border-slate-200 bg-white py-4 lg:hidden">
      <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
        {navigation.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
          >
            {item.label}
          </Link>
        ))}

        <div className="mt-2 px-1">
          <WaitlistButton className="w-full" />
        </div>
      </nav>
    </div>
  );
}