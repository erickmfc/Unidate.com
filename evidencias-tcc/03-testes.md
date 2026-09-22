# 3. Testes realizados

## Teste automatizado

Comando:

`npm test -- --watchAll=false --runInBand`

Resultado: PASS — 1 suíte e 1 teste aprovados.

## Build de produção

Comando:

`npm run build`

Resultado: Compiled successfully. A pasta `build` foi gerada e está pronta para hospedagem estática.

Após a migração do chat e dos recursos avançados de grupos para Supabase, o build foi executado novamente e passou.

## Validação do banco

- 15 tabelas da aplicação confirmadas no schema `public`;
- RLS habilitado nas 15 tabelas;
- 0 políticas abertas para a role `public`;
- migração aplicada para posts, mensagens, eventos e participantes de eventos de grupos.

## Smoke test no navegador

Validados no Chrome local:

- página inicial;
- cadastro e onboarding;
- login;
- alternância matrícula/e-mail;
- mostrar/ocultar senha;
- recuperação de senha;
- página Sobre;
- página Recursos;
- redirecionamento para login em `/discover`, `/feed`, `/groups`, `/chat`, `/events`, `/campus-guide`, `/experts`, `/sos`, `/anonymous-wall`, `/impulsionar` e `/profile2`.

## Produção no Vercel

Após o deploy do commit `d5c50e8`, foram confirmados HTTP 200 e carregamento visual em `https://unidate-com.vercel.app/`. Também foram validados login, cadastro, recuperação de senha, Sobre, Recursos e os redirecionamentos das rotas protegidas.

## Limite do teste

Não foram usados e-mails, senhas ou contas reais do projeto para executar fluxos autenticados de timeline, perfil, chat e grupos. Portanto, esses fluxos precisam de uma conta de teste autorizada para a rodada final da banca.
