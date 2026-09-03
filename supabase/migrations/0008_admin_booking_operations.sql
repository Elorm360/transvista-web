-- Admin booking-operations foundation for custom and package requests.
-- Public travellers retain insert-only access. Active owner/admin/support
-- members can manage operational fields and append immutable activity notes.

alter table public.trip_requests
  drop constraint if exists trip_requests_status_check;

alter table public.trip_requests
  add constraint trip_requests_status_check
  check (status in (
    'new', 'reviewing', 'contacted', 'quoted', 'confirmed',
    'in-progress', 'completed', 'cancelled', 'closed'
  ));

alter table public.package_reservations
  drop constraint if exists package_reservations_status_check;

alter table public.package_reservations
  add constraint package_reservations_status_check
  check (status in (
    'pending-review', 'confirmed-awaiting-deposit', 'deposit-paid', 'paid',
    'in-progress', 'completed', 'waitlisted', 'cancelled'
  ));

alter table public.trip_requests
  add column if not exists assigned_to uuid references public.admin_team_members(id) on delete set null,
  add column if not exists priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent')),
  add column if not exists follow_up_at timestamptz,
  add column if not exists quoted_amount numeric(12, 2)
    check (quoted_amount is null or quoted_amount >= 0),
  add column if not exists quote_currency text
    check (quote_currency is null or quote_currency in ('GHS', 'USD', 'GBP', 'EUR')),
  add column if not exists deposit_amount numeric(12, 2)
    check (deposit_amount is null or deposit_amount >= 0),
  add column if not exists amount_paid numeric(12, 2) not null default 0
    check (amount_paid >= 0),
  add column if not exists payment_status text not null default 'not-requested'
    check (payment_status in (
      'not-requested', 'deposit-requested', 'deposit-paid', 'paid',
      'refunded', 'partially-refunded'
    )),
  add column if not exists payment_method text
    check (payment_method is null or payment_method in (
      'mobile-money', 'card', 'bank-transfer', 'cash'
    )),
  add column if not exists payment_verified_at timestamptz,
  add column if not exists payment_verified_by uuid references public.admin_team_members(id) on delete set null,
  add column if not exists updated_by uuid references public.admin_team_members(id) on delete set null;

alter table public.package_reservations
  add column if not exists assigned_to uuid references public.admin_team_members(id) on delete set null,
  add column if not exists priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent')),
  add column if not exists follow_up_at timestamptz,
  add column if not exists quoted_amount numeric(12, 2)
    check (quoted_amount is null or quoted_amount >= 0),
  add column if not exists quote_currency text
    check (quote_currency is null or quote_currency in ('GHS', 'USD', 'GBP', 'EUR')),
  add column if not exists deposit_amount numeric(12, 2)
    check (deposit_amount is null or deposit_amount >= 0),
  add column if not exists amount_paid numeric(12, 2) not null default 0
    check (amount_paid >= 0),
  add column if not exists payment_method text
    check (payment_method is null or payment_method in (
      'mobile-money', 'card', 'bank-transfer', 'cash'
    )),
  add column if not exists payment_verified_at timestamptz,
  add column if not exists payment_verified_by uuid references public.admin_team_members(id) on delete set null,
  add column if not exists updated_by uuid references public.admin_team_members(id) on delete set null;

update public.package_reservations
set
  quoted_amount = coalesce(quoted_amount, total_price),
  quote_currency = coalesce(quote_currency, currency),
  deposit_amount = coalesce(deposit_amount, deposit_due)
where quoted_amount is null
   or quote_currency is null
   or deposit_amount is null;

create table if not exists public.request_activity (
  id uuid primary key default gen_random_uuid(),
  request_kind text not null check (request_kind in ('custom', 'package')),
  request_id bigint not null,
  reference text not null,
  activity_type text not null check (activity_type in (
    'update', 'status', 'assignment', 'payment', 'follow-up', 'note'
  )),
  summary text not null check (char_length(summary) between 1 and 2000),
  from_status text,
  to_status text,
  author_member_id uuid not null references public.admin_team_members(id) on delete restrict,
  created_at timestamptz not null default now()
);

alter table public.request_activity enable row level security;

create index if not exists trip_requests_assigned_to_idx
  on public.trip_requests (assigned_to)
  where assigned_to is not null;

create index if not exists trip_requests_operations_queue_idx
  on public.trip_requests (priority, follow_up_at, created_at desc)
  where status not in ('completed', 'cancelled', 'closed');

create index if not exists package_reservations_assigned_to_idx
  on public.package_reservations (assigned_to)
  where assigned_to is not null;

create index if not exists package_reservations_operations_queue_idx
  on public.package_reservations (priority, follow_up_at, created_at desc)
  where status not in ('completed', 'cancelled');

create index if not exists request_activity_request_idx
  on public.request_activity (request_kind, request_id, created_at desc);

create index if not exists request_activity_reference_idx
  on public.request_activity (reference, created_at desc);

revoke all on table public.request_activity from public, anon, authenticated;
grant select, insert on table public.request_activity to authenticated;

grant update (
  status, assigned_to, priority, follow_up_at, quoted_amount, quote_currency,
  deposit_amount, amount_paid, payment_status, payment_method,
  payment_verified_at, payment_verified_by, updated_by, updated_at
) on public.trip_requests to authenticated;

grant update (
  status, assigned_to, priority, follow_up_at, quoted_amount, quote_currency,
  deposit_amount, amount_paid, payment_status, payment_method,
  payment_verified_at, payment_verified_by, updated_by, updated_at
) on public.package_reservations to authenticated;

drop policy if exists "TransVista team can update trip requests" on public.trip_requests;
create policy "TransVista team can update trip requests"
on public.trip_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_team_members as member
    where member.user_id = (select auth.uid())
      and member.status = 'active'
      and member.role in ('owner', 'admin', 'support')
  )
)
with check (
  exists (
    select 1
    from public.admin_team_members as member
    where member.user_id = (select auth.uid())
      and member.status = 'active'
      and member.role in ('owner', 'admin', 'support')
  )
);

drop policy if exists "TransVista team can update package reservations" on public.package_reservations;
create policy "TransVista team can update package reservations"
on public.package_reservations
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_team_members as member
    where member.user_id = (select auth.uid())
      and member.status = 'active'
      and member.role in ('owner', 'admin', 'support')
  )
)
with check (
  exists (
    select 1
    from public.admin_team_members as member
    where member.user_id = (select auth.uid())
      and member.status = 'active'
      and member.role in ('owner', 'admin', 'support')
  )
);

drop policy if exists "TransVista team can view request activity" on public.request_activity;
create policy "TransVista team can view request activity"
on public.request_activity
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

drop policy if exists "TransVista team can add request activity" on public.request_activity;
create policy "TransVista team can add request activity"
on public.request_activity
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_team_members as member
    where member.id = author_member_id
      and member.user_id = (select auth.uid())
      and member.status = 'active'
      and member.role in ('owner', 'admin', 'support')
  )
);

create or replace function public.list_request_operators()
returns table (id uuid, full_name text, role text)
language sql
stable
security definer
set search_path = ''
as $$
  select operator.id, operator.full_name, operator.role
  from public.admin_team_members as operator
  where operator.status = 'active'
    and operator.role in ('owner', 'admin', 'support')
    and exists (
      select 1
      from public.admin_team_members as caller
      where caller.user_id = (select auth.uid())
        and caller.status = 'active'
        and caller.role in ('owner', 'admin', 'support')
    )
  order by
    case operator.role when 'owner' then 0 when 'admin' then 1 else 2 end,
    operator.full_name;
$$;

revoke all on function public.list_request_operators() from public, anon;
grant execute on function public.list_request_operators() to authenticated;
