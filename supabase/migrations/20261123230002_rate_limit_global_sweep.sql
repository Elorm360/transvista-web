-- Applied to production (transvista) on 2026-11-23.
--
-- Prune rows from rate-limit keys that are never called again. Windows are at
-- most 24 hours, so anything older is never needed. Runs on ~2% of calls.

create index if not exists rate_limit_hits_time_idx
  on private.rate_limit_hits (hit_at);

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

  -- Occasionally sweep rows from keys that are no longer used.
  if random() < 0.02 then
    delete from private.rate_limit_hits where hit_at < now() - interval '1 day';
  end if;

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

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
