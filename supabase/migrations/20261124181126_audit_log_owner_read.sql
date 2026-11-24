-- Applied to production (transvista) on 2026-11-24.
--
-- Only the active owner can read the audit log. No insert/update/delete
-- policies: entries are written by the server (service role) and the
-- append-only trigger blocks changes for everyone.
drop policy if exists "Owner can read audit log" on public.audit_log;
create policy "Owner can read audit log" on public.audit_log
  for select to authenticated
  using (exists (
    select 1 from public.admin_team_members m
    where m.user_id = (select auth.uid()) and m.status = 'active' and m.role = 'owner'
  ));
