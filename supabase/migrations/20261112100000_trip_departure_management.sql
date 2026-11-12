-- First-class departure operations.
-- Bookings remain the commercial records; departures become the shared operational unit.
-- No existing booking, payment, or trip-operation records are rewritten by this migration.

create table if not exists public.trip_departures (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default (
    'TVA-DEP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  ),
  title text not null check (char_length(btrim(title)) between 2 and 160),
  departure_date date not null,
  return_date date,
  scheduled_start_at timestamptz,
  scheduled_end_at timestamptz,
  meeting_point text,
  transport_provider text,
  driver_name text,
  driver_phone text,
  driver_verified boolean not null default false,
  vehicle_type text,
  vehicle_registration text,
  operations_lead_id uuid references public.admin_team_members(id) on delete set null,
  status text not null default 'planning'
    check (status in ('planning', 'confirmed', 'ready', 'underway', 'completed', 'cancelled')),
  operations_notes text,
  created_by uuid references public.admin_team_members(id) on delete set null,
  updated_by uuid references public.admin_team_members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_departures_valid_dates
    check (return_date is null or return_date >= departure_date),
  constraint trip_departures_valid_schedule
    check (scheduled_start_at is null or scheduled_end_at is null or scheduled_end_at >= scheduled_start_at),
  constraint trip_departures_driver_verification
    check (not driver_verified or (nullif(btrim(driver_name), '') is not null and nullif(btrim(driver_phone), '') is not null))
);

create index if not exists trip_departures_schedule_idx
  on public.trip_departures (departure_date, status);

create index if not exists trip_departures_operations_lead_idx
  on public.trip_departures (operations_lead_id)
  where operations_lead_id is not null;

create table if not exists public.trip_departure_bookings (
  id uuid primary key default gen_random_uuid(),
  departure_id uuid not null references public.trip_departures(id) on delete cascade,
  request_kind text not null check (request_kind in ('custom', 'package')),
  request_id bigint not null check (request_id > 0),
  added_by uuid references public.admin_team_members(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint trip_departure_bookings_unique_booking unique (request_kind, request_id),
  constraint trip_departure_bookings_unique_link unique (departure_id, request_kind, request_id)
);

create index if not exists trip_departure_bookings_departure_idx
  on public.trip_departure_bookings (departure_id);

create table if not exists public.trip_departure_checklist_items (
  id uuid primary key default gen_random_uuid(),
  departure_id uuid not null references public.trip_departures(id) on delete cascade,
  item_key text not null check (char_length(item_key) between 2 and 80),
  label text not null check (char_length(label) between 2 and 160),
  position smallint not null default 0,
  is_complete boolean not null default false,
  completed_by uuid references public.admin_team_members(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint trip_departure_checklist_unique_item unique (departure_id, item_key),
  constraint trip_departure_checklist_completion
    check ((is_complete and completed_at is not null) or (not is_complete and completed_at is null))
);

create index if not exists trip_departure_checklist_departure_idx
  on public.trip_departure_checklist_items (departure_id, position);

alter table public.trip_departures enable row level security;
alter table public.trip_departure_bookings enable row level security;
alter table public.trip_departure_checklist_items enable row level security;

revoke all on public.trip_departures from anon, public;
revoke all on public.trip_departure_bookings from anon, public;
revoke all on public.trip_departure_checklist_items from anon, public;

grant select, insert, update, delete on public.trip_departures to authenticated;
grant select, insert, delete on public.trip_departure_bookings to authenticated;
grant select, insert, update on public.trip_departure_checklist_items to authenticated;

drop policy if exists "Active operations staff can view departures" on public.trip_departures;
create policy "Active operations staff can view departures"
  on public.trip_departures for select to authenticated
  using (
    exists (
      select 1 from public.admin_team_members member
      where member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role in ('owner', 'admin', 'support')
    )
    and not exists (
      select 1 from public.trip_departure_bookings link
      where link.departure_id = trip_departures.id
    )
  );

drop policy if exists "Active operations staff can create departures" on public.trip_departures;
create policy "Active operations staff can create departures"
  on public.trip_departures for insert to authenticated
  with check (
    exists (
      select 1 from public.admin_team_members member
      where member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role in ('owner', 'admin', 'support')
        and member.id = created_by
    )
  );

drop policy if exists "Active operations staff can update departures" on public.trip_departures;
create policy "Active operations staff can update departures"
  on public.trip_departures for update to authenticated
  using (
    exists (
      select 1 from public.admin_team_members member
      where member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role in ('owner', 'admin', 'support')
    )
  )
  with check (
    exists (
      select 1 from public.admin_team_members member
      where member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role in ('owner', 'admin', 'support')
    )
  );

drop policy if exists "Active operations staff can view departure bookings" on public.trip_departure_bookings;
create policy "Active operations staff can view departure bookings"
  on public.trip_departure_bookings for select to authenticated
  using (
    exists (
      select 1 from public.admin_team_members member
      where member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role in ('owner', 'admin', 'support')
    )
  );

drop policy if exists "Active operations staff can link departure bookings" on public.trip_departure_bookings;
create policy "Active operations staff can link departure bookings"
  on public.trip_departure_bookings for insert to authenticated
  with check (
    exists (
      select 1 from public.admin_team_members member
      where member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role in ('owner', 'admin', 'support')
        and member.id = added_by
    )
  );

drop policy if exists "Active operations staff can unlink departure bookings" on public.trip_departure_bookings;
create policy "Active operations staff can unlink departure bookings"
  on public.trip_departure_bookings for delete to authenticated
  using (
    exists (
      select 1 from public.admin_team_members member
      where member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role in ('owner', 'admin', 'support')
    )
  );

drop policy if exists "Active operations staff can view departure checklist" on public.trip_departure_checklist_items;
create policy "Active operations staff can view departure checklist"
  on public.trip_departure_checklist_items for select to authenticated
  using (
    exists (
      select 1 from public.admin_team_members member
      where member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role in ('owner', 'admin', 'support')
    )
  );

drop policy if exists "Active operations staff can create departure checklist" on public.trip_departure_checklist_items;
create policy "Active operations staff can create departure checklist"
  on public.trip_departure_checklist_items for insert to authenticated
  with check (
    exists (
      select 1 from public.admin_team_members member
      where member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role in ('owner', 'admin', 'support')
    )
  );

drop policy if exists "Active operations staff can update departure checklist" on public.trip_departure_checklist_items;
create policy "Active operations staff can update departure checklist"
  on public.trip_departure_checklist_items for update to authenticated
  using (
    exists (
      select 1 from public.admin_team_members member
      where member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role in ('owner', 'admin', 'support')
    )
  )
  with check (
    exists (
      select 1 from public.admin_team_members member
      where member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role in ('owner', 'admin', 'support')
    )
  );


drop policy if exists "Active operations staff can delete unlinked departures" on public.trip_departures;
create policy "Active operations staff can delete empty departures"
  on public.trip_departures for delete to authenticated
  using (
    exists (
      select 1 from public.admin_team_members member
      where member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role in ('owner', 'admin', 'support')
    )
  );
