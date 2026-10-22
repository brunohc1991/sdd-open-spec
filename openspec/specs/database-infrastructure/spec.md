# database-infrastructure Specification

## Purpose
Infraestrutura de persistência com Prisma modular, pronta para receber os models dos módulos de negócio.

## Requirements

### Requirement: Schema Prisma modular
O backend SHALL organizar o schema do Prisma em arquivos por domínio (`*.model.prisma`), permitindo que cada módulo adicione seus próprios models.

#### Scenario: Novo módulo adiciona models
- **WHEN** um módulo futuro cria seu arquivo de models
- **THEN** o schema é composto sem alterar a infraestrutura base

### Requirement: Acesso ao banco injetável
O backend SHALL expor um módulo e um serviço de acesso ao banco reutilizáveis pelos módulos de negócio.

#### Scenario: Módulo consome o banco
- **WHEN** um módulo importa o módulo de banco
- **THEN** consegue usar o serviço de acesso ao banco via injeção de dependência

### Requirement: Seed técnico
O projeto SHALL fornecer um ponto de entrada de seed técnico, sem dados de módulos de negócio.

#### Scenario: Seed executado
- **WHEN** o seed é executado
- **THEN** conclui sem erros e sem criar dados de domínio

### Requirement: Banco local via docker compose
O projeto SHALL fornecer docker compose de PostgreSQL compatível com a `DATABASE_URL` do `.env`.

#### Scenario: Banco local disponível
- **WHEN** o docker compose do backend é iniciado
- **THEN** o PostgreSQL aceita conexões usando a `DATABASE_URL` configurada
