import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";

const whatsappHref = whatsappLink(
  "Hi TransVista Africa! I'd like help planning a trip to Ghana.",
);

export function PlanTrip() {
  return (
    <section
      id="plan-your-trip"
      className="relative overflow-hidden bg-brand-blue-950 py-20 text-white lg:py-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(60%_80%_at_85%_10%,rgba(244,123,32,0.18),transparent_60%),radial-gradient(50%_70%_at_10%_100%,rgba(87,118,214,0.22),transparent_60%)]"
      />
      <Container className="relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand-orange-300">
            Plan your trip
          </p>
          <h2 className="font-display mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Bring us the plan—or just the idea.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Tell us where you&apos;d like to go and what you need. You don&apos;t
            need a finished itinerary.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
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
              <FaWhatsapp className="mr-2 h-4 w-4" aria-hidden="true" />
              Ask on WhatsApp
            </Link>
          </div>

          <p className="mt-8 text-sm text-slate-400">
            Proposal within 48 hours · No payment to send a request
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
