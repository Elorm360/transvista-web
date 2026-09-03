-- Cover booking-operations foreign keys used for audit and staff attribution.

create index if not exists trip_requests_payment_verified_by_idx
  on public.trip_requests (payment_verified_by);

create index if not exists trip_requests_updated_by_idx
  on public.trip_requests (updated_by);

create index if not exists package_reservations_payment_verified_by_idx
  on public.package_reservations (payment_verified_by);

create index if not exists package_reservations_updated_by_idx
  on public.package_reservations (updated_by);

create index if not exists request_activity_author_member_id_idx
  on public.request_activity (author_member_id);
