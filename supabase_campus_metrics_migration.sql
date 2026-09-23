-- Returns only an aggregate count; raw activity logs remain private.
create or replace function public.get_active_people_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(distinct user_id)::integer
  from public.site_activity_logs
  where action = 'page_view'
    and created_at >= now() - interval '15 minutes';
$$;

revoke all on function public.get_active_people_count() from public, anon;
grant execute on function public.get_active_people_count() to authenticated;
