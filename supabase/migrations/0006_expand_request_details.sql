alter table public.trip_requests
  add column if not exists transport_details text;

alter table public.package_reservations
  add column if not exists package_date date,
  add column if not exists city text,
  add column if not exists balance_per_person integer
    check (balance_per_person is null or balance_per_person >= 0);