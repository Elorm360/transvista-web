import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = pageMetadata({
  title: "Upcoming Group Trips",
  description:
    "Discover upcoming TransVista group experiences in Ghana. New departures will be announced when dates and arrangements are confirmed.",
  path: "/trips",
});

export default function TripsPage() {
  return (
    <main id="main-content" className="bg-[#fffdfa]">
      <PageHeader
        eyebrow="Group experiences"
        title="Travel Ghana together."
        lead="Our group experiences bring people together to discover Ghana through thoughtfully coordinated journeys."
      />
      <section className="py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white px-7 py-12 text-center shadow-sm sm:px-12">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange-50 text-brand-orange-700">
              <Compass className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="font-display mt-6 text-2xl font-semibold text-slate-900 sm:text-3xl">Our next group experience is being planned.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
              We will announce the next departure once the itinerary, partners, dates and pricing have been confirmed. Follow our official updates so you do not miss the announcement.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <a href="https://whatsapp.com/channel/0029VbBchTr0G0XluVpGfy2q" target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center rounded-full bg-brand-orange-600 px-6 text-sm font-semibold text-white transition hover:bg-brand-orange-700">Follow WhatsApp updates</a>
              <Link href="/past-events" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-300 px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">Explore Past Events <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <p className="mt-10 text-center text-base text-slate-600">
            Prefer your own dates?{" "}
            <Link href="/plan" className="font-semibold text-brand-blue-800 underline">Plan a private trip</Link>.
          </p>
        </Container>
      </section>
    </main>
  );
}
