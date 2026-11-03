
create or replace function public.record_package_payment(
 p_reservation_id bigint,p_amount numeric,p_payment_method text default null,
 p_external_reference text default null,p_payment_date timestamptz default now(),p_notes text default null
)
returns table(transaction_id uuid,receipt_number text,reservation_reference text,cumulative_paid numeric,outstanding_balance numeric,payment_status text)
language plpgsql security definer set search_path=public
as $$
declare
 v_member_id uuid; v_reservation public.package_reservations%rowtype;
 v_transaction public.package_payment_transactions%rowtype;
 v_paid numeric(12,2); v_balance numeric(12,2); v_status text;
begin
 select id into v_member_id from public.admin_team_members
 where user_id=auth.uid() and status='active' and role in ('owner','admin') limit 1;
 if v_member_id is null then raise exception 'Only active owners and admins can record verified payments.'; end if;
 if p_amount is null or p_amount<=0 or p_amount>100000000 then raise exception 'Enter a valid payment amount.'; end if;
 if p_payment_method is not null and p_payment_method not in ('mobile-money','card','bank-transfer','cash') then raise exception 'Choose a valid payment method.'; end if;
 select * into v_reservation from public.package_reservations where id=p_reservation_id for update;
 if not found then raise exception 'Booking not found.'; end if;
 insert into public.package_payment_transactions(reservation_id,booking_reference,transaction_type,amount,currency,payment_method,external_reference,payment_date,status,recorded_by,verified_by,verified_at,notes,idempotency_key)
 values(v_reservation.id,v_reservation.reference,'payment',round(p_amount,2),v_reservation.currency,p_payment_method,nullif(trim(p_external_reference),''),coalesce(p_payment_date,now()),'verified',v_member_id,v_member_id,now(),nullif(trim(p_notes),''),'admin-payment-'||gen_random_uuid()::text)
 returning * into v_transaction;
 select coalesce(sum(amount),0) into v_paid from public.package_payment_transactions
 where reservation_id=v_reservation.id and status='verified' and transaction_type in ('payment','opening_balance');
 v_balance:=greatest(0,coalesce(v_reservation.total_price,0)-v_paid);
 v_status:=case when v_paid>=v_reservation.total_price then 'paid' when v_paid>0 then 'deposit-paid' else 'not-requested' end;
 update public.package_reservations set amount_paid=v_paid,payment_status=v_status,
 status=case when v_status='paid' then 'paid' when v_status='deposit-paid' and status='confirmed-awaiting-deposit' then 'deposit-paid' else status end,
 payment_method=coalesce(p_payment_method,payment_method),payment_verified_at=now(),payment_verified_by=v_member_id,updated_by=v_member_id,updated_at=now()
 where id=v_reservation.id;
 insert into public.request_activity(request_kind,request_id,reference,activity_type,summary,from_status,to_status,author_member_id)
 values('package',v_reservation.id,v_reservation.reference,'payment',
 'Payment recorded: '||v_reservation.currency||' '||to_char(p_amount,'FM999999990.00')||'. Receipt '||v_transaction.receipt_number||'. Total received: '||to_char(v_paid,'FM999999990.00')||'; outstanding: '||to_char(v_balance,'FM999999990.00')||'.',
 v_reservation.status,case when v_status='paid' then 'paid' else v_reservation.status end,v_member_id);
 return query select v_transaction.id,v_transaction.receipt_number,v_reservation.reference,v_paid,v_balance,v_status;
end; $$;
revoke all on function public.record_package_payment(bigint,numeric,text,text,timestamptz,text) from public,anon;
grant execute on function public.record_package_payment(bigint,numeric,text,text,timestamptz,text) to authenticated;
