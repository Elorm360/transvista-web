-- Audited, staff-controlled SMS messages for booking operations.

create table if not exists public.sms_messages (
  id uuid primary key default gen_random_uuid(),
  request_kind text not null check (request_kind in ('custom', 'package')),
  request_id bigint not null check (request_id > 0),
  reference text not null check (char_length(reference) between 1 and 100),
  recipient_phone text not null
    check (recipient_phone ~ '^\+[1-9][0-9]{7,14}$'),
  message_type text not null check (message_type in (
    'booking-update', 'payment-reminder', 'trip-reminder',
    'pickup-update', 'custom-operational'
  )),
  body text not null check (char_length(body) between 1 and 320),
  provider text not null default 'twilio'
    check (provider in ('twilio')),
  provider_message_id text,
  status text not null default 'queued' check (status in (
    'queued', 'accepted', 'scheduled', 'sending', 'sent',
    'delivered', 'undelivered', 'failed', 'canceled'
  )),
  failure_reason text check (
    failure_reason is null or char_length(failure_reason) <= 1000
  ),
  sent_by uuid not null
    references public.admin_team_members(id) on delete restrict,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.sms_messages enable row level security;

create index if not exists sms_messages_request_idx
  on public.sms_messages (request_kind, request_id, created_at desc);

create index if not exists sms_messages_created_idx
  on public.sms_messages (created_at desc);

create unique index if not exists sms_messages_provider_id_idx
  on public.sms_messages (provider, provider_message_id)
  where provider_message_id is not null;

revoke all on table public.sms_messages from public, anon, authenticated;
grant select, insert on table public.sms_messages to authenticated;

drop policy if exists "TransVista team can view SMS messages"
  on public.sms_messages;
create policy "TransVista team can view SMS messages"
on public.sms_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_team_members as member
    where member.user_id = (select auth.uid())
      and member.status = 'active'
      and member.role in ('owner', 'admin', 'support')
  )
);

drop policy if exists "TransVista team can record SMS messages"
  on public.sms_messages;
create policy "TransVista team can record SMS messages"
on public.sms_messages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_team_members as member
    where member.id = sent_by
      and member.user_id = (select auth.uid())
      and member.status = 'active'
      and member.role in ('owner', 'admin', 'support')
  )
);
