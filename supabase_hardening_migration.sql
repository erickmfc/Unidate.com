-- UniDate: hardening da camada Supabase para o TCC.
-- Remove políticas legadas abertas e deixa o acesso condicionado à sessão e à posse.

-- As tabelas principais já existem no projeto restaurado. O bloco é idempotente.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS last_message TEXT;
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_avatar TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES public.messages(id) ON DELETE SET NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS university TEXT DEFAULT 'Universidade não informada';
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS editors UUID[] DEFAULT '{}';
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 100;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS upcoming_events JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Limpeza idempotente das políticas desta aplicação.
DROP POLICY IF EXISTS "Usuários autenticados podem ler perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem excluir seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários autenticados podem ler posts" ON public.posts;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios posts" ON public.posts;
DROP POLICY IF EXISTS "Usuários podem excluir seus próprios posts" ON public.posts;
DROP POLICY IF EXISTS "Usuários autenticados podem ler curtidas" ON public.likes;
DROP POLICY IF EXISTS "Usuários podem criar suas próprias curtidas" ON public.likes;
DROP POLICY IF EXISTS "Usuários podem remover suas próprias curtidas" ON public.likes;
DROP POLICY IF EXISTS "Usuários autenticados podem ler comentários" ON public.comments;
DROP POLICY IF EXISTS "Usuários podem criar seus próprios comentários" ON public.comments;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios comentários" ON public.comments;
DROP POLICY IF EXISTS "Usuários podem excluir seus próprios comentários" ON public.comments;
DROP POLICY IF EXISTS "Usuários autenticados podem ler grupos" ON public.groups;
DROP POLICY IF EXISTS "Usuários podem criar grupos" ON public.groups;
DROP POLICY IF EXISTS "Criadores podem alterar seus grupos" ON public.groups;
DROP POLICY IF EXISTS "Criadores podem excluir seus grupos" ON public.groups;
DROP POLICY IF EXISTS "Usuários autenticados podem ler membros de grupos" ON public.group_members;
DROP POLICY IF EXISTS "Usuários podem entrar em grupos em seu próprio nome" ON public.group_members;
DROP POLICY IF EXISTS "Usuários podem sair de grupos em seu próprio nome" ON public.group_members;
DROP POLICY IF EXISTS "Participantes podem ler chats" ON public.chats;
DROP POLICY IF EXISTS "Usuários autenticados podem criar chats" ON public.chats;
DROP POLICY IF EXISTS "Participantes podem atualizar chats" ON public.chats;
DROP POLICY IF EXISTS "Participantes podem ler participantes" ON public.chat_participants;
DROP POLICY IF EXISTS "Usuários podem criar participação própria" ON public.chat_participants;
DROP POLICY IF EXISTS "Usuários podem sair de chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Participantes podem ler mensagens" ON public.messages;
DROP POLICY IF EXISTS "Participantes podem enviar mensagens próprias" ON public.messages;
DROP POLICY IF EXISTS "Usuários podem ler seus matches" ON public.matches;
DROP POLICY IF EXISTS "Usuários podem criar matches em seu nome" ON public.matches;
DROP POLICY IF EXISTS "Usuários podem atualizar seus matches" ON public.matches;
DROP POLICY IF EXISTS "Usuários podem excluir seus matches" ON public.matches;

DROP POLICY IF EXISTS "Leitura pública de perfis" ON public.profiles;
DROP POLICY IF EXISTS "Qualquer usuário autenticado pode ver perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem modificar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem manter seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem excluir seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários autenticados podem ler perfis" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "Usuários podem inserir seu próprio perfil" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "Usuários podem excluir seu próprio perfil" ON public.profiles
  FOR DELETE TO authenticated USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Leitura pública de posts" ON public.posts;
DROP POLICY IF EXISTS "Qualquer usuário autenticado pode ver posts" ON public.posts;
DROP POLICY IF EXISTS "Usuários podem criar seus próprios posts" ON public.posts;
DROP POLICY IF EXISTS "Usuários podem editar/excluir seus próprios posts" ON public.posts;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios posts" ON public.posts;
CREATE POLICY "Usuários autenticados podem ler posts" ON public.posts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários podem criar seus próprios posts" ON public.posts
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = author_id);
CREATE POLICY "Usuários podem atualizar seus próprios posts" ON public.posts
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = author_id)
  WITH CHECK ((select auth.uid()) = author_id);
CREATE POLICY "Usuários podem excluir seus próprios posts" ON public.posts
  FOR DELETE TO authenticated USING ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "Leitura pública de curtidas" ON public.likes;
DROP POLICY IF EXISTS "Leitura pública de likes" ON public.likes;
DROP POLICY IF EXISTS "Leitura de curtidas" ON public.likes;
DROP POLICY IF EXISTS "Usuários podem curtir posts" ON public.likes;
DROP POLICY IF EXISTS "Usuários podem descurtir posts" ON public.likes;
CREATE POLICY "Usuários autenticados podem ler curtidas" ON public.likes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários podem criar suas próprias curtidas" ON public.likes
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Usuários podem remover suas próprias curtidas" ON public.likes
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Leitura pública de comentários" ON public.comments;
DROP POLICY IF EXISTS "Usuários podem criar comentários" ON public.comments;
DROP POLICY IF EXISTS "Usuários podem editar/excluir seus comentários" ON public.comments;
CREATE POLICY "Usuários autenticados podem ler comentários" ON public.comments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários podem criar seus próprios comentários" ON public.comments
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = author_id);
CREATE POLICY "Usuários podem atualizar seus próprios comentários" ON public.comments
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = author_id)
  WITH CHECK ((select auth.uid()) = author_id);
CREATE POLICY "Usuários podem excluir seus próprios comentários" ON public.comments
  FOR DELETE TO authenticated USING ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "Usuários autenticados podem ler grupos" ON public.groups;
DROP POLICY IF EXISTS "Usuários podem criar grupos" ON public.groups;
DROP POLICY IF EXISTS "Criadores podem alterar seus grupos" ON public.groups;
DROP POLICY IF EXISTS "Criadores podem excluir seus grupos" ON public.groups;
CREATE POLICY "Usuários autenticados podem ler grupos" ON public.groups
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários podem criar grupos" ON public.groups
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = created_by);
CREATE POLICY "Criadores podem alterar seus grupos" ON public.groups
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by)
  WITH CHECK ((select auth.uid()) = created_by);
CREATE POLICY "Criadores podem excluir seus grupos" ON public.groups
  FOR DELETE TO authenticated USING ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Usuários autenticados podem ler membros de grupos" ON public.group_members;
DROP POLICY IF EXISTS "Usuários podem entrar em grupos em seu próprio nome" ON public.group_members;
DROP POLICY IF EXISTS "Usuários podem sair de grupos em seu próprio nome" ON public.group_members;
CREATE POLICY "Usuários autenticados podem ler membros de grupos" ON public.group_members
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários podem entrar em grupos em seu próprio nome" ON public.group_members
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Usuários podem sair de grupos em seu próprio nome" ON public.group_members
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Qualquer usuário autenticado pode criar chats" ON public.chats;
DROP POLICY IF EXISTS "Usuários podem ver chats participantes" ON public.chats;
DROP POLICY IF EXISTS "Participantes podem ler chats" ON public.chats;
CREATE POLICY "Participantes podem ler chats" ON public.chats
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.chat_participants cp
            WHERE cp.chat_id = chats.id AND cp.user_id = (select auth.uid()))
  );
CREATE POLICY "Usuários autenticados podem criar chats" ON public.chats
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Participantes podem atualizar chats" ON public.chats
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.chat_participants cp
            WHERE cp.chat_id = chats.id AND cp.user_id = (select auth.uid()))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.chat_participants cp
            WHERE cp.chat_id = chats.id AND cp.user_id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "Usuários podem adicionar participantes" ON public.chat_participants;
DROP POLICY IF EXISTS "Usuários podem ver participantes dos chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Participantes podem ler participantes" ON public.chat_participants;
DROP POLICY IF EXISTS "Usuários podem criar participação própria" ON public.chat_participants;
DROP POLICY IF EXISTS "Usuários podem sair de chats" ON public.chat_participants;
CREATE POLICY "Participantes podem ler participantes" ON public.chat_participants
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.chat_participants own
            WHERE own.chat_id = chat_participants.chat_id
              AND own.user_id = (select auth.uid()))
  );
CREATE POLICY "Usuários podem criar participação própria" ON public.chat_participants
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Usuários podem sair de chats" ON public.chat_participants
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Usuários podem ver mensagens dos seus chats" ON public.messages;
DROP POLICY IF EXISTS "Usuários podem enviar mensagens nos seus chats" ON public.messages;
DROP POLICY IF EXISTS "Participantes podem ler mensagens" ON public.messages;
DROP POLICY IF EXISTS "Participantes podem enviar mensagens próprias" ON public.messages;
CREATE POLICY "Participantes podem ler mensagens" ON public.messages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.chat_participants cp
            WHERE cp.chat_id = messages.chat_id
              AND cp.user_id = (select auth.uid()))
  );
CREATE POLICY "Participantes podem enviar mensagens próprias" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (
    (select auth.uid()) = sender_id
    AND EXISTS (SELECT 1 FROM public.chat_participants cp
                WHERE cp.chat_id = messages.chat_id
                  AND cp.user_id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "Usuários podem ver seus matches" ON public.matches;
DROP POLICY IF EXISTS "Usuários podem criar matches" ON public.matches;
DROP POLICY IF EXISTS "Usuários podem atualizar seus matches" ON public.matches;
DROP POLICY IF EXISTS "Usuários podem deletar seus matches" ON public.matches;
CREATE POLICY "Usuários podem ler seus matches" ON public.matches
  FOR SELECT TO authenticated USING ((select auth.uid()) IN (user1_id, user2_id));
CREATE POLICY "Usuários podem criar matches em seu nome" ON public.matches
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user1_id);
CREATE POLICY "Usuários podem atualizar seus matches" ON public.matches
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) IN (user1_id, user2_id))
  WITH CHECK ((select auth.uid()) IN (user1_id, user2_id));
CREATE POLICY "Usuários podem excluir seus matches" ON public.matches
  FOR DELETE TO authenticated USING ((select auth.uid()) IN (user1_id, user2_id));

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT,
  category TEXT,
  attendees INTEGER DEFAULT 0,
  color TEXT,
  icon TEXT,
  organizer TEXT DEFAULT 'UniDate',
  organizer_type TEXT CHECK (organizer_type IN ('user', 'group', 'official')) DEFAULT 'official',
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura de eventos para todos" ON public.events;
DROP POLICY IF EXISTS "Permitir criação de eventos para autenticados" ON public.events;
DROP POLICY IF EXISTS "Permitir atualização do próprio evento" ON public.events;
DROP POLICY IF EXISTS "Permitir exclusão do próprio evento" ON public.events;
DROP POLICY IF EXISTS "Usuários autenticados podem ler eventos" ON public.events;
DROP POLICY IF EXISTS "Usuários podem criar eventos em seu nome" ON public.events;
DROP POLICY IF EXISTS "Organizadores podem atualizar seus eventos" ON public.events;
DROP POLICY IF EXISTS "Organizadores podem excluir seus eventos" ON public.events;
CREATE POLICY "Usuários autenticados podem ler eventos" ON public.events
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários podem criar eventos em seu nome" ON public.events
  FOR INSERT TO authenticated WITH CHECK (
    organizer_type = 'official'
    OR (organizer_type = 'user' AND (select auth.uid()) = organizer_id)
  );
CREATE POLICY "Organizadores podem atualizar seus eventos" ON public.events
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = organizer_id)
  WITH CHECK ((select auth.uid()) = organizer_id);
CREATE POLICY "Organizadores podem excluir seus eventos" ON public.events
  FOR DELETE TO authenticated USING ((select auth.uid()) = organizer_id);

-- Funções SECURITY DEFINER precisam fixar o search_path para não resolver objetos controlados pelo usuário.
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.handle_post_like_increment() SET search_path = public;
ALTER FUNCTION public.handle_post_like_decrement() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_post_like_increment() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_post_like_decrement() FROM PUBLIC, anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups(created_by);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON public.chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON public.matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
