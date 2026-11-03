
create or replace function public.prevent_package_payment_transaction_edits()
returns trigger
language plpgsql
set search_path=public
as $$
begin
  if row(
    new.id,new.reservation_id,new.booking_reference,new.transaction_type,new.amount,new.currency,
    new.payment_method,new.external_reference,new.payment_date,new.status,new.receipt_number,
    new.notes,new.recorded_by,new.verified_by,new.verified_at,new.created_at,new.idempotency_key
  ) is distinct from row(
    old.id,old.reservation_id,old.booking_reference,old.transaction_type,old.amount,old.currency,
    old.payment_method,old.external_reference,old.payment_date,old.status,old.receipt_number,
    old.notes,old.recorded_by,old.verified_by,old.verified_at,old.created_at,old.idempotency_key
  ) then
    raise exception 'Payment transaction details are immutable. Record corrections as a separate transaction.';
  end if;
  return new;
end;
$$;
drop trigger if exists package_payment_transactions_immutable on public.package_payment_transactions;
create trigger package_payment_transactions_immutable
before update on public.package_payment_transactions
for each row execute function public.prevent_package_payment_transaction_edits();
