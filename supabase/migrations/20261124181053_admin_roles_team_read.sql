-- Applied to production (transvista) on 2026-11-24.
--
-- Let active team members read role definitions (names and section lists,
-- nothing sensitive), so the app can resolve a person's access with their own
-- session instead of the service-role key. Writes stay server-only.
drop policy if exists "Active team can read roles" on public.admin_roles;
create policy "Active team can read roles" on public.admin_roles
  for select to authenticated
  using (exists (
    select 1 from public.admin_team_members m
    where m.user_id = (select auth.uid()) and m.status = 'active'
  ));
