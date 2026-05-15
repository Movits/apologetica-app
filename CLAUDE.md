# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                    # instalar dependências
npx expo start --lan           # iniciar (celular no mesmo Wi-Fi)
npm run android                # abrir no emulador Android
npm run ios                    # abrir no simulador iOS
```

## Architecture

**React Native + Expo SDK 54** com 5 tabs no bottom navigator.

### Tabs
1. **Início** — `HomeScreen` — hero + atalhos
2. **Artigos** — `ArticlesScreen` — lista filtrável de textos de apologética
3. **Referências** — `ReferencesScreen` — Bíblia, Catecismo, documentos
4. **Bíblia** — `BibleScreen` — Livros → capítulos → versículos
5. **Ajustes** — `SettingsScreen` — modo escuro, tamanho de letra, etc

### Estado global
`src/context/ThemeContext.jsx` provê:
- `colors` (paleta light/dark)
- `darkMode`, `setDarkMode`
- `fontSize`, `setFontSize` (pequeno/normal/grande/enorme)
- `fs(n)` — função para escalar qualquer fontSize

Todas as telas usam `useTheme()` e fazem `styles` via `makeStyles(colors, fs)`.

### Navegação entre telas
- `ArticlesScreen` → tap em referência → `navigate('Referências', { highlightId })` → `ReferencesScreen` expande e scrolla até ela.
- `BibleScreen` aceita `route.params.bookId/chapter/highlightVerse` para deep linking.

### Dados (estáticos em `src/data/`)
- `articles.js` — array de artigos. Campo `references[]` contém IDs que apontam para `references.js`.
- `references.js` — versículos, CIC, documentos. Cada item tem `id`, `ref`, `fullSource`, `author`, `year`, `topic`, `text`, `url`, opcional `urlStrongs`.
- `bible.js` — `BIBLE_BOOKS[]` com livros, e cada livro tem `chapters: { [n]: [versículo1, ...] }`. Inclui apenas os capítulos referenciados nos artigos por enquanto.

### Convenções de conteúdo
- **Sem travessões (—)** nos textos. Usar vírgula, ponto ou parênteses.
- **Linguagem natural** em português brasileiro, não "AI-like".
- **Citações completas**: expandir siglas (Catecismo em vez de CIC) e incluir autor + ano.

### Paleta
- `primary: #1a3a5c` (azul marinho), `accent: #c9a84c` (dourado), `bg: #f5f0e8` (creme).
- Versão dark equivalente em `ThemeContext`.

Icons via `@expo/vector-icons` (Ionicons).
