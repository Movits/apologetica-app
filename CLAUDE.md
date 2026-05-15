# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # instalar dependências
npm start            # iniciar Expo DevTools
npm run android      # abrir no emulador Android
npm run ios          # abrir no simulador iOS
npm run lint         # ESLint em src/
```

## Architecture

**React Native + Expo** app with bottom tab navigation (3 tabs).

### Navigation
`App.js` → `NavigationContainer` → `createBottomTabNavigator` com 3 tabs:
- `HomeScreen` — hero + atalhos de navegação
- `ArticlesScreen` — lista filtrável + modal de detalhe
- `ReferencesScreen` — lista filtrável com accordion

### Data layer
All content is static data in `src/data/`:
- `articles.js` — array de objetos `{ id, title, category, summary, body, references[] }`
- `references.js` — array de objetos `{ ref, source, topic, text }` — sources: `'Bíblia' | 'CIC' | 'Documentos'`

To add new content, append to these arrays — no backend required.

### Styling
No external UI library. All styles via `StyleSheet.create`. Color palette:
- `primary: '#1a3a5c'` (azul marinho)
- `accent: '#c9a84c'` (dourado)
- `bg: '#f5f0e8'` (creme)

Icons via `@expo/vector-icons` (Ionicons).
