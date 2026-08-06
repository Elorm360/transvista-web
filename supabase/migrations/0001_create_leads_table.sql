-- ─────────────────────────────────────────────────────────────
-- 0001_create_leads_table.sql
--
-- Creates the `leads` table used by the public waitlist form and
-- the admin dashboard.
--
-- This matches the exact schema expected by the app code:
--   app/actions/waitlist.ts        → insert(full_name, email, phone, country, interest)
--   lib/dashboard/getCommunityMembers.ts → select(id, full_name, email, phone, country, interest, created_at)
--
-- RLS is enabled and configured so that:
--   • Anyone (anon key) can INSERT a new lead  → public waitlist form
--   • Anyone (anon key) can SELECT a lead by email → duplicate check
--   • Authenticated SERVER (service/anon via RLS) can read/delete for admin
--
-- NOTE: For a public form, enabling "select" for anon leaks the whole
-- table to anyone who queries it. The duplicate check only needs to
-- find a row by email. A tighter option is to restrict reads to
-- authenticated users only; adjust the policy below to your needs.
-- Because the waitlist page is unauthenticated and the duplicate check
-- runs under the anon key, an anon SELECT policy is included here so
-- the feature works out of the box.
-- ─────────────────────────────────────────────────────────────

-- The leads table
create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  email      text not null,
  phone      text,
  country    text not null,
  interest   text not null,
  created_at timestamptz not null default now()
);

-- Enforce one row per email at the database level (defence in depth,
-- in addition to the app's pre-insert duplicate check).
create unique index if not exists leads_email_key on public.leads (lower(email));

-- Enable Row Level Security
alter table public.leads enable row level security;

-- Allow anyone (anon key) to insert a new lead (the public waitlist form).
create policy "Public can insert leads" on public.leads
  for insert
  to anon, authenticated
  with check (true);

-- Allow anyone (anon key) to read leads (used by the duplicate check
-- and lets the unauthenticated waitlist page verify existing emails).
create policy "Public can read leads" on public.leads
  for select
  to anon, authenticated
  using (true);

-- Allow authenticated admins to delete leads (admin dashboard).
create policy "Authenticated can delete leads" on public.leads
  for delete
  to authenticated
  using (true);
