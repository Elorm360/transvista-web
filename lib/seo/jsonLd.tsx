import { seoConfig } from "@/constants/config/seo";
import type { Destination } from "@/constants/data/destinations";
import type { Experience } from "@/constants/data/experiences";

/**
 * Structured data (schema.org JSON-LD) helpers.
 *
 * These tell search engines what a page is about — a destination, a
 * curated trip, a dated group event — so results can show richer
 * snippets (dates, prices, breadcrumbs).
 */

type JsonLdObject = Record<string, unknown>;

const ORGANIZATION_REF = {
  "@type": "Organization",
  name: seoConfig.name,
  url: seoConfig.url,
};

/** Make relative paths absolute; leave full URLs alone. */
function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${seoConfig.url}${path}`;
}

/**
 * Render JSON-LD safely. Some values come from the database, so escape
 * "<" to stop any string from closing the <script> tag early.
 */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export function breadcrumbSchema(
  items: Array<{ name: string; path: string }>,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function destinationSchema(destination: Destination): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: destination.name,
    description: destination.description,
    url: absoluteUrl(`/destinations/${destination.slug}`),
    ...(destination.image ? { image: absoluteUrl(destination.image) } : {}),
    touristType: destination.bestFor,
    includesAttraction: destination.highlights.map((name) => ({
      "@type": "TouristAttraction",
      name,
    })),
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: destination.region,
      containedInPlace: { "@type": "Country", name: "Ghana" },
    },
  };
}

export function experienceSchema(
  experience: Experience,
  destination?: Destination,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: experience.name,
    description: experience.description,
    url: absoluteUrl(`/experiences/${experience.slug}`),
    ...(experience.image ? { image: absoluteUrl(experience.image) } : {}),
    touristType: experience.bestFor,
    provider: ORGANIZATION_REF,
    ...(destination
      ? {
          itinerary: {
            "@type": "TouristDestination",
            name: destination.name,
            url: absoluteUrl(`/destinations/${destination.slug}`),
          },
        }
      : {}),
  };
}

type GroupEvent = {
  slug: string;
  title: string;
  summary: string;
  region: string;
  start_date: string;
  end_date: string | null;
  price_amount: number | string;
  currency: string;
  pickup_location: string | null;
  image_path: string | null;
  status: string;
  registration_deadline?: string | null;
};

/** A dated, bookable group trip (Google "Event" rich result). */
export function groupEventSchema(event: GroupEvent): JsonLdObject {
  const url = absoluteUrl(`/trips/${event.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.summary,
    url,
    startDate: event.start_date,
    endDate: event.end_date ?? event.start_date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(event.image_path ? { image: absoluteUrl(event.image_path) } : {}),
    location: {
      "@type": "Place",
      name: event.pickup_location ?? event.region,
      address: {
        "@type": "PostalAddress",
        addressRegion: event.region,
        addressCountry: "GH",
      },
    },
    organizer: ORGANIZATION_REF,
    offers: {
      "@type": "Offer",
      url,
      price: Number(event.price_amount),
      priceCurrency: event.currency,
      availability:
        event.status === "registration_closed"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      ...(event.registration_deadline
        ? { validThrough: event.registration_deadline }
        : {}),
    },
  };
}

/** Site-wide WebSite entity (pairs with the Organization schema). */
export function websiteSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: seoConfig.name,
    url: seoConfig.url,
    publisher: ORGANIZATION_REF,
  };
}
