import Link from "next/link";
import Image from "next/image";
import type { Destination } from "@/constants/data/destinations";
import { PhotoPlaceholder } from "@/components/media/PhotoPlaceholder";

type DestinationCardProps = {
  destination: Destination;
};

export function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/destinations/${destination.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {destination.image ? (
            <Image
              src={destination.image}
              alt={destination.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={75}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <PhotoPlaceholder
              label="Photo coming soon"
              caption="TransVista destination photography"
            />
          )}
        </div>

        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-600">
            {destination.region}
          </p>

          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            {destination.name}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {destination.description}
          </p>

          <div className="mt-4 inline-flex items-center text-sm font-semibold text-blue-700">
            Explore destination
            <span
              className="ml-1 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
