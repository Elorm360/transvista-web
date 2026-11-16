import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, MessageSquareText } from "lucide-react";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { pastEvents } from "@/lib/events/past-events";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type EventRecord = {
  title: string; region: string; summary: string; description: string | null;
  start_date: string; pickup_location: string | null; price_amount: number | string;
  currency: string; itinerary: Array<{ title: string; detail: string }>;
};

async function getEvent(): Promise<{ event: EventRecord | null; allowStaticFallback: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("travel_events").select("status,title,region,summary,description,start_date,pickup_location,price_amount,currency,itinerary")
    .eq("slug", "central-region-heritage-adventure-2026").maybeSingle();
  if (error) {
    console.error("[CentralRegionPastEvent]", error);
    return { event: null, allowStaticFallback: true };
  }
  if (!data) return { event: null, allowStaticFallback: true };
  if (data.status !== "completed") return { event: null, allowStaticFallback: false };
  return { event: data as EventRecord, allowStaticFallback: false };
}
function dateLabel(value: string) {
  return new Date(value + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function money(value: number | string, currency: string) {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value));
}

export async function generateMetadata(): Promise<Metadata> {
  const { event, allowStaticFallback } = await getEvent();
  if (!event && !allowStaticFallback) return pageMetadata({ title: "Event unavailable", description: "This event is not currently listed in the public archive.", path: "/past-events" });
  return pageMetadata({
    title: (event?.title ?? "Central Region Heritage & Adventure") + " — Past Event",
    description: event?.summary ?? "A look back at TransVista's Central Region Heritage & Adventure Day Trip on 14 November 2026.",
    path: "/past-events/central-region-heritage-adventure-2026",
  });
}

export default async function CentralRegionPastEventPage() {
  const { event, allowStaticFallback } = await getEvent();
  if (!event && !allowStaticFallback) notFound();
  const fallback = pastEvents[0];
  const title = event?.title ?? fallback.title;
  const summary = event?.summary ?? fallback.summary;
  const date = event ? dateLabel(event.start_date) : fallback.dateLabel;
  const pickup = event?.pickup_location ?? fallback.pickup;
  const itinerary = event?.itinerary?.length ? event.itinerary : fallback.destinations.map((destination) => ({ title: destination, detail: "" }));
  const price = event ? money(event.price_amount, event.currency) + " per person" : fallback.originalPriceLabel;

  return (
    <main id="main-content" className="bg-[#fffdfa]">
      <PageHeader eyebrow={"Past event · " + (event?.region ?? fallback.region)} title={title} lead={event?.description ?? "A day of rainforest discovery, coastal heritage and shared experiences, organised by TransVista Africa."}>
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-700">
          <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-brand-orange-600" />{date}</span>
          <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-orange-600" />Departed from {pickup}</span>
        </div>
      </PageHeader>
      <section className="py-12 lg:py-16"><Container>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange-700">The journey</p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-slate-900">A group experience across the Central Region</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{summary}</p>
            <ol className="mt-8 space-y-4">
              {itinerary.map((stop, index) => <li key={stop.title} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue-950 text-sm font-semibold text-white">{String(index + 1).padStart(2, "0")}</span><div><h3 className="font-semibold text-slate-900">{stop.title}</h3>{stop.detail && <p className="mt-1 text-sm leading-6 text-slate-600">{stop.detail}</p>}</div></li>)}
            </ol>
          </div>
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange-700">Event record</p>
            <dl className="mt-5 space-y-4 text-sm"><div><dt className="text-slate-500">Original package price</dt><dd className="mt-1 font-semibold text-slate-900">{price}</dd></div><div><dt className="text-slate-500">Departure point</dt><dd className="mt-1 font-semibold text-slate-900">{pickup}</dd></div><div><dt className="text-slate-500">Experience</dt><dd className="mt-1 font-semibold text-slate-900">Day trip · Group experience</dd></div></dl>
            <div className="mt-7 border-t border-slate-200 pt-6"><h3 className="font-display text-xl font-semibold text-slate-900">Were you part of this journey?</h3><p className="mt-2 text-sm leading-6 text-slate-600">Your feedback helps us improve transport, organisation, itinerary planning and the overall experience. Responses are private and are not published as testimonials.</p><Link href={fallback.feedbackHref} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-orange-700">Share event feedback <MessageSquareText className="h-4 w-4" /></Link></div>
            <Link href="/past-events" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue-800 hover:text-brand-orange-700"><ArrowLeft className="h-4 w-4" />Back to Past Events</Link>
          </aside>
        </div>
        <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-[#f7f5f1] p-7 sm:p-9"><h2 className="font-display text-2xl font-semibold text-slate-900">Event photographs</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">The team will add selected photographs and video highlights here after reviewing the event media and confirming the necessary permissions. No attendee images are displayed until they have been cleared for publication.</p></div>
      </Container></section>
    </main>
  );
}
