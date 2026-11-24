-- Applied to production (transvista) on 2026-11-24.
--
-- Team tasks (assign, track deadlines, escalate to the CEO) and approval
-- requests (expenses, operational requests, payment corrections that need
-- the CEO's sign-off). Access is checked here with row-level security and
-- again in the app (lib/auth/access.ts).

-- ---------------------------------------------------------------- helpers
grant usage on schema private to authenticated;

-- The signed-in person's active team member id (null if not an active member).
create or replace function private.current_member_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select m.id from public.admin_team_members m
  where m.user_id = (select auth.uid()) and m.status = 'active'
  limit 1
$$;

-- Does the signed-in person have one of the capability sections
-- ('team_tasks', 'approvals')? Mirrors effectiveAreas() in
-- lib/auth/permissions.ts: the owner has everything; the admin base level has
-- both unless a custom role (with a matching base) leaves them out.
create or replace function private.member_has_area(p_area text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.admin_team_members m
    left join public.admin_roles r on r.key = m.custom_role_key and r.base_role = m.role
    where m.user_id = (select auth.uid())
      and m.status = 'active'
      and (
        m.role = 'owner'
        or (m.role = 'admin'
            and p_area in ('team_tasks', 'approvals')
            and (r.key is null or p_area = any (r.permissions)))
      )
  )
$$;

revoke all on function private.current_member_id() from public, anon;
revoke all on function private.member_has_area(text) from public, anon;
grant execute on function private.current_member_id() to authenticated;
grant execute on function private.member_has_area(text) to authenticated;

-- Everyone on the team can see who else is on the team (names and photos only),
-- so tasks can be assigned to anyone.
create or replace function public.list_team_directory()
returns table (id uuid, full_name text, avatar_path text)
language sql stable security definer set search_path = '' as $$
  select m.id, m.full_name, m.avatar_path
  from public.admin_team_members m
  where m.status = 'active' and private.current_member_id() is not null
  order by m.full_name
$$;
revoke all on function public.list_team_directory() from public, anon;
grant execute on function public.list_team_directory() to authenticated;

-- ------------------------------------------------------------------ tasks
create table if not exists public.admin_tasks (
  id               bigint generated always as identity primary key,
  title            text not null check (char_length(title) between 3 and 160),
  details          text check (char_length(details) <= 4000),
  department       text not null default 'general'
                   check (department in ('operations', 'community', 'marketing', 'finance', 'technology', 'general')),
  priority         text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status           text not null default 'todo' check (status in ('todo', 'in_progress', 'blocked', 'done')),
  assigned_to      uuid references public.admin_team_members(id) on delete set null,
  created_by       uuid references public.admin_team_members(id) on delete set null,
  due_at           timestamptz,
  booking_reference text check (char_length(booking_reference) <= 40),
  escalated_at     timestamptz,
  escalation_note  text check (char_length(escalation_note) <= 1000),
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists admin_tasks_assigned_idx on public.admin_tasks (assigned_to, status);
create index if not exists admin_tasks_created_by_idx on public.admin_tasks (created_by);
create index if not exists admin_tasks_due_idx on public.admin_tasks (due_at) where status <> 'done';
alter table public.admin_tasks enable row level security;
revoke all on public.admin_tasks from anon;

create table if not exists public.admin_task_notes (
  id               bigint generated always as identity primary key,
  task_id          bigint not null references public.admin_tasks(id) on delete cascade,
  author_member_id uuid references public.admin_team_members(id) on delete set null,
  body             text not null check (char_length(body) between 1 and 2000),
  created_at       timestamptz not null default now()
);
create index if not exists admin_task_notes_task_idx on public.admin_task_notes (task_id, created_at);
create index if not exists admin_task_notes_author_idx on public.admin_task_notes (author_member_id);
alter table public.admin_task_notes enable row level security;
revoke all on public.admin_task_notes from anon;

-- Creator never changes; keep timestamps honest.
create or replace function private.admin_tasks_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.created_by is distinct from old.created_by then
    raise exception 'A task''s creator cannot be changed.';
  end if;
  new.updated_at := now();
  if new.status = 'done' and (tg_op = 'INSERT' or old.status <> 'done') then
    new.completed_at := now();
  elsif new.status <> 'done' then
    new.completed_at := null;
  end if;
  return new;
end $$;
drop trigger if exists admin_tasks_guard on public.admin_tasks;
create trigger admin_tasks_guard before insert or update on public.admin_tasks
  for each row execute function private.admin_tasks_guard();

drop policy if exists "Team can see their tasks" on public.admin_tasks;
create policy "Team can see their tasks" on public.admin_tasks
  for select to authenticated
  using (
    (select private.member_has_area('team_tasks'))
    or assigned_to = (select private.current_member_id())
    or created_by = (select private.current_member_id())
  );

drop policy if exists "Team can create tasks" on public.admin_tasks;
create policy "Team can create tasks" on public.admin_tasks
  for insert to authenticated
  with check (created_by = (select private.current_member_id()));

drop policy if exists "Team can update their tasks" on public.admin_tasks;
create policy "Team can update their tasks" on public.admin_tasks
  for update to authenticated
  using (
    (select private.member_has_area('team_tasks'))
    or assigned_to = (select private.current_member_id())
    or created_by = (select private.current_member_id())
  )
  with check (
    (select private.member_has_area('team_tasks'))
    or assigned_to = (select private.current_member_id())
    or created_by = (select private.current_member_id())
  );

drop policy if exists "Creators and leads can delete tasks" on public.admin_tasks;
create policy "Creators and leads can delete tasks" on public.admin_tasks
  for delete to authenticated
  using ((select private.member_has_area('team_tasks')) or created_by = (select private.current_member_id()));

drop policy if exists "Team can read notes on visible tasks" on public.admin_task_notes;
create policy "Team can read notes on visible tasks" on public.admin_task_notes
  for select to authenticated
  using (exists (select 1 from public.admin_tasks t where t.id = task_id));

drop policy if exists "Team can add notes to visible tasks" on public.admin_task_notes;
create policy "Team can add notes to visible tasks" on public.admin_task_notes
  for insert to authenticated
  with check (
    author_member_id = (select private.current_member_id())
    and exists (select 1 from public.admin_tasks t where t.id = task_id)
  );

-- -------------------------------------------------------------- approvals
create table if not exists public.approval_requests (
  id             bigint generated always as identity primary key,
  kind           text not null check (kind in ('payment_correction', 'expense', 'operational', 'other')),
  title          text not null check (char_length(title) between 3 and 160),
  details        text check (char_length(details) <= 4000),
  amount         numeric(14, 2) check (amount is null or amount > 0),
  currency       text check (currency is null or currency in ('GHS', 'USD', 'GBP', 'EUR')),
  payload        jsonb not null default '{}'::jsonb,
  requested_by   uuid references public.admin_team_members(id) on delete set null,
  status         text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  decided_by     uuid references public.admin_team_members(id) on delete set null,
  decided_at     timestamptz,
  decision_note  text check (char_length(decision_note) <= 1000),
  executed_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists approval_requests_status_idx on public.approval_requests (status, created_at desc);
create index if not exists approval_requests_requested_by_idx on public.approval_requests (requested_by);
create index if not exists approval_requests_decided_by_idx on public.approval_requests (decided_by);
alter table public.approval_requests enable row level security;
revoke all on public.approval_requests from anon;

-- What was asked for can't change after it's submitted, a decision is final,
-- and nobody approves their own request.
create or replace function private.approval_requests_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    if (new.kind, new.title, new.details, new.amount, new.currency, new.payload, new.requested_by, new.created_at)
       is distinct from
       (old.kind, old.title, old.details, old.amount, old.currency, old.payload, old.requested_by, old.created_at) then
      raise exception 'A submitted request can''t be edited. Cancel it and submit a new one.';
    end if;
    if old.status <> 'pending' and new.status is distinct from old.status then
      raise exception 'This request has already been decided.';
    end if;
    if new.status in ('approved', 'rejected') and new.decided_by is not null and new.decided_by = new.requested_by then
      raise exception 'You can''t decide your own request.';
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists approval_requests_guard on public.approval_requests;
create trigger approval_requests_guard before insert or update on public.approval_requests
  for each row execute function private.approval_requests_guard();

drop policy if exists "Requesters and approvers can see requests" on public.approval_requests;
create policy "Requesters and approvers can see requests" on public.approval_requests
  for select to authenticated
  using (requested_by = (select private.current_member_id()) or (select private.member_has_area('approvals')));

drop policy if exists "Team can submit requests" on public.approval_requests;
create policy "Team can submit requests" on public.approval_requests
  for insert to authenticated
  with check (
    requested_by = (select private.current_member_id())
    and status = 'pending' and decided_by is null and decided_at is null and executed_at is null
  );

drop policy if exists "Approvers decide and requesters cancel" on public.approval_requests;
create policy "Approvers decide and requesters cancel" on public.approval_requests
  for update to authenticated
  using (requested_by = (select private.current_member_id()) or (select private.member_has_area('approvals')))
  with check (
    ((select private.member_has_area('approvals')) and (decided_by is null or decided_by = (select private.current_member_id())))
    or (requested_by = (select private.current_member_id()) and status in ('pending', 'cancelled') and decided_by is null and executed_at is null)
  );

-- The COO assigns and follows up everyone's tasks.
update public.admin_roles
set permissions = array_append(permissions, 'team_tasks'), updated_at = now()
where key = 'coo' and not ('team_tasks' = any (permissions));
