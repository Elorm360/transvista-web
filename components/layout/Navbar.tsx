"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";
import { WaitlistButton } from "./WaitlistButton";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
      <Container>
        <div className="flex h-20 items-center justify-between gap-4">
          <Logo priority className="shrink-0" />

          <NavLinks className="hidden lg:flex" />

          <div className="hidden lg:block">
            <WaitlistButton className="shadow-sm shadow-blue-900/10" />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 lg:hidden"
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
