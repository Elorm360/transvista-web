-- Trip requests are high-intent traveler enquiries for a specific package.
-- Public visitors may insert, while only authenticated team members may read.

create table if not exists public.trip_requests (
  id uuid primary key default gen_random_uuid(),
  package_slug text not null,
  package_name text not null,
  full_name text not null,
  email text not null,
  phone text not null,
  country text not null,
  preferred_start_date date not null,
  traveler_count integer not null check (traveler_count between 1 and 40),
  budget_range text not null,
  notes text,
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'quotation_sent', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists trip_requests_created_at_idx
  on public.trip_requests (created_at desc);

alter table public.trip_requests enable row level security;

create policy "Public can create trip requests"
on public.trip_requests
for insert
to anon, authenticated
with check (status = 'new');

create policy "Authenticated team can view trip requests"
on public.trip_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_team_members team_member
    where team_member.user_id = auth.uid()
      and team_member.status = 'active'
  )
);
