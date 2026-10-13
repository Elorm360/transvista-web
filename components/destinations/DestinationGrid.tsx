import { destinations } from "@/constants/data/destinations";
import { DestinationCard } from "./DestinationCard";

export function DestinationGrid() {
  return (
    <section
      aria-labelledby="destinations-heading"
      className="py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
            Discover Ghana
          </p>

          <h1
            id="destinations-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
          >
            Places worth discovering
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Explore destinations across Ghana and discover the places,
            experiences, and journeys that make each one unique.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
