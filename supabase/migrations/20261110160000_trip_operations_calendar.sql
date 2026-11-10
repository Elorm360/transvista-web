create table if not exists public.trip_operation_details (
  id uuid primary key default gen_random_uuid(),
  request_kind text not null check (request_kind in ('custom', 'package')),
  request_id bigint not null check (request_id > 0),
  operations_lead_id uuid references public.admin_team_members(id) on delete set null,
  scheduled_start_at timestamptz,
  scheduled_end_at timestamptz,
  meeting_point text,
  transport_provider text,
  driver_name text,
  driver_phone text,
  vehicle_type text,
  vehicle_registration text,
  operational_status text not null default 'planning'
    check (operational_status in ('planning', 'ready', 'underway', 'completed', 'cancelled')),
  operations_notes text,
  updated_by uuid references public.admin_team_members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_operation_details_unique_booking unique (request_kind, request_id),
  constraint trip_operation_details_valid_schedule
    check (scheduled_start_at is null or scheduled_end_at is null or scheduled_end_at >= scheduled_start_at)
);

create index if not exists trip_operation_details_schedule_idx
  on public.trip_operation_details (scheduled_start_at);

create index if not exists trip_operation_details_lead_idx
  on public.trip_operation_details (operations_lead_id);

alter table public.trip_operation_details enable row level security;
revoke all on public.trip_operation_details from anon, public;
grant select, insert, update on public.trip_operation_details to authenticated;

drop policy if exists "Active operations staff can view trip operations" on public.trip_operation_details;
create policy "Active operations staff can view trip operations"
  on public.trip_operation_details for select to authenticated
  using (
    exists (
      select 1 from public.admin_team_members m
      where m.user_id = (select auth.uid())
        and m.status = 'active'
        and m.role in ('owner', 'admin', 'support')
    )
  );

drop policy if exists "Active operations staff can create trip operations" on public.trip_operation_details;
create policy "Active operations staff can create trip operations"
  on public.trip_operation_details for insert to authenticated
  with check (
    exists (
      select 1 from public.admin_team_members m
      where m.user_id = (select auth.uid())
        and m.status = 'active'
        and m.role in ('owner', 'admin', 'support')
    )
  );

drop policy if exists "Active operations staff can update trip operations" on public.trip_operation_details;
create policy "Active operations staff can update trip operations"
  on public.trip_operation_details for update to authenticated
  using (
    exists (
      select 1 from public.admin_team_members m
      where m.user_id = (select auth.uid())
        and m.status = 'active'
        and m.role in ('owner', 'admin', 'support')
    )
  )
  with check (
    exists (
      select 1 from public.admin_team_members m
      where m.user_id = (select auth.uid())
        and m.status = 'active'
        and m.role in ('owner', 'admin', 'support')
    )
  );