import type { Metadata } from "next";
import Image from "next/image";
import { CalendarDays, CalendarPlus, ChevronDown, Clock3, MapPin, Camera, Utensils, Bus } from "lucide-react";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { Container } from "@/components/ui/Container";
import { PackageTerms } from "@/components/packages/PackageTerms";
import { PackageReservationForm } from "@/components/trips/PackageReservationForm";
import { centralRegionPackage } from "@/lib/travel/packages";
import { seoConfig } from "@/constants/config/seo";
import {
  tripGoogleCalendarUrl,
  tripIcsPath,
  tripMapUrl,
} from "@/lib/travel/calendar";
import {
  RegistrationCountdown,
  ShareTripButton,
  StickyReserveBar,
} from "@/components/trips/TripEngagement";

export const metadata: Metadata = pageMetadata({
  title: "Central Region Heritage & Adventure Day Trip",
  description:
    "Sat 14 Nov 2026 · GH₵400 per person. Kakum canopy walk, Cape Coast & Elmina Castles, Hans Cottage Botel, meals, photos and video. Pickup at Accra Mall.",
  path: "/trips/central-region-heritage-adventure-2026",
  image: centralRegionPackage.image,
  imageAlt: centralRegionPackage.imageAlt,
});

const trip = centralRegionPackage;
const tripUrl = `${seoConfig.url}/trips/${trip.slug}`;

const faqs = [
  {
    question: "Do I pay anything when I register?",
    answer: `No. Registration is free. After TransVista confirms your place, you receive official instructions for the ${trip.currencySymbol}${trip.depositPerPerson} deposit per traveller. The remaining ${trip.currencySymbol}${trip.balancePerPerson} is due by ${trip.balanceDeadline}.`,
  },
  {
    question: "When is my place confirmed?",
    answer:
      "Your registration is provisional once the deposit is received and fully confirmed after full payment.",
  },
  {
    question: "Where and when do we meet?",
    answer: `At ${trip.pickupLocation}, Accra. Check in from ${trip.checkInTime} for a prompt ${trip.departureTime} departure. We expect to return around 7:00 p.m., depending on traffic.`,
  },
  {
    question: "What is included in the price?",
    answer: `${trip.inclusions.join(", ")}.`,
  },
  {
    question: "Can I register for a group?",
    answer:
      "Yes. Submit one form and enter the number of travellers. TransVista arranges vehicle size according to confirmed paid attendance.",
  },
  {
    question: "Will I appear in photos or videos?",
    answer:
      "A guided photo and video experience is part of the trip and may happen in shared group areas. Using identifiable images of you for promotion is optional and needs your consent on the form.",
  },
  {
    question: "What if I can't make it after paying?",
    answer:
      "Cancellations, transfers and travel credit follow the TransVista Payment, Booking & Refund Policy, linked in the booking terms on this page.",
  },
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Event",
    name: trip.title,
    startDate: `${trip.date}T05:30:00+00:00`,
    endDate: `${trip.date}T19:00:00+00:00`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: [`${seoConfig.url}${trip.image}`],
    description: metadata.description,
    location: {
      "@type": "Place",
      name: trip.pickupLocation,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Accra",
        addressCountry: "GH",
      },
    },
    organizer: {
      "@type": "Organization",
      name: seoConfig.name,
      url: seoConfig.url,
    },
    offers: {
      "@type": "Offer",
      price: trip.pricePerPerson,
      priceCurrency: trip.currency,
      availability: "https://schema.org/InStock",
      url: tripUrl,
      validThrough: `${trip.registrationDeadlineIso}T23:59:59+00:00`,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  },
];

export default function CentralRegionTripPage() {
  return (
    <main id="main-content" className="bg-[#fffdfa]">
      <section className="relative min-h-[520px] overflow-hidden bg-slate-950">
        <Image
          src={trip.image}
          alt={trip.imageAlt}
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/30" />
        <Container className="relative flex min-h-[520px] items-center py-16">
          <div className="max-w-3xl text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange-300">
              Upcoming group trip · Open registration
            </p>
            <h1 className="font-display mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {trip.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              Rainforest adventure, two historic castles, shared meals, and a
              guided photo and video experience—all in one thoughtfully
              coordinated day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#register"
                className="inline-flex h-12 items-center justify-center rounded-full bg-brand-orange-600 px-7 text-base font-semibold text-white shadow-lg transition hover:bg-brand-orange-600__"
              >
                Reserve my spot
              </a>
              <span className="inline-flex h-12 items-center rounded-full border border-white/20 bg-white/10 px-5 text-base font-semibold backdrop-blur-sm">
                {trip.currencySymbol}{trip.pricePerPerson} per person
              </span>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <RegistrationCountdown deadlineIso={trip.registrationDeadlineIso} />
              <ShareTripButton
                title={trip.title}
                text={`Join me on the TransVista ${trip.shortTitle}: ${trip.displayDate}, ${trip.currencySymbol}${trip.pricePerPerson} per person.`}
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-slate-200 bg-white py-8">
        <Container>
          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Fact icon={CalendarDays} label="Date" value={trip.displayDate} />
            <Fact icon={MapPin} label="Pickup" value={trip.pickupLocation} />
            <Fact icon={Clock3} label="Departure" value={trip.departureTime} />
            <Fact icon={Bus} label="Return" value={trip.expectedReturnTime} />
          </dl>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
            <a
              href={tripMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-slate-800 transition hover:bg-slate-50"
            >
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Pickup on Google Maps
            </a>
            <a
              href={tripGoogleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-slate-800 transition hover:bg-slate-50"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              Add to Google Calendar
            </a>
            <a
              href={tripIcsPath}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-slate-800 transition hover:bg-slate-50"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              Apple / Outlook calendar
            </a>
          </div>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-orange-700">
                Your day
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold text-slate-900">
                Four destinations, one connected route
              </h2>
              <div className="mt-8 space-y-4">
                {trip.itinerary.map((item, index) => (
                  <article
                    key={item.title}
                    className="grid grid-cols-[auto_1fr] gap-4 rounded-[20px] border border-slate-200 bg-white p-5"
                  >
                    <span className="font-display flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue-800 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.detail}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-500">
                The sequence may change to account for traffic, attraction
                access, group movement, and safety.
              </p>
            </div>

            <div>
              <div className="rounded-[28px] bg-brand-blue-950 p-7 text-white sm:p-8">
                <h2 className="font-display text-2xl font-semibold">
                  What your {trip.currencySymbol}{trip.pricePerPerson} includes
                </h2>
                <ul className="mt-6 space-y-3">
                  {trip.inclusions.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-slate-200">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <span className="flex items-center gap-3 text-sm text-slate-200">
                    <Utensils className="h-5 w-5 text-brand-orange-300" />
                    Breakfast, lunch, snacks
                  </span>
                  <span className="flex items-center gap-3 text-sm text-slate-200">
                    <Camera className="h-5 w-5 text-brand-orange-300" />
                    Photo-shoot and video moments
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <PackageTerms terms={trip.packageTerms} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-slate-200 py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-semibold text-slate-900">
              Questions travellers ask
            </h2>
            <div className="mt-6 divide-y divide-slate-200 rounded-[24px] border border-slate-200 bg-white">
              {faqs.map((faq) => (
                <details key={faq.question} className="group p-5 sm:p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-slate-900">
                    {faq.question}
                    <ChevronDown
                      className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-slate-200 bg-white py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-brand-orange-700">
              Registration closes {trip.registrationDeadline}
            </p>
            <h2 className="font-display mt-3 text-center text-3xl font-semibold text-slate-900">
              Request your place
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-base leading-7 text-slate-600">
              Submit one form for yourself or your group. TransVista will
              confirm availability before requesting any deposit.
            </p>
            <div className="mt-8">
              <PackageReservationForm trip={trip} />
            </div>
          </div>
        </Container>
      </section>
      <StickyReserveBar
        priceLabel={`${trip.currencySymbol}${trip.pricePerPerson} / person`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-3 text-sm font-semibold text-slate-900">
        <Icon className="h-5 w-5 shrink-0 text-brand-blue-700" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 pl-8 text-sm leading-6 text-slate-600">{value}</dd>
    </div>
  );
}
