import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { WaitlistForm } from "./WaitlistForm";

import { waitlistContent } from "@/content/waitlist";

export function Waitlist() {
  return (
    <section id="waitlist" className="py-20 lg:py-28">
      <Container>
        <div className="rounded-[28px] bg-tv-primary px-6 py-16 text-center sm:px-10 lg:px-16 lg:py-20">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
            {waitlistContent.badge}
          </span>

          <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white lg:text-5xl">
            {waitlistContent.title}
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-200">
            {waitlistContent.description}
          </p>

          <WaitlistForm />

          <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {waitlistContent.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-2 text-sm font-medium text-slate-200"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-blue-100">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

