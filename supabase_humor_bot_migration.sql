-- Motor de publicações humorísticas do UniDate.
-- A publicação é feita por função protegida para nunca usar o usuário administrador como autor.

create table if not exists public.bot_posts_memory (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete set null,
  bot_profile_id uuid references public.bot_profiles(id) on delete cascade,
  text text not null,
  topic text not null,
  format text not null,
  keywords text[] not null default '{}',
  engagement_score numeric not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  constraint bot_posts_memory_text_key unique (bot_profile_id, text)
);

create index if not exists bot_posts_memory_recent_idx
  on public.bot_posts_memory (bot_profile_id, created_at desc);
create index if not exists bot_posts_memory_topic_idx
  on public.bot_posts_memory (topic, created_at desc);

create table if not exists public.bot_ideas (
  id uuid primary key default gen_random_uuid(),
  situation text not null,
  consequence text not null,
  topic text not null,
  weight integer not null default 1 check (weight between 1 and 100),
  used_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bot_engagement_events (
  id uuid primary key default gen_random_uuid(),
  bot_profile_id uuid references public.bot_profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  event_type text not null check (event_type in ('like', 'comment', 'share', 'view')),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bot_settings (
  id boolean primary key default true check (id),
  mode text not null default 'manual' check (mode in ('manual', 'semi_automatic', 'automatic')),
  is_paused boolean not null default false,
  posts_per_day integer not null default 4 check (posts_per_day between 0 and 8),
  window_start time not null default '08:00',
  window_end time not null default '23:30',
  irony_level integer not null default 45 check (irony_level between 0 and 100),
  average_length integer not null default 120 check (average_length between 40 and 300),
  allowed_topics text[] not null default '{}',
  auto_replies boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references auth.users(id) on delete set null
);

insert into public.bot_settings (id) values (true) on conflict (id) do nothing;

alter table public.bot_posts_memory enable row level security;
alter table public.bot_ideas enable row level security;
alter table public.bot_engagement_events enable row level security;
alter table public.bot_settings enable row level security;

drop policy if exists "Operadores consultam memória do bot" on public.bot_posts_memory;
create policy "Operadores consultam memória do bot" on public.bot_posts_memory
  for select to authenticated using (exists (select 1 from public.bot_operators where user_id = (select auth.uid()) and is_active));
drop policy if exists "Operadores consultam ideias do bot" on public.bot_ideas;
create policy "Operadores consultam ideias do bot" on public.bot_ideas
  for select to authenticated using (exists (select 1 from public.bot_operators where user_id = (select auth.uid()) and is_active));
drop policy if exists "Operadores consultam métricas do bot" on public.bot_engagement_events;
create policy "Operadores consultam métricas do bot" on public.bot_engagement_events
  for select to authenticated using (exists (select 1 from public.bot_operators where user_id = (select auth.uid()) and is_active));
drop policy if exists "Operadores consultam configurações do bot" on public.bot_settings;
create policy "Operadores consultam configurações do bot" on public.bot_settings
  for select to authenticated using (exists (select 1 from public.bot_operators where user_id = (select auth.uid()) and is_active));
drop policy if exists "Operadores alteram configurações do bot" on public.bot_settings;
create policy "Operadores alteram configurações do bot" on public.bot_settings
  for update to authenticated using (exists (select 1 from public.bot_operators where user_id = (select auth.uid()) and is_active))
  with check (exists (select 1 from public.bot_operators where user_id = (select auth.uid()) and is_active));

grant select on public.bot_posts_memory, public.bot_ideas, public.bot_engagement_events, public.bot_settings to authenticated;
grant update on public.bot_settings to authenticated;

create or replace function public.publish_bot_post(
  p_bot_profile_id uuid,
  p_content text,
  p_topic text,
  p_format text,
  p_keywords text[] default '{}'
) returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  operator_id uuid := auth.uid();
  bot_user_id uuid;
  new_post_id uuid;
begin
  if operator_id is null or not exists (select 1 from public.bot_operators where user_id = operator_id and is_active) then
    raise exception 'Operador de bot não autorizado';
  end if;
  if length(trim(coalesce(p_content, ''))) = 0 or length(p_content) > 500 then
    raise exception 'Conteúdo inválido';
  end if;
  select auth_user_id into bot_user_id from public.bot_profiles where id = p_bot_profile_id and is_active and is_automated;
  if bot_user_id is null then raise exception 'Perfil automatizado não encontrado'; end if;
  if exists (select 1 from public.bot_posts_memory where bot_profile_id = p_bot_profile_id and text = trim(p_content)) then
    raise exception 'Conteúdo repetido';
  end if;
  insert into public.posts (author_id, content, type, likes_count, comments_count, hashtags)
  values (bot_user_id, trim(p_content), 'text', 0, 0, '{}') returning id into new_post_id;
  insert into public.bot_posts_memory (post_id, bot_profile_id, text, topic, format, keywords)
  values (new_post_id, p_bot_profile_id, trim(p_content), coalesce(nullif(trim(p_topic), ''), 'faculdade'), coalesce(nullif(trim(p_format), ''), 'frase'), coalesce(p_keywords, '{}'));
  return new_post_id;
end;
$$;

revoke all on function public.publish_bot_post(uuid, text, text, text, text[]) from public;
grant execute on function public.publish_bot_post(uuid, text, text, text, text[]) to authenticated;
