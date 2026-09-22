-- Demo bots are regular Supabase Auth users with an explicit automated label.
-- No service-role key is exposed to the frontend.
CREATE TABLE IF NOT EXISTS public.bot_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  bot_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  bio TEXT NOT NULL,
  personality TEXT NOT NULL,
  interests TEXT[] NOT NULL DEFAULT '{}',
  photo_url TEXT,
  is_automated BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.bot_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários autenticados podem ver bots" ON public.bot_profiles;
CREATE POLICY "Usuários autenticados podem ver bots"
  ON public.bot_profiles FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS bot_profiles_active_idx
  ON public.bot_profiles (is_active, created_at DESC);

COMMENT ON TABLE public.bot_profiles IS
  'Perfis automatizados de demonstração. Nunca devem ser apresentados como pessoas reais.';

CREATE TABLE IF NOT EXISTS public.bot_operators (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.bot_operators ENABLE ROW LEVEL SECURITY;
-- Explicit deny policy documents that only the Edge Function's service role may read it.
DROP POLICY IF EXISTS "Nenhum cliente lê operadores de bot" ON public.bot_operators;
CREATE POLICY "Nenhum cliente lê operadores de bot"
  ON public.bot_operators FOR SELECT TO authenticated USING (false);

INSERT INTO public.bot_operators (user_id)
SELECT id FROM auth.users WHERE lower(email) = lower('matheusfc777@gmail.com')
ON CONFLICT (user_id) DO UPDATE SET is_active = TRUE;
