# backend-jwt-auth-base Specification

## Purpose
Base de autenticação JWT para proteger endpoints, sem cadastro nem login de usuário, para uso por módulos futuros.

## Requirements

### Requirement: Proteção de endpoints por JWT
O backend SHALL fornecer mecanismo para proteger endpoints, exigindo token JWT válido.

#### Scenario: Requisição sem token
- **WHEN** um endpoint protegido recebe requisição sem token
- **THEN** a API responde 401 no formato padronizado de erro

#### Scenario: Token inválido ou expirado
- **WHEN** um endpoint protegido recebe token inválido ou expirado
- **THEN** a API responde 401 no formato padronizado de erro

#### Scenario: Token válido
- **WHEN** um endpoint protegido recebe token válido
- **THEN** a requisição é processada e a identidade autenticada fica disponível ao endpoint

### Requirement: Endpoints públicos
O backend SHALL permitir marcar endpoints como públicos, dispensando token.

#### Scenario: Endpoint público
- **WHEN** um endpoint público recebe requisição sem token
- **THEN** a requisição é processada normalmente

### Requirement: Base sem módulo de usuário
Esta capacidade SHALL entregar apenas a infraestrutura de autenticação, sem cadastro nem login de usuário.

#### Scenario: Escopo
- **WHEN** a change é concluída
- **THEN** não há endpoints de registro ou login, que pertencem a changes futuras
