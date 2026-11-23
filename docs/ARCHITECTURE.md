# Architecture

One Next.js 16 app serves both the public website and the admin area.
Supabase holds the data and handles sign-in. Vercel hosts it.

```
Browser ──► Vercel (Next.js 16)
             ├─ proxy.ts ............ session refresh + /admin gate
             ├─ app/(public)/ ....... public site (mostly static / cached)
             ├─ app/admin/ .......... team area (server-rendered per request)
             └─ app/actions/ ........ server actions (all writes)
                    │
                    ├─► Supabase Postgres (RLS on every table)
                    ├─► Resend (email)      └─ emails/*.tsx templates
                    └─► Twilio (SMS)
```

## Folders

| Folder | What lives there |
|---|---|
| `app/(public)/` | Public pages: home, destinations, experiences, trips, past events, stories, plan, contact, legal |
| `app/admin/` | Admin pages. `layout.tsx` checks the user's role on every request. |
| `app/actions/` | Server actions. **All writes go through here.** The browser never writes to Supabase directly. |
| `components/` | UI, grouped by feature (`admin/`, `trips/`, `sections/home/`, …) |
| `constants/data/` | Editorial content as code: destinations, experiences, photos manifest |
| `content/` | Page copy (headings, labels, messages) |
| `lib/` | Data access (`dashboard/`), auth (`auth/`), email, SMS, SEO, security, Supabase clients |
| `emails/` | React Email templates |
| `supabase/migrations/` | SQL migrations, kept in sync with production |
| `scripts/` | Build guard, OG image and photo optimizer |
| `tests/e2e/` | Playwright tests |

## Supabase clients: use the right one

| Client | File | Use for |
|---|---|---|
| Server (cookies) | `lib/supabase/server.ts` | Anything that depends on who is signed in (admin pages, team actions). RLS applies as that user. |
| Public (no cookies) | `lib/supabase/public.ts` (added in PR #28) | Cacheable public pages. Always queries as `anon`, so cached HTML can never contain drafts. |
| Browser | `lib/supabase/client.ts` | Client components that need auth state |
| Admin (service role) | `lib/supabase/admin.ts` | **Server only.** Bypasses RLS. Used for invites, verified reviews and feedback, and rate limits. Do not use it for convenience. |

## Auth and roles

- **Sign-in:** Supabase Auth with email and password. Team members are
  invited (`app/actions/team-members.ts`) and set their password at
  `/invite/set-password`.
- **Gatekeeping:** `proxy.ts` (Next 16's middleware) runs on `/admin`,
  `/login`, `/invite` and `/auth/callback`. It refreshes the session and
  sends signed-out users to `/login`.
- **Roles** come from `admin_team_members` (`lib/auth/isAdmin.ts → roleFor`).
  `lib/auth/permissions.ts → canAccess(role, area)` is the single source of
  truth:

  | Area | owner | admin | support | community_manager |
  |---|:-:|:-:|:-:|:-:|
  | Dashboard | ✓ | ✓ | ✓ | ✓ |
  | Requests, payments | ✓ | ✓ | ✓ | |
  | Community (waitlist) | ✓ | ✓ | | ✓ |
  | Events, analytics | ✓ | ✓ | | |
  | Settings (team) | ✓ | | | |

- **Defence in depth:** pages *and* server actions call `canAccess`, and
  database RLS policies repeat the same rules. Hiding a menu item is never
  the only protection.

## Data model (main tables)

| Table | Holds |
|---|---|
| `leads` | Waitlist / community sign-ups |
| `trip_requests` | Custom trip requests from `/plan` |
| `package_reservations` | Group-trip bookings |
| `package_payment_transactions` | Immutable payment ledger, plus audited corrections |
| `request_activity` | Audit trail for every booking change |
| `travel_events` | Group-trip catalogue: draft → published → registration_closed → completed |
| `trip_departures`, `trip_departure_bookings`, `trip_departure_checklist_items` | Shared departure operations |
| `trip_operation_details`, `transport_assignments` | Scheduling, drivers and vehicles |
| `traveller_reviews`, `event_feedback` | Public stories (verified ones auto-publish) and private post-trip feedback |
| `sms_messages` | SMS delivery audit |
| `admin_team_members`, `admin_notification_reads` | Team, roles and notification read state |
| `private.rate_limit_hits` | Public-form rate-limit counters (not exposed to the API) |

Some tables (`traveller_profiles`, `pricing_rate_cards`, `driver_applications`,
`ai_planner_usage`, …) are created by migrations that live outside this repo,
most likely the mobile app.

## Rendering and caching

- **Static at build:** destinations, experiences, legal pages.
- **ISR (refreshed every 5 minutes):** home and stories, plus trips and past
  events once PR #28 is merged (they render per request until then). Admin
  event actions call `revalidatePath`, so edits appear immediately.
- **Dynamic per request:** everything under `/admin`.
- `app/sitemap.ts` lists static pages plus published trips and events from
  the database. JSON-LD helpers are in `lib/seo/jsonLd.tsx`.

## Public forms

Waitlist, trip request, package reservation, event feedback and review.
Each one:

1. validates on the client, then **again on the server** (never trust the client);
2. drops bots silently with a hidden honeypot field (`website`);
3. is rate-limited per visitor, and per email address for forms that send
   email (`lib/security/rateLimit.ts`). Counters live in Supabase, so they
   hold across serverless instances. IPs and emails are HMAC-hashed before
   storage. If the check itself fails, the submission is allowed (fail
   open);
4. saves first, then sends email. An email failure never loses the lead.

## Security notes

- RLS is enabled on every table. Run the Supabase security advisor after
  any schema change.
- `SUPABASE_SERVICE_ROLE_KEY` is only read in server code. It must never be
  imported into a client component.
- `scripts/check-config-integrity.mjs` runs before every build. It blocks
  deploys if obfuscated code appears in config files again, after an
  incident in Nov 2026 where `postcss.config.mjs` was tampered with.
- Security headers are set in `next.config.ts`.
