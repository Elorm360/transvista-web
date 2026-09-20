This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Trip companion pilot

The optional companion on `/plan` calls `/api/ai/trip-plan`. The Flutter app calls the same URL. The endpoint returns a draft from curated destination highlights; the existing request form and TransVista's 48-hour confirmation remain the booking path. No model key or Supabase service-role key belongs in browser or mobile code.

Before enabling the companion, set these **server-only** variables in the hosting environment:

- `OPENAI_API_KEY`: server API key with spending limits.
- `OPENAI_MODEL`: a model supporting the Responses API and JSON schema output (for example `gpt-4.1-mini`).
- `SUPABASE_SERVICE_ROLE_KEY`: service-role key, used only by the server for `consume_ai_planner_quota`.
- `AI_RATE_LIMIT_SECRET`: random, private string of at least 32 characters for hashing client IPs. Use a dedicated value, distinct from API keys.

Apply `supabase/migrations/20260920121105_ai_planner_quota.sql` to the intended Supabase project. The connected TransVista project already has this migration applied. The endpoint is unavailable until all four server variables are present. It accepts five drafts per hashed client IP per UTC day, with a global cap of 100 per UTC day. The quota table stores only hashes and counts; clean up old days periodically. Review model spend, CORS policy, and abuse telemetry before a public launch.

For local Flutter testing, run `flutter pub get` in `apps/flutter_mobile`. Point at a test web server with `--dart-define=AI_PLANNER_URL=https://your-test-host/api/ai/trip-plan`; the default is the TransVista production domain. Verify a generated draft can be edited and included in a trip request before merging.
