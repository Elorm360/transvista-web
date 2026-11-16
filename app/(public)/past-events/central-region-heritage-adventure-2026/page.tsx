import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, MessageSquareText } from "lucide-react";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { pastEvents } from "@/lib/events/past-events";

const event = pastEvents[0];

export const metadata: Metadata = pageMetadata({
  title: "Central Region Heritage & Adventure — Past Event",
  description:
    "A look back at TransVista's Central Region Heritage & Adventure Day Trip on 14 November 2026.",
  path: event.href,
});

export default function CentralRegionPastEventPage() {
  return (
    <main id="main-content" className="bg-[#fffdfa]">
      <PageHeader
        eyebrow="Past event · Central Region"
        title="Central Region Heritage & Adventure"
        lead="A day of rainforest discovery, coastal heritage and shared experiences, organised by TransVista Africa on Saturday, 14 November 2026."
      >
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-700">
          <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-brand-orange-600" />{event.dateLabel}</span>
          <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-orange-600" />Departed from {event.pickup}</span>
        </div>
      </PageHeader>

      <section className="py-12 lg:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange-700">The journey</p>
              <h2 className="font-display mt-3 text-3xl font-semibold text-slate-900">Four stops across the Central Region</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{event.summary}</p>
              <ol className="mt-8 space-y-4">
                {event.destinations.map((destination, index) => (
                  <li key={destination} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue-950 text-sm font-semibold text-white">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="font-semibold text-slate-900">{destination}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{index === 0 ? "Rainforest and canopy walkway experience." : index === 1 ? "A stop for food, nature and shared group moments." : "A guided coastal heritage visit."}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange-700">Event record</p>
              <dl className="mt-5 space-y-4 text-sm">
                <div><dt className="text-slate-500">Original package price</dt><dd className="mt-1 font-semibold text-slate-900">{event.originalPriceLabel}</dd></div>
                <div><dt className="text-slate-500">Departure point</dt><dd className="mt-1 font-semibold text-slate-900">{event.pickup}</dd></div>
                <div><dt className="text-slate-500">Experience</dt><dd className="mt-1 font-semibold text-slate-900">Day trip · Group experience</dd></div>
              </dl>
              <div className="mt-7 border-t border-slate-200 pt-6">
                <h3 className="font-display text-xl font-semibold text-slate-900">Were you part of this journey?</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Your feedback helps us improve transport, organisation, itinerary planning and the overall experience. Responses are private and are not published as testimonials.</p>
                <Link href={event.feedbackHref} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-orange-700">
                  Share event feedback <MessageSquareText className="h-4 w-4" />
                </Link>
              </div>
              <Link href="/past-events" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue-800 hover:text-brand-orange-700"><ArrowLeft className="h-4 w-4" />Back to Past Events</Link>
            </aside>
          </div>

          <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-[#f7f5f1] p-7 sm:p-9">
            <h2 className="font-display text-2xl font-semibold text-slate-900">Event photographs</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">The team will add selected photographs and video highlights here after reviewing the event media and confirming the necessary permissions. No attendee images are displayed until they have been cleared for publication.</p>
          </div>
        </Container>
      </section>
    </main>
  );
}
