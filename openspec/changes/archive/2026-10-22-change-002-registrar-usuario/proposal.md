## Why

A base técnica (change 001) está pronta, mas ainda não existe nenhum fluxo de negócio. Registrar usuário é o primeiro caso de uso real e destrava login e cadastros seguintes. Esta change migra a spec legada `.spec/changes/002-registrar-usuario` para o padrão OpenSpec.

## What Changes

- Criar o módulo de negócio `auth` com o agregado `user`: entidade (`id`, `name`, `email`, `password`), interface `crypto.provider.ts` e caso de uso `register-user` (retorno `void`).
- Persistir `user` via Prisma (model + migration + repositório Prisma) e criptografar a senha com `bcrypt`.
- Expor `POST /auth/register` em `auth.controller.ts`, com testes de integração HTTP em `auth.integration.http`.
- Mapear no i18n do frontend (pt e en) todos os códigos de erro possíveis de `POST /auth/register`.
- Implementar em `/join` a alternância entre cadastro (integrado ao backend) e login (apenas estrutura visual, sem integração).
- Fora de escopo: login funcional, redirecionamento após cadastro, validação client-side além de `required`, novos componentes fora de `app/(public)/join/`.

## Capabilities

### New Capabilities

- `user-registration`: registro de usuário no backend (módulo `auth`, entidade, caso de uso, persistência, bcrypt, endpoint HTTP).
- `frontend-join-register`: tela `/join` com alternância cadastro/login, integração do cadastro com a API e exibição de erros via toasts i18n.

### Modified Capabilities

<!-- Nenhuma: openspec/specs está vazio (a change 001 ainda não foi arquivada). -->

## Shared Instructions

Esta change segue as instruções gerais do projeto: [Como executar](../../shared/como-executar.md) e [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md).

## Impact

- Novo módulo `modules/auth` e `apps/backend/src/modules/auth` (repositório Prisma, `crypto.provider.ts` bcrypt, `auth.controller.ts`, `auth.integration.http`).
- `apps/backend/prisma/models/auth.model.prisma` e nova migration.
- `apps/frontend/src/app/(public)/join/page.tsx` e `apps/frontend/src/shared/i18n/messages.{pt,en}.ts`.
- Dependência nova: `bcrypt` no backend. Variável `NEXT_PUBLIC_API_URL` em `apps/frontend/.env`.
- Implementação deve usar as skills: `config-new-module`, `module-aggregate`, `module-entity`, `module-use-case`, `backend-prisma-sync-module`, `backend-prisma-repository`, `backend-nest-controller`.
- Dependência: change 001 concluída (rota `/join`, `Toaster`, i18n, `ApiErrorResponse`).
- Observação: o namespace npm do projeto é `@sdd` (prevalece sobre `@cadastro-base` citado em `.spec/memory`).
