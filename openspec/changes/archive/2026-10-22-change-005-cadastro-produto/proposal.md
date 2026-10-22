## Why

O projeto precisa de um segundo cadastro de negócio, desta vez fora do módulo `auth`, validando o padrão de CRUD estabelecido na change 004. Esta change entrega o CRUD de `product` no módulo `catalog` e migra a spec legada `.spec/changes/005-cadastro-produto` para o padrão OpenSpec.

## What Changes

- Criar o agregado `product` no módulo `catalog`: entidade `Product`, contrato de repositório e casos de uso `save-product` (criação e atualização) e `delete-product`.
- Persistir `product` via Prisma (model, migration e repositório Prisma em `apps/backend/src/modules/catalog`).
- Expor o CRUD autenticado em `/products` via `product.controller.ts`, com cenários em `product.integration.http`.
- Criar no frontend a listagem paginada, o formulário compartilhado (seções "Dados básicos", "Preço e status" e "Disponibilidade"), a exclusão com confirmação e o item "Produtos" no menu lateral.
- Acrescentar ao i18n as chaves novas (`product.not_found`, `product.status.active|inactive|draft` e validações dos novos campos).
- Fora de escopo: DTOs de entrada e verificação automatizada de UI (a interface é validada manualmente).

## Capabilities

### New Capabilities

- `product-management`: agregado `product`, casos de uso `save-product` e `delete-product`, persistência e endpoints CRUD autenticados no módulo `catalog`.
- `frontend-product-crud`: listagem paginada, formulário compartilhado, exclusão com confirmação, menu lateral e i18n do CRUD de produto.

### Modified Capabilities

<!-- Nenhuma: openspec/specs está vazio. -->

## Shared Instructions

Esta change segue as instruções gerais do projeto: [Como executar](../../shared/como-executar.md) e [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md).

## Impact

- `modules/catalog` (agregado, entidade, repositório, casos de uso, testes), `apps/backend/prisma/models/catalog.model.prisma` e migration, `apps/backend/src/modules/catalog` (repositório Prisma, `product.controller.ts`, `product.integration.http`).
- `apps/frontend/src/modules/catalog`, rota privada de produtos, menu lateral, `shared/i18n/messages.{pt,en}.ts`.
- Reutiliza `form-section-layout.tsx` e `delete-confirmation-dialog.tsx`.
- Pré-requisitos: changes 001 a 004 implementadas (autenticação, padrão de CRUD e componentes).
- Implementação deve usar as skills `module-aggregate`, `module-entity`, `module-repository`, `module-use-case`, `backend-prisma-sync-module`, `backend-prisma-repository`, `backend-nest-controller`.
- **Conflito com a spec legada**: ela afirma que o módulo `catalog` "já existe", mas nenhuma change anterior o cria e não há `modules/` no repositório. Esta change adiciona a criação do módulo (com `config-new-module`) como primeira task, condicionada à ausência dele.
