import { tripIcs } from "@/lib/travel/calendar";

export const dynamic = "force-static";

export function GET() {
  return new Response(tripIcs(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="transvista-central-region-trip.ics"',
    },
  });
}
