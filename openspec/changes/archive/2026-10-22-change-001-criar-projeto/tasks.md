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
- [x] 1.1 descrição da task
  > ✅ YYYY-MM-DD HH:MM — o que foi feito, decisões tomadas, desvios do plano
```

## 1. Monorepo

- [x] 1.1 Criar a estrutura base do monorepo com a skill `config-project-fullstack` usando o namespace `@sdd`; verificar que `apps/frontend` e `apps/backend` existem e que o build do workspace passa
  > ✅ 2026-10-22 00:05 — Executada a skill `config-project-fullstack --namespace @sdd`. Criados `apps/frontend` (@sdd/frontend) e `apps/backend` (@sdd/backend); `npm run build` passou (2/2 tasks). Aviso do turbo sobre `outputs` do backend (dist) e EBADENGINE do Node 22.13.1, sem impacto.

## 2. Prisma

- [x] 2.1 Configurar a infraestrutura do Prisma no backend com a skill `config-prisma` (schema modular, `DbModule`, `PrismaService`, seed técnico, docker compose); verificar que o backend compila e o banco local aceita conexão com a `DATABASE_URL`
  > ✅ 2026-10-22 00:20 — Skill `config-prisma --apply --install` executada: schema modular (bootstrap.model.prisma temporário), `DbModule`/`PrismaService`, seed técnico, docker-compose (porta 5690). `db:start` subiu o Postgres, `prisma:generate` e `nest build` passaram, conexão via `DATABASE_URL` validada com `select 1`.

## 3. Pacote compartilhado

- [x] 3.1 Criar o pacote compartilhado com a skill `config-package-shared` usando o namespace `@sdd`; verificar que seus testes passam e que backend e frontend o importam sem erro
  > ✅ 2026-10-22 00:35 — Skill `config-package-shared` criou `packages/shared` (@sdd/shared); 21 suítes / 96 testes passam. Desvios: (1) o `package.json` do template da skill estava com `@sdd/shared` (reescrito pelo rewrite de namespace da task 1.1) e o script exige `@temp/shared`; restaurado `@temp/shared` e reexecutado. (2) O script não adicionou a dependência nos apps; adicionei `@sdd/shared: *` em `apps/backend` e `apps/frontend` e rodei `npm install`. `require('@sdd/shared')` resolve em ambos (68 exports) e `npm run build` passa (3/3).

## 4. Backend: erros e JWT

- [x] 4.1 Configurar tratamento de erros centralizado e autenticação JWT com a skill `backend-nest-config`; verificar que o build do backend passa e que um endpoint protegido responde 401 sem token no formato padronizado
  > ✅ 2026-10-22 00:25 — Skill `backend-nest-config` aplicada (`src/shared/` com filtro `ApiExceptionFilter` e `JwtAuthGuard` globais, `@Public`/`@CurrentUser`, `JWT_SECRET`/`JWT_EXPIRES_IN` no .env); build do backend passou. Como o backend não tem rota protegida ainda (`/` é `@Public`), validei com um controller temporário `GET /tmp-probe`: 401 sem token em `{statusCode, errors, details, path, timestamp}`. Controller temporário removido e backend recompilado. Obs.: o build sai em `dist/src/main` (não `dist/main`), então o script `start:prod` do scaffold aponta para caminho incorreto; não alterado por estar fora do escopo.

## 5. Frontend

- [x] 5.1 Executar a skill `frontend-next-config` para criar `shared/` e os grupos de rotas `(public)`/`(private)` com sidebar; verificar que o frontend compila, inicia na porta 3000 sem erros e a sidebar aparece nas rotas privadas
  > ✅ 2026-10-22 00:45 — Skill `frontend-next-config` aplicada com padrões (destino `apps/frontend`, sem guard de auth: TODO do template mantido). Criados `src/shared/`, grupos `(public)`/`(private)`, `/join` e `/example/dashboard`; dependências instaladas via workspace (`@sdd/shared` já presente). `next build` passou sem correções; `next start` na porta 3000 sem erros; `<aside>`+`<nav>` presentes em `/example/dashboard` e ausentes em `/join`.

## 6. Integração

- [x] 6.1 Subir frontend (3000) e backend (4000) juntos e verificar que ambos iniciam sem erros e que nenhum módulo de domínio foi criado
  > ✅ 2026-10-22 00:55 — Backend (`node dist/src/main`, porta 4000) e frontend (`next start`, porta 3000) subidos juntos: ambos respondem 200 em `/` e os logs não têm erros/exceções. Nenhum módulo de domínio: sem diretório `modules/`, backend só com `db` e `shared`, `prisma/models` só com o `bootstrap.model.prisma` temporário, frontend só com `app` e `shared`. Servidores encerrados após o teste.
