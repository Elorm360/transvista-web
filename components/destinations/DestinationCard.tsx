import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Destination } from "@/constants/data/destinations";
import { PhotoPlaceholder } from "@/components/media/PhotoPlaceholder";

type DestinationCardProps = {
  destination: Destination;
};

export function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <article className="group">
      <Link
        href={`/destinations/${destination.slug}`}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-600 focus-visible:ring-offset-4"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
          {destination.image ? (
            <Image
              src={destination.image}
              alt={destination.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={75}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <PhotoPlaceholder />
          )}
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-800 backdrop-blur">
            {destination.category}
          </span>
        </div>

        <div className="pt-5">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
            {destination.region}
          </p>
          <h3 className="font-display mt-1.5 text-2xl font-semibold tracking-tight text-slate-950">
            {destination.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-[15px] leading-7 text-slate-600">
            {destination.description}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue-800">
            Explore
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>
    </article>
  );
}
