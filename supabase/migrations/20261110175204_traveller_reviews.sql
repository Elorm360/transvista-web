-- Traveller reviews shown on the website.
-- Submissions are written ONLY by the website server (service role) after validation
-- and booking verification. The public can read approved reviews' safe columns only.
create table public.traveller_reviews (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(btrim(full_name)) between 2 and 80),
  location text check (location is null or char_length(location) <= 80),
  trip_name text not null check (char_length(btrim(trip_name)) between 2 and 120),
  rating smallint not null check (rating between 1 and 5),
  review text not null check (char_length(btrim(review)) between 20 and 1200),
  email text check (email is null or position('@' in email) > 1),
  booking_reference text check (booking_reference is null or char_length(booking_reference) <= 40),
  verified boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  consent_to_publish boolean not null check (consent_to_publish),
  reviewed_by uuid references public.admin_team_members(id) on delete set null,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index traveller_reviews_booking_reference_key
  on public.traveller_reviews (upper(booking_reference)) where booking_reference is not null;
create index traveller_reviews_published_idx
  on public.traveller_reviews (published_at desc) where status = 'approved';
create index traveller_reviews_status_idx on public.traveller_reviews (status, created_at desc);
create index traveller_reviews_reviewed_by_idx on public.traveller_reviews (reviewed_by);

alter table public.traveller_reviews enable row level security;

revoke all on public.traveller_reviews from anon, authenticated, public;
grant select (id, full_name, location, trip_name, rating, review, verified, status, published_at)
  on public.traveller_reviews to anon, authenticated;
grant select, update (status, reviewed_by, reviewed_at, published_at)
  on public.traveller_reviews to authenticated;

create policy "Public can read approved reviews"
  on public.traveller_reviews for select to anon, authenticated
  using (status = 'approved');

create policy "Review team can read all reviews"
  on public.traveller_reviews for select to authenticated
  using (exists (
    select 1 from public.admin_team_members m
    where m.user_id = (select auth.uid()) and m.status = 'active'
      and m.role in ('owner', 'admin', 'community_manager')));

create policy "Review team can moderate reviews"
  on public.traveller_reviews for update to authenticated
  using (exists (
    select 1 from public.admin_team_members m
    where m.user_id = (select auth.uid()) and m.status = 'active'
      and m.role in ('owner', 'admin', 'community_manager')))
  with check (exists (
    select 1 from public.admin_team_members m
    where m.user_id = (select auth.uid()) and m.status = 'active'
      and m.role in ('owner', 'admin', 'community_manager')));

comment on table public.traveller_reviews is
  'Traveller reviews. Inserted by the website server only. Verified (booking reference + email match) reviews auto-publish; others need staff approval.';
