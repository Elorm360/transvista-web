-- Applied to production (transvista) on 2026-11-24.
--
-- The audit log is append-only (updates blocked), so its actor link must not
-- try to SET NULL when a member row is removed. RESTRICT makes a full delete
-- fall back to the existing anonymise path, keeping the audit trail intact.
alter table public.audit_log drop constraint if exists audit_log_actor_member_id_fkey;
alter table public.audit_log
  add constraint audit_log_actor_member_id_fkey
  foreign key (actor_member_id) references public.admin_team_members(id) on delete restrict;
