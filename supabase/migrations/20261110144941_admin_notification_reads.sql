-- Per-user read receipts for the in-app admin notification centre.
-- Notification content is derived from existing booking, payment and team activity records.

create table if not exists public.admin_notification_reads (
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_key text not null check (char_length(notification_key) between 1 and 200),
  read_at timestamptz not null default now(),
  primary key (user_id, notification_key)
);

create index if not exists admin_notification_reads_user_read_at_idx
  on public.admin_notification_reads (user_id, read_at desc);

alter table public.admin_notification_reads enable row level security;

revoke all on table public.admin_notification_reads from public, anon;
grant select, insert, update on table public.admin_notification_reads to authenticated;

drop policy if exists "Team members can view their notification read states" on public.admin_notification_reads;
create policy "Team members can view their notification read states"
on public.admin_notification_reads
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Team members can mark their notifications as read" on public.admin_notification_reads;
create policy "Team members can mark their notifications as read"
on public.admin_notification_reads
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Team members can update their notification read states" on public.admin_notification_reads;
create policy "Team members can update their notification read states"
on public.admin_notification_reads
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
