# 2026-09-24 - Upgrade para o Expo SDK 57

## Por que

O dono quis abrir o app no Expo Go do iPhone, e o Expo Go das lojas só abre
projetos no SDK mais recente (57 em setembro de 2026). O projeto estava no 54,
que era o atual quando foi criado. O Expo lança um SDK por quadrimestre, e três
ficaram para trás (55, 56 e 57).

## O que mudou entre 54 e 57 e o que afetava o app

- SDK 55: New Architecture obrigatória (o app já usava), edge-to-edge
  obrigatório no Android (`edgeToEdgeEnabled` removido do `app.json`), campos
  `notification`, `androidNavigationBar` e `splash` do `app.json` viraram
  plugins, `setBackgroundColorAsync`/`setButtonStyleAsync` da navigation bar
  deixaram de existir (agora `NavigationBar.setStyle`), `experimentalBlurMethod`
  virou `blurMethod` (o app não usa), Node mínimo 20.19.
- SDK 56: `expo/fetch` vira o `fetch` global (os três `fetch` do app usam só
  `signal` e `headers`, compatíveis), `expo` não depende mais de
  `@expo/vector-icons` (o app já declarava), iOS mínimo 16.4.
- SDK 57: React Native 0.86 e React 19.2.3, reanimated 4.5, worklets 0.10,
  gesture-handler 2.32. Sem quebra declarada.

## O que foi feito

- `npx expo install expo@^57.0.0 --fix`: 25 pacotes trocados, `react-native`
  0.81.5 -> 0.86.3, `react` 19.1 -> 19.2.3, `react-native-view-shot` 4 -> 5
  (assinatura de `captureRef` igual), `@sentry/react-native` 7.2 -> 7.11.
  `react-native-web` continua 0.21 e React Navigation continua na 6 (sem peer
  inválido).
- `app.json`: `splash` -> plugin `expo-splash-screen` (imagem 512 px a 200 de
  largura, navy `#1a3a5c`, escuro `#142844` igual ao `BrandedSplash`),
  `notification` -> plugin `expo-notifications`, `androidNavigationBar` e
  `edgeToEdgeEnabled` removidos, plugin do Sentry pelo nome raiz
  `@sentry/react-native`, mais `expo-sharing` e `expo-status-bar` que a CLI
  exigiu.
- `ThemeContext.jsx` e `useModalNavBar.js`: `NavigationBar.setStyle(darkMode ?
  'light' : 'dark')`, síncrono, só no Android. Não existe mais cor de fundo da
  barra para pintar.
- Workflow de deploy em Node 22. Docs: CLAUDE.md, README, Visão Geral.

## Verificado

- `npx expo-doctor`: 21/21. Lint 0 erros e 2 warnings (baseline). 99 testes.
  `check:refs` 0 erros.
- `npx expo export -p web`: bundle principal 1.397.606 B gzip (era 1.396.480,
  +1 KB). As 26 capturas do Playwright saíram **byte a byte iguais** às do SDK
  54, com 0 erros de página, abas e alvos iguais.
- `npx expo export -p ios -p android`: os bundles nativos compilam (2.267 e
  2.271 módulos), o que cobre os módulos só nativos (Sentry, notificações,
  Google, view-shot, mapa).

## Pendente

- Smoke no aparelho: agora dá para abrir no Expo Go da loja (iPhone e Android)
  com `npx expo start --go --lan` no computador. O túnel do Metro não sai do
  container (ngrok bloqueado pela política de rede) e o build EAS depende de
  `EXPO_TOKEN` no ambiente.
- Com edge-to-edge obrigatório, conferir no Android real a barra de navegação
  por gesto e por botões sobre a tab bar translúcida.
