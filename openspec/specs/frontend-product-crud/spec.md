# frontend-product-crud Specification

## Purpose
CRUD de produto no frontend: listagem paginada, formulário compartilhado de criação e edição, exclusão com confirmação, item no menu lateral e mensagens traduzidas.

## Requirements

### Requirement: Listagem paginada de produtos
O frontend SHALL ter, no módulo `catalog` e em rota privada, uma listagem paginada de produtos com colunas nome, preço, status e ações (ícones de editar e excluir).

#### Scenario: Exibir produtos
- **WHEN** um usuário autenticado acessa a listagem
- **THEN** vê a tabela paginada com nome, preço, status e ações

### Requirement: Formulário compartilhado de criação e edição
O frontend SHALL ter um único formulário para criar e editar produto, organizado com `form-section-layout` em: "Dados básicos" (nome, descrição), "Preço e status" (preço; status como `select` com `active`, `inactive`, `draft`) e "Disponibilidade" (checkboxes `availableOnline`, `featured`, `allowsPreOrder`).

#### Scenario: Criar produto
- **WHEN** o usuário preenche e envia o formulário
- **THEN** os dados são enviados ao backend e o resultado é exibido

#### Scenario: Editar produto
- **WHEN** o usuário abre a edição de um produto
- **THEN** o formulário vem preenchido com os valores atuais, incluindo os checkboxes

### Requirement: Ações de editar e excluir
O lápis SHALL navegar para a edição. A lixeira SHALL abrir `delete-confirmation-dialog` e, ao confirmar, chamar o backend e atualizar a tabela.

#### Scenario: Excluir com confirmação
- **WHEN** o usuário clica na lixeira e confirma
- **THEN** o produto é excluído e a tabela é atualizada

#### Scenario: Cancelar exclusão
- **WHEN** o usuário fecha o diálogo sem confirmar
- **THEN** nada é excluído

### Requirement: Item "Produtos" no menu lateral
O menu lateral SHALL ter o item "Produtos" apontando para a listagem.

#### Scenario: Navegar pelo menu
- **WHEN** o usuário clica em "Produtos"
- **THEN** a listagem de produtos é exibida

### Requirement: Mensagens i18n do CRUD de produto
O i18n (pt e en) SHALL receber as chaves novas: `product.not_found`, `product.status.active`, `product.status.inactive`, `product.status.draft` e mensagens de validação dos novos campos, reaproveitando as chaves existentes.

#### Scenario: Status traduzido
- **WHEN** a listagem ou o formulário exibe o status de um produto
- **THEN** o rótulo aparece traduzido no idioma do navegador
