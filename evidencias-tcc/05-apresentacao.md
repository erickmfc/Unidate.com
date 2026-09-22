# 5. Roteiro para a apresentação do TCC

1. Contexto: dificuldade de integração e descoberta dentro da universidade.
2. Problema: informações e comunidades fragmentadas.
3. Objetivo: criar uma rede universitária centralizada, segura e orientada à convivência.
4. Público-alvo: estudantes e comunidades acadêmicas.
5. Jornada principal: cadastro, onboarding, descoberta, feed, grupos, chat e eventos.
6. Diferenciais: contexto universitário, comunidades por interesse, recursos de segurança e suporte.
7. Arquitetura: React/TypeScript no frontend e Supabase Auth/Postgres/RLS no backend.
8. Banco: 15 tabelas da aplicação, RLS habilitado em todas e políticas sem acesso público aberto; o conteúdo avançado de grupos possui tabelas próprias.
9. Qualidade: teste automatizado, build de produção e smoke test das rotas principais.
10. Demonstração: abrir landing page, cadastro, login, recuperação de senha e mostrar grupos/eventos após autenticação.
11. Limitações: algumas integrações administrativas/legadas ainda estão em migração para Supabase; é necessária uma conta de teste para validar os fluxos autenticados de ponta a ponta.
12. Próximos passos: concluir migração dos serviços restantes, habilitar proteção contra senhas vazadas e publicar a versão final no Vercel.
