# product-management Specification

## Purpose
Gestão de produtos no módulo catalog: agregado product, validação da entidade, casos de uso save-product e delete-product, persistência e endpoints CRUD autenticados.

## Requirements

### Requirement: Agregado product no módulo catalog
O módulo `catalog` SHALL possuir o agregado `product` com a entidade `Product` e o contrato de repositório correspondente.

#### Scenario: Estrutura do agregado
- **WHEN** o módulo `catalog` é inspecionado
- **THEN** contém o agregado `product` com entidade, interface de repositório e casos de uso

### Requirement: Validação da entidade Product
A entidade `Product` SHALL validar: `name` obrigatório, mínimo 2 e máximo 120 caracteres; `description` opcional, máximo 500 caracteres, persistida como `null` quando ausente; `price` obrigatório, numérico, mínimo 0 e no máximo 2 casas decimais; `status` obrigatório, dentre `active`, `inactive` e `draft` (regra `in` do pacote compartilhado, exposto como tipo no agregado); `availableOnline`, `featured` e `allowsPreOrder` booleanos, `false` quando ausentes na criação.

#### Scenario: Produto válido
- **WHEN** um `Product` é criado com nome, preço e status válidos
- **THEN** a entidade é construída, com os booleanos ausentes em `false` e `description` nula

#### Scenario: Nome inválido
- **WHEN** `name` tem menos de 2 ou mais de 120 caracteres
- **THEN** a validação falha com o erro de `name`

#### Scenario: Preço inválido
- **WHEN** `price` é negativo ou tem mais de 2 casas decimais
- **THEN** a validação falha com o erro de `price`

#### Scenario: Status fora da enumeração
- **WHEN** `status` não é `active`, `inactive` nem `draft`
- **THEN** a validação falha com o erro de `status`

### Requirement: Caso de uso save-product
O caso de uso `save-product` SHALL cobrir criação e atualização e retornar `void`. A decisão SHALL basear-se em `findById`: com `id` e registro encontrado, atualiza; sem `id` ou registro inexistente, cria usando o `id` recebido ou gerando um novo.

#### Scenario: Criação
- **WHEN** `save-product` recebe dados válidos sem `id`
- **THEN** cria o produto com novo `id`

#### Scenario: Atualização
- **WHEN** `save-product` recebe um `id` existente
- **THEN** atualiza o produto

#### Scenario: Id inexistente
- **WHEN** `save-product` recebe um `id` que `findById` não encontra
- **THEN** cria o produto com o `id` recebido

### Requirement: Caso de uso delete-product
O caso de uso `delete-product` SHALL excluir o produto e retornar `void`, lançando `DomainError("product.not_found", 404)` quando o `id` não existir.

#### Scenario: Exclusão existente
- **WHEN** `delete-product` recebe o `id` de um produto existente
- **THEN** o produto é removido

#### Scenario: Produto inexistente
- **WHEN** `delete-product` recebe um `id` inexistente
- **THEN** lança `DomainError("product.not_found", 404)`

### Requirement: Testes unitários dos casos de uso
`save-product` e `delete-product` SHALL ter testes unitários com `FakeProductRepository` e demais providers necessários.

#### Scenario: Testes passando
- **WHEN** os testes do módulo `catalog` são executados
- **THEN** passam

### Requirement: Persistência de product com Prisma
O sistema SHALL persistir `product` em model Prisma do módulo `catalog`, com migration aplicada, e o repositório Prisma SHALL ficar em `apps/backend/src/modules/catalog` sem alterar a interface definida no módulo.

#### Scenario: Persistência
- **WHEN** um produto é salvo e consultado pelo repositório Prisma
- **THEN** todos os campos são persistidos e recuperados, com `description` nula quando ausente

### Requirement: Endpoints CRUD autenticados
O backend SHALL expor em `product.controller.ts` o CRUD em `/products` (criar, atualizar, excluir, obter por id e listar paginado), todos autenticados. Consultas SHALL chamar o repositório direto e comandos SHALL instanciar o caso de uso no corpo do método.

#### Scenario: Sem autenticação
- **WHEN** um endpoint de `/products` é chamado sem token válido
- **THEN** responde 401

#### Scenario: Produto inexistente na exclusão
- **WHEN** `DELETE /products/:id` recebe um `id` inexistente
- **THEN** responde 404 com `product.not_found` em `errors[]`

### Requirement: Respostas de leitura como objetos simples
O controller SHALL mapear leituras para objetos simples com `id`, `name`, `description`, `price`, `status`, `availableOnline`, `featured` e `allowsPreOrder`, pois entidades de domínio não serializam via `JSON.stringify`.

#### Scenario: Corpo serializado
- **WHEN** um produto é retornado por qualquer consulta
- **THEN** o JSON contém todos esses campos

### Requirement: Testes de integração HTTP do CRUD
`product.integration.http` SHALL cobrir os fluxos do CRUD e os erros principais: nome inválido, preço negativo, status fora do enum e produto inexistente em update e delete.

#### Scenario: Execução dos cenários
- **WHEN** os requests são executados contra o backend em execução
- **THEN** cada um retorna o status esperado
