import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { WaitlistForm } from "./WaitlistForm";

import { waitlistContent } from "@/content/waitlist";

export function Waitlist() {
  return (
    <section id="waitlist" className="scroll-mt-6 py-14 lg:py-20">
      <Container>
        <div className="overflow-hidden rounded-[32px] bg-slate-900">
          <div className="grid lg:grid-cols-[1fr_1.2fr]">
            {/* ── Left: Copy ── */}
            <div className="px-8 pb-10 pt-12 sm:px-12 lg:px-14 lg:py-16">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                {waitlistContent.badge}
              </span>

              <h2 className="font-display mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
                {waitlistContent.title}
              </h2>

              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                {waitlistContent.description}
              </p>

              <ul className="mt-8 flex flex-col gap-3">
                {waitlistContent.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-center gap-3 text-sm font-medium text-slate-200"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Right: Form ── */}
            <div className="bg-white/5 px-8 py-12 sm:px-12 lg:px-14 lg:py-16">
              <WaitlistForm />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
