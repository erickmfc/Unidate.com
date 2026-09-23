-- User sign-in/sign-out records and website/event activity for UniDate.
-- Authentication audit details (including failed attempts) remain in
-- Supabase's managed auth.audit_log_entries table.

CREATE TABLE IF NOT EXISTS public.site_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('login', 'logout', 'page_view')),
  page_path TEXT CHECK (page_path IS NULL OR char_length(page_path) <= 512),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (
    action IN ('view', 'rsvp_going', 'rsvp_maybe', 'rsvp_cancelled', 'created', 'shared')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_activity_logs_user_created_idx
  ON public.site_activity_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS site_activity_logs_action_created_idx
  ON public.site_activity_logs (action, created_at DESC);

CREATE INDEX IF NOT EXISTS event_activity_logs_user_created_idx
  ON public.event_activity_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS event_activity_logs_event_action_created_idx
  ON public.event_activity_logs (event_id, action, created_at DESC);

ALTER TABLE public.site_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_activity_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.site_activity_logs FROM anon, authenticated;
REVOKE ALL ON TABLE public.event_activity_logs FROM anon, authenticated;
GRANT INSERT (user_id, action, page_path) ON TABLE public.site_activity_logs TO authenticated;
GRANT INSERT (user_id, event_id, action) ON TABLE public.event_activity_logs TO authenticated;
GRANT ALL ON TABLE public.site_activity_logs TO service_role;
GRANT ALL ON TABLE public.event_activity_logs TO service_role;

DROP POLICY IF EXISTS "Users can insert their own site activity" ON public.site_activity_logs;
CREATE POLICY "Users can insert their own site activity"
  ON public.site_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own event activity" ON public.event_activity_logs;
CREATE POLICY "Users can insert their own event activity"
  ON public.event_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

COMMENT ON TABLE public.site_activity_logs IS
  'Login, logout and page-view activity. Authentication audit details are also kept by Supabase in auth.audit_log_entries.';
COMMENT ON TABLE public.event_activity_logs IS
  'User interactions with UniDate events, including event views, RSVPs, creation and shares.';
