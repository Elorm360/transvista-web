import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { tripPackages } from "@/constants/data/packages";

export function FeaturedPackage() {
  const tripPackage = tripPackages[0];

  return (
    <Section id="trip-packages" className="bg-white">
      <Container>
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange-700">Plan a real journey</p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Start with our founding Volta escape.</h2>
          </div>
          <p className="max-w-md text-base leading-7 text-slate-600">Share your dates first. We confirm the route, stay, and local partners before asking you to commit.</p>
        </div>

        <article className="group grid overflow-hidden rounded-[32px] border border-slate-200 bg-[#fffdfa] shadow-[0_25px_70px_-45px_rgba(15,23,42,0.35)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[320px] overflow-hidden lg:min-h-[500px]">
            <Image
              src={tripPackage.image}
              alt={tripPackage.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-6 pt-20 text-white lg:hidden">
              <p className="text-sm font-semibold">From ${tripPackage.priceFrom} per traveler</p>
            </div>
          </div>
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange-700">{tripPackage.eyebrow}</p>
            <h3 className="font-display mt-4 text-3xl font-semibold tracking-tight text-slate-900">{tripPackage.name}</h3>
            <p className="mt-4 text-base leading-7 text-slate-600">{tripPackage.description}</p>
            <div className="mt-7 grid gap-3 text-sm font-medium text-slate-700 sm:grid-cols-2">
              <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-brand-blue-700" />{tripPackage.duration}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-blue-700" />{tripPackage.region}</p>
              <p className="flex items-center gap-2 sm:col-span-2"><ShieldCheck className="h-4 w-4 text-brand-blue-700" />Availability confirmed before payment</p>
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href={`/packages/${tripPackage.slug}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-orange-600 px-6 text-sm font-semibold text-white transition hover:bg-brand-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange-600 focus-visible:ring-offset-2">
                View journey <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="hidden text-sm text-slate-500 lg:block">From <strong className="text-lg text-slate-900">${tripPackage.priceFrom}</strong> per traveler</p>
            </div>
          </div>
        </article>
      </Container>
    </Section>
  );
}
