-- UniDate: criação segura de conversas diretas entre usuários autenticados.
-- A função faz as duas inclusões no banco em uma única operação protegida.

create or replace function public.create_direct_chat(target_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  direct_chat_id uuid;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  if target_user_id is null or target_user_id = current_user_id then
    raise exception 'Destinatário inválido';
  end if;

  if not exists (select 1 from public.profiles where id = target_user_id) then
    raise exception 'Perfil do destinatário não encontrado';
  end if;

  select first_member.chat_id
    into direct_chat_id
  from public.chat_participants first_member
  join public.chat_participants second_member
    on second_member.chat_id = first_member.chat_id
  join public.chats chat_row
    on chat_row.id = first_member.chat_id
  where first_member.user_id = current_user_id
    and second_member.user_id = target_user_id
    and chat_row.type = 'direct'
    and chat_row.is_active = true
  limit 1;

  if direct_chat_id is not null then
    return direct_chat_id;
  end if;

  insert into public.chats (type, is_active)
  values ('direct', true)
  returning id into direct_chat_id;

  insert into public.chat_participants (chat_id, user_id)
  values (direct_chat_id, current_user_id), (direct_chat_id, target_user_id);

  return direct_chat_id;
end;
$$;

revoke all on function public.create_direct_chat(uuid) from public;
grant execute on function public.create_direct_chat(uuid) to authenticated;

drop policy if exists "Participantes podem atualizar leitura das mensagens" on public.messages;
create policy "Participantes podem atualizar leitura das mensagens"
  on public.messages
  for update to authenticated
  using (exists (
    select 1 from public.chat_participants cp
    where cp.chat_id = messages.chat_id and cp.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.chat_participants cp
    where cp.chat_id = messages.chat_id and cp.user_id = (select auth.uid())
  ));

alter publication supabase_realtime add table public.messages;
