import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3 } from "lucide-react";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { Container } from "@/components/ui/Container";
import { upcomingEvents } from "@/lib/events/upcoming-events";

export const metadata: Metadata = pageMetadata({
  title: "Group Trips",
  description:
    "Join an upcoming TransVista group trip in Ghana: transport, meals, guided visits and photo moments coordinated for you.",
  path: "/trips",
});

export default function TripsPage() {
  return (
    <main id="main-content" className="bg-[#fffdfa]">
      <header className="border-b border-slate-200 bg-white py-12 lg:py-16">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-orange-700">
            Group trips
          </p>
          <h1 className="font-display mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Travel Ghana together.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Fixed-date trips with transport, meals and guided visits arranged
            for you. Reserve with no payment upfront. TransVista confirms your
            place before asking for a deposit.
          </p>
        </Container>
      </header>

      <section className="py-12 lg:py-16">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {upcomingEvents.map((event) => (
              <article
                key={event.id}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[16/9]">
                  <Image
                    src={event.image}
                    alt={event.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold text-brand-blue-950 shadow">
                    {event.priceLabel}
                  </span>
                </div>
                <div className="p-6 sm:p-8">
                  <h2 className="font-display text-2xl font-semibold text-slate-900">
                    {event.title}
                  </h2>
                  <p className="mt-4 flex items-center gap-3 text-sm text-slate-700">
                    <CalendarDays className="h-5 w-5 text-brand-blue-700" aria-hidden="true" />
                    {event.dateLabel}
                  </p>
                  <p className="mt-2 flex items-center gap-3 text-sm text-slate-700">
                    <Clock3 className="h-5 w-5 text-brand-blue-700" aria-hidden="true" />
                    Registration closes {event.registrationDeadline}
                  </p>
                  <p className="mt-4 text-base leading-7 text-slate-600">
                    {event.summary}
                  </p>
                  <Link
                    href={event.href}
                    className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-brand-orange-600 px-6 text-sm font-semibold text-white transition hover:bg-brand-orange-600__ focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange-500 focus-visible:ring-offset-2"
                  >
                    View trip and reserve
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-10 text-base text-slate-600">
            Prefer your own dates?{" "}
            <Link href="/plan" className="font-semibold text-brand-blue-800 underline">
              Plan a private trip
            </Link>
            .
          </p>
        </Container>
      </section>
    </main>
  );
}
