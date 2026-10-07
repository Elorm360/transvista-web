-- Archive requests safely and permit tightly controlled owner-only cleanup.
alter table public.trip_requests
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references public.admin_team_members(id) on delete set null,
  add column if not exists archive_reason text;

alter table public.package_reservations
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references public.admin_team_members(id) on delete set null,
  add column if not exists archive_reason text;

alter table public.trip_requests
  drop constraint if exists trip_requests_archive_reason_length;
alter table public.trip_requests
  add constraint trip_requests_archive_reason_length
  check (archive_reason is null or char_length(archive_reason) <= 500);

alter table public.package_reservations
  drop constraint if exists package_reservations_archive_reason_length;
alter table public.package_reservations
  add constraint package_reservations_archive_reason_length
  check (archive_reason is null or char_length(archive_reason) <= 500);

alter table public.request_activity
  drop constraint if exists request_activity_activity_type_check;
alter table public.request_activity
  add constraint request_activity_activity_type_check
  check (activity_type in (
    'update',
    'status',
    'assignment',
    'payment',
    'follow-up',
    'note',
    'archive',
    'delete'
  ));

create or replace function public.set_request_archive(
  p_kind text,
  p_request_id bigint,
  p_archived boolean,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member_id uuid;
  v_reference text;
  v_status text;
  v_reason text;
begin
  select id
    into v_member_id
  from public.admin_team_members
  where user_id = auth.uid()
    and status = 'active'
    and role in ('owner', 'admin', 'support');

  if v_member_id is null then
    raise exception 'You do not have permission to manage requests.';
  end if;

  v_reason := nullif(left(trim(coalesce(p_reason, '')), 500), '');
  if p_archived and (v_reason is null or char_length(v_reason) < 3) then
    raise exception 'Add a short reason for archiving this request.';
  end if;

  if p_kind = 'custom' then
    update public.trip_requests
      set archived_at = case when p_archived then now() else null end,
          archived_by = case when p_archived then v_member_id else null end,
          archive_reason = case when p_archived then v_reason else null end,
          updated_by = v_member_id,
          updated_at = now()
    where id = p_request_id
    returning reference, status into v_reference, v_status;
  elsif p_kind = 'package' then
    update public.package_reservations
      set archived_at = case when p_archived then now() else null end,
          archived_by = case when p_archived then v_member_id else null end,
          archive_reason = case when p_archived then v_reason else null end,
          updated_by = v_member_id,
          updated_at = now()
    where id = p_request_id
    returning reference, status into v_reference, v_status;
  else
    raise exception 'This request type is not supported.';
  end if;

  if v_reference is null then
    raise exception 'Request not found.';
  end if;

  insert into public.request_activity (
    request_kind,
    request_id,
    reference,
    activity_type,
    summary,
    from_status,
    to_status,
    author_member_id
  ) values (
    p_kind,
    p_request_id,
    v_reference,
    'archive',
    case
      when p_archived then 'Archived from the active queue. Reason: ' || v_reason
      else 'Restored to the active request queue.'
    end,
    v_status,
    v_status,
    v_member_id
  );
end;
$$;

create or replace function public.delete_archived_request(
  p_kind text,
  p_request_id bigint,
  p_confirmation_reference text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member_id uuid;
  v_reference text;
  v_status text;
  v_payment_status text;
  v_amount_paid numeric;
  v_archived_at timestamptz;
begin
  select id
    into v_member_id
  from public.admin_team_members
  where user_id = auth.uid()
    and status = 'active'
    and role = 'owner';

  if v_member_id is null then
    raise exception 'Only the account owner can permanently delete requests.';
  end if;

  if p_kind = 'custom' then
    select reference, status, payment_status, coalesce(amount_paid, 0), archived_at
      into v_reference, v_status, v_payment_status, v_amount_paid, v_archived_at
    from public.trip_requests
    where id = p_request_id
    for update;
  elsif p_kind = 'package' then
    select reference, status, payment_status, coalesce(amount_paid, 0), archived_at
      into v_reference, v_status, v_payment_status, v_amount_paid, v_archived_at
    from public.package_reservations
    where id = p_request_id
    for update;
  else
    raise exception 'This request type is not supported.';
  end if;

  if v_reference is null then
    raise exception 'Request not found.';
  end if;
  if v_archived_at is null then
    raise exception 'Archive the request before permanently deleting it.';
  end if;
  if trim(coalesce(p_confirmation_reference, '')) <> v_reference then
    raise exception 'The confirmation reference does not match.';
  end if;
  if v_amount_paid > 0 or coalesce(v_payment_status, 'not-requested') <> 'not-requested' then
    raise exception 'Requests with payment history cannot be permanently deleted. Keep this request archived.';
  end if;

  if p_kind = 'custom' then
    if v_status not in ('new', 'reviewing', 'contacted', 'cancelled', 'closed') then
      raise exception 'This request has progressed too far for permanent deletion. Keep it archived.';
    end if;
    if exists (
      select 1 from public.transport_assignments
      where trip_request_id = p_request_id
    ) then
      raise exception 'Requests with transport assignments cannot be permanently deleted.';
    end if;
  else
    if v_status not in ('pending-review', 'waitlisted', 'cancelled') then
      raise exception 'This request has progressed too far for permanent deletion. Keep it archived.';
    end if;
  end if;

  insert into public.request_activity (
    request_kind,
    request_id,
    reference,
    activity_type,
    summary,
    from_status,
    to_status,
    author_member_id
  ) values (
    p_kind,
    p_request_id,
    v_reference,
    'delete',
    'Permanently deleted archived request ' || v_reference || '.',
    v_status,
    v_status,
    v_member_id
  );

  if p_kind = 'custom' then
    delete from public.trip_requests where id = p_request_id;
  else
    delete from public.package_reservations where id = p_request_id;
  end if;
end;
$$;

revoke all on function public.set_request_archive(text, bigint, boolean, text) from public, anon;
revoke all on function public.delete_archived_request(text, bigint, text) from public, anon;
grant execute on function public.set_request_archive(text, bigint, boolean, text) to authenticated;
grant execute on function public.delete_archived_request(text, bigint, text) to authenticated;

comment on function public.set_request_archive(text, bigint, boolean, text)
  is 'Archives or restores a booking request and records the action atomically.';
comment on function public.delete_archived_request(text, bigint, text)
  is 'Owner-only permanent deletion for archived test/duplicate requests without payments or assignments.';
