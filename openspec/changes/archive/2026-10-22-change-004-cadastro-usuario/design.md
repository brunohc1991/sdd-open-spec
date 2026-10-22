# Design

## Context

As changes 002 e 003 entregam o módulo `auth` com `UserRepository`, `CryptoProvider`, fakes, `register-user`, `login-user`, JWT e `AuthGuard`. O frontend já tem `AdminShell`, menu lateral, i18n e componentes em `shared/components/ui` (`form-section-layout`, `delete-confirmation-dialog`). Convenções: [Como executar](../../shared/como-executar.md) e [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md).

## Goals / Non-Goals

**Goals:**
- Entregar um CRUD de referência reutilizável pelos próximos cadastros.
- Manter `register-user` e `login-user` intactos.

**Non-Goals:**
- DTOs de entrada, verificação automatizada de UI, alterações em registro/login.

## Decisions

- **`save-user` único para criar e atualizar**, decidido via `findById`; distinto de `register-user`, que continua sendo o fluxo público de cadastro.
- **Consultas sem caso de uso**: o controller chama o repositório direto; só comandos viram casos de uso, retornando `void`.
- **Mapeamento explícito no controller**: entidades usam `protected readonly props` com getters de prototype e serializam como `{}`; o controller devolve `{ id, name, email }`.
- **Senha**: confirmação só no frontend; edição com senha vazia mantém o hash atual.
- **Controller dedicado** `user.controller.ts` em `/users`, separado de `auth.controller.ts`, com endpoints autenticados.
- **Validação**: automatizada até o backend (testes unitários e Rest Client); UI conferida manualmente pelo usuário, sem `mcp__Claude_Preview` nem `mcp__Claude_in_Chrome`.
- **Nomenclatura**: `kebab-case` com sufixo por papel.

## Risks / Trade-offs

- [Entidade não serializa] → mapeamento explícito evita corpo vazio e vazamento de `password`.
- [Sem teste automatizado de UI] → conferência manual pelo usuário.
- [Dependência das changes 002 e 003] → apply só após ambas implementadas.
- [Spec não define a forma da paginação] → usar o `findPage` existente e registrar a escolha na evidência.
