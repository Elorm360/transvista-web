# TransVista Event Management

## Who can manage events
Only active TransVista Owner and Admin accounts can open **Admin → Event management**. Support and community roles do not have permission to create, edit or publish event records.

## Event lifecycle
- **Draft** — internal planning only; not shown on the public website.
- **Published** — appears on Upcoming Group Trips with its confirmed details and an enquiry link.
- **Registration closed** — remains visible for information, but the public page clearly says registration is closed.
- **Completed** — appears in Past Events. Its record is retained for the event archive.
- **Cancelled** — retained internally and not shown in the public upcoming or past-event listings.

Do not publish an event until management has approved its itinerary, operating partners, dates, pricing, pickup arrangements and registration plan.

## Creating an event
1. Open Admin → Event management.
2. Add the event title, region, summary and dates.
3. Enter the confirmed per-person price and currency. Leave capacity blank if it is not fixed.
4. Add the registration deadline and pickup point when confirmed.
5. Add inclusions one per line.
6. Add itinerary stops one per line using `Place | Description`.
7. Use an image path only after an approved real event image has been uploaded under `public/images/`. Do not use stock or generated images to imply that an event has already happened.
8. Save as Draft first. Change the status to Published only after management approval.

The URL slug is generated from the event title if it is left blank. Once created, it is kept stable to protect shared links.

## Public behaviour
Published events appear at `/trips` and have a detail page at `/trips/<slug>`. The page's WhatsApp action is an enquiry only; it does not create a booking or request payment. The TransVista team must confirm availability and explain payment steps separately.

When an event is completed, change its status to Completed. It is then listed under `/past-events`. Completed event records are not deleted.

## Preview and production
Preview deployments share the production database and are read-only. Use previews to review layout and content. Make event changes only in the authenticated production admin workspace.

## Records and privacy
Event records are stored separately from package reservations, payment transactions and attendee feedback. Editing event details does not change historic bookings or payment records. Never place attendee names, phone numbers, payment details or private feedback in event descriptions, itinerary fields or public media captions.
