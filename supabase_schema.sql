-- 1. Tabela de Perfis de Usuários (profiles)
-- Armazena os dados públicos e acadêmicos dos usuários, estendendo a tabela auth.users do Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    user_type TEXT CHECK (user_type IN ('aluno', 'professor', 'uni')) DEFAULT 'aluno',
    registration_number TEXT UNIQUE,
    university TEXT DEFAULT 'Universidade não informada',
    course TEXT DEFAULT 'Curso não informado',
    year INTEGER DEFAULT 2026,
    period INTEGER DEFAULT 1,
    bio TEXT DEFAULT 'Estudante Universitário',
    interests TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    photo_url TEXT DEFAULT '/api/placeholder/40/40',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Posts (posts)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    type TEXT CHECK (type IN ('text', 'image', 'poll', 'tevi')) DEFAULT 'text',
    image TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    location TEXT,
    hashtags TEXT[] DEFAULT '{}',
    tevi_data JSONB DEFAULT NULL,
    poll_data JSONB DEFAULT NULL,
    event_data JSONB DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Curtidas (likes)
-- Garante que um usuário só possa curtir um post uma única vez
CREATE TABLE IF NOT EXISTS public.likes (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

-- 4. Tabela de Comentários (comments)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Grupos (groups)
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    avatar TEXT,
    banner TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    members_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabela de Membros de Grupos (group_members)
CREATE TABLE IF NOT EXISTS public.group_members (
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('member', 'admin')) DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (group_id, user_id)
);

-- 7. Tabela de Chats (chats)
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT CHECK (type IN ('direct', 'group')) DEFAULT 'direct',
    name TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Participantes de Chats (chat_participants)
CREATE TABLE IF NOT EXISTS public.chat_participants (
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (chat_id, user_id)
);

-- 9. Tabela de Mensagens (messages)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Tabela de Matches (matches)
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user1_id, user2_id)
);

-- Habilitar Row Level Security (RLS) para segurança das tabelas
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

-- REGRAS DE RLS (Row Level Security)

-- Perfis: leitura por qualquer usuário autenticado; escrita apenas pelo próprio usuário dono
CREATE POLICY "Qualquer usuário autenticado pode ver perfis" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários podem modificar seu próprio perfil" ON public.profiles
    FOR ALL TO authenticated USING (auth.uid() = id);

-- Posts: leitura por qualquer usuário autenticado; escrita apenas pelo autor
CREATE POLICY "Qualquer usuário autenticado pode ver posts" ON public.posts
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários podem criar seus próprios posts" ON public.posts
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Usuários podem editar/excluir seus próprios posts" ON public.posts
    FOR UPDATE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Usuários podem deletar seus próprios posts" ON public.posts
    FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Curtidas (Likes): qualquer usuário autenticado pode ler; inserção e deleção apenas do próprio usuário
CREATE POLICY "Leitura de curtidas" ON public.likes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários podem curtir posts" ON public.likes
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem descurtir posts" ON public.likes
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Triggers de Banco de Dados

-- Trigger 1: Criação automática de perfil no banco de dados após cadastro no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    display_name, 
    photo_url, 
    user_type, 
    registration_number, 
    university, 
    course, 
    year, 
    period, 
    onboarding_completed, 
    is_verified
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'displayName', new.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(new.raw_user_meta_data->>'photoURL', new.raw_user_meta_data->>'avatar', '/api/placeholder/40/40'),
    COALESCE(new.raw_user_meta_data->>'userType', 'aluno'),
    COALESCE(new.raw_user_meta_data->>'registrationNumber', 'MAT_' || SUBSTRING(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data->>'university', 'Universidade Federal do Rio de Janeiro'),
    COALESCE(new.raw_user_meta_data->>'course', 'Curso não informado'),
    COALESCE((new.raw_user_meta_data->>'year')::integer, 2026),
    COALESCE((new.raw_user_meta_data->>'period')::integer, 1),
    FALSE,
    FALSE
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger 2: Incremento de curtidas automático
CREATE OR REPLACE FUNCTION public.handle_post_like_increment()
RETURNS trigger AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = likes_count + 1
  WHERE id = new.post_id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_like_created
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_post_like_increment();

-- Trigger 3: Decremento de curtidas automático
CREATE OR REPLACE FUNCTION public.handle_post_like_decrement()
RETURNS trigger AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = old.post_id;
  RETURN old;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_like_deleted
  AFTER DELETE ON public.likes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_post_like_decrement();
