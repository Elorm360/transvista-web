revoke all on table public.trip_requests from anon, authenticated;
revoke all on table public.package_reservations from anon, authenticated;
revoke all on sequence public.trip_requests_id_seq from anon, authenticated;
revoke all on sequence public.package_reservations_id_seq from anon, authenticated;

grant usage on sequence public.trip_requests_id_seq to anon, authenticated;
grant usage on sequence public.package_reservations_id_seq to anon, authenticated;

grant insert (
  reference, full_name, email, phone, country, destinations, services, interests,
  travel_start, travel_end, date_flexibility, adults, children, budget_currency,
  budget_basis, budget_range, accommodation_style, transport_details, notes,
  policy_version, policy_accepted_at
) on public.trip_requests to anon, authenticated;

grant insert (
  reference, package_slug, package_title, package_date, full_name, email, phone,
  city, emergency_contact_name, emergency_contact_phone, travellers,
  dietary_requirements, notes, currency, price_per_person, total_price,
  deposit_per_person, deposit_due, balance_per_person, promotional_media_consent,
  media_notice_acknowledged_at, policy_version, policy_accepted_at
) on public.package_reservations to anon, authenticated;

grant select on public.trip_requests to authenticated;
grant select on public.package_reservations to authenticated;

drop policy if exists "Public can submit trip requests" on public.trip_requests;
create policy "Public can submit trip requests"
on public.trip_requests
for insert
to anon, authenticated
with check (
  status = 'new'
  and policy_version = '2026-08-07'
  and policy_accepted_at is not null
  and policy_accepted_at between now() - interval '10 minutes' and now() + interval '10 minutes'
);

drop policy if exists "TransVista team can view trip requests" on public.trip_requests;
create policy "TransVista team can view trip requests"
on public.trip_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_team_members as member
    where member.user_id = (select auth.uid())
      and member.status = 'active'
      and member.role in ('owner', 'admin', 'support')
  )
);

drop policy if exists "Public can submit package reservations" on public.package_reservations;
create policy "Public can submit package reservations"
on public.package_reservations
for insert
to anon, authenticated
with check (
  status = 'pending-review'
  and payment_status = 'not-requested'
  and policy_version = '2026-08-07'
  and policy_accepted_at is not null
  and media_notice_acknowledged_at is not null
  and policy_accepted_at between now() - interval '10 minutes' and now() + interval '10 minutes'
);

drop policy if exists "TransVista team can view package reservations" on public.package_reservations;
create policy "TransVista team can view package reservations"
on public.package_reservations
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_team_members as member
    where member.user_id = (select auth.uid())
      and member.status = 'active'
      and member.role in ('owner', 'admin', 'support')
  )
);