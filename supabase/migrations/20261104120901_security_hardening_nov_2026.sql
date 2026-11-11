-- 1. Logged-out visitors should never be able to call the payment-correction tool
revoke execute on function public.adjust_package_payment(bigint, numeric, text, timestamptz) from anon, public;

-- 2. Missing indexes on foreign keys
create index if not exists driver_applications_reviewed_by_idx on public.driver_applications (reviewed_by);
create index if not exists pricing_rate_cards_created_by_idx on public.pricing_rate_cards (created_by);
create index if not exists transport_assignments_assigned_by_idx on public.transport_assignments (assigned_by);
create index if not exists transport_assignments_driver_application_id_idx on public.transport_assignments (driver_application_id);
create index if not exists transport_assignments_updated_by_idx on public.transport_assignments (updated_by);
