import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { WaitlistForm } from "./WaitlistForm";

import { waitlistContent } from "@/content/waitlist";

export function Waitlist() {
  const titleWords = waitlistContent.title.split(" ");
  const lastWord = titleWords.pop();

  return (
    <section id="waitlist" className="scroll-mt-6 py-14 lg:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-blue-950 via-brand-blue-900 to-slate-950">
          {/* Slow-drifting mesh background */}
          <div aria-hidden="true" className="mesh-gradient absolute inset-0 opacity-60" />

          <div className="relative grid lg:grid-cols-[1fr_1.2fr]">
            {/* ── Left: Copy ── */}
            <div className="px-8 pb-10 pt-12 sm:px-12 lg:px-14 lg:py-16">
              <Reveal>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange-400">
                  {waitlistContent.badge}
                </span>

                <h2 className="font-display mt-4 max-w-xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {titleWords.join(" ")}{" "}
                  <span className="bg-gradient-to-r from-brand-orange-400 to-brand-orange-200 bg-clip-text text-transparent">
                    {lastWord}
                  </span>
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
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-orange-400/20 text-brand-orange-300">
                        <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                      </span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            {/* ── Right: Form ── */}
            <Reveal delay={150} direction="right" className="bg-white/[0.06] px-8 py-12 backdrop-blur-sm sm:px-12 lg:px-14 lg:py-16">
              <WaitlistForm />
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
