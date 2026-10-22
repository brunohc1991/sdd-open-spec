# Design

## Context

A change 001 entregou monorepo, Prisma, pacote `@sdd/shared`, tratamento de erros (`ApiErrorResponse`) e o shell do frontend (rota `/join`, `Toaster` sonner no `layout.tsx`, i18n com `getMessage`). Ainda não existem `modules/` nem módulos de negócio. Convenções: [Como executar](../../shared/como-executar.md) e [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md).

## Goals / Non-Goals

**Goals:**
- Entregar o fluxo completo de registro (domínio → persistência → HTTP → tela).
- Usar as skills do projeto como implementação principal, registrando desvios.

**Non-Goals:**
- Login funcional, JWT na tela, redirecionamentos, validação client-side de negócio.

## Decisions

- **Ordem**: módulo `auth` → agregado → entidade → provider → caso de uso → Prisma → repositório/bcrypt → controller → testes HTTP → i18n → frontend. Cada etapa depende da anterior.
- **Contratos imutáveis**: interfaces do repositório e de `crypto.provider.ts` ficam no módulo `auth`; implementações Prisma e bcrypt ficam em `apps/backend/src/modules/auth` sem subpasta.
- **Controller simples**: injeta repositório e `crypto.provider` e instancia `register-user` no corpo do método, sem abstrações antecipadas.
- **Mapeamento de erros antes do frontend**: códigos são lidos de `auth.integration.http` e `api-exception.filter.ts` e só então adicionados ao i18n, evitando mapear códigos imaginários.
- **Frontend**: `fetch` nativo, `NEXT_PUBLIC_API_URL` em `apps/frontend/.env`, um `toast.error` por item de `errors[]`, sem novos componentes fora de `join/`.
- **Validação de negócio só no backend**: no client apenas `required`.

## Risks / Trade-offs

- [Divergência de namespace em `.spec/memory` (`@cadastro-base`)] → prevalece `@sdd`.
- [Skills podem não cobrir o caso inteiro] → aplicar até onde couber e registrar o desvio.
- [`openspec/specs` vazio: change 001 ainda não arquivada] → deltas desta change são todos ADDED, sem conflito.
- [Falta `NEXT_PUBLIC_API_URL` no `.env`] → conferir/definir antes de validar no navegador.
