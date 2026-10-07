-- Run request retention RPCs with the caller's permissions and RLS policies.
alter function public.set_request_archive(text, bigint, boolean, text)
  security invoker;
alter function public.delete_archived_request(text, bigint, text)
  security invoker;

grant update, delete on table public.trip_requests to authenticated;
grant update, delete on table public.package_reservations to authenticated;

drop policy if exists "Owner can permanently delete trip requests"
  on public.trip_requests;
create policy "Owner can permanently delete trip requests"
  on public.trip_requests
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.admin_team_members member
      where member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role = 'owner'
    )
  );

drop policy if exists "Owner can permanently delete package reservations"
  on public.package_reservations;
create policy "Owner can permanently delete package reservations"
  on public.package_reservations
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.admin_team_members member
      where member.user_id = (select auth.uid())
        and member.status = 'active'
        and member.role = 'owner'
    )
  );

create index if not exists trip_requests_archived_by_idx
  on public.trip_requests (archived_by);
create index if not exists package_reservations_archived_by_idx
  on public.package_reservations (archived_by);
