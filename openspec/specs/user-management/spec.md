# user-management Specification

## Purpose
Gestão de usuários no backend: casos de uso save-user e delete-user e endpoints CRUD autenticados de usuário, com respostas de leitura sem dados sensíveis.

## Requirements

### Requirement: Caso de uso save-user
O caso de uso `save-user` SHALL cobrir criação e atualização de usuário, distinto de `register-user`, e retornar `void`. A decisão SHALL basear-se em `findById`: com `id` na entrada e usuário encontrado, atualiza; sem `id` ou usuário inexistente, cria usando o `id` recebido ou gerando um novo.

#### Scenario: Criação sem id
- **WHEN** `save-user` recebe dados válidos sem `id`
- **THEN** cria o usuário com novo `id`, senha criptografada, e retorna `void`

#### Scenario: Atualização de usuário existente
- **WHEN** `save-user` recebe um `id` para o qual `findById` retorna um usuário
- **THEN** atualiza o usuário existente

#### Scenario: Id inexistente no banco
- **WHEN** `save-user` recebe um `id` para o qual `findById` não retorna usuário
- **THEN** cria o usuário usando o `id` recebido

#### Scenario: Edição sem senha
- **WHEN** `save-user` atualiza um usuário com `password` ausente ou vazio
- **THEN** mantém o hash atual, sem re-hashear

### Requirement: Caso de uso delete-user
O caso de uso `delete-user` SHALL excluir o usuário indicado e retornar `void`.

#### Scenario: Exclusão de usuário existente
- **WHEN** `delete-user` recebe o `id` de um usuário existente
- **THEN** o usuário é removido

### Requirement: Preservação dos casos de uso existentes
A change SHALL NOT alterar `register-user` nem `login-user`.

#### Scenario: Casos de uso intactos
- **WHEN** os testes de `register-user` e `login-user` são executados após a change
- **THEN** continuam passando sem alterações nos casos de uso

### Requirement: Testes unitários dos casos de uso
`save-user` e `delete-user` SHALL ter testes unitários que reaproveitam `FakeUserRepository` e `FakeCryptoProvider`.

#### Scenario: Testes passando
- **WHEN** os testes do módulo `auth` são executados
- **THEN** os testes de `save-user` e `delete-user` passam

### Requirement: Endpoints CRUD autenticados
O backend SHALL expor em `apps/backend/src/modules/auth/user.controller.ts` o CRUD em `/users` (criar, atualizar, excluir, obter por id e listar paginado), todos autenticados. Comandos SHALL instanciar o caso de uso correspondente; consultas SHALL chamar o repositório direto, sem caso de uso. A confirmação de senha SHALL ser responsabilidade do frontend: o backend recebe apenas `password`.

#### Scenario: Requisição sem autenticação
- **WHEN** qualquer endpoint de `/users` é chamado sem token válido
- **THEN** responde 401

#### Scenario: Listagem paginada
- **WHEN** um usuário autenticado lista `/users`
- **THEN** recebe uma página de usuários

#### Scenario: Obter por id
- **WHEN** um usuário autenticado consulta um `id` existente
- **THEN** recebe os dados do usuário

### Requirement: Respostas de leitura como objetos simples
O controller SHALL mapear entidades de leitura para objetos simples antes de retornar (ex.: `{ id, name, email }`), pois entidades de domínio não serializam via `JSON.stringify`; a resposta SHALL NOT conter `password` nem hash.

#### Scenario: Corpo serializado
- **WHEN** um usuário é retornado por qualquer consulta
- **THEN** o JSON contém `id`, `name` e `email` e não contém `password`

### Requirement: Testes de integração HTTP do CRUD
`user.integration.http` SHALL cobrir os fluxos do CRUD, incluindo os principais casos de erro.

#### Scenario: Execução dos cenários
- **WHEN** os requests são executados contra o backend em execução
- **THEN** cada um retorna o status esperado
