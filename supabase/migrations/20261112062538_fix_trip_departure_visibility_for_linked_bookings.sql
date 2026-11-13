-- Allow active operations staff to view departures whether or not bookings are linked.
-- Booking links are part of the normal departure lifecycle and must not hide the parent record.

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
  );
