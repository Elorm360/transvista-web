
create sequence if not exists public.payment_receipt_number_seq;
create table if not exists public.package_payment_transactions (
  id uuid primary key default gen_random_uuid(),
  reservation_id bigint not null references public.package_reservations(id) on delete restrict,
  booking_reference text not null,
  transaction_type text not null default 'payment' check (transaction_type in ('payment','opening_balance','refund')),
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'GHS' check (currency in ('GHS','USD','GBP','EUR')),
  payment_method text null check (payment_method is null or payment_method in ('mobile-money','card','bank-transfer','cash')),
  external_reference text null,
  payment_date timestamptz not null default now(),
  status text not null default 'verified' check (status in ('pending','verified','rejected','refunded')),
  receipt_number text not null unique default ('TVA-RCPT-' || to_char(now() at time zone 'Africa/Accra','YYYY') || '-' || lpad(nextval('public.payment_receipt_number_seq')::text,6,'0')),
  notes text null,
  recorded_by uuid null references public.admin_team_members(id) on delete set null,
  verified_by uuid null references public.admin_team_members(id) on delete set null,
  verified_at timestamptz null,
  created_at timestamptz not null default now(),
  idempotency_key text not null unique
);
create index if not exists package_payment_transactions_reservation_idx on public.package_payment_transactions(reservation_id,payment_date desc);
create index if not exists package_payment_transactions_status_idx on public.package_payment_transactions(status,payment_date desc);
alter table public.package_payment_transactions enable row level security;
drop policy if exists "Active team can view package payment transactions" on public.package_payment_transactions;
create policy "Active team can view package payment transactions" on public.package_payment_transactions for select to authenticated using (exists(select 1 from public.admin_team_members m where m.user_id=auth.uid() and m.status='active'));
drop policy if exists "Owner and admins can manage package payment transactions" on public.package_payment_transactions;
create policy "Owner and admins can manage package payment transactions" on public.package_payment_transactions for all to authenticated using (exists(select 1 from public.admin_team_members m where m.user_id=auth.uid() and m.status='active' and m.role in ('owner','admin'))) with check (exists(select 1 from public.admin_team_members m where m.user_id=auth.uid() and m.status='active' and m.role in ('owner','admin')));
insert into public.package_payment_transactions(reservation_id,booking_reference,transaction_type,amount,currency,payment_method,external_reference,payment_date,status,verified_at,recorded_by,verified_by,notes,idempotency_key)
select r.id,r.reference,'opening_balance',r.amount_paid,r.currency,r.payment_method,r.payment_reference,coalesce(r.payment_verified_at,r.updated_at),'verified',r.payment_verified_at,r.payment_verified_by,r.payment_verified_by,'Opening balance migrated from the legacy cumulative payment record.','legacy-opening-balance-'||r.id::text
from public.package_reservations r where r.amount_paid>0 and not exists(select 1 from public.package_payment_transactions t where t.idempotency_key='legacy-opening-balance-'||r.id::text);
