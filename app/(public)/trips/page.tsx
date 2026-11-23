import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Compass, MapPin } from "lucide-react";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { createPublicClient } from "@/lib/supabase/public";

// Cached and refreshed every 5 minutes; admin event changes refresh it immediately.
export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Upcoming Group Trips",
  description: "Discover upcoming TransVista group experiences in Ghana. Explore confirmed itineraries and enquire about upcoming departures.",
  path: "/trips",
});

type PublicEvent = {
  slug: string; title: string; region: string; summary: string;
  start_date: string; end_date: string | null; registration_deadline: string | null;
  price_amount: number | string; currency: string; pickup_location: string | null;
  image_path: string | null; image_alt: string | null; status: string; featured: boolean;
};

function dateLabel(value: string) {
  return new Date(value + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
function money(value: number | string, currency: string) {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value));
}

export default async function TripsPage() {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("travel_events")
    .select("slug,title,region,summary,start_date,end_date,registration_deadline,price_amount,currency,pickup_location,image_path,image_alt,status,featured")
    .in("status", ["published", "registration_closed"])
    .order("featured", { ascending: false })
    .order("start_date", { ascending: true });
  if (error) console.error("[TripsPage]", error);
  const events = (data ?? []) as PublicEvent[];

  return (
    <main id="main-content" className="bg-[#fffdfa]">
      <PageHeader eyebrow="Group experiences" title="Travel Ghana together." lead="Our group experiences bring people together to discover Ghana through thoughtfully coordinated journeys." />
      <section className="py-12 lg:py-16">
        <Container>
          {error ? (
            <div role="status" className="mx-auto max-w-3xl rounded-[28px] border border-amber-200 bg-amber-50 px-7 py-12 text-center">
              <h2 className="font-display text-2xl font-semibold text-slate-900">Upcoming experiences are temporarily unavailable.</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">Please check back shortly or follow our official WhatsApp updates for confirmed announcements.</p>
              <a href="https://whatsapp.com/channel/0029VbBchTr0G0XluVpGfy2q" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-brand-orange-600 px-5 text-sm font-semibold text-white">Follow WhatsApp updates</a>
            </div>
          ) : events.length ? (
            <div className="grid gap-6 md:grid-cols-2">
              {events.map((event) => (
                <article key={event.slug} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                  {event.image_path ? <div className="relative aspect-[16/9] bg-slate-100"><Image src={event.image_path} alt={event.image_alt || event.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /></div> : <div className="flex aspect-[16/9] items-center justify-center bg-brand-blue-950 text-white"><Compass className="h-10 w-10 text-brand-orange-300" aria-hidden="true" /></div>}
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-brand-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-orange-800">{event.region}</span>{event.status === "registration_closed" && <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600">Registration closed</span>}{event.featured && <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-800">Featured</span>}</div>
                    <h2 className="font-display mt-4 text-2xl font-semibold leading-tight text-slate-900">{event.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{event.summary}</p>
                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-brand-orange-600" />{dateLabel(event.start_date)}{event.end_date && event.end_date !== event.start_date ? " – " + dateLabel(event.end_date) : ""}</span>{event.pickup_location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-brand-orange-600" />{event.pickup_location}</span>}</div>
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"><p className="text-sm font-bold text-slate-900">{money(event.price_amount, event.currency)} <span className="font-normal text-slate-500">/ person</span></p><Link href={"/trips/" + event.slug} className="inline-flex h-10 items-center gap-2 rounded-full bg-brand-orange-600 px-4 text-xs font-semibold text-white transition hover:bg-brand-orange-700">View experience <ArrowRight className="h-4 w-4" /></Link></div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white px-7 py-12 text-center shadow-sm sm:px-12">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange-50 text-brand-orange-700"><Compass className="h-7 w-7" aria-hidden="true" /></span>
              <h2 className="font-display mt-6 text-2xl font-semibold text-slate-900 sm:text-3xl">Our next group experience is being planned.</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">We will announce the next departure once the itinerary, partners, dates and pricing have been confirmed. Follow our official updates so you do not miss the announcement.</p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><a href="https://whatsapp.com/channel/0029VbBchTr0G0XluVpGfy2q" target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center rounded-full bg-brand-orange-600 px-6 text-sm font-semibold text-white transition hover:bg-brand-orange-700">Follow WhatsApp updates</a><Link href="/past-events" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-300 px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">Explore Past Events <ArrowRight className="h-4 w-4" /></Link></div>
            </div>
          )}
          {error && <p className="mt-6 text-center text-xs text-slate-500">Event listings are temporarily unavailable. Please check back shortly.</p>}
          <p className="mt-10 text-center text-base text-slate-600">Prefer your own dates? <Link href="/plan" className="font-semibold text-brand-blue-800 underline">Plan a private trip</Link>.</p>
        </Container>
      </section>
    </main>
  );
}
