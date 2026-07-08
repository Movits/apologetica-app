---
tags: [arquitetura]
atualizado: 2026-07-08
---

# Estado Global e Tema

O estado global do app vive em três contexts de React, todos em `src/context/`. Em `App.js` eles envolvem a navegação nesta ordem: LanguageProvider, depois ThemeProvider, depois AuthProvider (mais o AccountPromptProvider dos modais de conta).

## ThemeContext

Arquivo: `src/context/ThemeContext.jsx`. Controla tema claro/escuro e tamanho de fonte.

- **Paleta clara**: navy `#1a3a5c` (primary), dourado `#c9a84c` (accent) e creme `#f5f0e8` (bg).
- **Paleta escura**: estilo "noite na catedral", navy profundo com dourado quente. `primaryText` vira dourado claro `#e6c878` e o texto geral é creme, não branco puro.
- **Fonte**: quatro níveis (pequeno, normal, grande, enorme). As telas usam `fs(n)` para escalar qualquer tamanho base, ex.: `fs(16)`.
- **Persistência**: AsyncStorage nas chaves `settings:darkMode` e `settings:fontSize`.
- **Sincronia com o site**: na web, a chave `appg_theme` do localStorage é compartilhada com a landing (mesmo domínio) e tem prioridade na hidratação. Ver [[Site (Landing Page)]].
- Extras: sincroniza a navigation bar do Android com o tema e injeta CSS na web para o autofill do navegador não destoar dos cards.

Uso típico nas telas:

```js
const { colors, darkMode, fs } = useTheme();
```

## AuthContext

Arquivo: `src/context/AuthContext.jsx`. Estado de autenticação Firebase.

- `user`: usuário Firebase logado ou null.
- `guest`: modo visitante, persistido em `auth:guestMode`. Logar desativa o modo visitante automaticamente.
- `signedInOrGuest`: verdadeiro se logou OU escolheu continuar como visitante. É o que decide entre MainStack e AuthStack em `App.js`.
- `loading`: enquanto hidrata, o app mostra o splash com a marca.
- Expõe `signUp`, `signIn`, `signOut`, `resetPassword` e `linkGoogleToEmail`, com mensagens de erro traduzidas PT/EN.

Detalhes de conta, Google e Firestore ficam em [[Contas e Sincronização]].

## LanguageContext

Arquivo: `src/context/LanguageContext.jsx`. Idioma da interface.

- `t(key)` traduz usando `src/i18n/strings.js`, com fallback de EN para PT.
- `isEn` e `isPt` para condicionais rápidas nas telas.
- Persistência em `settings:language` e, na web, sincronia com a chave `appg_lang` compartilhada com a landing.
- Mantém o AuthContext informado do idioma via `setAuthLanguage`, porque o Auth fica acima dele na árvore e não pode usar o hook.

O sistema de tradução completo está em [[Idiomas (i18n)]].
