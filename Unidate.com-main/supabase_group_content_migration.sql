-- Supabase-backed content for group materials, resources and announcements.
create table if not exists public.group_materials (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  description text not null default '',
  type text not null default 'link',
  subject text not null default '',
  category text not null default '',
  difficulty text not null default 'iniciante',
  tags text[] not null default '{}',
  file_url text,
  external_url text,
  shared_by uuid not null references public.profiles(id) on delete cascade,
  shared_by_name text not null default 'Usuário',
  downloads integer not null default 0,
  views integer not null default 0,
  likes uuid[] not null default '{}',
  comments_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.group_resources (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  description text not null default '',
  url text not null,
  category text not null default 'link',
  tags text[] not null default '{}',
  added_by uuid not null references public.profiles(id) on delete cascade,
  added_by_name text not null default 'Usuário',
  clicks integer not null default 0,
  likes uuid[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.group_announcements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  content text not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_by_name text not null default 'Usuário',
  is_pinned boolean not null default false,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.group_materials enable row level security;
alter table public.group_resources enable row level security;
alter table public.group_announcements enable row level security;

drop policy if exists "Members can read group materials" on public.group_materials;
create policy "Members can read group materials" on public.group_materials for select to authenticated
using (exists (select 1 from public.group_members gm where gm.group_id = group_materials.group_id and gm.user_id = (select auth.uid())));
drop policy if exists "Members can create group materials" on public.group_materials;
create policy "Members can create group materials" on public.group_materials for insert to authenticated
with check (shared_by = (select auth.uid()) and exists (select 1 from public.group_members gm where gm.group_id = group_materials.group_id and gm.user_id = (select auth.uid())));
drop policy if exists "Authors can delete group materials" on public.group_materials;
create policy "Authors can delete group materials" on public.group_materials for delete to authenticated
using (shared_by = (select auth.uid()));

drop policy if exists "Members can read group resources" on public.group_resources;
create policy "Members can read group resources" on public.group_resources for select to authenticated
using (exists (select 1 from public.group_members gm where gm.group_id = group_resources.group_id and gm.user_id = (select auth.uid())));
drop policy if exists "Members can create group resources" on public.group_resources;
create policy "Members can create group resources" on public.group_resources for insert to authenticated
with check (added_by = (select auth.uid()) and exists (select 1 from public.group_members gm where gm.group_id = group_resources.group_id and gm.user_id = (select auth.uid())));
drop policy if exists "Authors can delete group resources" on public.group_resources;
create policy "Authors can delete group resources" on public.group_resources for delete to authenticated
using (added_by = (select auth.uid()));

drop policy if exists "Members can read group announcements" on public.group_announcements;
create policy "Members can read group announcements" on public.group_announcements for select to authenticated
using (exists (select 1 from public.group_members gm where gm.group_id = group_announcements.group_id and gm.user_id = (select auth.uid())));
drop policy if exists "Editors can create group announcements" on public.group_announcements;
create policy "Editors can create group announcements" on public.group_announcements for insert to authenticated
with check (created_by = (select auth.uid()) and exists (select 1 from public.groups g where g.id = group_announcements.group_id and ((select auth.uid()) = g.created_by or (select auth.uid()) = any(g.editors))));
drop policy if exists "Authors can delete group announcements" on public.group_announcements;
create policy "Authors can delete group announcements" on public.group_announcements for delete to authenticated
using (created_by = (select auth.uid()));

grant select, insert, update, delete on public.group_materials, public.group_resources, public.group_announcements to authenticated;
