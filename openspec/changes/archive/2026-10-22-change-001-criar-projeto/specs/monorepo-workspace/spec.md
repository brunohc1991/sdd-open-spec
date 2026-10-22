## ADDED Requirements

### Requirement: Estrutura do monorepo
O projeto SHALL ser organizado como um monorepo com `apps/frontend` e `apps/backend`, usando o namespace npm `@sdd` para os pacotes do workspace.

#### Scenario: Workspace criado
- **WHEN** a base do projeto é criada
- **THEN** existem `apps/frontend` e `apps/backend`, e os pacotes do workspace usam o namespace `@sdd`

### Requirement: Portas dos aplicativos
O frontend SHALL ser servido na porta 3000 e o backend na porta 4000.

#### Scenario: Aplicativos em execução
- **WHEN** frontend e backend são iniciados em desenvolvimento
- **THEN** o frontend responde em `http://localhost:3000` e o backend em `http://localhost:4000`

### Requirement: Configuração por ambiente
O projeto SHALL fornecer `.env.example` e `.env` com as variáveis necessárias, e o backend SHALL aceitar requisições do frontend (CORS).

#### Scenario: Frontend consome o backend
- **WHEN** o frontend em `localhost:3000` faz uma requisição ao backend
- **THEN** o backend não a bloqueia por política de CORS

### Requirement: Ausência de módulos de domínio
A base do projeto SHALL NOT incluir módulos de negócio.

#### Scenario: Estrutura inicial
- **WHEN** a change é concluída
- **THEN** não existem módulos de domínio em `modules/`
