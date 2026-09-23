-- Autoriza a conta administrativa de operação dos bots.
-- A inserção é idempotente e não cria usuário nem altera senha.
insert into public.bot_operators (user_id, is_active)
select id, true
from auth.users
where email = 'admin@unidate.com'
on conflict (user_id) do update set is_active = true;
