-- ─────────────────────────────────────────────────────────────
-- 0003_admin_team_members_owner_rls.sql
--
-- Temporary owner-email RLS for admin_team_members.
--
-- Public/anonymous → no access
-- Normal authenticated users → no access
-- Owner (info@transvistaafrica.com) → select/insert/update/delete
--
-- These policies keep current owner access working while the
-- authorization layer is upgraded. They will later be replaced
-- with role-based policies from admin_team_members itself.
-- ─────────────────────────────────────────────────────────────

create policy "Owner can view team members"
on public.admin_team_members
for select
to authenticated
using (
  lower(auth.jwt() ->> 'email') = 'info@transvistaafrica.com'
);

create policy "Owner can insert team members"
on public.admin_team_members
for insert
to authenticated
with check (
  lower(auth.jwt() ->> 'email') = 'info@transvistaafrica.com'
);

create policy "Owner can update team members"
on public.admin_team_members
for update
to authenticated
using (
  lower(auth.jwt() ->> 'email') = 'info@transvistaafrica.com'
)
with check (
  lower(auth.jwt() ->> 'email') = 'info@transvistaafrica.com'
);

create policy "Owner can delete team members"
on public.admin_team_members
for delete
to authenticated
using (
  lower(auth.jwt() ->> 'email') = 'info@transvistaafrica.com'
);
