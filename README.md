# SDD com OpenSpec

Projeto de estudo criado para **começar a usar o [OpenSpec](https://github.com/Fission-AI/OpenSpec)** e praticar **Spec-Driven Development (SDD)**: cada funcionalidade nasce como uma *change* (proposta, specs, design e tarefas), é implementada a partir dela e, ao final, suas specs são sincronizadas e arquivadas.

A aplicação em si (autenticação, usuários e produtos) é apenas o veículo para exercitar o fluxo. O que importa aqui é o processo, registrado em [`openspec/`](openspec/).

> Não é um produto: é um repositório de aprendizado. Há decisões simplificadas de propósito (veja [Limitações conhecidas](#limitações-conhecidas)).

## O que foi construído

Cinco changes, todas implementadas e arquivadas em [`openspec/changes/archive/`](openspec/changes/archive/):

| # | Change | Entrega |
| - | ------ | ------- |
| 001 | `criar-projeto` | Monorepo Turborepo, Prisma modular, pacote `@sdd/shared`, tratamento de erros, base JWT e shell do frontend |
| 002 | `registrar-usuario` | Módulo `auth`, caso de uso `register-user`, `POST /auth/register` e tela `/join` |
| 003 | `login-usuario` | `login-user`, `POST /auth/login` com JWT, sessão por cookie, `AuthGuard` e logout |
| 004 | `cadastro-usuario` | CRUD de usuário autenticado (`/users`) com listagem, formulário e exclusão |
| 005 | `cadastro-produto` | Módulo `catalog` e CRUD de produto (`/products`), com enum, decimal e booleanos |

As specs resultantes (o comportamento atual do sistema) ficam em [`openspec/specs/`](openspec/specs/), uma pasta por capacidade.

## Como o OpenSpec foi usado

O fluxo de cada change seguiu o schema `spec-driven`, conduzido pelo Claude Code com os comandos `/opsx:*`:

1. **Propor** (`/opsx:propose`): gera `proposal.md`, `specs/`, `design.md` e `tasks.md`.
2. **Implementar** (`/opsx:apply`): executa as tarefas em ordem, marcando cada uma com a evidência do que foi feito e dos desvios.
3. **Sincronizar** (`/opsx:sync`): funde as specs da change (deltas) nas specs principais.
4. **Arquivar** (`/opsx:archive`): move a change para `openspec/changes/archive/`.

Regras gerais que todas as changes seguem ficam em [`openspec/shared/`](openspec/shared/): como executar as tarefas e as regras de nomenclatura.

Parte da implementação usou as *skills* do projeto em [`.claude/skills/`](.claude/skills/) (criar módulo, agregado, entidade, caso de uso, repositório Prisma, controller etc.), para manter o mesmo padrão entre módulos.

## Estrutura

```
apps/
  backend/     NestJS (porta 4000): controllers, repositórios Prisma, JWT
  frontend/    Next.js (porta 3000): rotas públicas e privadas, i18n pt/en
modules/
  auth/        domínio de autenticação e usuário
  catalog/     domínio de catálogo e produto
packages/
  shared/      contratos, entidade base, erros de domínio e regras de validação
  ui/, eslint-config/, typescript-config/
openspec/
  specs/       specs principais (comportamento atual)
  changes/     changes em andamento e, em archive/, as concluídas
  shared/      instruções gerais das changes
```

Namespace dos pacotes do workspace: `@sdd`. Os módulos de negócio (`modules/*`) contêm só domínio (entidades, casos de uso e contratos de repositório); a infraestrutura (Prisma, bcrypt, HTTP) fica no `apps/backend`.

## Como rodar

Requisitos: Node 24+ (campo `engines` do `package.json`), npm e Docker (para o PostgreSQL).

```sh
# 1. dependências
npm install

# 2. variáveis de ambiente (copie e ajuste, se necessário)
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# 3. banco de dados (PostgreSQL na porta 5690) e migrations
npm --workspace apps/backend run db:start
npm --workspace apps/backend run prisma:migrate:deploy
npm --workspace apps/backend run prisma:generate

# 4. build (os módulos e o pacote shared são consumidos compilados)
npm run build

# 5. desenvolvimento
npm run dev
```

Depois, acesse `http://localhost:3000/join`, cadastre um usuário e entre. As telas de **Usuários** e **Produtos** ficam no menu lateral.

Testes (cada módulo tem a sua suíte):

```sh
npm run test --workspace @sdd/auth
npm run test --workspace @sdd/catalog
npm run test --workspace @sdd/shared
```

Os endpoints de cada módulo têm cenários para a extensão [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) do VS Code em `apps/backend/src/modules/*/*.integration.http`.

## Limitações conhecidas

- A interface do frontend **não tem teste automatizado**: nas changes 004 e 005 ela foi conferida só por `tsc` e build, deixando a verificação visual para o usuário.
- O JWT é guardado em cookie **sem `httpOnly`** (para o frontend reidratar a sessão), trade-off aceito e registrado na change 003.
- `JWT_SECRET` em `.env.example` é só um valor de exemplo: troque-o por um segredo forte em qualquer ambiente real.
- `npm run check-types` na raiz falha em `packages/ui` (o `tsconfig` dele aponta para um pacote `@repo/typescript-config` que não existe). É anterior às changes e não foi corrigido.
- `PUT /products/:id` com um `id` inexistente **cria** o produto (conforme o requisito do `save-product`) em vez de responder 404.
