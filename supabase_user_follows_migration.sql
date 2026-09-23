-- Follow graph used by colleague suggestions, profile actions and the feed.
CREATE TABLE IF NOT EXISTS public.user_follows (
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT user_follows_no_self_follow CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS user_follows_following_idx
  ON public.user_follows (following_id, created_at DESC);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.user_follows FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.user_follows TO authenticated;
GRANT ALL ON TABLE public.user_follows TO service_role;

DROP POLICY IF EXISTS "Authenticated users can read follows" ON public.user_follows;
DROP POLICY IF EXISTS "Users can follow from their own account" ON public.user_follows;
DROP POLICY IF EXISTS "Users can unfollow from their own account" ON public.user_follows;

CREATE POLICY "Authenticated users can read follows"
  ON public.user_follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can follow from their own account"
  ON public.user_follows FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = follower_id);
CREATE POLICY "Users can unfollow from their own account"
  ON public.user_follows FOR DELETE TO authenticated
  USING ((select auth.uid()) = follower_id);

COMMENT ON TABLE public.user_follows IS
  'Directed follows between UniDate users, separate from mutual matches.';
