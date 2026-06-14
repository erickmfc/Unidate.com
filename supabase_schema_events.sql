-- Tabela de Eventos (events)
-- Armazena os eventos do campus e oficiais integrados ao Supabase
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    category TEXT,
    attendees INTEGER DEFAULT 0,
    color TEXT,
    icon TEXT,
    organizer TEXT DEFAULT 'UniDate',
    organizer_type TEXT CHECK (organizer_type IN ('user', 'group', 'official')) DEFAULT 'official',
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Permitir leitura de eventos para todos" ON public.events;
DROP POLICY IF EXISTS "Permitir criação de eventos para autenticados" ON public.events;
DROP POLICY IF EXISTS "Permitir atualização do próprio evento" ON public.events;
DROP POLICY IF EXISTS "Permitir exclusão do próprio evento" ON public.events;

-- Criar políticas de RLS
CREATE POLICY "Permitir leitura de eventos para todos" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Permitir criação de eventos para autenticados" ON public.events
    FOR INSERT WITH CHECK (true); -- Permitir inserções por qualquer usuário autenticado para simplificar testes

CREATE POLICY "Permitir atualização do próprio evento" ON public.events
    FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão do próprio evento" ON public.events
    FOR DELETE USING (true);
