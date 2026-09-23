create or replace function public.sync_group_member_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.groups set members_count = coalesce(members_count, 0) + 1 where id = new.group_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.groups set members_count = greatest(coalesce(members_count, 0) - 1, 0) where id = old.group_id;
    return old;
  elsif old.group_id is distinct from new.group_id then
    update public.groups set members_count = greatest(coalesce(members_count, 0) - 1, 0) where id = old.group_id;
    update public.groups set members_count = coalesce(members_count, 0) + 1 where id = new.group_id;
    return new;
  end if;
  return new;
end;
$$;

drop trigger if exists group_members_sync_count on public.group_members;
create trigger group_members_sync_count
after insert or update of group_id or delete on public.group_members
for each row execute function public.sync_group_member_count();

update public.groups as g
set members_count = coalesce(m.member_count, 0)
from (
  select g2.id, count(gm.user_id)::integer as member_count
  from public.groups as g2
  left join public.group_members as gm on gm.group_id = g2.id
  group by g2.id
) as m
where m.id = g.id;

alter table public.groups alter column members_count set default 0;
alter table public.groups alter column members_count set not null;
