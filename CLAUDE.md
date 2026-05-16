# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                    # instalar dependências
npx expo start --lan           # iniciar (celular no mesmo Wi-Fi)
npm run android                # abrir no emulador Android
npm run ios                    # abrir no simulador iOS
```

Para regerar a Bíblia Almeida a partir do JSON original:
```bash
node scripts/convert-almeida.mjs
```

## Architecture

**React Native + Expo SDK 54** com 5 tabs no bottom navigator. **Tudo funciona offline** — sem chamadas de rede em tempo de execução.

### Tabs
1. **Início** — `HomeScreen`
2. **Artigos** — `ArticlesScreen`
3. **Referências** — `ReferencesScreen`
4. **Bíblia** — `BibleScreen` — 73 livros, navegação prev/next entre capítulos
5. **Ajustes** — `SettingsScreen`

### Estado global
`src/context/ThemeContext.jsx` provê:
- `colors` (light/dark — `primary` = bg, `primaryText` = texto enfatizado)
- `darkMode`, `fontSize` (persistidos em AsyncStorage)
- `fs(n)` — escala fontSize

### Bíblia: 100% offline
`src/services/bibleApi.js` — função síncrona `getChapter(bookId, chapter)`. Resolve em 2 camadas:
1. **`src/data/bibleContent.js`** — conteúdo curado e deuterocanônicos (Tb, Jt, Sb, Eclo, Br, 1Mc, 2Mc).
2. **`src/data/bibleAlmeida.js`** — Almeida Atualizada completa (66 livros canônicos, 3.7 MB).

Sem rede, sem cache de runtime — tudo bundled. Capítulos deuterocanônicos sem conteúdo mostram "em preparação" mas dá pra navegar prev/next normalmente.

### Navegação entre telas
- `ArticlesScreen` → tap em referência → `navigate('Referências', { highlightId })`.
- `ReferencesScreen` → "Ler no app" (refs com `bibleNav`) → `navigate('Bíblia', { bookId, chapter, highlightVerse })`.
- `BibleScreen`: deep link via `route.params`, e prev/next chapter dentro da própria tela.

### Dados (estáticos em `src/data/`)
- `articles.js` — array de artigos (`references[]` aponta para IDs em references.js).
- `references.js` — versículos/CIC/documentos. Refs bíblicas têm `bibleNav: { bookId, chapter, verse }` e opcionalmente `urlStrongs` (Bible Hub).
- `bible.js` — metadados dos 73 livros (id, apiId legado, name, short, testament, group, totalChapters, deutero).
- `bibleContent.js` — texto local: curado + deuterocanônicos.
- `bibleAlmeida.js` — gerado por `scripts/convert-almeida.mjs` a partir de thiagobodruk/bible. Formato compacto: `{ bookId: [[v1,v2,...], ...] }`.

### Convenções de conteúdo
- **Sem travessões (—)**.
- **Linguagem natural** em português, não "AI-like".
- **Citações completas**: expandir siglas (Catecismo em vez de CIC) e incluir autor + ano.

### Paleta
- `primary: #1a3a5c` (azul marinho), `accent: #c9a84c` (dourado), `bg: #f5f0e8` (creme).
- Dark mode: `primaryText` vira dourado claro para legibilidade.

Icons via `@expo/vector-icons` (Ionicons).
