# TransVista Africa — website and operations platform

The public site at [transvistaafrica.com](https://www.transvistaafrica.com)
and the admin area the TransVista team uses to run trips.

- **Public site:** destinations, curated experiences, group trips, past
  events, traveller stories, a custom trip-planning form, and the community
  waitlist.
- **Admin (`/admin`):** trip requests and bookings, payments and receipts,
  group-trip departures, events, SMS, reviews, feedback, the waitlist, the
  team and business intelligence. Access is role-based.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn / Base UI components |
| Data and auth | Supabase (Postgres with row-level security, Auth) |
| Email | Resend with React Email templates (`emails/`) |
| SMS | Twilio (`lib/sms/`) |
| Hosting | Vercel, with Vercel Analytics (cookieless) |
| Tests | Playwright end-to-end, with axe accessibility checks |

> **Next.js 16 differs from older versions.** Read the guides in
> `node_modules/next/dist/docs/` before changing routing, caching or
> middleware. For example, middleware is now `proxy.ts`.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Needed for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Everything |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Everything (public; RLS protects data) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only: team invites, reviews, event feedback, form rate limits. **Never expose it to the browser.** |
| `RESEND_API_KEY` | Sending email |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID` | Admin SMS |
| `NEXT_PUBLIC_SITE_URL` | Team-invite links. It defaults to `http://localhost:3000`, so it must be set in production. |

Without the service-role key, the features that need it are skipped locally.
Form rate limits, for example, let every submission through.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build. `prebuild` first runs `scripts/check-config-integrity.mjs`, which blocks the build if obfuscated code appears in config files. |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright tests on mobile and desktop. They start a production server, or test a deploy with `BASE_URL=…`. |
| `npm run photos` | Optimize original photos from `photos/` and put them on the site. See [docs/PHOTOS.md](docs/PHOTOS.md). |

## Database changes

Schema changes are SQL migrations in `supabase/migrations/`. Apply them to
the Supabase project, then commit the file with the same version timestamp,
so the repo always matches production.

## Deploying

Pushing to `main` deploys to production on Vercel. Each pull request gets a
preview deployment. Check the preview before merging.

## Docs

- [Architecture](docs/ARCHITECTURE.md): how the pieces fit, auth and roles,
  data, caching, security
- [Product bible](docs/PRODUCT_BIBLE.md): what TransVista is, who it serves,
  and how it sounds
- [Design system](docs/DESIGN_SYSTEM.md): type, colour, principles
- [Roadmap](docs/ROADMAP.md) and [changelog](docs/CHANGELOG.md)
- [Photos](docs/PHOTOS.md) and [event management](docs/EVENT-MANAGEMENT.md)
