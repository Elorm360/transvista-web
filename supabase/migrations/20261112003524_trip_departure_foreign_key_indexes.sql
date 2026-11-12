create index if not exists trip_departure_bookings_added_by_idx
  on public.trip_departure_bookings (added_by)
  where added_by is not null;

create index if not exists trip_departure_checklist_items_completed_by_idx
  on public.trip_departure_checklist_items (completed_by)
  where completed_by is not null;

create index if not exists trip_departures_created_by_idx
  on public.trip_departures (created_by)
  where created_by is not null;

create index if not exists trip_departures_updated_by_idx
  on public.trip_departures (updated_by)
  where updated_by is not null;
