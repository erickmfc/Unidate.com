-- Configuração e execução segura dos personagens virtuais do campus.
-- Os perfis aparecem com identificação pública de personagem virtual.

ALTER TABLE public.bot_profiles
  ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT 'Saquarema',
  ADD COLUMN IF NOT EXISTS institution TEXT NOT NULL DEFAULT 'UniDate Campus',
  ADD COLUMN IF NOT EXISTS public_disclosure TEXT NOT NULL DEFAULT 'Personagem virtual',
  ADD COLUMN IF NOT EXISTS writing_style TEXT NOT NULL DEFAULT 'conversa universitária',
  ADD COLUMN IF NOT EXISTS topics TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS post_templates TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS comment_templates TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS initiative_level TEXT NOT NULL DEFAULT 'normal'
    CHECK (initiative_level IN ('reserved', 'normal', 'high')),
  ADD COLUMN IF NOT EXISTS daily_post_limit INTEGER NOT NULL DEFAULT 1
    CHECK (daily_post_limit BETWEEN 0 AND 8),
  ADD COLUMN IF NOT EXISTS daily_comment_limit INTEGER NOT NULL DEFAULT 2
    CHECK (daily_comment_limit BETWEEN 0 AND 20),
  ADD COLUMN IF NOT EXISTS response_probability NUMERIC(4,3) NOT NULL DEFAULT 0.15
    CHECK (response_probability BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS active_hours_start TIME NOT NULL DEFAULT '08:00',
  ADD COLUMN IF NOT EXISTS active_hours_end TIME NOT NULL DEFAULT '23:00',
  ADD COLUMN IF NOT EXISTS cadence_minutes INTEGER NOT NULL DEFAULT 1440
    CHECK (cadence_minutes BETWEEN 15 AND 10080),
  ADD COLUMN IF NOT EXISTS next_action_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS last_action_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.bot_automation_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id = TRUE),
  intensity TEXT NOT NULL DEFAULT 'normal'
    CHECK (intensity IN ('off', 'low', 'normal', 'high', 'custom')),
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  posts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  comments_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  require_approval BOOLEAN NOT NULL DEFAULT FALSE,
  paused_until TIMESTAMPTZ,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.bot_automation_settings (id)
VALUES (TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.bot_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_key TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('post', 'comment', 'skip', 'error')),
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  target_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  target_author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT,
  decision_reason TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'skipped', 'error', 'pending')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS bot_activity_logs_created_idx
  ON public.bot_activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS bot_activity_logs_target_idx
  ON public.bot_activity_logs (bot_key, target_post_id, created_at DESC);

ALTER TABLE public.bot_automation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_bot_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.bot_operators
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
    OR COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('admin', 'super_admin');
$$;

DROP POLICY IF EXISTS "Administradores leem configuração de bots" ON public.bot_automation_settings;
CREATE POLICY "Administradores leem configuração de bots"
  ON public.bot_automation_settings FOR SELECT TO authenticated
  USING (public.is_bot_admin());

DROP POLICY IF EXISTS "Administradores leem histórico de bots" ON public.bot_activity_logs;
CREATE POLICY "Administradores leem histórico de bots"
  ON public.bot_activity_logs FOR SELECT TO authenticated
  USING (public.is_bot_admin());

CREATE OR REPLACE FUNCTION public.update_bot_automation_settings(
  p_intensity TEXT,
  p_is_enabled BOOLEAN,
  p_posts_enabled BOOLEAN,
  p_comments_enabled BOOLEAN,
  p_require_approval BOOLEAN,
  p_paused_until TIMESTAMPTZ DEFAULT NULL
)
RETURNS public.bot_automation_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
DECLARE result public.bot_automation_settings;
BEGIN
  IF NOT public.is_bot_admin() THEN
    RAISE EXCEPTION 'Acesso administrativo necessário';
  END IF;

  UPDATE public.bot_automation_settings
  SET intensity = p_intensity,
      is_enabled = p_is_enabled,
      posts_enabled = p_posts_enabled,
      comments_enabled = p_comments_enabled,
      require_approval = p_require_approval,
      paused_until = p_paused_until,
      updated_by = auth.uid(),
      updated_at = timezone('utc'::text, now())
  WHERE id = TRUE
  RETURNING * INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_bot_profile_settings(
  p_bot_key TEXT,
  p_is_active BOOLEAN DEFAULT NULL,
  p_daily_post_limit INTEGER DEFAULT NULL,
  p_daily_comment_limit INTEGER DEFAULT NULL,
  p_response_probability NUMERIC DEFAULT NULL,
  p_initiative_level TEXT DEFAULT NULL
)
RETURNS public.bot_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
DECLARE result public.bot_profiles;
BEGIN
  IF NOT public.is_bot_admin() THEN
    RAISE EXCEPTION 'Acesso administrativo necessário';
  END IF;

  UPDATE public.bot_profiles
  SET is_active = COALESCE(p_is_active, is_active),
      daily_post_limit = COALESCE(p_daily_post_limit, daily_post_limit),
      daily_comment_limit = COALESCE(p_daily_comment_limit, daily_comment_limit),
      response_probability = COALESCE(p_response_probability, response_probability),
      initiative_level = COALESCE(p_initiative_level, initiative_level),
      updated_at = timezone('utc'::text, now())
  WHERE bot_key = p_bot_key
  RETURNING * INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.run_bot_automation()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
DECLARE
  cfg public.bot_automation_settings;
  actor public.bot_profiles;
  target public.posts;
  new_post public.posts;
  chosen_content TEXT;
  chosen_action TEXT := 'skip';
  decision TEXT := 'Nenhum perfil estava elegível neste ciclo';
  topic TEXT;
  cooldown INTEGER;
  posts_today INTEGER;
  comments_today INTEGER;
  intensity_factor NUMERIC := 1;
BEGIN
  SELECT * INTO cfg FROM public.bot_automation_settings WHERE id = TRUE;
  IF cfg IS NULL OR NOT cfg.is_enabled OR cfg.intensity = 'off'
     OR (cfg.paused_until IS NOT NULL AND cfg.paused_until > timezone('utc'::text, now())) THEN
    RETURN jsonb_build_object('ok', true, 'action', 'skip', 'reason', 'automação pausada');
  END IF;

  intensity_factor := CASE cfg.intensity WHEN 'low' THEN 0.55 WHEN 'high' THEN 1.8 ELSE 1 END;

  SELECT bp.* INTO actor
  FROM public.bot_profiles bp
  WHERE bp.is_active
    AND bp.next_action_at <= timezone('utc'::text, now())
    AND (timezone('utc'::text, now())::time BETWEEN bp.active_hours_start AND bp.active_hours_end)
  ORDER BY random()
  LIMIT 1;

  IF actor IS NULL THEN
    RETURN jsonb_build_object('ok', true, 'action', 'skip', 'reason', decision);
  END IF;

  SELECT count(*)::INTEGER INTO posts_today
  FROM public.posts
  WHERE author_id = actor.auth_user_id
    AND created_at >= date_trunc('day', timezone('utc'::text, now()));
  SELECT count(*)::INTEGER INTO comments_today
  FROM public.comments
  WHERE author_id = actor.auth_user_id
    AND created_at >= date_trunc('day', timezone('utc'::text, now()));

  -- Personagens mais ativas entram em conversas existentes antes de abrir um novo tópico.
  IF cfg.comments_enabled AND actor.daily_comment_limit > comments_today
     AND actor.initiative_level = 'high'
     AND random() <= LEAST(1, actor.response_probability * intensity_factor) THEN
    SELECT p.* INTO target
    FROM public.posts p
    WHERE p.author_id <> actor.auth_user_id
      AND p.created_at >= timezone('utc'::text, now()) - interval '72 hours'
      AND EXISTS (
        SELECT 1 FROM unnest(actor.topics) AS t(topic)
        WHERE lower(coalesce(p.content, '')) LIKE '%' || lower(t.topic) || '%'
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.bot_activity_logs l
        WHERE l.bot_key = actor.bot_key
          AND l.target_post_id = p.id
          AND l.created_at >= timezone('utc'::text, now()) - interval '7 days'
      )
    ORDER BY random()
    LIMIT 1;

    IF target IS NOT NULL THEN
      topic := COALESCE((SELECT t.topic FROM unnest(actor.topics) AS t(topic)
                         WHERE lower(coalesce(target.content, '')) LIKE '%' || lower(t.topic) || '%' LIMIT 1), 'campus');
      chosen_content := COALESCE(actor.comment_templates[1 + floor(random() * GREATEST(array_length(actor.comment_templates, 1), 1))::INTEGER],
        'Essa parte sobre ' || topic || ' acontece muito por aqui. Como vocês estão lidando com isso?');
      INSERT INTO public.comments (post_id, author_id, content)
      VALUES (target.id, actor.auth_user_id, chosen_content);
      UPDATE public.posts SET comments_count = COALESCE(comments_count, 0) + 1 WHERE id = target.id;
      INSERT INTO public.bot_activity_logs (bot_key, action, target_post_id, target_author_id, content, decision_reason, metadata)
      VALUES (actor.bot_key, 'comment', target.id, target.author_id, chosen_content,
              'Comentário contextual distribuído por tema; limite diário respeitado',
              jsonb_build_object('public_disclosure', actor.public_disclosure, 'topic', topic));
      chosen_action := 'comment';
      decision := 'Comentário contextual publicado';
    END IF;
  END IF;

  IF chosen_action = 'skip' AND cfg.posts_enabled AND posts_today < actor.daily_post_limit THEN
    chosen_content := COALESCE(actor.post_templates[1 + floor(random() * GREATEST(array_length(actor.post_templates, 1), 1))::INTEGER],
      'Mais um dia de faculdade em Saquarema: uma tarefa resolvida e outra entrando na lista.');
    INSERT INTO public.posts (author_id, content, type, hashtags)
    VALUES (actor.auth_user_id, chosen_content, 'text', actor.topics)
    RETURNING * INTO new_post;
    INSERT INTO public.bot_activity_logs (bot_key, action, post_id, content, decision_reason, metadata)
    VALUES (actor.bot_key, 'post', new_post.id, chosen_content,
            'Post escolhido pelo calendário da personagem e pelo limite diário',
            jsonb_build_object('public_disclosure', actor.public_disclosure, 'city', actor.city));
    chosen_action := 'post';
    decision := 'Post publicado';
  END IF;

  cooldown := GREATEST(15, round(actor.cadence_minutes / intensity_factor)::INTEGER);
  UPDATE public.bot_profiles
  SET last_action_at = timezone('utc'::text, now()),
      next_action_at = timezone('utc'::text, now()) + make_interval(mins => cooldown),
      updated_at = timezone('utc'::text, now())
  WHERE bot_key = actor.bot_key;

  IF chosen_action = 'skip' THEN
    INSERT INTO public.bot_activity_logs (bot_key, action, decision_reason, status)
    VALUES (actor.bot_key, 'skip', 'Limite diário ou contexto insuficiente', 'skipped');
  END IF;

  RETURN jsonb_build_object('ok', true, 'action', chosen_action, 'bot_key', actor.bot_key, 'reason', decision);
END;
$$;

CREATE OR REPLACE FUNCTION public.run_bot_automation_for_admin()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
BEGIN
  IF NOT public.is_bot_admin() THEN
    RAISE EXCEPTION 'Acesso administrativo necessário';
  END IF;
  RETURN public.run_bot_automation();
END;
$$;

REVOKE ALL ON FUNCTION public.run_bot_automation() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.run_bot_automation_for_admin() TO authenticated;
