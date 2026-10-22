# Tasks

## Referências Compartilhadas

- [Como executar](../../shared/como-executar.md)
- [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md)

Regras de execução (resumo de [Como executar](../../shared/como-executar.md), que prevalece em caso de dúvida):

- Execute as tasks na ordem em que aparecem dentro de cada grupo.
- Ao concluir uma task, marque o checkbox e adicione a evidência logo abaixo.
- Nunca remova uma task; se não puder ser executada, registre o motivo na evidência.
- Quando a task indicar uma skill ou gerador, use-o como implementação principal e registre desvios na evidência.
- A change só está concluída quando todos os checkboxes estiverem marcados com evidência.

Formato da evidência:

```md
[x] 1.1 descrição da task
  > ✅ YYYY-MM-DD HH:MM — o que foi feito, decisões tomadas, desvios do plano
```

## 1. Módulo auth

- [x] 1.1 Criar o módulo `auth` com a skill `config-new-module`.
  > ✅ 2026-10-22 18:30 — Skill executada com `--module auth --namespace @sdd`: criou `modules/auth`, o módulo/controller NestJS, a estrutura do frontend e o registro no AppModule. Desvio: o template do `package.json` deixou o nome como `@sdd/__package_name__` (placeholder não substituído) e o `npm install` falhou com 404 em `@sdd/auth`; corrigi o nome para `@sdd/auth` manualmente e rodei `npm install`, `npm run build` (4/4 tasks) e `npm run test --workspace @sdd/auth` (1 teste passou).
- [x] 1.2 Criar o agregado `user` no módulo `auth` com a skill `module-aggregate`, com apenas um caso de uso de exemplo.
  > ✅ 2026-10-22 18:35 — Skill executada com `--module auth --aggregate user --mode example`: criou `modules/auth/src/user/{model,provider,usecase}` com `User`, `UserRepository` e `CreateUser` (apenas o caso de uso de exemplo), e exportou `./user` em `src/index.ts`. `tsc` do workspace `@sdd/auth` compila sem erros. Sem desvios.
- [x] 1.3 Implementar a entidade `user` com a skill `module-entity`: `id`, `name` (rule: person name), `email` (rule: email), `password` (rule: hash pass).
  > ✅ 2026-10-22 18:45 — Skill `module-entity` aplicada: `modules/auth/src/user/model/user.entity.ts` (name: Required/MinLength(3)/MaxLength(80)/PersonName; email: Required/Email; password: BcryptHashRule; `id` validado pela classe base `Entity`) e `modules/auth/test/user/model/user.entity.test.ts`. 15 testes passando, 100% de cobertura da entidade. Observação: `BcryptHashRule` ignora valor vazio, então a entidade sozinha não rejeita senha vazia; a validação da senha em texto puro (senha fraca → 422) deve ficar no caso de uso `register-user` (task 1.5).
- [x] 1.4 Criar a interface `crypto.provider.ts` em `modules/auth/.../user/provider` com os métodos de criptografar e comparar senhas.
  > ✅ 2026-10-22 18:46 — Criado `modules/auth/src/user/provider/crypto.provider.ts` com `CryptoProvider { encrypt(value): Promise<string>; compare(value, hash): Promise<boolean> }`, exportado em `provider/index.ts`. Build do workspace `@sdd/auth` sem erros.
- [x] 1.5 Implementar o caso de uso `register-user` com a skill `module-use-case`: validar entrada, checar usuário já cadastrado, criptografar senha, criar entidade e persistir; retorno `void`.
  > ✅ 2026-10-22 19:05 — Skill `module-use-case` (custom, retorno `void`): `modules/auth/src/user/usecase/register-user.usecase.ts` (`RegisterUser(cryptoProvider, userRepository)`), exportado em `usecase/index.ts`. Fluxo: valida `name`/`email`/`password` em uma única chamada ao `Validator` (acumula um código por campo inválido; senha em texto puro com `RequiredRule` + `StrongPasswordRule`) → `findByEmail` → `encrypt` → `new User` + `user.validate()` → `create`. Testes: `test/user/usecase/register-user.usecase.test.ts` + fakes concretas `test/mock/{fake-user.repository,fake-crypto.provider}.ts` (e `fake-repositories.test.ts` para cobri-las); 25 testes passando no módulo, 100% de cobertura do caso de uso. Desvios/decisões: (1) adicionei `findByEmail(email): Promise<User | null>` à interface `UserRepository`, necessário para "checar usuário já cadastrado" e feito aqui, antes das implementações (2.2), que não a alterarão; (2) criei `EmailAlreadyRegisteredError` (409, código `user.email.already.registered`) em `modules/auth/src/user/error/`, pois `@sdd/shared` não tem erro de conflito; (3) os arquivos de referência obrigatórios da skill (`register-user.usecase.ts`, fakes) não existiam no repo, então usei os few-shots da skill como base.

## 2. Back-end

- [x] 2.1 Sincronizar o módulo `auth` com o Prisma (model `user` + migration) com a skill `backend-prisma-sync-module`.
  > ✅ 2026-10-22 19:15 — Skill `backend-prisma-sync-module` aplicada: criado `apps/backend/prisma/models/auth.model.prisma` (model `User` → tabela `users`, campos `id`, `name`, `email` único, `password`, `createdAt`, `updatedAt`, `deletedAt?`) e removido `bootstrap.model.prisma`, conforme a skill. Migration `20261022182918_auth` (primeira sincronização do módulo) gerada e aplicada no PostgreSQL local (porta 5690); SQL revisado (apenas `CREATE TABLE users` + índice único em `email`, sem operações destrutivas, pois `migrations/` estava vazio). `prisma:generate` executado (client v7.10.1). Suposição: `email` com `@unique`, coerente com a regra de e-mail duplicado.
- [x] 2.2 Implementar o repositório Prisma de `user` em `apps/backend/src/modules/auth` (sem subpasta) com a skill `backend-prisma-repository`, sem alterar a interface.
  > ✅ 2026-10-22 19:25 — Skill `backend-prisma-repository` aplicada: `apps/backend/src/modules/auth/user.prisma.ts` com `PrismaUserRepository implements UserRepository` (`create`, `update`, `delete`, `findById`, `findPage` e também `findByEmail`, método adicionado à interface na task 1.5, antes desta implementação; a interface não foi alterada aqui). `auth.module.ts` passou a importar `DbModule` e registrar/exportar o repositório. `tsc --noEmit` do backend sem erros. Ainda não exercitado contra o banco: será validado pelos testes HTTP (2.5) e no navegador (5.2).
- [x] 2.3 Instalar `bcrypt` no backend e implementar `crypto.provider.ts` em `apps/backend/src/modules/auth` (sem subpasta), sem alterar a interface.
  > ✅ 2026-10-22 19:30 — Instalados `bcrypt@^6` e `@types/bcrypt` no workspace `@sdd/backend`. Criado `apps/backend/src/modules/auth/crypto.provider.ts` com `BcryptCryptoProvider implements CryptoProvider` (`encrypt` = `bcrypt.hash` com 10 rounds; `compare` = `bcrypt.compare`), registrado e exportado em `auth.module.ts`. `tsc --noEmit` sem erros; verificado em Node que o hash gerado casa com o regex de `BcryptHashRule` e que `compare` retorna `true`. Interface inalterada.
- [x] 2.4 Criar `auth.controller.ts` com a skill `backend-nest-controller` expondo `POST /auth/register`: injetar repositório e `crypto.provider`, instanciar `register-user` no corpo do método.
  > ✅ 2026-10-22 19:40 — Skill `backend-nest-controller` aplicada em `apps/backend/src/modules/auth/auth.controller.ts`: `POST /auth/register` com `@Public()` (o `JwtAuthGuard` é global e a rota precisa ser aberta), `@Body()` tipado com `RegisterUserIn`, injeção de `PrismaUserRepository` e `BcryptCryptoProvider` e `new RegisterUser(...)` no corpo do método; resposta 201 sem corpo (padrão do Nest para POST + `void`). Preservado o `GET /auth`. Os campos do body são repassados individualmente (`input?.name` etc.) para que um body vazio gere erros de validação 422 em vez de erro 500. Backend subiu e foi exercitado com curl (201, 409, 422).
- [x] 2.5 Criar os testes de integração HTTP em `auth.integration.http` (Rest Client) cobrindo o fluxo de registro.
  > ✅ 2026-10-22 19:45 — Criado `apps/backend/src/modules/auth/auth.integration.http` (Rest Client) com `@baseUrl`, `@scenarioVersion = {{$timestamp}}` para e-mails únicos e 8 requests separados por `###`: registro válido (201), e-mail duplicado (409), senha fraca, nome sem sobrenome, nome curto, e-mail inválido, body vazio e múltiplos campos inválidos (422). Os status e códigos esperados foram conferidos executando os mesmos payloads com curl contra o backend local. Observação: nome `Al` retorna `user.name.min.length` e também `user.name.person.name`.

## 3. Mapeamento de erros e i18n

- [x] 3.1 Ler `auth.integration.http` e `apps/backend/src/shared/errors/api-exception.filter.ts` e listar, na evidência, todos os códigos de `errors[]` possíveis em `POST /auth/register`.
  > ✅ 2026-10-22 19:50 — Lidos `auth.integration.http` e `api-exception.filter.ts` (e o caso de uso/entidade). Códigos possíveis em `errors[]` de `POST /auth/register`: 422 → `user.name.required`, `user.name.min.length`, `user.name.max.length`, `user.name.person.name`, `user.email.required`, `user.email.invalid.email`, `user.password.required`, `user.password.strong.password`; 409 → `user.email.already.registered`; 500 → `INTERNAL_SERVER_ERROR` (fallback do filtro). Rota pública, então não há 401. Fora da lista: body com JSON malformado gera `HttpException` 400 do Nest cujo `errors[]` traz o texto cru da mensagem do framework, que não é um código estável e não foi mapeado.
- [x] 3.2 Garantir que cada código da 3.1 exista em `apps/frontend/src/shared/i18n/messages.pt.ts` e `messages.en.ts`, adicionando os ausentes em pt e en no padrão existente.
  > ✅ 2026-10-22 19:52 — Nenhum dos 10 códigos existia. Adicionados em `messages.pt.ts` e `messages.en.ts` (chaves entre aspas por serem pontuadas; `INTERNAL_SERVER_ERROR` na ordem alfabética das chaves em caixa alta). `tsc --noEmit` do frontend sem erros (o tipo `ErrorMessages` exige as mesmas chaves nos dois idiomas).

## 4. Front-end

- [x] 4.1 Confirmar `NEXT_PUBLIC_API_URL` em `apps/frontend/.env` e substituir `app/(public)/join/page.tsx` por componente com estado `mode` (`'register' | 'login'`) e controle de troca.
  > ✅ 2026-10-22 20:00 — `NEXT_PUBLIC_API_URL=http://localhost:4000` já existia em `apps/frontend/.env` (nada a alterar). `app/(public)/join/page.tsx` reescrito como client component com `useState<'register' | 'login'>('register')` e botão de troca ("Já tem conta? Entrar" / "Não tem conta? Cadastre-se"). O botão "Acessar Dashboard" do placeholder anterior foi removido por ser substituído pelos formulários. Componentes de UI reaproveitados de `shared/` (`Button`, `Input`, `Label`); os dois formulários são funções locais do próprio `page.tsx`, sem novos arquivos fora de `join/`.
- [x] 4.2 Implementar o formulário de cadastro (`name`, `email`, `password`, `required`) chamando `POST {NEXT_PUBLIC_API_URL}/auth/register` com `fetch`: `toast.success` em 201; em erro, um `toast.error(getMessage(code))` por item de `errors[]`; sem redirecionar.
  > ✅ 2026-10-22 20:00 — `RegisterForm` em `join/page.tsx`: campos `name`, `email`, `password` apenas com `required` (sem `type="email"`, para que e-mail inválido chegue ao backend e retorne o 422 esperado), `fetch` nativo para `{NEXT_PUBLIC_API_URL}/auth/register`; 201 → `toast.success` e `form.reset()`; erro → um `toast.error(getMessage(code))` por item de `errors[]`; sem redirecionamento. Extras para robustez: corpo sem `errors[]` ou falha de rede → `toast.error(getMessage('DEFAULT_API_ERROR'))`; botão desabilitado durante o envio. `tsc --noEmit` sem erros.
- [x] 4.3 Implementar o formulário de login (`email`, `password`, botão) com handler no-op ou `toast.info('Login em breve')`.
  > ✅ 2026-10-22 20:00 — `LoginForm` em `join/page.tsx` com `email`, `password` e botão "Entrar"; o submit chama `preventDefault()` e `toast.info('Login em breve')`, sem nenhuma chamada à API.

## 5. Validação

- [x] 5.1 Executar build e checagem de tipos sem erros em backend e frontend.
  > ✅ 2026-10-22 20:10 — `npm run build` (turbo): 4/4 tasks com sucesso (shared, auth, backend e frontend; o frontend gerou `/join` estático). `tsc --noEmit` isolado sem erros em `apps/backend`, `apps/frontend` e `modules/auth`; testes do módulo `auth`: 25 passando. Ressalva fora do escopo: `npm run check-types` na raiz falha apenas em `packages/ui` (`@sdd/ui`), pré-existente e não tocado por esta change — o `tsconfig.json` dele estende `@repo/typescript-config/react-library.json`, pacote inexistente (o do projeto é `@sdd/typescript-config`). Não corrigido para não ampliar o escopo; vale uma change própria.
- [x] 5.2 Validar no navegador e registrar evidência: alternar modos; cadastro válido (toast de sucesso); e-mail duplicado (409); senha fraca (422); múltiplos campos inválidos (um toast por erro).
  > ✅ 2026-10-22 20:20 — Validado em Chrome headless (Playwright) contra `next start` (3000) e `nest start` (4000) reais, com PostgreSQL local; script e screenshots ficaram fora do repositório (scratchpad). Resultados em `/join`: (1) alternância: modo inicial "Cadastrar" → troca para login (campos e-mail/senha, botão "Entrar") → volta; (2) login: toast info "Login em breve" e 0 chamadas à API; (3) cadastro válido → 201, `toast.success` "Cadastro realizado com sucesso!", URL permaneceu `/join`; (4) e-mail duplicado → 409, toast "Este e-mail já está cadastrado."; (5) senha fraca `123456` → 422, toast de senha forte; (6) `Maria` / `invalido` / `1` → 422 com 3 toasts de erro, um por campo (nome completo, e-mail válido, senha forte), sem redirecionamento. Todas as mensagens vieram traduzidas, nenhuma `UNKNOWN_ERROR_CODE`. Verificado também no banco que a senha gravada começa com `$2b$10$` (hash bcrypt, nunca texto puro). Os usuários de teste criados foram removidos do banco após a validação.
