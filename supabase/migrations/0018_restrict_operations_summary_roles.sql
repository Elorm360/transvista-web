
create or replace function public.get_admin_operations_summary()
returns table(total_requests bigint, attention_requests bigint, ghs_received numeric, ghs_outstanding numeric)
language plpgsql security definer set search_path=public
as $$
declare v_role text;
begin
  select m.role into v_role
  from public.admin_team_members m
  where m.user_id=auth.uid() and m.status='active'
  limit 1;
  if v_role is null or v_role not in ('owner','admin','support') then
    raise exception 'You do not have permission to view operations and payment totals.';
  end if;
  return query
  with package_totals as (
    select count(*)::bigint total_count,
      count(*) filter(where status not in ('completed','cancelled','waitlisted') and
        (status in ('pending-review','confirmed-awaiting-deposit') or payment_status in ('payment-requested','deposit-requested','not-requested')))::bigint attention_count,
      coalesce(sum(amount_paid) filter(where currency='GHS'),0)::numeric received,
      coalesce(sum(greatest(coalesce(total_price,0)-coalesce(amount_paid,0),0)) filter(where currency='GHS'),0)::numeric outstanding
    from public.package_reservations
  ), custom_totals as (
    select count(*)::bigint total_count,
      count(*) filter(where status not in ('completed','cancelled','closed') and
        (status in ('new','reviewing','contacted','quoted') or payment_status in ('payment-requested','deposit-requested','not-requested')))::bigint attention_count,
      coalesce(sum(amount_paid) filter(where coalesce(quote_currency,budget_currency)='GHS'),0)::numeric received,
      coalesce(sum(greatest(coalesce(quoted_amount,0)-coalesce(amount_paid,0),0)) filter(where coalesce(quote_currency,budget_currency)='GHS'),0)::numeric outstanding
    from public.trip_requests
  )
  select p.total_count+c.total_count,p.attention_count+c.attention_count,p.received+c.received,p.outstanding+c.outstanding
  from package_totals p cross join custom_totals c;
end;
$$;
revoke all on function public.get_admin_operations_summary() from public,anon;
grant execute on function public.get_admin_operations_summary() to authenticated;
