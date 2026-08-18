-- ─────────────────────────────────────────────────────────────
-- 0002_create_admin_team_members.sql
--
-- Database foundation for role-based admin access.
--
-- Roles: owner | community_manager | admin | support
-- Status: active | inactive
--
-- Step 29.1 creates the table, enables RLS, and registers the
-- existing owner (info@transvistaafrica.com). RLS policies and
-- isAdmin() upgrades come in later steps so current owner access
-- is not interrupted.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.admin_team_members (
  id uuid primary key default gen_random_uuid(),

  user_id uuid unique references auth.users(id) on delete cascade,

  full_name text not null,
  email text not null unique,

  role text not null default 'community_manager'
    check (role in ('owner', 'community_manager', 'admin', 'support')),

  status text not null default 'active'
    check (status in ('active', 'inactive')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_team_members enable row level security;

insert into public.admin_team_members (
  user_id,
  full_name,
  email,
  role,
  status
)
select
  id,
  coalesce(raw_user_meta_data->>'full_name', 'TransVista Owner'),
  lower(email),
  'owner',
  'active'
from auth.users
where lower(email) = 'info@transvistaafrica.com'
on conflict (email)
do update set
  user_id = excluded.user_id,
  role = 'owner',
  status = 'active',
  updated_at = now();
