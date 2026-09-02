import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const whatsappHref =
  "https://wa.me/233506987204?text=Hi%20TransVista%20Africa!%20I%27d%20like%20help%20planning%20a%20trip%20to%20Ghana.";

const steps = [
  {
    number: "01",
    title: "Share your starting point",
    description:
      "Choose destinations, dates, interests, travel needs, and a comfortable budget range.",
  },
  {
    number: "02",
    title: "Hear from us within 48 hours",
    description:
      "We coordinate availability and return with a clear proposal and price.",
  },
  {
    number: "03",
    title: "Confirm with confidence",
    description:
      "Pay the agreed deposit or full amount under our shared booking policy.",
  },
];

export function PlanTrip() {
  return (
    <Section
      id="plan-your-trip"
      className="overflow-hidden bg-gradient-to-br from-brand-blue-950 via-brand-blue-900 to-slate-950 text-white"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange-300">
              Plan Your Trip
            </p>
            <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Bring us the plan—or just the idea.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              Use the guided request form to tell TransVista where you want to
              go and what you need. You do not need a finished itinerary.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/plan"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "rounded-full",
                )}
              >
                Start my trip request
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline-white", size: "lg" }),
                  "rounded-full",
                )}
              >
                Ask on WhatsApp
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-4">
            {steps.map((step, index) => (
              <Reveal key={step.number} delay={index * 100}>
                <article className="grid grid-cols-[auto_1fr] gap-4 rounded-[24px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm sm:p-6">
                  <span className="font-display text-lg font-semibold text-brand-orange-300">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {step.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
