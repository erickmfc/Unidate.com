# 1. Visão geral

## Problema

Estudantes precisam encontrar pessoas, grupos, eventos e suporte dentro do ambiente universitário, mas normalmente essas informações ficam espalhadas em redes sociais, grupos de mensagem e canais institucionais.

## Proposta

O UniDate centraliza a comunidade universitária em uma aplicação web com descoberta de perfis, feed, grupos, chat, eventos, recursos de segurança e recuperação de acesso.

## Público-alvo

Estudantes universitários, organizadores de grupos e comunidades acadêmicas.

## Funcionalidades principais

- autenticação por e-mail institucional ou matrícula;
- onboarding de estudante;
- descoberta e perfil;
- timeline/feed da comunidade;
- grupos universitários;
- mensagens e matches;
- eventos e guia do campus;
- área de suporte e SOS;
- recuperação de senha;
- painel administrativo com autenticação Supabase e 2FA de seis dígitos.

## Stack

React, TypeScript, React Router, Tailwind CSS e Supabase como backend de autenticação e dados. O projeto mantém integrações legadas em alguns módulos enquanto a migração completa é feita de forma incremental.
