-- Applied to production (transvista) on 2026-11-24.
--
-- The six core team roles (the Founder & CEO is the Super Admin / owner).
-- Each narrows the Admin base level to the sections that person needs.
-- Sensitive money (Payments, and money figures on the Overview and Reports)
-- is only visible to roles that include Payments.
-- Safe to re-run: existing roles with the same key are left untouched.
insert into public.admin_roles (key, name, description, base_role, permissions) values
  ('coo', 'Chief Operating Officer',
   'Company-wide operational view: bookings, departures, events, communications, community and reports. No payment ledger or owner settings.',
   'admin', array['requests','departures','messages','events','community','reviews','feedback','analytics']),
  ('cto', 'Chief Technology Officer',
   'Business reports for technical planning. Website, hosting and database tools are managed outside the admin. No financial information.',
   'admin', array['analytics']),
  ('travel_operations', 'Travel Operations & Logistics Manager',
   'Trips, itineraries, departures, transport and traveller follow-ups. Can message travellers. Cannot change payments.',
   'admin', array['requests','departures','events','messages']),
  ('community_communications', 'Community & Communications Lead',
   'Customer messages, community members, testimonials and post-trip feedback.',
   'admin', array['messages','community','reviews','feedback']),
  ('digital_marketing', 'Digital Marketing Manager',
   'Community sign-ups (leads), testimonials and performance reports. No financial information.',
   'admin', array['community','reviews','analytics']),
  ('finance_admin', 'Finance & Administration Manager',
   'Record and verify payments, send receipts, monitor balances and financial reports. Corrections are logged in the audit log for CEO review.',
   'admin', array['payments','requests','analytics'])
on conflict (key) do nothing;

insert into public.audit_log (actor_name, action, target_type, target_id, summary, metadata)
select 'System setup', 'role.created', 'role', r.key, 'Created role "' || r.name || '" (core team setup)',
       jsonb_build_object('baseRole', r.base_role, 'permissions', r.permissions)
from public.admin_roles r
where r.key in ('coo','cto','travel_operations','community_communications','digital_marketing','finance_admin')
  and not exists (select 1 from public.audit_log a where a.action = 'role.created' and a.target_id = r.key);
