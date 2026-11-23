# Changelog

Notable changes to the TransVista website and admin, newest first.
Compiled from git history; PR numbers refer to
[Elorm360/transvista-web](https://github.com/Elorm360/transvista-web/pulls).

## November 2026

### In review
- **Form protection:** rate limits on all five public forms (per visitor, and
  per email for forms that send email), a honeypot on the waitlist, and
  filled-in project docs.
- **Photos and colours (#29):** `npm run photos` drop-in photo pipeline, a
  compact placeholder for pages without photos, and brand colour tokens
  across the public site.
- **Performance and SEO (#28):** cached trip and past-event pages, a complete
  sitemap, structured data for destinations, experiences and trips, and
  0 lint errors.
- **Access and stats (#27):** waitlist access follows team roles, faster
  database permission checks, and correct "distinct countries / interests"
  on the dashboard.

### Shipped
- **Event feedback dashboard (#26):** NPS, category scores, destination
  demand, filters and CSV export.
- **Event Management Centre (#22, #23, #25):** create and publish group
  trips; a past-events archive with private, verified post-trip feedback;
  public-story invites.
- **Security (#24):** removed obfuscated code from the PostCSS config and
  added a build guard that blocks deploys if it reappears.
- **Shared trip departures (#19):** group bookings by departure, with
  checklists and calendar events.
- **Traveller stories (#18):** review photos and Adinkra avatars.
- **Operations:**
  - trip operations calendar;
  - booking search with saved views and bulk assignment;
  - role-aware notification centre;
  - Business Intelligence dashboard with payment reconciliation.
- **Payments:**
  - immutable payment ledger with audited corrections;
  - receipts;
  - the support role can record verified payments.
- **Admin redesign:** an operations control centre, a Smart Action Centre,
  and team onboarding and role guides.
- **Central Region trip (#14):** deadline extension with a live countdown,
  and a mobile trip pop-up.

## October 2026
- **Site quality pass (#11–#13):**
  - unified WhatsApp support and channel;
  - SEO and share previews;
  - form validation, accessibility fixes and legal pages;
  - cookieless analytics;
  - destination filters;
  - booking-conversion features;
  - editorial homepage and inner-page redesign.
- Safe admin clean-up for trip requests.

## September 2026
- **Trip planning (#8):** custom trip requests across all Ghana regions,
  booking policy, and package reservations.
- Admin booking operations and payment requests.
- Admin SMS messaging via Twilio, with a delivery audit.
- Verified traveller stories.

## August 2026
- **v1.0 launch (4 Aug):** landing page, community waitlist with welcome and
  admin emails, and an admin dashboard.
- Team members with role-based access, invites, and a branded invite email.
- Ghana destination pages and hero waitlist conversion.
- Mobile Safari stability fixes for the waitlist, an OG share image, and
  admin CSV export.
- Premium redesign: cinematic hero carousel and brand colour system.

## July 2026
- Project started: Next.js platform foundation, hero and "Why TransVista"
  sections.
