## Why

Com o registro de usuário planejado (change 002), falta concluir a autenticação do módulo `auth`: autenticar credenciais, emitir sessão e proteger a área privada. Esta change migra a spec legada `.spec/changes/003-login-usuario` para o padrão OpenSpec.

## What Changes

- Implementar o caso de uso `login-user` no módulo `auth`, retornando apenas `{ id, name, email }`, sem qualquer noção de token, JWT ou sessão.
- Expor `POST /auth/login` no backend; o JWT é gerado exclusivamente na camada do controller (helper `jwt.util.ts`) a partir da saída do caso de uso, com `JWT_SECRET` e payload `sub`, `name`, `email`.
- Estender `auth.integration.http` com cenários de login e adicionar a chave i18n `user.credentials.invalid` (pt e en).
- No frontend, criar `AuthContext`, `AuthGuard` e utilitário de decode de JWT (UTF-8) em `modules/auth`, persistir a sessão no cookie `auth_token` via `js-cookie` e proteger o grupo `(private)`.
- Integrar o formulário de login de `/join`, alimentar o dropdown do `AdminShell` com o usuário logado, implementar logout e redirecionar `/join` para `/example/dashboard` quando já autenticado.
- Fora de escopo: refresh token, cookie `httpOnly`, recuperação de senha, nova biblioteca HTTP (segue `fetch` nativo).

## Capabilities

### New Capabilities

- `user-login`: autenticação por e-mail e senha no backend (caso de uso `login-user`, `POST /auth/login`, emissão do JWT na camada HTTP).
- `frontend-auth-session`: sessão no frontend (cookie, `AuthContext`, `AuthGuard`, login, logout, redirecionamentos e dados do usuário no `AdminShell`).

### Modified Capabilities

<!-- Nenhuma: openspec/specs está vazio. A tela /join e o endpoint de registro vêm da change 002, ainda não arquivada; esta change não altera seus requisitos. -->

## Shared Instructions

Esta change segue as instruções gerais do projeto: [Como executar](../../shared/como-executar.md) e [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md).

## Impact

- `modules/auth` (caso de uso e testes), `apps/backend/src/modules/auth` (`auth.controller.ts`, `jwt.util.ts`, `auth.integration.http`), `apps/backend/.env` e `.env.example`.
- `apps/frontend/src/modules/auth/{context,guard,util,components}`, `app/layout.tsx`, `app/(private)/layout.tsx`, `app/(public)/join/page.tsx`, `AdminShell`, `shared/i18n/messages.{pt,en}.ts`.
- Dependências: `jsonwebtoken` e `@types/jsonwebtoken` (backend); `js-cookie` e `@types/js-cookie` (frontend).
- Pré-requisito: change 002 implementada (módulo `auth`, `UserRepository`, `CryptoProvider`, fakes, tela `/join`).
- Implementação deve usar a skill `module-use-case`.
- Observação: a spec legada cita expiração de 7 dias no contexto e `14d` na task do helper; esta change adota **7 dias** em JWT e cookie.
