## ADDED Requirements

### Requirement: Listagem paginada de usuários
O frontend SHALL ter, no módulo `auth` e em rota privada, uma listagem paginada de usuários em tabela com colunas de nome, e-mail e ações (ícones de editar e excluir).

#### Scenario: Exibir usuários
- **WHEN** um usuário autenticado acessa a listagem
- **THEN** vê a tabela paginada com nome, e-mail e ações por linha

### Requirement: Formulário compartilhado de criação e edição
O frontend SHALL ter um único formulário para criar e editar usuário, organizado com `form-section-layout` nas seções "Dados básicos" (nome, e-mail) e "Senha" (senha e confirmação). A confirmação de senha SHALL ser validada no frontend, e somente `password` é enviado ao backend.

#### Scenario: Criar usuário
- **WHEN** o usuário preenche o formulário com senha e confirmação iguais e envia
- **THEN** o frontend envia nome, e-mail e `password` ao backend

#### Scenario: Senha e confirmação divergentes
- **WHEN** senha e confirmação são diferentes
- **THEN** o frontend exibe a mensagem i18n de divergência e não envia a requisição

#### Scenario: Editar sem alterar a senha
- **WHEN** o usuário edita nome ou e-mail deixando a senha vazia
- **THEN** a senha atual é mantida

### Requirement: Ações de editar e excluir
O ícone de lápis SHALL navegar para a edição do usuário. O ícone de lixeira SHALL abrir `delete-confirmation-dialog` e, ao confirmar, chamar o backend e atualizar a tabela.

#### Scenario: Editar
- **WHEN** o usuário clica no lápis de uma linha
- **THEN** é levado ao formulário preenchido com os dados do usuário

#### Scenario: Excluir com confirmação
- **WHEN** o usuário clica na lixeira e confirma no diálogo
- **THEN** o usuário é excluído e a tabela é atualizada

#### Scenario: Cancelar exclusão
- **WHEN** o usuário fecha o diálogo sem confirmar
- **THEN** nada é excluído

### Requirement: Item "Usuários" no menu lateral
O menu lateral SHALL ter o item "Usuários" apontando para a listagem.

#### Scenario: Navegar pelo menu
- **WHEN** o usuário clica em "Usuários"
- **THEN** a listagem é exibida

### Requirement: Mensagens i18n do CRUD
O i18n (pt e en) SHALL receber as chaves novas do CRUD (ex.: `user.not_found`, senha e confirmação divergentes), reaproveitando as chaves já cadastradas.

#### Scenario: Chaves traduzidas
- **WHEN** o frontend exibe um erro do CRUD
- **THEN** a mensagem está traduzida nos dois idiomas
