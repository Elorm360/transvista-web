
alter table public.package_payment_transactions add column if not exists receipt_sent_at timestamptz null;
alter table public.package_payment_transactions add column if not exists receipt_sent_to text null;
