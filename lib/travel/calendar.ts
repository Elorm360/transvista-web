import { centralRegionPackage } from "@/lib/travel/packages";
import { seoConfig } from "@/constants/config/seo";

const trip = centralRegionPackage;
const tripUrl = `${seoConfig.url}/trips/${trip.slug}`;

// Ghana is UTC+0 all year, so local times map directly to UTC.
const startUtc = `${trip.date.replaceAll("-", "")}T053000Z`;
const endUtc = `${trip.date.replaceAll("-", "")}T190000Z`;
const location = `${trip.pickupLocation}, Accra, Ghana`;
const details = `Pickup at ${trip.pickupLocation}: check in from ${trip.checkInTime}, departure ${trip.departureTime}. Details: ${tripUrl}`;

export const tripMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

export const tripGoogleCalendarUrl =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  `&text=${encodeURIComponent(`TransVista: ${trip.title}`)}` +
  `&dates=${startUtc}/${endUtc}` +
  `&details=${encodeURIComponent(details)}` +
  `&location=${encodeURIComponent(location)}`;

export const tripIcsPath = `/trips/${trip.slug}/calendar.ics`;

function escapeIcs(value: string) {
  return value.replace(/[\\,;]/g, (match) => `\\${match}`);
}

export function tripIcs() {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TransVista Africa//Group Trips//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${trip.slug}@transvistaafrica.com`,
    `DTSTAMP:${startUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${escapeIcs(`TransVista: ${trip.title}`)}`,
    `LOCATION:${escapeIcs(location)}`,
    `DESCRIPTION:${escapeIcs(details)}`,
    `URL:${tripUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
