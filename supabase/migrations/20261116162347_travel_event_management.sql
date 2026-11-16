create table public.travel_events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) between 3 and 120),
  title text not null check (char_length(btrim(title)) between 3 and 160),
  region text not null check (char_length(btrim(region)) between 2 and 100),
  summary text not null check (char_length(btrim(summary)) between 20 and 500),
  description text check (description is null or char_length(description) <= 5000),
  start_date date not null,
  end_date date,
  registration_deadline date,
  price_amount numeric(12,2) not null check (price_amount >= 0),
  currency text not null default 'GHS' check (currency in ('GHS','USD','EUR','GBP')),
  capacity integer check (capacity is null or capacity between 1 and 10000),
  pickup_location text check (pickup_location is null or char_length(pickup_location) <= 240),
  image_path text check (image_path is null or (image_path like '/images/%' and image_path not like '%..%')),
  image_alt text check (image_alt is null or char_length(image_alt) <= 240),
  inclusions text[] not null default '{}',
  itinerary jsonb not null default '[]'::jsonb check (jsonb_typeof(itinerary) = 'array'),
  status text not null default 'draft' check (status in ('draft','published','registration_closed','completed','cancelled')),
  featured boolean not null default false,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint travel_events_valid_date_range check (end_date is null or end_date >= start_date),
  constraint travel_events_deadline_range check (registration_deadline is null or registration_deadline <= start_date)
);

create index travel_events_public_listing_idx
  on public.travel_events (start_date asc)
  where status in ('published','registration_closed');

create index travel_events_archive_idx
  on public.travel_events (start_date desc)
  where status = 'completed';

alter table public.travel_events enable row level security;
revoke all on table public.travel_events from public, anon, authenticated;
grant all on table public.travel_events to service_role;

comment on table public.travel_events is
  'TransVista group event catalogue and lifecycle. Access is mediated by trusted server-side actions; never expose draft or operational event records directly through the Data API.';