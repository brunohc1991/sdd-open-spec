## ADDED Requirements

### Requirement: Decode de JWT preservando UTF-8
O frontend SHALL decodificar o payload do JWT com base64url → `Uint8Array` → `TextDecoder('utf-8')`, sem usar `atob` cru, retornando `{ sub, name, email }` ou `null` se inválido.

#### Scenario: Acentuação preservada
- **WHEN** o token contém `name` igual a `José da Silva`
- **THEN** o payload decodificado mantém `José da Silva`

#### Scenario: Token inválido
- **WHEN** o token é malformado
- **THEN** a decodificação retorna `null`

### Requirement: AuthContext com sessão em cookie
O frontend SHALL prover `AuthContext` em `modules/auth/context` com `user`, `token` e `status` (`'loading' | 'authenticated' | 'unauthenticated'`), hook `useAuth()` e as operações `login(token)` e `logout()`. A sessão SHALL ser persistida no cookie `auth_token` via `js-cookie`, com `sameSite: 'lax'`, `secure` em produção, `expires: 7` e sem `httpOnly`.

#### Scenario: Hidratação a partir do cookie
- **WHEN** a aplicação monta com um cookie `auth_token` válido
- **THEN** o contexto passa de `loading` para `authenticated` com os dados do usuário

#### Scenario: Sem cookie ou cookie inválido
- **WHEN** a aplicação monta sem cookie ou com token inválido
- **THEN** o contexto passa a `unauthenticated`

#### Scenario: Login e logout
- **WHEN** `login(token)` é chamado e depois `logout()`
- **THEN** o cookie é gravado e o estado hidratado; em seguida o cookie é removido e o estado limpo

### Requirement: AuthProvider em escopo global
O `AuthProvider` SHALL cobrir os grupos `(public)` e `(private)`, posicionado no `app/layout.tsx` raiz ou em layout pai equivalente. `AuthContext` e `AuthGuard` SHALL ser exportados pelo barrel do módulo.

#### Scenario: Contexto compartilhado
- **WHEN** a tela de login e a área privada consultam `useAuth()`
- **THEN** ambas leem o mesmo contexto

### Requirement: AuthGuard nas rotas privadas
O `AuthGuard` SHALL envolver o layout do grupo `(private)`: renderizar placeholder neutro enquanto `loading`, redirecionar para `/join` quando `unauthenticated` e renderizar os filhos quando `authenticated`.

#### Scenario: Acesso deslogado
- **WHEN** um usuário sem sessão acessa `/example/dashboard`
- **THEN** é redirecionado para `/join` sem exibir conteúdo privado

#### Scenario: Recarga autenticada
- **WHEN** um usuário autenticado recarrega `/example/dashboard`
- **THEN** permanece autenticado, sem flash de tela pública

### Requirement: Login integrado ao backend
O formulário de login em `modules/auth/components/auth.component.tsx` SHALL chamar `POST {NEXT_PUBLIC_API_URL}/auth/login` com `fetch`; em sucesso SHALL chamar `auth.login(token)` e redirecionar para `/example/dashboard`; em erro SHALL disparar um `toast.error(getMessage(code))` por item de `errors[]`.

#### Scenario: Login com sucesso
- **WHEN** a API responde 200 com `token`
- **THEN** o cookie `auth_token` é gravado e o usuário vai para `/example/dashboard`

#### Scenario: Senha errada
- **WHEN** a API responde 401 com `user.credentials.invalid`
- **THEN** é exibido o toast "E-mail ou senha inválidos." e nenhum cookie é gravado

### Requirement: Mensagem i18n de credenciais inválidas
`messages.pt.ts` e `messages.en.ts` SHALL conter a chave `user.credentials.invalid` com "E-mail ou senha inválidos." e "Invalid email or password.".

#### Scenario: Tradução
- **WHEN** `getMessage('user.credentials.invalid')` é chamado
- **THEN** retorna a mensagem no idioma do navegador

### Requirement: Redirecionamento de /join com sessão ativa
A tela `/join` SHALL, quando `status === 'authenticated'`, redirecionar para `/example/dashboard` e, enquanto `loading`, não renderizar o formulário.

#### Scenario: Acesso logado a /join
- **WHEN** um usuário autenticado acessa `/join`
- **THEN** é redirecionado para `/example/dashboard`

### Requirement: Dados do usuário e logout no AdminShell
O `AdminShell` SHALL exibir `name` e `email` do usuário via `useAuth()` no dropdown do header, e `onLogout` SHALL chamar `auth.logout()` seguido de `router.push('/join')`.

#### Scenario: Dropdown com acentuação
- **WHEN** um usuário chamado `José da Conceição` está logado
- **THEN** o dropdown exibe o nome com a acentuação correta

#### Scenario: Logout
- **WHEN** o usuário aciona "Logout"
- **THEN** o cookie é removido e a tela `/join` é exibida

### Requirement: Persistência entre sessões do navegador
A sessão SHALL sobreviver ao fechamento e reabertura do navegador enquanto o cookie não expirar.

#### Scenario: Reabertura do navegador
- **WHEN** o navegador é fechado e reaberto dentro de 7 dias após o login
- **THEN** o usuário continua autenticado
