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

/**
 * Only confirmed, approved departures belong here.
 * Completed events are recorded in lib/events/past-events.ts instead.
 */
export const upcomingEvents: UpcomingEvent[] = [];
