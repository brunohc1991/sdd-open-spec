# Design

## Context

A change 002 (pré-requisito) entrega o módulo `auth` com `UserRepository`, `CryptoProvider`, fakes, `auth.controller.ts` com `POST /auth/register` e a tela `/join`. A change 001 entrega o tratamento de erros, `ApiErrorResponse`, i18n e o shell do frontend (`AdminShell`, grupos `(public)`/`(private)`). Convenções: [Como executar](../../shared/como-executar.md) e [Regras de nomenclatura](../../shared/regras-de-nomenclatura.md).

## Goals / Non-Goals

**Goals:**
- Concluir o ciclo de autenticação com separação estrita entre domínio e transporte.
- Proteger a área privada com sessão que sobrevive ao fechamento do navegador.

**Non-Goals:**
- Refresh token, cookie `httpOnly`, recuperação de senha, nova biblioteca HTTP.

## Decisions

- **Token fora do domínio**: `login-user` devolve só `{ id, name, email }`; o JWT é criado em `jwt.util.ts` e chamado pelo controller. Alternativa descartada: `TokenProvider` no domínio, por vazar detalhe de transporte.
- **Erro único para credenciais**: e-mail inexistente e senha incorreta lançam o mesmo `DomainError('user.credentials.invalid', 401)`, para não revelar quais e-mails existem.
- **Expiração de 7 dias** no JWT e no cookie (a spec legada trazia `14d` no helper; unificado em 7 dias).
- **Cookie legível pelo client** (`js-cookie`, sem `httpOnly`) para reidratar o `AuthContext`; trade-off de exposição a XSS aceito pela spec.
- **Decode com `TextDecoder('utf-8')`** em vez de `atob` cru, para preservar acentuação.
- **Provider global**: `AuthProvider` no layout raiz para servir `(public)` e `(private)`; `AuthGuard` apenas no layout `(private)`.
- **Ordem**: caso de uso e testes → backend (dependência, helper, endpoint, `.http`) → frontend (dependência, i18n, decode, contexto, guard, layouts, login, redirecionamento) → validação manual.
- **Nomenclatura**: `kebab-case` com sufixo por papel (`*.util.ts`, `*.context.tsx`, `*.guard.tsx`).

## Risks / Trade-offs

- [Cookie sem `httpOnly`] → exposto a XSS; mitigado por payload mínimo e expiração.
- [Flash de conteúdo na hidratação] → placeholder neutro enquanto `loading`.
- [Dependência da change 002 não implementada] → apply desta change só após a 002.
- [Segredo fraco em `.env.example`] → aviso de troca em produção.
