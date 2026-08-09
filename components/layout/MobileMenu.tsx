import Link from "next/link";
import { navigation } from "@/constants/navigation";
import { WaitlistButton } from "./WaitlistButton";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/**
 * MobileMenu
 *
 * Stays mounted at all times and animates via max-height + opacity so the
 * panel slides open/closed smoothly instead of abruptly appearing —
 * pure CSS transition, no animation library.
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  return (
    <div
      className={cn(
        "overflow-hidden border-t bg-white transition-all duration-300 ease-out lg:hidden",
        open
          ? "max-h-96 border-slate-200 py-4 opacity-100"
          : "max-h-0 border-transparent py-0 opacity-0",
      )}
      aria-hidden={!open}
    >
      <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
        {navigation.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-blue-600"
          >
            {item.label}
          </Link>
        ))}

        <div className="mt-2 px-1">
          <WaitlistButton
            className="w-full rounded-full"
            onClick={onClose}
            tabIndex={open ? 0 : -1}
          />
        </div>
      </nav>
    </div>
  );
}
