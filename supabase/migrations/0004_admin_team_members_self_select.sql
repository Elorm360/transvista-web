-- ─────────────────────────────────────────────────────────────
-- 0004_admin_team_members_self_select.sql
--
-- Active team members can read their own row so roleFor() works
-- without granting them access to the rest of the team list.
-- Owner-wide policies from 0003 remain in place.
-- ─────────────────────────────────────────────────────────────

create policy "Team members can view themselves"
on public.admin_team_members
for select
to authenticated
using (
  user_id = auth.uid()
  and status = 'active'
);
