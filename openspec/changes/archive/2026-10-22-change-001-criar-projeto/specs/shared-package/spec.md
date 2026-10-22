## ADDED Requirements

### Requirement: Pacote compartilhado
O projeto SHALL fornecer um pacote compartilhado no namespace `@sdd` consumível por backend, frontend e módulos de negócio, contendo contratos reutilizáveis, classes base, erros de domínio, casos de uso e validações.

#### Scenario: Consumo por apps
- **WHEN** backend ou frontend importam o pacote compartilhado
- **THEN** a importação resolve sem erros de build

### Requirement: Erros de domínio
O pacote compartilhado SHALL definir erros de domínio e de validação com código identificável, para que sejam tratados de forma uniforme.

#### Scenario: Erro com código
- **WHEN** uma regra de validação falha
- **THEN** o erro resultante carrega um código estável

### Requirement: Testes do pacote
O pacote compartilhado SHALL possuir testes automatizados passando.

#### Scenario: Testes executados
- **WHEN** os testes do pacote são executados
- **THEN** todos passam
