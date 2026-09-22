# 3. Testes realizados

## Teste automatizado

Comando:

`npm test -- --watchAll=false --runInBand`

Resultado: PASS — 1 suíte e 1 teste aprovados.

## Build de produção

Comando:

`npm run build`

Resultado: Compiled successfully. A pasta `build` foi gerada e está pronta para hospedagem estática.

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

## Limite do teste

Não foram usados e-mails, senhas ou contas reais do projeto para executar fluxos autenticados de timeline, perfil, chat e grupos. Portanto, esses fluxos precisam de uma conta de teste autorizada para a rodada final da banca.
