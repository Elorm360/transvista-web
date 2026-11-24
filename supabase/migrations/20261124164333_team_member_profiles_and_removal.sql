-- Applied to production (transvista) on 2026-11-24.
--
-- Team member self-service profiles (photo, phone, theme) and permanent removal.

alter table public.admin_team_members
  add column if not exists avatar_path text check (avatar_path is null or char_length(avatar_path) <= 300),
  add column if not exists phone text check (phone is null or char_length(phone) <= 32),
  add column if not exists theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  add column if not exists removed_at timestamptz;

-- "removed" = login erased and personal details anonymised. The row stays so
-- bookings, payments and activity history keep a valid (neutral) author;
-- several history tables reference this row with ON DELETE RESTRICT.
alter table public.admin_team_members drop constraint if exists admin_team_members_status_check;
alter table public.admin_team_members
  add constraint admin_team_members_status_check check (status in ('active', 'inactive', 'removed'));

-- Profile photos. Public read (shown inside the admin only, under unguessable
-- paths); writes happen only through server actions using the service role.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('team-avatars', 'team-avatars', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
