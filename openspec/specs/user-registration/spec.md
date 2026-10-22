# user-registration Specification

## Purpose
Registro de usuário no backend: módulo auth, entidade user, caso de uso register-user, persistência com senha criptografada e endpoint HTTP de cadastro.

## Requirements

### Requirement: Módulo auth com agregado user
O sistema SHALL possuir o módulo de negócio `auth` com o agregado `user`, cuja entidade contém `id`, `name`, `email` e `password`, validados respectivamente pelas regras de nome de pessoa, e-mail e senha forte (hash pass).

#### Scenario: Entidade com dados válidos
- **WHEN** uma entidade `user` é criada com nome, e-mail e senha válidos
- **THEN** a entidade é construída sem erros de validação

#### Scenario: Entidade com dados inválidos
- **WHEN** uma entidade `user` é criada com algum campo que viola sua regra
- **THEN** o erro de validação correspondente é retornado

### Requirement: Caso de uso register-user
O caso de uso `register-user` SHALL validar `name`, `email` e `password`, verificar se o usuário já está cadastrado, criptografar a senha via `crypto.provider`, criar a entidade `user` e persisti-la pelo repositório, retornando `void`.

#### Scenario: Registro bem-sucedido
- **WHEN** `register-user` recebe dados válidos de um e-mail ainda não cadastrado
- **THEN** o usuário é persistido com a senha criptografada e o caso de uso retorna `void`

#### Scenario: E-mail já cadastrado
- **WHEN** `register-user` recebe um e-mail já cadastrado
- **THEN** o caso de uso falha com erro de e-mail duplicado e nada é persistido

#### Scenario: Dados de entrada inválidos
- **WHEN** `register-user` recebe `name`, `email` ou `password` inválidos
- **THEN** o caso de uso falha com os erros de validação correspondentes

### Requirement: Contratos do módulo preservados
As interfaces do módulo `auth` (repositório de `user` e `crypto.provider.ts`) SHALL permanecer inalteradas pelas implementações técnicas, que ficam diretamente em `apps/backend/src/modules/auth`, sem subpasta.

#### Scenario: Implementações no backend
- **WHEN** o repositório Prisma e o provider bcrypt são implementados
- **THEN** residem em `apps/backend/src/modules/auth` e implementam as interfaces sem modificá-las

### Requirement: Persistência de user com Prisma
O sistema SHALL persistir `user` em um model Prisma do módulo `auth`, com migration aplicada, armazenando a senha apenas criptografada.

#### Scenario: Senha armazenada com hash
- **WHEN** um usuário é registrado
- **THEN** o valor persistido em `password` é o hash bcrypt, nunca a senha em texto puro

### Requirement: Endpoint de registro
O backend SHALL expor `POST /auth/register` com corpo `{ name, email, password }`, respondendo 201 sem corpo em sucesso. O controller SHALL receber repositório e `crypto.provider` por injeção e instanciar `register-user` no corpo do método.

#### Scenario: Registro com sucesso
- **WHEN** `POST /auth/register` recebe dados válidos de e-mail inédito
- **THEN** responde 201 sem corpo

#### Scenario: E-mail duplicado
- **WHEN** `POST /auth/register` recebe um e-mail já cadastrado
- **THEN** responde 409 com `ApiErrorResponse` contendo o código de e-mail duplicado em `errors[]`

#### Scenario: Senha fraca
- **WHEN** `POST /auth/register` recebe uma senha que viola a regra de senha
- **THEN** responde 422 com `ApiErrorResponse` contendo o código de senha inválida em `errors[]`

#### Scenario: Múltiplos campos inválidos
- **WHEN** `POST /auth/register` recebe vários campos inválidos
- **THEN** responde com `ApiErrorResponse` cujo `errors[]` contém um código para cada erro

### Requirement: Testes de integração HTTP
O backend SHALL ter `auth.integration.http` (Rest Client) cobrindo o fluxo de registro, incluindo sucesso e os principais erros.

#### Scenario: Execução dos testes
- **WHEN** os requests de `auth.integration.http` são executados contra o backend
- **THEN** os resultados correspondem às respostas esperadas do endpoint
