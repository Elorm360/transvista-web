alter table public.travel_events
  drop column if exists created_by,
  drop column if exists updated_by;

revoke all on table public.travel_events from public;
grant select on table public.travel_events to anon, authenticated;
grant insert, update on table public.travel_events to authenticated;
grant all on table public.travel_events to service_role;

drop policy if exists "Public can view published travel events" on public.travel_events;
drop policy if exists "Authenticated users can view public or admin event records" on public.travel_events;
drop policy if exists "Active owners and admins can create travel events" on public.travel_events;
drop policy if exists "Active owners and admins can update travel events" on public.travel_events;

create policy "Public can view published travel events"
  on public.travel_events for select
  to anon
  using (status in ('published','registration_closed','completed'));

create policy "Authenticated users can view public or admin event records"
  on public.travel_events for select
  to authenticated
  using (
    status in ('published','registration_closed','completed')
    or exists (
      select 1 from public.admin_team_members member
      where member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role in ('owner','admin')
    )
  );

create policy "Active owners and admins can create travel events"
  on public.travel_events for insert
  to authenticated
  with check (
    exists (
      select 1 from public.admin_team_members member
      where member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role in ('owner','admin')
    )
  );

create policy "Active owners and admins can update travel events"
  on public.travel_events for update
  to authenticated
  using (
    exists (
      select 1 from public.admin_team_members member
      where member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role in ('owner','admin')
    )
  )
  with check (
    exists (
      select 1 from public.admin_team_members member
      where member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role in ('owner','admin')
    )
  );