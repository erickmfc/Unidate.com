# 2. Supabase e banco de dados

## Projeto

Projeto Supabase `Unidate.com`, ref. `xrwsmxqxqzrqzqmyjcwt`, restaurado e confirmado como ativo.

## Tabelas públicas validadas

As 11 tabelas centrais são `profiles`, `posts`, `likes`, `comments`, `groups`, `group_members`, `chats`, `chat_participants`, `messages`, `matches` e `events`. Para os recursos avançados de grupos, foram acrescentadas `group_posts`, `group_messages`, `group_events` e `group_event_attendees`.

## Resultado da validação

- 15 tabelas da aplicação encontradas;
- 15 tabelas com Row Level Security (RLS) habilitado;
- 0 políticas abertas para a role `public`;
- perfis encontrados: 2;
- posts encontrados: 3;
- eventos encontrados: 0.

## Regras reforçadas

As políticas foram ajustadas para exigir usuário autenticado e, quando aplicável, limitar leitura/escrita ao próprio usuário, participante do chat, membro do grupo, autor ou organizador do registro. Também foram adicionados índices para relações de grupos e chat.

O chat principal agora usa `chats`, `chat_participants` e `messages` no Supabase, com atualização em tempo real via Realtime. Posts, mensagens e eventos dentro de grupos usam as quatro tabelas de conteúdo de grupos, também protegidas por RLS. O login Google e a verificação de e-mail também usam Supabase Auth.

## Observação

O alerta restante no Security Advisor é a proteção contra senhas vazadas do Supabase Auth, que deve ser habilitada no painel da própria conta Supabase.
