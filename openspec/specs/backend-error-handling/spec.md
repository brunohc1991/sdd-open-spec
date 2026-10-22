# backend-error-handling Specification

## Purpose
Tratamento centralizado e padronizado de erros na API, em formato consumível pelo frontend.

## Requirements

### Requirement: Tratamento centralizado de erros
A API SHALL tratar erros de domínio, validação e inesperados em um único ponto, retornando resposta JSON padronizada (`ApiErrorResponse`).

#### Scenario: Erro de domínio
- **WHEN** um caso de uso lança um erro de domínio
- **THEN** a API responde com status HTTP apropriado e corpo no formato padronizado contendo o código e mensagem do erro

#### Scenario: Erro inesperado
- **WHEN** ocorre uma exceção não prevista
- **THEN** a API responde com erro 500 padronizado, sem expor detalhes internos

### Requirement: Erros compreensíveis pelo frontend
O formato de erro da API SHALL ser consumível pelo frontend para exibição de mensagens compreensíveis.

#### Scenario: Frontend exibe erro
- **WHEN** o frontend recebe uma resposta de erro da API
- **THEN** consegue extrair código e mensagem do corpo padronizado
