-- Applied to production (transvista) on 2026-11-23.
--
-- Durable rate limiting for public forms (waitlist, trip requests, package
-- reservations, event feedback, reviews). Works across serverless instances,
-- unlike in-memory counters. Keys are opaque hashes built on the server
-- (e.g. "trip_request:ip:<sha256>"), so no raw IPs or emails are stored.

create schema if not exists private;

create table if not exists private.rate_limit_hits (
  id bigint generated always as identity primary key,
  key text not null check (char_length(key) between 1 and 200),
  hit_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_key_time_idx
  on private.rate_limit_hits (key, hit_at desc);

alter table private.rate_limit_hits enable row level security;
revoke all on private.rate_limit_hits from public, anon, authenticated;

-- Record one attempt for p_key and report whether it is within the limit.
-- Returns true when allowed, false when the caller should be throttled.
create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if p_key is null or char_length(p_key) not between 1 and 200
     or p_limit < 1 or p_limit > 1000
     or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'Invalid rate limit arguments' using errcode = '22023';
  end if;

  -- Serialise concurrent calls for the same key.
  perform pg_advisory_xact_lock(hashtextextended(p_key, 0));

  delete from private.rate_limit_hits
  where key = p_key
    and hit_at < now() - make_interval(secs => p_window_seconds);

  select count(*) into v_count
  from private.rate_limit_hits
  where key = p_key;

  if v_count >= p_limit then
    return false;
  end if;

  insert into private.rate_limit_hits (key) values (p_key);
  return true;
end;
$$;

-- Server-only: called with the service-role key, never from browsers.
revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
