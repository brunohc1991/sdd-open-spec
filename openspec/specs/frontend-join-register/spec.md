# frontend-join-register Specification

## Purpose
Tela /join com alternância entre cadastro e login, integração do cadastro com a API e exibição de erros traduzidos via toasts.

## Requirements

### Requirement: Alternância entre cadastro e login
A rota `/join` (`app/(public)/join/page.tsx`) SHALL manter um estado `mode` (`'register' | 'login'`) e alternar entre os dois formulários por botão ou link de troca.

#### Scenario: Alternar modo
- **WHEN** o usuário aciona a troca entre cadastro e login
- **THEN** o formulário correspondente ao novo modo é exibido

### Requirement: Formulário de cadastro integrado
O formulário de cadastro SHALL ter os campos obrigatórios `name`, `email` e `password` (apenas atributo `required`, sem outra validação client-side) e SHALL chamar `POST {NEXT_PUBLIC_API_URL}/auth/register` com `fetch` nativo, sem redirecionar em nenhum caso.

#### Scenario: Cadastro com sucesso
- **WHEN** a API responde 201
- **THEN** é exibido um `toast.success` de confirmação e não há redirecionamento

#### Scenario: Erros da API
- **WHEN** a API responde com `ApiErrorResponse`
- **THEN** é exibido um `toast.error(getMessage(code))` individual para cada item de `errors[]`, sem redirecionamento

### Requirement: Formulário de login apenas visual
O formulário de login SHALL ter os campos `email` e `password` e botão de submissão, sem integração funcional; o handler pode ser no-op ou `toast.info('Login em breve')`.

#### Scenario: Submeter login
- **WHEN** o usuário submete o formulário de login
- **THEN** nenhuma chamada à API é feita

### Requirement: Mensagens de erro de registro em i18n
Todos os códigos de erro possíveis de `POST /auth/register` SHALL existir como chaves em `messages.pt.ts` e `messages.en.ts` de `apps/frontend/src/shared/i18n/`, com tradução nos dois idiomas.

#### Scenario: Código mapeado
- **WHEN** a API retorna um código de erro de `POST /auth/register`
- **THEN** `getMessage(code)` retorna a mensagem traduzida, não `UNKNOWN_ERROR_CODE`

### Requirement: Escopo de componentes
A implementação SHALL NOT criar componentes fora de `app/(public)/join/`, reaproveitando o que já existe em `shared/`.

#### Scenario: Reuso de shared
- **WHEN** a tela precisa de componentes de UI
- **THEN** usa os existentes em `shared/`
