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
4. **Bíblia** — `BibleScreen` — 73 livros do cânon católico, fetch online + cache
5. **Ajustes** — `SettingsScreen` — modo escuro, fonte, cache da Bíblia

### Estado global
`src/context/ThemeContext.jsx` provê:
- `colors` (paleta light/dark, com `primary` para bg e `primaryText` para texto)
- `darkMode`, `setDarkMode` (persistido em AsyncStorage)
- `fontSize`, `setFontSize` (persistido)
- `fs(n)` — função para escalar fontSize

Todas as telas usam `useTheme()` e fazem `styles` via `makeStyles(colors, fs)`.

### Bíblia: API + Cache
`src/services/bibleApi.js` orquestra três camadas:
1. **Conteúdo local curado** (`src/data/bibleContent.js`): capítulos referenciados nos artigos + 7 deuterocanônicos (Tb, Jt, 1-2 Mc, Sb, Eclo, Br).
2. **AsyncStorage cache**: capítulos baixados ficam offline para sempre.
3. **bible-api.com** (Almeida, gratuita): fallback para os 66 livros canônicos quando não está em cache.

Função principal: `fetchChapter(bookId, chapter)` retorna `{ total, verses: [{n, t}], source }`.

`source` indica origem (`local` | `cache` | `api` | `unavailable`).

### Navegação entre telas
- `ArticlesScreen` → tap em referência → `navigate('Referências', { highlightId })`.
- `ReferencesScreen` → botão "Ler no app" para refs bíblicas → `navigate('Bíblia', { bookId, chapter, highlightVerse })`.
- `BibleScreen` aceita esses params via `route.params`.

### Dados (estáticos em `src/data/`)
- `articles.js` — array de artigos. `references[]` contém IDs de `references.js`.
- `references.js` — versículos, CIC, documentos. Refs bíblicas têm `bibleNav: { bookId, chapter, verse }`.
- `bible.js` — metadados dos 73 livros (id, apiId, nome, total de capítulos, deuterocanônico ou não).
- `bibleContent.js` — capítulos com texto local: curados (Gn 1, Sl 23, etc.) + deuterocanônicos.

### Convenções de conteúdo
- **Sem travessões (—)** nos textos.
- **Linguagem natural** em português, não "AI-like".
- **Citações completas**: expandir siglas (Catecismo em vez de CIC) e incluir autor + ano.

### Paleta
- `primary: #1a3a5c` (azul marinho), `accent: #c9a84c` (dourado), `bg: #f5f0e8` (creme).
- Dark mode: primaryText vira dourado claro (#e6c878) para legibilidade.

Icons via `@expo/vector-icons` (Ionicons).
