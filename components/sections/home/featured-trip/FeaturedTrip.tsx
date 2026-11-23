import Link from "next/link";
import { ArrowRight, CalendarDays, Compass } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { pastEvents } from "@/lib/events/past-events";

export function FeaturedTrip() {
  const latestEvent = pastEvents[0];

  return (
    <Section id="featured-trip" className="bg-white">
      <Container>
        <Reveal>
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-canvas shadow-[0_24px_80px_-45px_rgba(15,23,42,0.4)]">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
              <div className="flex min-h-[280px] flex-col justify-between bg-brand-blue-950 p-8 text-white sm:p-10">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange-500 text-white">
                  <Compass className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-orange-300">TransVista experiences</p>
                  <p className="font-display mt-3 text-3xl font-semibold">Journeys worth remembering.</p>
                </div>
              </div>

              <div className="p-7 sm:p-10 lg:p-12">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-orange-700">
                  {latestEvent ? "Our latest past event" : "Our event archive"}
                </p>
                <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  {latestEvent ? latestEvent.title : "Explore TransVista past events"}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  {latestEvent
                    ? "Explore the route, destinations and details from our completed Central Region group experience. Attendees can also share private feedback to help us improve."
                    : "Explore completed group experiences organised by TransVista across Ghana."}
                </p>
                {latestEvent && (
                  <div className="mt-7 flex items-center gap-3 text-sm text-slate-700">
                    <CalendarDays className="h-5 w-5 text-brand-blue-700" aria-hidden="true" />
                    {latestEvent.dateLabel}
                  </div>
                )}
                <Link
                  href="/past-events"
                  className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-orange-600 px-6 text-sm font-semibold text-white transition hover:bg-brand-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange-500 focus-visible:ring-offset-2"
                >
                  Explore Past Events
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
