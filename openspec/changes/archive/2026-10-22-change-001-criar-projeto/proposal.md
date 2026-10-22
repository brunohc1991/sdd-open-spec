## Why

O projeto ainda não possui a base técnica sobre a qual os módulos de negócio (cadastro de usuário, login, produto etc.) serão construídos. Esta change migra a spec legada `.spec/changes/001-criar-projeto` para o padrão OpenSpec e entrega apenas a infraestrutura compartilhada, destravando as próximas changes.

## What Changes

- Criar o monorepo Turbo com `apps/frontend` (Next.js, porta 3000) e `apps/backend` (NestJS, porta 4000) sob o namespace npm `@sdd`.
- Configurar a infraestrutura do Prisma no backend (schema modular por domínio, `DbModule`, `PrismaService`, seed técnico e docker compose).
- Criar o pacote compartilhado (`packages/shared`) consumível por backend, frontend e módulos de negócio.
- Configurar no backend o tratamento de erros centralizado e a base de autenticação JWT.
- Configurar no frontend a pasta `shared/` e os grupos de rotas `(public)` e `(private)` com sidebar de navegação.
- Fora de escopo: qualquer módulo de domínio (ex.: `auth`, cadastro de usuário), que fica para changes posteriores.

## Capabilities

### New Capabilities

- `monorepo-workspace`: estrutura do monorepo, apps e portas, namespace `@sdd`.
- `database-infrastructure`: infraestrutura de persistência com Prisma modular, pronta para receber models de módulos.
- `shared-package`: pacote compartilhado de contratos, classes base, erros de domínio, casos de uso e validações.
- `backend-error-handling`: tratamento centralizado e padronizado de erros na API.
- `backend-jwt-auth-base`: base de autenticação JWT para proteger endpoints de módulos futuros.
- `frontend-app-shell`: estrutura compartilhada e roteamento público/privado com sidebar no frontend.

### Modified Capabilities

<!-- Nenhuma: openspec/specs está vazio. -->

## Shared Instructions

Esta change segue as instruções gerais do projeto, que devem constar em toda change: [Como executar](../../shared/como-executar.md) e [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md).

## Impact

- Novos diretórios: `apps/frontend`, `apps/backend`, `packages/shared`, `apps/backend/prisma`.
- Dependências: Turbo, Next.js, NestJS, Prisma/PostgreSQL, JWT.
- Implementação deve usar as skills do projeto: `config-project-fullstack`, `config-prisma`, `config-package-shared`, `backend-nest-config`, `frontend-next-config`.
- Observação: `.spec/memory` cita o namespace `@cadastro-base` e o módulo `customer`, divergindo do namespace `@sdd` desta spec; prevalece `@sdd`.
