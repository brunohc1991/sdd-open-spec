# user-login Specification

## Purpose
Autenticação por e-mail e senha no backend: caso de uso login-user, endpoint de login e emissão do JWT na camada HTTP, sem o domínio conhecer token.

## Requirements

### Requirement: Caso de uso login-user
O caso de uso `login-user` SHALL receber `{ email, password }`, validar a entrada (`email` obrigatório e válido; `password` obrigatório), buscar o usuário por e-mail, comparar a senha via `CryptoProvider.comparePassword` e retornar apenas `{ id, name, email }`, sem `password` nem hash.

#### Scenario: Login válido
- **WHEN** `login-user` recebe e-mail cadastrado e senha correta
- **THEN** retorna `{ id, name, email }` sem `password` e sem hash

#### Scenario: E-mail inexistente
- **WHEN** `login-user` recebe um e-mail não cadastrado
- **THEN** lança `DomainError('user.credentials.invalid', 401)`

#### Scenario: Senha incorreta
- **WHEN** `login-user` recebe um e-mail cadastrado com senha errada
- **THEN** lança o mesmo `DomainError('user.credentials.invalid', 401)` do caso de e-mail inexistente

#### Scenario: Entrada inválida
- **WHEN** `login-user` recebe e-mail vazio, e-mail inválido ou senha vazia
- **THEN** falha com o erro de validação correspondente

### Requirement: Domínio sem conhecimento de token
O módulo de negócio `auth` SHALL NOT importar, mencionar nem criar abstrações de token, JWT ou sessão; a saída de `login-user` é estritamente os atributos públicos do usuário.

#### Scenario: Ausência de referências
- **WHEN** o código de `modules/auth` é inspecionado
- **THEN** não há referência a token, JWT ou sessão

### Requirement: Cobertura de testes do caso de uso
O caso de uso `login-user` SHALL ter testes unitários com 100% de cobertura, reaproveitando `FakeUserRepository` e `FakeCryptoProvider`, cobrindo login válido, e-mail inexistente, senha incorreta, e-mail vazio, e-mail inválido e senha vazia.

#### Scenario: Cobertura completa
- **WHEN** os testes do caso de uso são executados com cobertura
- **THEN** todos passam e a cobertura do caso de uso é 100%

### Requirement: Endpoint de login com emissão de JWT
O backend SHALL expor `POST /auth/login` público, que injeta `UserRepository`, `CryptoProvider` e `ConfigService`, instancia `LoginUser` no corpo do método e, com a saída do caso de uso, gera o JWT via `signUserToken` em `jwt.util.ts` (em `apps/backend/src/modules/auth`), respondendo 200 com `{ token, user: { id, name, email } }`.

#### Scenario: Credenciais válidas
- **WHEN** `POST /auth/login` recebe credenciais válidas
- **THEN** responde 200 com `token` e `user: { id, name, email }`

#### Scenario: Credenciais inválidas
- **WHEN** `POST /auth/login` recebe e-mail inexistente ou senha incorreta
- **THEN** responde 401 com `ApiErrorResponse` contendo `user.credentials.invalid` em `errors[]`

#### Scenario: Entrada inválida
- **WHEN** `POST /auth/login` recebe e-mail inválido ou corpo incompleto
- **THEN** responde 422 com `ApiErrorResponse`

### Requirement: Conteúdo e assinatura do JWT
O JWT SHALL ser assinado com `JWT_SECRET` (definido em `apps/backend/.env` e `.env.example`), expirar em 7 dias e conter apenas `sub` (id), `name` e `email`, nunca senha ou hash.

#### Scenario: Payload mínimo
- **WHEN** um token é emitido
- **THEN** o payload contém somente `sub`, `name`, `email` e os campos padrão de tempo (`iat`, `exp`)

### Requirement: Testes de integração HTTP de login
`auth.integration.http` SHALL cobrir login com credenciais válidas (200), e-mail inexistente (401), senha incorreta (401), e-mail inválido (422) e corpo incompleto (422).

#### Scenario: Execução dos cenários
- **WHEN** os requests são executados contra o backend em execução
- **THEN** cada um retorna o status esperado
