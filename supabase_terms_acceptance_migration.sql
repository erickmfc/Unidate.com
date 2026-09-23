-- UniDate: aceite dos termos de uso por pessoa e por versão do documento.
-- O registro é imutável para o usuário: somente leitura e inclusão são liberadas.

create table if not exists public.terms_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  terms_version text not null,
  accepted_at timestamptz not null default timezone('utc', now()),
  constraint terms_acceptances_user_version_key unique (user_id, terms_version)
);

create index if not exists terms_acceptances_user_id_idx
  on public.terms_acceptances (user_id);

alter table public.terms_acceptances enable row level security;

drop policy if exists "Usuários podem consultar seu aceite" on public.terms_acceptances;
create policy "Usuários podem consultar seu aceite"
  on public.terms_acceptances
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Usuários podem registrar seu aceite" on public.terms_acceptances;
create policy "Usuários podem registrar seu aceite"
  on public.terms_acceptances
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

revoke all on table public.terms_acceptances from public;
grant select, insert on table public.terms_acceptances to authenticated;
