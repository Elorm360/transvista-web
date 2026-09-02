import { centralRegionPackage } from "@/lib/travel/packages";

export type UpcomingEvent = {
  id: string;
  title: string;
  eyebrow: string;
  dateLabel: string;
  registrationDeadline: string;
  registrationDeadlineIso: string;
  priceLabel: string;
  summary: string;
  href: string;
  image: string;
  imageAlt: string;
};

export const upcomingEvents: UpcomingEvent[] = [
  {
    id: centralRegionPackage.slug,
    title: centralRegionPackage.title,
    eyebrow: "Upcoming group trip",
    dateLabel: centralRegionPackage.displayDate,
    registrationDeadline: centralRegionPackage.registrationDeadline,
    registrationDeadlineIso: "2026-11-01",
    priceLabel: `${centralRegionPackage.currencySymbol}${centralRegionPackage.pricePerPerson} per person`,
    summary:
      "Kakum National Park, Hans Cottage Botel, Cape Coast Castle and Elmina Castle—with meals, transport, photography and a short-form video experience.",
    href: `/trips/${centralRegionPackage.slug}`,
    image: centralRegionPackage.image,
    imageAlt: centralRegionPackage.imageAlt,
  },
];