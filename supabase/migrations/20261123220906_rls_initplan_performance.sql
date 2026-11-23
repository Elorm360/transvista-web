-- Applied to production (transvista) on 2026-11-23.
--
-- Performance only: wrap auth.*() calls in (select ...) so Postgres evaluates
-- them once per query instead of once per row (Supabase advisor
-- "auth_rls_initplan"). Access rules are unchanged.

alter policy "Owner can delete team members" on public.admin_team_members
  using (lower((select auth.jwt()) ->> 'email') = 'info@transvistaafrica.com');

alter policy "Owner can insert team members" on public.admin_team_members
  with check (lower((select auth.jwt()) ->> 'email') = 'info@transvistaafrica.com');

alter policy "Owner can update team members" on public.admin_team_members
  using (lower((select auth.jwt()) ->> 'email') = 'info@transvistaafrica.com')
  with check (lower((select auth.jwt()) ->> 'email') = 'info@transvistaafrica.com');

alter policy "Owner can view team members" on public.admin_team_members
  using (lower((select auth.jwt()) ->> 'email') = 'info@transvistaafrica.com');

alter policy "Team members can view themselves" on public.admin_team_members
  using (user_id = (select auth.uid()) and status = 'active');

alter policy "Active team can record package payments" on public.package_payment_transactions
  with check (exists (
    select 1 from public.admin_team_members m
    where m.user_id = (select auth.uid())
      and m.status = 'active'
      and m.role = any (array['owner', 'admin', 'support'])
  ));
