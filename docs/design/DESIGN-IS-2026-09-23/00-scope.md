# 00. Escopo da auditoria (design-is, Dieter Rams)

Data: 2026-09-23. Commit auditado: `efbdbde` (branch `claude/funny-cray-ret9a0`, sem alterações em `src/`).

## O que está sendo auditado

- **Produto**: APPologética, app católico de apologética em React Native + Expo SDK 54, mesmo código em Android, iOS e web (react-native-web).
- **Instância viva**: build web gerado por `npx expo export -p web` e servido em `http://127.0.0.1:8787/` (pasta `dist/`, gitignored). Playwright + Chromium disponíveis para inspeção de estilos computados.
- **Capturas**: `design/preview/antes/` (26 imagens, claro e escuro, viewport 390x844 @2x, mais duas de desktop 1280 px).
- **Superfície auditada** (as 5 telas prioritárias mais o chrome global, decididas na Fase 0):
  1. Chrome global: tab bar e headers (`App.js`, navegadores e `screenOptions`).
  2. Início (`src/screens/HomeScreen.jsx`).
  3. Artigo, a leitura (`src/screens/ArticleDetailScreen.jsx`, `src/components/MarkdownText.jsx`).
  4. Bíblia, capítulo (`src/screens/BibleScreen.jsx`).
  5. Onboarding e Login (`src/screens/OnboardingScreen.jsx`, `src/screens/auth/LoginScreen.jsx`).
- **Sistema de tema**: `src/context/ThemeContext.jsx` (paletas LIGHT/DARK, `fs()`), sem arquivo de tokens.

## Usuário primário e tarefa primária

- **Usuário**: "Lucas, o defensor", católico de 20 a 38 anos que já travou ao defender a fé (personas em `brain/2-Projeto/Plano de Negócio.md`).
- **Tarefa primária**: achar e ler uma resposta com fonte a uma objeção (artigo ou diálogo) e abrir a passagem bíblica citada, para responder com caridade.

## Restrições

- Marca: navy `#1a3a5c`, dourado `#c9a84c`, creme `#f5f0e8` (claro) e "noite na catedral" (escuro). Ionicons mantidos.
- Stack: React Native + Expo, compatível com Expo Go, 100% offline, sem renomear rotas (deep links), 5 abas fixas.
- Piso de acessibilidade já conquistado: dourado AA (`accentText`), alvos de toque 44, escala de fonte (`fs`), reduce motion a respeitar.
- Direção decidida na Fase 0: híbrida (estrutura Apple + identidade mantida), tokens antes de chrome antes de microinterações.

## Referências

- Apple Books (leitura), Apple Journal (cards e movimento), Ajustes do iOS (listas agrupadas), Hallow (tom premium, nunca o paywall), Capela (padrões de UX, concorrente devocional).
