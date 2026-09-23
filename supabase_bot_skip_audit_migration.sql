-- Registra no histórico os ciclos administrativos que terminam antes de escolher uma personagem.
create or replace function public.run_bot_automation_for_admin()
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'auth', 'pg_catalog'
as $function$
declare
  result jsonb;
  reason text;
begin
  if not public.is_bot_admin() then
    raise exception 'Acesso administrativo necessário';
  end if;

  result := public.run_bot_automation();
  reason := result ->> 'reason';

  if result ->> 'action' = 'skip'
     and reason in ('automação pausada', 'Nenhum perfil estava elegível neste ciclo') then
    insert into public.bot_activity_logs (bot_key, action, decision_reason, status)
    values ('system', 'skip', reason, 'skipped');
  end if;

  return result;
end;
$function$;
