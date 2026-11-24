-- Applied to production (transvista) on 2026-11-24.
--
-- Custom admin roles and an audit log. Additive only.
--
-- Custom roles (e.g. "COO", "Finance Manager") are built on one of the
-- existing access levels (admin / support / community_manager) and narrowed
-- to chosen admin sections. Members keep their base level in
-- admin_team_members.role, so every existing RLS policy still applies as a
-- ceiling; the app enforces the narrower section list on the server.

create table if not exists public.admin_roles (
  key         text primary key check (key ~ '^[a-z][a-z0-9_]{1,40}$'),
  name        text not null check (char_length(name) between 2 and 60),
  description text check (description is null or char_length(description) <= 300),
  base_role   text not null check (base_role in ('admin', 'support', 'community_manager')),
  permissions text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references public.admin_team_members(id) on delete set null
);
alter table public.admin_roles enable row level security;
-- No policies: read and written only by server code with the service role
-- after an owner / session check.

alter table public.admin_team_members
  add column if not exists custom_role_key text references public.admin_roles(key) on delete set null;
create index if not exists admin_team_members_custom_role_idx on public.admin_team_members (custom_role_key);

-- Append-only record of sensitive admin actions.
create table if not exists public.audit_log (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),
  actor_member_id uuid references public.admin_team_members(id) on delete set null,
  actor_name      text,
  action          text not null check (char_length(action) between 2 and 80),
  target_type     text check (target_type is null or char_length(target_type) <= 60),
  target_id       text check (target_id is null or char_length(target_id) <= 120),
  summary         text not null check (char_length(summary) between 1 and 500),
  metadata        jsonb not null default '{}'::jsonb
);
create index if not exists audit_log_created_idx on public.audit_log (created_at desc);
create index if not exists audit_log_actor_idx on public.audit_log (actor_member_id);
create index if not exists audit_log_action_idx on public.audit_log (action);
alter table public.audit_log enable row level security;
-- No policies: written and read only via the service role (owner-only page).

-- Make the log append-only even for the service role: block updates/deletes.
create or replace function private.audit_log_is_append_only()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'audit_log is append-only';
end;
$$;

drop trigger if exists audit_log_no_update on public.audit_log;
create trigger audit_log_no_update
  before update or delete on public.audit_log
  for each row execute function private.audit_log_is_append_only();
