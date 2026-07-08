---
tags: [arquitetura]
atualizado: 2026-07-08
---

# Contas e Sincronização

O Firebase é a única dependência de nuvem do app e serve só para conta e sincronização dos dados do usuário. Todo o conteúdo continua offline, ver [[Decisão - App 100% offline]].

## Configuração

`src/services/firebase.js` inicializa o projeto `appologetica7`. As chaves client-side são públicas por design, a segurança vem das regras do Firestore. A persistência do login é por plataforma: IndexedDB (com fallback localStorage) na web e AsyncStorage no nativo, para o login sobreviver a recarregamentos.

## Formas de entrar

- **Email e senha**: cadastro, login e recuperação de senha no AuthStack, com mensagens de erro traduzidas.
- **Google**: via `src/hooks/useGoogleSignIn.js` (e variante `.web.js`), usando expo-auth-session.
- **Uma conta por email**: se a pessoa criou conta com email/senha e depois entra com Google usando o mesmo email, o app pede a senha e vincula a credencial Google à MESMA conta com `linkGoogleToEmail`. Assim o login Google passa a cair no mesmo UID e nos mesmos dados.

## Modo visitante

Quem não quer conta toca em "continuar como visitante". O estado fica em `auth:guestMode` no AsyncStorage e `signedInOrGuest` libera o app inteiro, ver [[Estado Global e Tema]].

Recursos que gravam na nuvem passam pelo hook de `src/components/GuestGate.jsx`: `requireAccount(callback)` executa direto se há login, senão abre o modal "Criar uma conta?" de `src/components/AccountPrompt.jsx`. O visitante navega por tudo, só não sincroniza.

## O que sincroniza no Firestore

Tudo em `users/{uid}`, via `src/services/userData.js`, com escuta em tempo real (onSnapshot):

| Subcoleção | Conteúdo |
| --- | --- |
| `highlights` | marcações de versículo com cor, ver [[Leitor da Bíblia]] |
| `notes` | notas ancoradas em versículos |
| `notebook` | páginas do caderno livre, ver [[Caderno, Notas e Favoritos]] |

Favoritos de artigos e progresso de leitura ficam locais em AsyncStorage, não sincronizam (julho de 2026).

## Segurança

`firestore.rules` na raiz do repo: cada usuário só lê e escreve documentos abaixo do próprio UID, anônimos não acessam nada. As regras são coladas manualmente no console do Firebase.

## Ferramenta administrativa

`scripts/merge-accounts.mjs` roda fora do app com firebase-admin. Lista as contas do Firestore (`--list`) e junta os dados de um UID em outro (`--from X --to Y`), útil quando alguém acabou com duas contas para o mesmo email antes da vinculação existir. Exige chave de service account em `.secrets/` (fora do git). Ver [[Scripts da Pasta scripts]].
