-- Server-only quota accounting. No trip text or IP addresses are stored.
create table public.ai_planner_usage (
  quota_key text not null check (length(quota_key) between 6 and 100),
  day date not null default (now() at time zone 'utc')::date,
  uses integer not null default 0 check (uses >= 0),
  primary key (quota_key, day)
);
alter table public.ai_planner_usage enable row level security;
revoke all on public.ai_planner_usage from public, anon, authenticated;
grant select, insert, update on public.ai_planner_usage to service_role;

create or replace function public.consume_ai_planner_quota(p_key text, p_limit int)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare permitted boolean;
begin
  if length(p_key) not between 6 and 100 or p_limit not between 1 and 1000 then
    return false;
  end if;
  insert into public.ai_planner_usage (quota_key, day, uses)
    values (p_key, (now() at time zone 'utc')::date, 1)
    on conflict (quota_key, day) do update
      set uses = ai_planner_usage.uses + 1
      where ai_planner_usage.uses < p_limit
    returning true into permitted;
  return coalesce(permitted, false);
end;
$$;
revoke all on function public.consume_ai_planner_quota(text, int) from public, anon, authenticated;
grant execute on function public.consume_ai_planner_quota(text, int) to service_role;
