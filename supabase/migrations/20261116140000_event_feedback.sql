create table if not exists public.event_feedback (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null check (char_length(btrim(event_slug)) between 2 and 120),
  event_title text not null check (char_length(btrim(event_title)) between 2 and 160),
  booking_reference text not null check (char_length(btrim(booking_reference)) between 3 and 40),
  full_name text not null check (char_length(btrim(full_name)) between 2 and 120),
  email text not null check (position('@' in email) > 1),
  overall_rating smallint not null check (overall_rating between 1 and 5),
  transport_rating smallint not null check (transport_rating between 1 and 5),
  organisation_rating smallint not null check (organisation_rating between 1 and 5),
  itinerary_rating smallint not null check (itinerary_rating between 1 and 5),
  guide_rating smallint not null check (guide_rating between 1 and 5),
  value_rating smallint not null check (value_rating between 1 and 5),
  recommendation_score smallint not null check (recommendation_score between 0 and 10),
  favourite_part text check (favourite_part is null or char_length(favourite_part) <= 1200),
  improvement_suggestion text check (improvement_suggestion is null or char_length(improvement_suggestion) <= 1200),
  would_travel_again text not null check (would_travel_again in ('yes', 'maybe', 'no')),
  next_destination_interest text check (next_destination_interest is null or char_length(next_destination_interest) <= 240),
  created_at timestamptz not null default now()
);

comment on table public.event_feedback is
  'Private post-event feedback. Submitted only after server-side booking-reference and email verification; never published as a testimonial.';

create unique index if not exists event_feedback_event_booking_key
  on public.event_feedback (event_slug, upper(booking_reference));

create index if not exists event_feedback_event_created_idx
  on public.event_feedback (event_slug, created_at desc);

alter table public.event_feedback enable row level security;

-- This table is deliberately server-only. Public and signed-in clients cannot
-- read or submit feedback directly; trusted server actions use the service role.
revoke all on table public.event_feedback from public, anon, authenticated;
grant all on table public.event_feedback to service_role;
