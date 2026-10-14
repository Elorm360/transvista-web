import type { Metadata } from "next";
import { Clock3, ShieldCheck } from "lucide-react";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { TripRequestForm } from "@/components/trip-planning/TripRequestForm";
import {
  ghanaTourismRegions,
  initialDestinationSlugs,
} from "@/constants/data/ghana-tourism-regions";

export const metadata: Metadata = pageMetadata({
  title: "Plan Your Ghana Trip",
  description:
    "Tell TransVista where you want to go, what you need, and your comfortable budget. Receive a coordinated response within 48 hours.",
  path: "/plan",
});

type PlanPageProps = {
  searchParams: Promise<{ destination?: string | string[] }>;
};

const allowedDestinations = new Set([
  ...ghanaTourismRegions.map((region) => region.slug),
  ...initialDestinationSlugs,
]);

export default async function PlanPage({ searchParams }: PlanPageProps) {
  const params = await searchParams;
  const rawDestination = Array.isArray(params.destination)
    ? params.destination[0]
    : params.destination;
  // Accept slugs and display names ("Accra", "Cape Coast") from older links.
  const normalized = (rawDestination ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const initialDestination = allowedDestinations.has(normalized)
    ? normalized
    : "";

  return (
    <main id="main-content" className="bg-[#fffdfa]">
      <PageHeader
        eyebrow="Plan your trip"
        title="Tell us what you know. We’ll help shape the rest."
        lead="Request experiences, transport, accommodation or a complete Ghana itinerary. Sending this form is free and doesn’t confirm a booking."
      >
        <ul className="mt-6 flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:gap-6">
          <li className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-brand-blue-700" aria-hidden="true" />
            Proposal within 48 hours
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand-blue-700" aria-hidden="true" />
            No payment until you approve
          </li>
        </ul>
      </PageHeader>

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
