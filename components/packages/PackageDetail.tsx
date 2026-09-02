import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Clock3, MapPin, ShieldCheck, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { TripRequestForm } from "@/components/packages/TripRequestForm";
import { tripRequestContent } from "@/content/trip-request";
import type { TripPackage } from "@/constants/data/packages";

export function PackageDetail({ tripPackage }: { tripPackage: TripPackage }) {
  return (
    <main id="main-content" className="bg-[#fffdfa]">
      <section className="relative isolate overflow-hidden bg-brand-blue-950 text-white">
        <Image
          src={tripPackage.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover opacity-45"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-blue-950 via-brand-blue-950/90 to-brand-blue-950/45" />
        <Container className="py-20 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange-300">
            {tripPackage.eyebrow}
          </p>
          <h1 className="font-display mt-5 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {tripPackage.name}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
            {tripPackage.tagline}
          </p>
          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-200">
            <span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-brand-orange-300" />{tripPackage.duration}</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-orange-300" />{tripPackage.region}</span>
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-brand-orange-300" />{tripPackage.groupType}</span>
          </div>
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="#request"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-brand-orange-600 px-8 text-base font-semibold text-white shadow-lg transition hover:bg-brand-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Check availability <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-sm text-slate-300">
              From <strong className="text-xl text-white">${tripPackage.priceFrom}</strong> per traveler
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-slate-200 bg-white py-8">
        <Container>
          <div className="grid gap-5 sm:grid-cols-3">
            {["Availability confirmed before payment", "Personally coordinated local partners", "TransVista support throughout the trip"].map((item) => (
              <p key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <ShieldCheck className="h-5 w-5 shrink-0 text-brand-blue-700" />{item}
              </p>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange-700">The journey</p>
              <h2 className="font-display mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">A Volta weekend without the planning scramble.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">{tripPackage.description}</p>
              <div className="mt-10 space-y-7">
                {tripPackage.itinerary.map((item) => (
                  <article key={item.day} className="relative border-l-2 border-brand-orange-200 pl-7">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-orange-700">{item.day}</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-2 leading-7 text-slate-600">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
            <aside className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)] sm:p-9">
              <p className="text-sm font-semibold text-brand-blue-800">Indicative group price</p>
              <p className="mt-2 text-4xl font-bold text-slate-900">${tripPackage.priceFrom}<span className="text-base font-medium text-slate-500"> / traveler</span></p>
              <p className="mt-3 text-sm leading-6 text-slate-500">{tripPackage.priceNote}</p>
              <ul className="mt-7 space-y-4">
                {tripPackage.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3 text-sm leading-6 text-slate-700"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />{highlight}</li>
                ))}
              </ul>
              <Link href="#request" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-brand-blue-800 hover:text-brand-orange-700">Request your dates <ArrowRight className="h-4 w-4" /></Link>
            </aside>
          </div>
        </Container>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-16 lg:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <InclusionList title="What your quotation can include" items={tripPackage.included} tone="included" />
            <InclusionList title="Not included" items={tripPackage.notIncluded} tone="excluded" />
          </div>
        </Container>
      </section>

      <section id="request" className="scroll-mt-24 py-16 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange-700">{tripRequestContent.eyebrow}</p>
              <h2 className="font-display mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">{tripRequestContent.title}</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">{tripRequestContent.description}</p>
              <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-brand-blue-800"><Clock3 className="h-4 w-4" />{tripRequestContent.responseTime}</p>
            </div>
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-40px_rgba(15,23,42,0.35)] sm:p-9">
              <TripRequestForm packageSlug={tripPackage.slug} />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

function InclusionList({ title, items, tone }: { title: string; items: string[]; tone: "included" | "excluded" }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-slate-900">{title}</h2>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
            <span className={tone === "included" ? "mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" : "mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-400"} />{item}
          </li>
        ))}
      </ul>
    </div>
  );
}
