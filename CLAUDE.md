# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                    # instalar dependências
npx expo start --lan           # iniciar (celular no mesmo Wi-Fi)
npm run android                # abrir no emulador Android
npm run ios                    # abrir no simulador iOS
```

Scripts de conversão de dados:
```bash
node scripts/convert-avemaria.mjs        # regera bibleAveMaria.js (fonte _avemaria_raw.json é gitignored; obter antes de rodar)
node scripts/convert-douay-rheims.mjs    # regera bibleDouayRheims.js (EN, fonte em scripts/source/)
node scripts/sync-bible-refs.mjs         # sincroniza referências bíblicas
node scripts/generate-icons.mjs          # gera ícones do app
node scripts/merge-accounts.mjs          # admin: junta dados de duas contas (precisa .secrets/)
node scripts/generate-brain.mjs          # regera o grafo de conteúdo do vault (brain/4-Conteúdo)
```

## Architecture

**React Native + Expo SDK 54** com 5 tabs no bottom navigator. **Tudo funciona offline** — sem chamadas de rede em tempo de execução (exceto auth Firebase).

### Tabs
1. **Início** — `HomeScreen` (com HomeStack interno para telas secundárias)
2. **Artigos** — `ArticlesScreen` (com ArticlesStack: lista → detalhe)
3. **Bíblia** — `BibleScreen` — 73 livros Ave Maria (PT) + Douay-Rheims (EN), navegação prev/next entre capítulos
4. **Ferramentas** — `ToolsScreen` (com ToolsStack: menu de todas as ferramentas)
5. **Ajustes** — `SettingsScreen` (com SettingsStack)

### Navegação
O app usa quatro stacks internos dentro dos tabs (tab bar permanece visível):

- **HomeStack** (`HomeStackScreen`): HomeMain → References, Tools, Today, Notebook, NotebookPage, CategoryArticles, Favorites, Glossary, ReadingPlan, Rosary, ExamConscience, Highlights, Notes, Search, Liturgy, ArticleFromSearch, RefDetail, Quiz, Dialogue, DebateStrategies, BibleMap, Legal.
- **ToolsStack** (`ToolsStackScreen`): ToolsMain → mesmas telas secundárias (Today, Notebook, Quiz, Dialogue, DebateStrategies, BibleMap etc.).
- **SettingsStack** (`SettingsStackScreen`): SettingsMain → Legal, Glossary, ReadingPlan, Rosary, ExamConscience, Favorites, ArticleFromSearch, RefDetail.
- **ArticlesStack** (`ArticlesStackScreen`): ArticlesList → ArticleDetail → RefDetail.
- **MainStack** (raiz): MainTabs + NoteEditor (modal full-screen sem tab bar).
- **AuthStack**: Login, Signup, ForgotPassword.
- **OnboardingScreen**: exibido antes das tabs enquanto deslogado.
- Rotas `ArticleFromSearch`/`RefDetail` são duplicadas de propósito nos stacks para o tap resolver dentro da aba ativa.

### Estado global (Contexts)
- `ThemeContext` — `colors` (light/dark), `darkMode`, `fontSize`, `fs(n)` (escala). Persistido em AsyncStorage.
  - `primary` = cor de fundo principal, `primaryText` = texto enfatizado.
- `AuthContext` — estado de autenticação Firebase (`signedInOrGuest`, `loading`).
- `LanguageContext` — `t(key)` para internacionalização PT/EN.

### Bíblia: 100% offline (Ave Maria + Douay-Rheims)
`src/services/bibleApi.js` — `getChapter(bookId, chapter, language?)` síncrono.
- `language='pt'` → Ave Maria (`src/data/bibleAveMaria.js`, ~4 MB)
- `language='en'` → Douay-Rheims-Challoner (`src/data/bibleDouayRheims.js`, ~4.5 MB). Fallback automático para PT se EN indisponível.

### Navegação entre telas
- Artigo → tap em referência → `navigate('RefDetail', { highlightId })` (tela dedicada de uma referência).
- Referências/RefDetail → "Ler no app" (refs com `bibleNav`) → `navigate('Bíblia', { bookId, chapter, highlightVerse })`.
- `BibleScreen`: deep link via `route.params`, prev/next dentro da tela de versículos.

### Dados (estáticos em `src/data/`)
- `articles/` — artigos divididos por categoria (existencia-deus, igreja-catolica, sagrada-escritura, moral, outras-religioes, historia-igreja). `articles/index.js` mescla tudo e aplica traduções EN.
- `articles-en.js` — traduções em inglês dos artigos (`{ [id]: { titleEn, summaryEn, bodyEn } }`).
- `articleRelations.js` — relações entre artigos para "Artigos relacionados".
- `references.js` — versículos/Catecismo/documentos. Refs bíblicas têm `bibleNav: { bookId, chapter, verse }`.
- `references-en.js` — traduções EN das referências (`{ [id]: { textEn, topicEn, ... } }`).
- `referenceSources.js` — categorias de fonte das referências (Bíblia, Catecismo, ...).
- `articleCategories.js` — categorias, ranking e "mais buscados" dos artigos.
- `bible.js` — metadados dos 73 livros (id, apiId, name, short, testament, group, totalChapters, deutero).
- `bibleAveMaria.js` — Bíblia Ave Maria completa. Formato: `{ bookId: [[v1,v2,...], ...] }`.
- `bibleDouayRheims.js` — Douay-Rheims-Challoner (EN). Mesmo formato.
- `dailyVerses.js` — versículos do dia.
- `saints.js` — santos do dia.
- `glossary.js` — glossário apologético.
- `quiz.js` — questões para o quiz de fé.
- `dialogues.js` — diálogos apologéticos.
- `examConscience.js` — exame de consciência.
- `readingPlan.js` — plano de leitura em dois trilhos (Fundamentos + Aprofundamento).
- `jesusJourney.js` — mapa da jornada de Jesus (21 paradas, usado pelo BibleMapScreen).
- `debateStrategies.js` — táticas de debate e falácias.

### Serviços (`src/services/`)
- `bibleApi.js` — acesso síncrono à Bíblia (PT e EN).
- `firebase.js` — configuração do Firebase (auth, Firestore).
- `userData.js` — CRUD de dados do usuário no Firestore (notas, destaques, favoritos).
- `liturgyApi.js` — liturgia do dia (rede, com cache e fallback offline).
- `newsApi.js` — notícias católicas via RSS (rede, cache de 3h por idioma).
- `notifications.js` — notificações push locais (`.web.js` é no-op).

### Convenções de conteúdo
- **Sem travessões (—)**.
- **Evitar ponto e vírgula (;)** no corpo dos artigos: usar vírgula ou ponto final, que soa mais natural e menos "AI-like".
- **Linguagem natural** em português, não "AI-like".
- **Citações completas**: expandir siglas (Catecismo em vez de CIC) e incluir autor + ano.
- **Referências batem com o texto**: todo versículo citado de forma central no corpo deve ter uma entrada correspondente em `references`; não deixar refs que não são citadas.

### Pastas do usuário (não código)
- `documentos/` — pesquisas e anotações do usuário (mercado, público, top100, créditos de imagens, previews antigos). Nada referencia no código.
- `fotos/` — imagens do site adicionadas pelo usuário. `fotos/sao-miguel.jpg` é o fundo do hero da landing (`docs/index.html`); o deploy copia a pasta inteira pro site. Fallback remoto se o arquivo faltar.
- `brain/` — second brain do projeto (vault do Obsidian, versionado), em 4 áreas: `1-Memória` (diário de sessões, aprendizados, backlog vivo), `2-Projeto` (decisões, convenções, pesquisas, site), `3-App` (arquitetura e funcionalidades), `4-Conteúdo` (catálogo + grafo gerado por `scripts/generate-brain.mjs`; as subpastas "... do App" e "Termos do Glossário" não se editam à mão). `brain/.obsidian/` fica fora do git.
  - **Ritual de memória**: ao concluir uma sessão de trabalho significativa, criar `brain/1-Memória/Diário/AAAA-MM-DD - resumo.md` (o que foi feito, decisões, pendências) e acrescentar lições permanentes em `brain/1-Memória/Aprendizados.md`. Ao retomar trabalho, ler a entrada mais recente do Diário.
- `GUIA-DO-PROJETO.md` — mapa da raiz em linguagem leiga; manter atualizado ao criar/mover pastas.

### Paleta
- `primary: #1a3a5c` (azul marinho), `accent: #c9a84c` (dourado), `bg: #f5f0e8` (creme).
- Dark mode: `primaryText` vira dourado claro (`#e6c878`).

Icons via `@expo/vector-icons` (Ionicons).

## Fluxo de revisão e verificação

Antes de dar uma mudança como concluída, siga este fluxo leve. Ele substitui, de
forma adaptada ao app (JS/RN), a ideia de "agentes para verificar e aperfeiçoar o
código": a verificação determinística aqui é o lint e o build, não scripts Python.

**1. Lint (verificação determinística):**
```bash
npm run lint    # ESLint em src/ — precisa passar antes de commitar
```

**2. Revisão por agente — para mudanças não triviais (lógica, navegação, telas):**
- `/code-review` — revisa o diff atual em busca de bugs de correção.
- `/simplify` — limpa duplicação e simplifica o que foi alterado (só qualidade, não bugs).
- `/security-review` — quando a mudança toca auth, Firebase ou dados do usuário.

**3. Verificação de comportamento — quando a mudança é visível ao usuário:**
- `/verify` ou `/run` — sobe o app e confirma que a alteração funciona de verdade,
  não só que compila.

**Regras práticas:**
- Mudança só de conteúdo (texto de artigo, referência, tradução em `strings.js`):
  basta o lint. Não precisa de review nem build.
- Mudança em tela, navegação, contexto ou serviço: lint + `/code-review`, e `/verify`
  se houver impacto visual.
- Nunca dar como "pronto e testado" o que só compilou — diga o que foi de fato
  verificado e o que ficou de fora.
