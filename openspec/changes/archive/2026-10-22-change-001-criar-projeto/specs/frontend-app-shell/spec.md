## ADDED Requirements

### Requirement: Estrutura compartilhada do frontend
O frontend SHALL possuir pasta `shared/` com código reutilizável e desacoplado de configuração, navegação e estado específicos da aplicação.

#### Scenario: Separação de camadas
- **WHEN** código depende de sessão, rotas, permissões ou configuração do projeto
- **THEN** ele reside na camada da aplicação, fora de `shared/`

### Requirement: Grupos de rotas público e privado
O frontend SHALL organizar as rotas em grupos `(public)` e `(private)`.

#### Scenario: Rota privada com navegação
- **WHEN** o usuário acessa uma rota do grupo `(private)`
- **THEN** a página é exibida com sidebar de navegação funcional

#### Scenario: Rota pública
- **WHEN** o usuário acessa uma rota do grupo `(public)`
- **THEN** a página é exibida sem a sidebar

### Requirement: Inicialização sem erros
O frontend SHALL iniciar e compilar sem erros.

#### Scenario: Build e execução
- **WHEN** o frontend é compilado e iniciado
- **THEN** não há erros de build nem de execução na página inicial
