import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { pastEvents } from "@/lib/events/past-events";
import { createPublicClient } from "@/lib/supabase/public";

// Cached and refreshed every 5 minutes; admin event changes refresh it immediately.
export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Past Events",
  description: "Explore completed group journeys and experiences organised by TransVista Africa.",
  path: "/past-events",
});

type ArchiveEvent = {
  slug: string; title: string; region: string; summary: string; start_date: string;
  price_amount: number | string; currency: string; pickup_location: string | null;
  itinerary: Array<{ title: string; detail: string }>;
};

function dateLabel(value: string) {
  return new Date(value + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
function money(value: number | string, currency: string) {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value));
}

export default async function PastEventsPage() {
  const supabase = createPublicClient();
  const { data: allEvents, error } = await supabase.from("travel_events")
    .select("slug,status,title,region,summary,start_date,price_amount,currency,pickup_location,itinerary")
    .order("start_date", { ascending: false });
  if (error) console.error("[PastEventsPage]", error);
  const records = allEvents ?? [];
  const managed = records.filter((event) => event.status === "completed") as ArchiveEvent[];
  // Public RLS intentionally hides drafts and cancelled records. Therefore a successful
  // query is authoritative: never restore static records that could now be non-public.
  // Static content is used only during a database outage.
  const fallback = error ? pastEvents : [];

  return (
    <main id="main-content" className="bg-canvas">
      <PageHeader eyebrow="Our journey together" title="Past Events" lead="A record of the group experiences TransVista has organised. Explore each journey, revisit the itinerary and share feedback with our team." />
      <section className="py-12 lg:py-16">
        <Container>
          {managed.length || fallback.length ? (
            <div className="grid gap-6 md:grid-cols-2">
              {managed.map((event) => <article key={event.slug} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="bg-brand-blue-950 px-7 py-8 text-white sm:px-9 sm:py-10"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange-300">{event.region} · Completed</p><h2 className="font-display mt-4 text-2xl font-semibold leading-tight sm:text-3xl">{event.title}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-brand-blue-100/80">{event.summary}</p></div>
                <div className="p-7 sm:p-9"><div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600"><span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-brand-orange-600" />{dateLabel(event.start_date)}</span>{event.pickup_location && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-orange-600" />{event.pickup_location}</span>}</div><p className="mt-4 text-xs font-semibold text-slate-500">Original price: {money(event.price_amount, event.currency)} per person</p>{event.itinerary?.length ? <><p className="mt-5 text-sm font-semibold text-slate-800">The route included</p><ul className="mt-2 flex flex-wrap gap-2">{event.itinerary.map((stop) => <li key={stop.title} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">{stop.title}</li>)}</ul></> : null}<Link href={"/past-events/" + event.slug} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue-800 hover:text-brand-orange-700">View event details <ArrowRight className="h-4 w-4" /></Link></div>
              </article>)}
              {fallback.map((event) => <article key={event.slug} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"><div className="bg-brand-blue-950 px-7 py-8 text-white sm:px-9 sm:py-10"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange-300">{event.region} · Completed</p><h2 className="font-display mt-4 text-2xl font-semibold leading-tight sm:text-3xl">{event.title}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-brand-blue-100/80">{event.summary}</p></div><div className="p-7 sm:p-9"><div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600"><span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-brand-orange-600" />{event.dateLabel}</span><span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-orange-600" />{event.pickup}</span></div><p className="mt-5 text-sm font-semibold text-slate-800">The route included</p><ul className="mt-2 flex flex-wrap gap-2">{event.destinations.map((destination) => <li key={destination} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">{destination}</li>)}</ul><Link href={event.href} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue-800 hover:text-brand-orange-700">View event details <ArrowRight className="h-4 w-4" /></Link></div></article>)}
            </div>
          ) : <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><h2 className="font-display text-2xl font-semibold text-slate-900">Our event archive is being prepared.</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">Completed TransVista group experiences will appear here as their records and approved event media are ready.</p></div>}
          {error && <p className="mt-6 text-center text-xs text-slate-500">The archive is showing the last verified static record while the event database is unavailable.</p>}
          <div className="mt-10 rounded-3xl border border-slate-200 bg-sand p-7 sm:p-9"><h2 className="font-display text-2xl font-semibold text-slate-900">Looking for an upcoming experience?</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">We are preparing future group experiences. Follow our official updates or tell us what kind of journey you would like to take.</p><Link href="/trips" className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-orange-700">Explore upcoming events <ArrowRight className="h-4 w-4" /></Link></div>
        </Container>
      </section>
    </main>
  );
}
