# Design

## Context

As changes 001 a 004 entregam a base técnica, autenticação (JWT, `AuthGuard`) e o CRUD de usuário, que serve de referência de padrão. O módulo `catalog` é citado como "já existente" pela spec legada, mas não existe no repositório nem é criado por nenhuma change anterior. Convenções: [Como executar](../../shared/como-executar.md) e [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md).

## Goals / Non-Goals

**Goals:**
- Replicar o padrão de CRUD da change 004 em um segundo módulo de negócio.
- Modelar uma enumeração (`status`), booleanos com default e preço com precisão.

**Non-Goals:**
- DTOs de entrada, verificação automatizada de UI.

## Decisions

- **Criar `catalog` se ausente**: a primeira task cria o módulo com `config-new-module` apenas se ele não existir, registrando o desvio na evidência. Alternativa descartada: bloquear a change até outra criar o módulo.
- **`save-product` único** para criar e atualizar, decidido via `findById`, como em `save-user`.
- **`delete-product` com `product.not_found` (404)**: diferente de `save-product`, exclusão de inexistente é erro.
- **Contrato de repositório antes dos casos de uso**: skill `module-repository` gera também o repositório em memória para os testes.
- **Enumeração `status`** validada com a regra `in` do pacote compartilhado e exposta como tipo no agregado.
- **Mapeamento explícito no controller**: entidades não serializam; o controller devolve objeto simples com todos os campos.
- **Consultas sem caso de uso**: o controller chama o repositório direto; só comandos viram casos de uso, com retorno `void`.
- **Validação**: automatizada até o backend (testes unitários e Rest Client); UI validada manualmente pelo usuário.

## Risks / Trade-offs

- [Spec legada assume módulo existente] → criar condicionalmente e registrar o desvio.
- [`price` decimal com no máximo 2 casas] → escolher tipo Prisma adequado ao sincronizar o model e registrar a escolha na evidência.
- [Dependência das changes 001 a 004] → apply só após elas.
- [Sem teste automatizado de UI] → conferência manual pelo usuário.
