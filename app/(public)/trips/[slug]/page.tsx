import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, MapPin, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { createClient } from "@/lib/supabase/server";
import { pageMetadata } from "@/lib/seo/pageMetadata";

export const dynamic = "force-dynamic";

type EventRow = {
  slug: string; title: string; region: string; summary: string; description: string | null;
  start_date: string; end_date: string | null; registration_deadline: string | null;
  price_amount: number | string; currency: string; capacity: number | null;
  pickup_location: string | null; image_path: string | null; image_alt: string | null;
  inclusions: string[]; itinerary: Array<{ title: string; detail: string }>; status: string;
};

async function getEvent(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("travel_events").select("*").eq("slug", slug)
    .in("status", ["published", "registration_closed"]).maybeSingle();
  if (error) console.error("[PublicEventPage]", error);
  return data as EventRow | null;
}

function dateLabel(value: string) {
  return new Date(value + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
function money(value: number | string, currency: string) {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return pageMetadata({ title: "Group Experience", description: "Explore a TransVista group experience.", path: "/trips" });
  return pageMetadata({ title: event.title, description: event.summary, path: "/trips/" + event.slug });
}

export default async function PublicEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();
  const message = encodeURIComponent("Hello TransVista Africa, I would like to enquire about " + event.title + " (" + event.start_date + "). Please share the next steps.");
  const whatsappHref = "https://wa.me/233248442916?text=" + message;

  return (
    <main id="main-content" className="bg-canvas">
      <PageHeader eyebrow={event.region + " · Group experience"} title={event.title} lead={event.summary} />
      <section className="py-10 lg:py-14">
        <Container>
          <Link href="/trips" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue-800 hover:text-brand-orange-700"><ArrowLeft className="h-4 w-4" />All group experiences</Link>
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
            <div className="space-y-7">
              {event.image_path ? <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] bg-slate-100"><Image src={event.image_path} alt={event.image_alt || event.title} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 65vw" /></div> : <div className="flex aspect-[16/9] items-center justify-center rounded-[28px] bg-brand-blue-950 text-center text-white"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange-300">{event.region}</p><p className="font-display mt-3 text-3xl font-semibold">{event.title}</p></div></div>}
              {event.description && <div><h2 className="font-display text-2xl font-semibold text-slate-900">About this experience</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{event.description}</p></div>}
              {event.itinerary?.length > 0 && <div><h2 className="font-display text-2xl font-semibold text-slate-900">Planned itinerary</h2><ol className="mt-4 space-y-4">{event.itinerary.map((stop, index) => <li key={stop.title + index} className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-orange-50 text-xs font-bold text-brand-orange-800">{index + 1}</span><div><h3 className="text-sm font-semibold text-slate-900">{stop.title}</h3>{stop.detail && <p className="mt-1 text-sm leading-6 text-slate-600">{stop.detail}</p>}</div></li>)}</ol></div>}
              {event.inclusions?.length > 0 && <div><h2 className="font-display text-2xl font-semibold text-slate-900">What's included</h2><ul className="mt-4 grid gap-3 sm:grid-cols-2">{event.inclusions.map((item) => <li key={item} className="flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{item}</li>)}</ul></div>}
            </div>
            <aside className="h-fit rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange-700">Event details</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{money(event.price_amount, event.currency)}<span className="ml-1 text-sm font-normal text-slate-500">/ person</span></p>
              <dl className="mt-6 space-y-4 border-t border-slate-100 pt-5 text-sm">
                <div className="flex gap-3"><CalendarDays className="h-4 w-4 shrink-0 text-brand-orange-600" /><div><dt className="text-xs text-slate-500">Event date</dt><dd className="mt-1 font-semibold text-slate-800">{dateLabel(event.start_date)}{event.end_date && event.end_date !== event.start_date ? " – " + dateLabel(event.end_date) : ""}</dd></div></div>
                {event.registration_deadline && <div className="flex gap-3"><Clock3 className="h-4 w-4 shrink-0 text-brand-orange-600" /><div><dt className="text-xs text-slate-500">Registration deadline</dt><dd className="mt-1 font-semibold text-slate-800">{dateLabel(event.registration_deadline)}</dd></div></div>}
                {event.pickup_location && <div className="flex gap-3"><MapPin className="h-4 w-4 shrink-0 text-brand-orange-600" /><div><dt className="text-xs text-slate-500">Meeting point</dt><dd className="mt-1 font-semibold text-slate-800">{event.pickup_location}</dd></div></div>}
                {event.capacity && <div><dt className="text-xs text-slate-500">Available capacity</dt><dd className="mt-1 font-semibold text-slate-800">{event.capacity} places maximum</dd></div>}
              </dl>
              {event.status === "registration_closed" ? <div className="mt-6 rounded-xl bg-brand-orange-50 p-4 text-sm font-semibold text-brand-orange-900">Registration for this event has closed.</div> : <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-orange-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-orange-700"><MessageCircle className="h-4 w-4" />Enquire about this event</a>}
              <p className="mt-4 text-xs leading-5 text-slate-500">An enquiry is not a confirmed booking. The TransVista team will explain availability, arrangements and payment steps before any payment is requested.</p>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
