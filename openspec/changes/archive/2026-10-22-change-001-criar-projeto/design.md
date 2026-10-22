# Design

## Context

Projeto greenfield: ainda não há `apps/`, `packages/` nem specs principais. O repositório já contém skills em `.claude/skills` que geram cada peça da base de forma determinística. Convenções de nomenclatura (kebab-case e sufixos por papel) estão em `.spec/shared/regras-de-nomenclatura.md`; convenções do `shared` do frontend em `.spec/memory/estrutura.md`.

Convenções globais aplicáveis a toda change do projeto: [Como executar](../../shared/como-executar.md) e [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md).

## Goals / Non-Goals

**Goals:**
- Entregar a base técnica reutilizável pelas changes de módulos seguintes.
- Usar as skills do projeto como implementação principal, registrando desvios.

**Non-Goals:**
- Módulos de domínio, endpoints de login/registro e models Prisma de negócio.

## Decisions

- **Ordem de execução**: monorepo → Prisma → pacote compartilhado → config do backend → frontend. Cada etapa depende da anterior (o backend Nest precisa do pacote shared; Prisma precisa do app backend).
- **Skills como gerador principal** (`config-project-fullstack`, `config-prisma`, `config-package-shared`, `backend-nest-config`, `frontend-next-config`) em vez de scaffolding manual, para garantir padrão consistente. Alternativa descartada: criar à mão, por risco de divergência.
- **Namespace `@sdd`** informado à skill de monorepo e à de pacote compartilhado. Os docs em `.spec/memory` citam `@cadastro-base`; prevalece `@sdd`, conforme a spec original.
- **Schema Prisma modular** por domínio para evitar um arquivo monolítico e permitir que cada módulo traga seu model.

- **Nomenclatura**: todos os arquivos e diretórios criados seguem `kebab-case` com sufixo por papel (`*.controller.ts`, `*.guard.ts`, `*.page.tsx` etc.), conforme [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md).
- **Rastreabilidade da execução**: cada task concluída recebe evidência no formato definido em [Como executar](../../shared/como-executar.md).

## Risks / Trade-offs

- [Docs de memória divergentes (`@cadastro-base`, `customer`)] → Seguir `@sdd`; atualizar a memória em change futura.
- [Skills podem não cobrir o caso inteiro] → Aplicar até onde fizer sentido e registrar o desvio na conclusão da task.
- [Banco indisponível localmente] → Docker compose fornecido; validar conexão antes de gerar migrations.
