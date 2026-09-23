-- O agendador chama um procedimento SECURITY DEFINER sem expor chave de serviço.
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
DECLARE existing_job_id BIGINT;
BEGIN
  SELECT jobid INTO existing_job_id FROM cron.job WHERE jobname = 'unidate-bot-automation';
  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;
  PERFORM cron.schedule('unidate-bot-automation', '*/15 * * * *', 'select public.run_bot_automation();');
END;
$$;
