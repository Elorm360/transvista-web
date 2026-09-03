-- Policy-driven payment requests, document records and due dates.

alter table public.trip_requests
  drop constraint if exists trip_requests_payment_status_check;

alter table public.trip_requests
  add constraint trip_requests_payment_status_check
  check (payment_status in (
    'not-requested', 'payment-requested', 'deposit-requested',
    'deposit-paid', 'paid', 'refunded', 'partially-refunded'
  ));

alter table public.package_reservations
  drop constraint if exists package_reservations_payment_status_check;

alter table public.package_reservations
  add constraint package_reservations_payment_status_check
  check (payment_status in (
    'not-requested', 'payment-requested', 'deposit-requested',
    'deposit-paid', 'paid', 'refunded', 'partially-refunded'
  ));

alter table public.trip_requests
  add column if not exists payment_due_at date,
  add column if not exists payment_request_sent_at timestamptz,
  add column if not exists payment_request_amount numeric(12, 2)
    check (payment_request_amount is null or payment_request_amount > 0),
  add column if not exists payment_request_type text
    check (payment_request_type is null or payment_request_type in (
      'deposit', 'balance', 'full', 'installment'
    )),
  add column if not exists payment_reference text,
  add column if not exists confirmed_itinerary text;

alter table public.package_reservations
  add column if not exists payment_due_at date,
  add column if not exists payment_request_sent_at timestamptz,
  add column if not exists payment_request_amount numeric(12, 2)
    check (payment_request_amount is null or payment_request_amount > 0),
  add column if not exists payment_request_type text
    check (payment_request_type is null or payment_request_type in (
      'deposit', 'balance', 'full', 'installment'
    )),
  add column if not exists payment_reference text,
  add column if not exists confirmed_itinerary text;

grant update (
  payment_due_at, payment_request_sent_at, payment_request_amount,
  payment_request_type, payment_reference, confirmed_itinerary
) on public.trip_requests to authenticated;

grant update (
  payment_due_at, payment_request_sent_at, payment_request_amount,
  payment_request_type, payment_reference, confirmed_itinerary
) on public.package_reservations to authenticated;

create index if not exists trip_requests_payment_due_idx
  on public.trip_requests (payment_due_at)
  where payment_status in ('payment-requested', 'deposit-requested');

create index if not exists package_reservations_payment_due_idx
  on public.package_reservations (payment_due_at)
  where payment_status in ('payment-requested', 'deposit-requested');
