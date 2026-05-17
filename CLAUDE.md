# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                    # instalar dependências
npx expo start --lan           # iniciar (celular no mesmo Wi-Fi)
npm run android                # abrir no emulador Android
npm run ios                    # abrir no simulador iOS
```

Para regerar a Bíblia Ave Maria a partir do JSON original:
```bash
node scripts/convert-avemaria.mjs
```

## Architecture

**React Native + Expo SDK 54** com 5 tabs no bottom navigator. **Tudo funciona offline** — sem chamadas de rede em tempo de execução.

### Tabs
1. **Início** — `HomeScreen`
2. **Artigos** — `ArticlesScreen`
3. **Referências** — `ReferencesScreen`
4. **Bíblia** — `BibleScreen` — 73 livros Ave Maria, navegação prev/next entre capítulos
5. **Ajustes** — `SettingsScreen`

### Estado global
`src/context/ThemeContext.jsx` provê:
- `colors` (light/dark — `primary` = bg, `primaryText` = texto enfatizado)
- `darkMode`, `fontSize` (persistidos em AsyncStorage)
- `fs(n)` — escala fontSize

### Bíblia: 100% offline (Ave Maria)
`src/services/bibleApi.js` — `getChapter(bookId, chapter)` síncrono.
`src/data/bibleAveMaria.js` — Bíblia Ave Maria completa (73 livros, ~4 MB bundled, fonte: github.com/fidalgobr/bibliaAveMariaJSON).

### Navegação entre telas
- `ArticlesScreen` → tap em referência → `navigate('Referências', { highlightId })`.
- `ReferencesScreen` → "Ler no app" (refs com `bibleNav`) → `navigate('Bíblia', { bookId, chapter, highlightVerse })`.
- `BibleScreen`: deep link via `route.params`, prev/next dentro da tela de versículos.

### Dados (estáticos em `src/data/`)
- `articles.js` — array de artigos (`references[]` aponta para IDs em references.js).
- `references.js` — versículos/Catecismo/documentos. Refs bíblicas têm `bibleNav: { bookId, chapter, verse }`.
- `bible.js` — metadados dos 73 livros (id, apiId, name, short, testament, group, totalChapters, deutero).
- `bibleAveMaria.js` — gerado por `scripts/convert-avemaria.mjs`. Formato: `{ bookId: [[v1,v2,...], ...] }`.

### Convenções de conteúdo
- **Sem travessões (—)**.
- **Linguagem natural** em português, não "AI-like".
- **Citações completas**: expandir siglas (Catecismo em vez de CIC) e incluir autor + ano.

### Paleta
- `primary: #1a3a5c` (azul marinho), `accent: #c9a84c` (dourado), `bg: #f5f0e8` (creme).
- Dark mode: `primaryText` vira dourado claro (`#e6c878`).

Icons via `@expo/vector-icons` (Ionicons).
