# 2. Supabase e banco de dados

## Projeto

Projeto Supabase `Unidate.com`, ref. `xrwsmxqxqzrqzqmyjcwt`, restaurado e confirmado como ativo.

## Tabelas públicas validadas

`profiles`, `posts`, `likes`, `comments`, `groups`, `group_members`, `chats`, `chat_participants`, `messages`, `matches` e `events`.

## Resultado da validação

- 11 tabelas públicas encontradas;
- 11 tabelas com Row Level Security (RLS) habilitado;
- 0 políticas abertas para a role `public`;
- perfis encontrados: 2;
- posts encontrados: 3;
- eventos encontrados: 0.

## Regras reforçadas

As políticas foram ajustadas para exigir usuário autenticado e, quando aplicável, limitar leitura/escrita ao próprio usuário, participante do chat, membro do grupo, autor ou organizador do registro. Também foram adicionados índices para relações de grupos e chat.

## Observação

O alerta restante no Security Advisor é a proteção contra senhas vazadas do Supabase Auth, que deve ser habilitada no painel da própria conta Supabase.
