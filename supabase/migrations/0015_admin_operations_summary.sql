create or replace function public.get_admin_operations_summary()
returns table(total_requests bigint, attention_requests bigint, ghs_received numeric, ghs_outstanding numeric)
language plpgsql
security definer
set search_path=public
as $$
begin
  if not exists (
    select 1 from public.admin_team_members m
    where m.user_id=auth.uid() and m.status='active'
  ) then
    raise exception 'Active TransVista team access is required.';
  end if;

  return query
  with package_totals as (
    select
      count(*)::bigint as total_count,
      count(*) filter (
        where status in ('pending-review','confirmed-awaiting-deposit')
           or payment_status in ('payment-requested','deposit-requested','not-requested')
      )::bigint as attention_count,
      coalesce(sum(amount_paid) filter (where currency='GHS'),0)::numeric as received,
      coalesce(sum(greatest(coalesce(total_price,0)-coalesce(amount_paid,0),0)) filter (where currency='GHS'),0)::numeric as outstanding
    from public.package_reservations
  ),
  custom_totals as (
    select
      count(*)::bigint as total_count,
      count(*) filter (
        where status in ('new','reviewing','contacted')
           or payment_status in ('payment-requested','deposit-requested','not-requested')
      )::bigint as attention_count,
      coalesce(sum(amount_paid) filter (where coalesce(quote_currency,budget_currency)='GHS'),0)::numeric as received,
      coalesce(sum(greatest(coalesce(quoted_amount,0)-coalesce(amount_paid,0),0)) filter (where coalesce(quote_currency,budget_currency)='GHS'),0)::numeric as outstanding
    from public.trip_requests
  )
  select p.total_count+c.total_count,p.attention_count+c.attention_count,p.received+c.received,p.outstanding+c.outstanding
  from package_totals p cross join custom_totals c;
end;
$$;
revoke all on function public.get_admin_operations_summary() from public,anon;
grant execute on function public.get_admin_operations_summary() to authenticated;
