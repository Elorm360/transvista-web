-- Applied to production (transvista) on 2026-11-23.
--
-- Align waitlist (leads) access with the app's team roles
-- (lib/auth/permissions.ts: owner, admin, community_manager may manage
-- the community), instead of a single hard-coded email address.
--
-- Note: before this, production already had admin-only policies
-- ("Admin can view/delete waitlist members", created in the dashboard
-- and never committed). 0001's "Public can read leads" no longer exists.

drop policy if exists "Public can read leads" on public.leads;
drop policy if exists "Authenticated can delete leads" on public.leads;
drop policy if exists "Admin can view waitlist members" on public.leads;
drop policy if exists "Admin can delete waitlist members" on public.leads;
drop policy if exists "Team can view waitlist members" on public.leads;
drop policy if exists "Team can delete waitlist members" on public.leads;

create policy "Team can view waitlist members" on public.leads
  for select to authenticated
  using (exists (
    select 1 from public.admin_team_members m
    where m.user_id = (select auth.uid())
      and m.status = 'active'
      and m.role in ('owner', 'admin', 'community_manager')
  ));

create policy "Team can delete waitlist members" on public.leads
  for delete to authenticated
  using (exists (
    select 1 from public.admin_team_members m
    where m.user_id = (select auth.uid())
      and m.status = 'active'
      and m.role in ('owner', 'admin', 'community_manager')
  ));

-- Field length limits on public submissions (NOT VALID: enforced for new
-- rows only, so existing rows can never make this migration fail).
alter table public.leads drop constraint if exists leads_field_lengths;
alter table public.leads add constraint leads_field_lengths check (
  char_length(full_name) between 1 and 120
  and char_length(email) between 3 and 254
  and (phone is null or char_length(phone) <= 32)
  and char_length(country) between 1 and 80
  and char_length(interest) between 1 and 80
) not valid;
