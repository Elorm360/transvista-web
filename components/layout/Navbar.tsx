"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";
import { WaitlistButton } from "./WaitlistButton";
import { MobileMenu } from "./MobileMenu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const onHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The hero is dark, so the navbar starts as a transparent glass panel
  // with light text, then crossfades to a solid white glass bar with
  // dark text once the user scrolls past it.
  const solid = scrolled || mobileOpen || !onHome;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300",
        solid
          ? "border-slate-200 bg-white/90 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]"
          : "border-white/10 bg-white/[0.06]",
      )}
    >
      {/* refined top accent edge */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-orange-500 to-transparent"
      />
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          <div
            className={cn(
              "shrink-0 rounded-full px-1 py-0.5 transition-colors duration-300",
              !solid && "bg-white/90 backdrop-blur-sm",
            )}
          >
            <Logo priority />
          </div>

          <NavLinks className="hidden lg:flex" tone={solid ? "light" : "dark"} />

          <div className="hidden lg:block">
            <WaitlistButton className="rounded-full shadow-sm shadow-brand-orange-900/10" />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-orange-600 lg:hidden",
              solid
                ? "border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900"
                : "border-white/25 text-white hover:border-white/50",
            )}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      </Container>
    </header>
  );
}
