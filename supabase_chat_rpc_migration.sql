-- UniDate: RPCs protegidas para criar conversas e enviar mensagens diretas.
-- Aplicadas no projeto Supabase xrwsmxqxqzrqzqmyjcwt.

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
  if current_user_id is null then raise exception 'Usuário não autenticado'; end if;
  if target_user_id is null or target_user_id = current_user_id then raise exception 'Destinatário inválido'; end if;
  if not exists (select 1 from public.profiles where id = target_user_id) then raise exception 'Perfil do destinatário não encontrado'; end if;

  select first_member.chat_id into direct_chat_id
  from public.chat_participants first_member
  join public.chat_participants second_member on second_member.chat_id = first_member.chat_id
  join public.chats chat_row on chat_row.id = first_member.chat_id
  where first_member.user_id = current_user_id and second_member.user_id = target_user_id
    and chat_row.type = 'direct' and chat_row.is_active = true
  limit 1;

  if direct_chat_id is not null then return direct_chat_id; end if;

  insert into public.chats (type, is_active) values ('direct', true) returning id into direct_chat_id;
  insert into public.chat_participants (chat_id, user_id)
  values (direct_chat_id, current_user_id), (direct_chat_id, target_user_id);
  return direct_chat_id;
end;
$$;

create or replace function public.send_chat_message(
  target_chat_id uuid,
  message_content text,
  message_type text default 'text',
  reply_to_message_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_user_name text;
  created_message_id uuid;
begin
  if current_user_id is null then raise exception 'Usuário não autenticado'; end if;
  if target_chat_id is null or coalesce(trim(message_content), '') = '' then raise exception 'Mensagem inválida'; end if;
  if not exists (select 1 from public.chat_participants where chat_id = target_chat_id and user_id = current_user_id) then
    raise exception 'Usuário não participa desta conversa';
  end if;

  select display_name into current_user_name from public.profiles where id = current_user_id;
  insert into public.messages (chat_id, sender_id, sender_name, content, type, reply_to, is_read)
  values (target_chat_id, current_user_id, coalesce(current_user_name, 'Usuário'), message_content,
          coalesce(nullif(message_type, ''), 'text'), reply_to_message_id, false)
  returning id into created_message_id;

  update public.chats set last_message = message_content, last_message_at = now() where id = target_chat_id;
  return created_message_id;
end;
$$;

revoke all on function public.create_direct_chat(uuid) from public;
revoke all on function public.send_chat_message(uuid, text, text, uuid) from public;
grant execute on function public.create_direct_chat(uuid) to authenticated;
grant execute on function public.send_chat_message(uuid, text, text, uuid) to authenticated;
