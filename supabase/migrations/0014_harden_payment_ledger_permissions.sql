
revoke all on function public.record_package_payment(bigint,numeric,text,text,timestamptz,text) from public,anon;
grant execute on function public.record_package_payment(bigint,numeric,text,text,timestamptz,text) to authenticated;
drop policy if exists "Owner and admins can manage package payment transactions" on public.package_payment_transactions;
drop policy if exists "Active team can view package payment transactions" on public.package_payment_transactions;
create policy "Active team can view package payment transactions" on public.package_payment_transactions for select to authenticated
using (exists(select 1 from public.admin_team_members m where m.user_id=(select auth.uid()) and m.status='active'));
create policy "Owners and admins can update receipt delivery status" on public.package_payment_transactions for update to authenticated
using (exists(select 1 from public.admin_team_members m where m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin')))
with check (exists(select 1 from public.admin_team_members m where m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin')));
create index if not exists package_payment_transactions_recorded_by_idx on public.package_payment_transactions(recorded_by);
create index if not exists package_payment_transactions_verified_by_idx on public.package_payment_transactions(verified_by);
