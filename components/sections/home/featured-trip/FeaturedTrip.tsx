import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Camera, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { buttonVariants } from "@/components/ui/button";
import { centralRegionPackage } from "@/lib/travel/packages";
import { cn } from "@/lib/utils";

export function FeaturedTrip() {
  const trip = centralRegionPackage;

  return (
    <Section id="featured-trip" className="bg-white">
      <Container>
        <Reveal>
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-[#fffdfa] shadow-[0_24px_80px_-45px_rgba(15,23,42,0.4)]">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative min-h-[320px]">
                <Image
                  src={trip.image}
                  alt={trip.imageAlt}
                  fill
                  quality={80}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <span className="absolute left-6 top-6 rounded-full bg-brand-orange-700 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                  Upcoming group trip
                </span>
              </div>

              <div className="p-7 sm:p-10 lg:p-12">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-orange-700">
                  Central Region · One day
                </p>
                <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  Heritage, rainforest, and moments worth capturing.
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Join TransVista for Kakum National Park, Cape Coast Castle,
                  Elmina Castle, Hans Cottage Botel, food, and a guided photo
                  and video experience.
                </p>

                <dl className="mt-7 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="flex items-center gap-3 text-sm font-semibold text-slate-900">
                      <CalendarDays className="h-5 w-5 shrink-0 text-brand-blue-700" aria-hidden="true" />
                      Date
                    </dt>
                    <dd className="mt-1 pl-8 text-sm text-slate-600">{trip.displayDate}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-3 text-sm font-semibold text-slate-900">
                      <MapPin className="h-5 w-5 shrink-0 text-brand-blue-700" aria-hidden="true" />
                      Pickup
                    </dt>
                    <dd className="mt-1 pl-8 text-sm text-slate-600">
                        {trip.pickupLocation}, {trip.departureTime}
                      </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-3 text-sm font-semibold text-slate-900">
                      <Camera className="h-5 w-5 shrink-0 text-brand-blue-700" aria-hidden="true" />
                      Included
                    </dt>
                    <dd className="mt-1 pl-8 text-sm text-slate-600">
                        Meals, photos, video, transport
                      </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-semibold text-slate-900">Price</dt>
                    <dd className="mt-1 text-2xl font-bold text-brand-blue-900">
                      {trip.currencySymbol}{trip.pricePerPerson}
                      <span className="ml-1 text-sm font-medium text-slate-500">per person</span>
                    </dd>
                  </div>
                </dl>

                <Link
                  href={`/trips/${trip.slug}`}
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "mt-8 rounded-full",
                  )}
                >
                  View trip and register
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
