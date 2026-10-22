## Why

O módulo `auth` já registra e autentica usuários, mas não há gestão de usuários por quem está logado. Esta change entrega o CRUD de usuário e serve de referência para os próximos cadastros do projeto. Migra a spec legada `.spec/changes/004-cadastro-usuario` para o padrão OpenSpec.

## What Changes

- Criar os casos de uso `save-user` (criação e atualização) e `delete-user` no módulo `auth`, sem alterar `register-user` nem `login-user`.
- Expor o CRUD autenticado em `/users` via `user.controller.ts` (criar, atualizar, excluir, obter por id, listar paginado), com cenários em `user.integration.http`.
- Criar no frontend a listagem paginada de usuários, o formulário compartilhado entre criação e edição, a exclusão com confirmação e o item "Usuários" no menu lateral.
- Acrescentar ao i18n as chaves novas necessárias (ex.: `user.not_found`, senha e confirmação divergentes).
- Fora de escopo: alterar `register-user`/`login-user`, DTOs de entrada, verificação automatizada de UI (a interface é validada manualmente).

## Capabilities

### New Capabilities

- `user-management`: casos de uso `save-user` e `delete-user` e endpoints CRUD autenticados de usuário no backend.
- `frontend-user-crud`: listagem paginada, formulário compartilhado, exclusão com confirmação, menu lateral e i18n do CRUD de usuário.

### Modified Capabilities

<!-- Nenhuma: openspec/specs está vazio. Registro e login (changes 002 e 003) não têm requisitos alterados. -->

## Shared Instructions

Esta change segue as instruções gerais do projeto: [Como executar](../../shared/como-executar.md) e [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md).

## Impact

- `modules/auth` (novos casos de uso e testes), `apps/backend/src/modules/auth/user.controller.ts` e `user.integration.http`.
- `apps/frontend/src/modules/auth` (listagem, formulário), rota privada de usuários, menu lateral, `shared/i18n/messages.{pt,en}.ts`.
- Reutiliza `shared/components/ui/form-section-layout.tsx` e `delete-confirmation-dialog.tsx`.
- Pré-requisito: changes 002 e 003 implementadas (`UserRepository`, `CryptoProvider`, fakes, autenticação JWT e `AuthGuard`).
- Implementação deve usar as skills `module-use-case` e `backend-nest-controller`.
- Assunção: a paginação usa o `findPage` do repositório já existente do agregado `user`.
