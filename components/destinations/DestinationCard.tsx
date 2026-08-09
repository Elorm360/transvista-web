import Link from "next/link";
import type { Destination } from "@/constants/data/destinations";

type DestinationCardProps = {
  destination: Destination;
};

export function DestinationCard({
  destination,
}: DestinationCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/destinations/${destination.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-white to-amber-50 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-6 w-6 text-slate-400"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="8.5" cy="9" r="1.5" />
                <path d="m21 15-4.5-4.5L7 20" />
              </svg>
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-600">
              Original photo coming soon
            </p>

            <p className="mt-1 text-xs text-slate-400">
              TransVista destination photography
            </p>
          </div>
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
