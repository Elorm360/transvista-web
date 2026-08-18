<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

`transvista-web` is a Next.js 16 (App Router + Turbopack) marketing/waitlist site.
The public landing page (`app/(public)/page.tsx`) with its "Join the TransVista
Family" waitlist form is the core product; `/admin/*` is a Supabase-auth-protected
dashboard, and transactional email goes through Resend.

Standard commands live in `package.json` scripts: `npm run dev` (dev server on
:3000), `npm run build`, `npm run lint`. Note: `npm run lint` currently reports
several pre-existing errors in the repo (e.g. `components/motion/Reveal.tsx`,
`scripts/generate-og.js`) — these are not caused by environment setup.

### Environment variables (`.env.local`, gitignored)

The app reads `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
`RESEND_API_KEY`. Create `.env.local` in the repo root pointing at the local
Supabase stack:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key from `supabase status`>
RESEND_API_KEY=re_local_dev_placeholder
```

- `RESEND_API_KEY` must be a **non-empty** string. The Resend client is
  constructed at module load (`lib/email/resend.ts`) and throws
  `Missing API Key` on an empty value, which makes the whole `joinWaitlist`
  server action fail before the DB insert. A dummy `re_...` value is enough:
  the email send then fails inside a try/catch and the lead still saves (the UI
  shows success with a "welcome email couldn't be delivered" note). Use a real
  key only if you need to actually send email.
- Restart `npm run dev` after editing `.env.local` — Next.js only reads env at
  server start.

### Local Supabase (required for the waitlist form / admin)

Docker and the `supabase` CLI are preinstalled in the image. On a fresh VM boot
(no systemd), bring the stack up in this order:

1. Start the Docker daemon if `docker info` fails: `sudo dockerd` (run it in a
   background tmux session) and `sudo chmod 666 /var/run/docker.sock`.
2. From the repo root: `supabase start` (applies `supabase/migrations/*` and
   prints the API URL + anon key; `supabase status` reprints them).
3. **Grant caveat (non-obvious):** current Supabase no longer auto-grants the
   `anon` role privileges on newly created tables, so the anon waitlist insert
   fails with `42501 permission denied` using only the committed migration. The
   grant is intentionally NOT committed to the app migrations; apply it to the
   local DB after `supabase start` / `supabase db reset`:
   `docker exec supabase_db_workspace psql -U postgres -d postgres -c "GRANT SELECT, INSERT ON public.leads TO anon, authenticated;"`
4. Inspect data with `docker exec supabase_db_workspace psql -U postgres -d postgres -c "SELECT * FROM public.leads;"`; Studio is at http://127.0.0.1:54323.

The `/admin/*` dashboard additionally needs a Supabase auth user; it is optional
for verifying the core waitlist flow.
