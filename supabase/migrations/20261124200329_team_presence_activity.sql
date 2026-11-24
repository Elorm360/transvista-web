-- Applied to production (transvista) on 2026-11-24.
--
-- Team presence and activity for the Founder & CEO:
--  * online / away / offline and "last seen", from a heartbeat the
--    dashboard sends about once a minute while it's open;
--  * active time per day (only while the tab is in use, never more than
--    real elapsed time);
--  * first sign-in (invite accepted);
--  * per-person task performance and a team update feed.
-- Readable only by people with the "team_activity" section (Super Admin,
-- or a role it's granted to). Each person can read their own time.

-- --------------------------------------------------------------- columns
alter table public.admin_team_members
  add column if not exists last_seen_at timestamptz,
  add column if not exists last_active_at timestamptz,
  add column if not exists first_signed_in_at timestamptz;

-- Members who already accepted their invite: use when they confirmed it.
update public.admin_team_members m
set first_signed_in_at = u.email_confirmed_at
from auth.users u
where u.id = m.user_id and m.first_signed_in_at is null and u.email_confirmed_at is not null;

create table if not exists public.admin_activity_days (
  member_id      uuid not null references public.admin_team_members(id) on delete cascade,
  day            date not null,
  active_seconds integer not null default 0 check (active_seconds >= 0 and active_seconds <= 86400),
  primary key (member_id, day)
);
alter table public.admin_activity_days enable row level security;
revoke all on public.admin_activity_days from anon, authenticated;

-- ----------------------------------------------------- capability check
-- Same as before, plus 'team_activity' for the admin base level.
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
            and p_area in ('team_tasks', 'approvals', 'team_activity')
            and (r.key is null or p_area = any (r.permissions)))
      )
  )
$$;

-- ------------------------------------------------------------ heartbeat
-- Called by the dashboard about once a minute. p_active = the person used
-- the page (mouse, keys, scroll) in the last few minutes and it's visible.
-- Active time grows by the real gap since their previous active heartbeat,
-- capped at 90 seconds, so it can never exceed wall-clock time.
create or replace function public.record_admin_heartbeat(p_active boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_member public.admin_team_members%rowtype;
  v_now timestamptz := now();
  v_gap numeric;
begin
  select * into v_member from public.admin_team_members
  where user_id = (select auth.uid()) and status = 'active'
  limit 1;
  if not found then return; end if;

  if v_member.first_signed_in_at is null then
    insert into public.audit_log (actor_member_id, actor_name, action, target_type, target_id, summary)
    values (v_member.id, v_member.full_name, 'team.first_sign_in', 'team_member', v_member.id::text,
            v_member.full_name || ' accepted their invite and signed in for the first time');
  end if;

  if p_active and v_member.last_active_at is not null then
    v_gap := extract(epoch from (v_now - v_member.last_active_at));
    if v_gap > 0 and v_gap <= 150 then
      insert into public.admin_activity_days (member_id, day, active_seconds)
      values (v_member.id, (v_now at time zone 'Africa/Accra')::date, least(v_gap, 90)::integer)
      on conflict (member_id, day)
      do update set active_seconds = least(86400, public.admin_activity_days.active_seconds + excluded.active_seconds);
    end if;
  end if;

  update public.admin_team_members
  set last_seen_at = v_now,
      last_active_at = case when p_active then v_now else last_active_at end,
      first_signed_in_at = coalesce(first_signed_in_at, v_now)
  where id = v_member.id;
end $$;
revoke all on function public.record_admin_heartbeat(boolean) from public, anon;
grant execute on function public.record_admin_heartbeat(boolean) to authenticated;

-- ------------------------------------------------------- my own activity
create or replace function public.get_my_activity()
returns table (today_seconds integer, week_seconds integer, month_seconds integer)
language sql stable security definer set search_path = '' as $$
  with me as (select private.current_member_id() as id),
       today as (select (now() at time zone 'Africa/Accra')::date as d)
  select
    coalesce(sum(a.active_seconds) filter (where a.day = t.d), 0)::integer,
    coalesce(sum(a.active_seconds) filter (where a.day >= date_trunc('week', t.d)::date), 0)::integer,
    coalesce(sum(a.active_seconds) filter (where a.day >= date_trunc('month', t.d)::date), 0)::integer
  from me cross join today t
  left join public.admin_activity_days a on a.member_id = me.id
$$;
revoke all on function public.get_my_activity() from public, anon;
grant execute on function public.get_my_activity() to authenticated;

-- -------------------------------------------------------- team overview
create or replace function public.get_team_activity()
returns table (
  member_id uuid, full_name text, avatar_path text, role text, custom_role_key text, status text,
  invited_at timestamptz, first_signed_in_at timestamptz, last_seen_at timestamptz, last_active_at timestamptz,
  today_seconds integer, week_seconds integer, month_seconds integer,
  open_tasks integer, overdue_tasks integer, done_7d integer,
  due_done_30d integer, on_time_30d integer,
  updates_7d integer, last_update_at timestamptz
)
language sql stable security definer set search_path = '' as $$
  with today as (select (now() at time zone 'Africa/Accra')::date as d)
  select
    m.id, m.full_name, m.avatar_path, m.role, m.custom_role_key, m.status,
    m.created_at, m.first_signed_in_at, m.last_seen_at, m.last_active_at,
    coalesce((select sum(a.active_seconds) from public.admin_activity_days a where a.member_id = m.id and a.day = t.d), 0)::integer,
    coalesce((select sum(a.active_seconds) from public.admin_activity_days a where a.member_id = m.id and a.day >= date_trunc('week', t.d)::date), 0)::integer,
    coalesce((select sum(a.active_seconds) from public.admin_activity_days a where a.member_id = m.id and a.day >= date_trunc('month', t.d)::date), 0)::integer,
    (select count(*) from public.admin_tasks k where k.assigned_to = m.id and k.status <> 'done')::integer,
    (select count(*) from public.admin_tasks k where k.assigned_to = m.id and k.status <> 'done' and k.due_at < now())::integer,
    (select count(*) from public.admin_tasks k where k.assigned_to = m.id and k.status = 'done' and k.completed_at >= now() - interval '7 days')::integer,
    (select count(*) from public.admin_tasks k where k.assigned_to = m.id and k.status = 'done' and k.due_at is not null and k.completed_at >= now() - interval '30 days')::integer,
    (select count(*) from public.admin_tasks k where k.assigned_to = m.id and k.status = 'done' and k.due_at is not null and k.completed_at <= k.due_at and k.completed_at >= now() - interval '30 days')::integer,
    (select count(*) from public.admin_task_notes n where n.author_member_id = m.id and n.created_at >= now() - interval '7 days')::integer,
    (select max(n.created_at) from public.admin_task_notes n where n.author_member_id = m.id)
  from public.admin_team_members m cross join today t
  where m.status <> 'removed' and private.member_has_area('team_activity')
  order by m.full_name
$$;
revoke all on function public.get_team_activity() from public, anon;
grant execute on function public.get_team_activity() to authenticated;

-- Recent task updates and completions across the team.
create or replace function public.get_team_feed(p_limit integer default 60)
returns table (kind text, at timestamptz, member_id uuid, task_id bigint, task_title text, body text, due_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select * from (
    select 'update'::text, n.created_at, n.author_member_id, k.id, k.title, n.body, k.due_at
    from public.admin_task_notes n join public.admin_tasks k on k.id = n.task_id
    union all
    select 'completed'::text, k.completed_at, k.assigned_to, k.id, k.title, null::text, k.due_at
    from public.admin_tasks k where k.status = 'done' and k.completed_at is not null
  ) feed (kind, at, member_id, task_id, task_title, body, due_at)
  where private.member_has_area('team_activity')
  order by at desc
  limit least(greatest(coalesce(p_limit, 60), 1), 200)
$$;
revoke all on function public.get_team_feed(integer) from public, anon;
grant execute on function public.get_team_feed(integer) to authenticated;
