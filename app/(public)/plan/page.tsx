import type { Metadata } from "next";
import { Clock3, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { TripRequestForm } from "@/components/trip-planning/TripRequestForm";

export const metadata: Metadata = {
  title: "Plan Your Ghana Trip | TransVista Africa",
  description:
    "Tell TransVista where you want to go, what you need, and your comfortable budget. Receive a coordinated response within 48 hours.",
};

type PlanPageProps = {
  searchParams: Promise<{ destination?: string | string[] }>;
};

const allowedDestinations = new Set(["accra", "cape-coast", "volta-region"]);

export default async function PlanPage({ searchParams }: PlanPageProps) {
  const params = await searchParams;
  const rawDestination = Array.isArray(params.destination)
    ? params.destination[0]
    : params.destination;
  const initialDestination =
    rawDestination && allowedDestinations.has(rawDestination)
      ? rawDestination
      : "";

  return (
    <main id="main-content" className="bg-[#fffdfa]">
      <header className="border-b border-slate-200 bg-white py-12 lg:py-16">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-orange-700">
            Plan Your Trip
          </p>
          <h1 className="font-display mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Tell us what you know. We’ll help shape the rest.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Request experiences, transport, accommodation, or a complete Ghana
            itinerary. This form does not require payment and does not confirm
            a booking.
          </p>
          <div className="mt-6 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:gap-6">
            <span className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-brand-blue-700" />
              Response within 48 hours
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand-blue-700" />
              TransVista coordinates first
            </span>
          </div>
        </Container>
      </header>

      <section className="py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-4xl">
            <TripRequestForm initialDestination={initialDestination} />
          </div>
        </Container>
      </section>
    </main>
  );
}
