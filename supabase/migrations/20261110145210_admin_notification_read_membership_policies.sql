-- Restrict notification read receipts to active TransVista team members.
-- The primary key already covers user_id + notification_key lookups.

drop index if exists public.admin_notification_reads_user_read_at_idx;

drop policy if exists "Team members can view their notification read states" on public.admin_notification_reads;
create policy "Active team members can view their notification read states"
on public.admin_notification_reads
for select
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.admin_team_members member
    where member.user_id = (select auth.uid()) and member.status = 'active'
  )
);

drop policy if exists "Team members can mark their notifications as read" on public.admin_notification_reads;
create policy "Active team members can mark their notifications as read"
on public.admin_notification_reads
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.admin_team_members member
    where member.user_id = (select auth.uid()) and member.status = 'active'
  )
);

drop policy if exists "Team members can update their notification read states" on public.admin_notification_reads;
create policy "Active team members can update their notification read states"
on public.admin_notification_reads
for update
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.admin_team_members member
    where member.user_id = (select auth.uid()) and member.status = 'active'
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.admin_team_members member
    where member.user_id = (select auth.uid()) and member.status = 'active'
  )
);
