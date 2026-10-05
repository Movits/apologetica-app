# 00. Inventário de features (Pathfinder)

Data: 2026-09-23. Base: commit `f00ef6d` (branch `claude/funny-cray-ret9a0`, `src/` intocado). Descoberta feita por um subagente somente leitura e revisada pelo orquestrador. Ajuste feito na revisão: Compartilhamento, Notificações e Infra são pequenas e transversais, então recebem um único fluxograma (`transversal.md`).

## Rotas registradas em `App.js`

- Gate raiz `RootNavigation` (`App.js:381-428`): `loading` → `BrandedSplash` (`:402-404`); `!user && !onboardingPassed` → `OnboardingScreen` (`:406-408`, estado de sessão, "TEMPORÁRIO" `:384-387`); `signedInOrGuest ? MainStack : AuthStack` (`:425`). Deep links só nativo (`LINKING`, `:71-89`).
- `MainTabs` (`:294-348`, `backBehavior="history"` `:310`): `Início` → HomeStack (`:333-337`), `Artigos` → ArticlesStack (`:338-342`), `Bíblia` → `BibleScreen` direto, sem stack (`:343`), `Ferramentas` → ToolsStack (`:344`), `Ajustes` → SettingsStack (`:345`).
- `MainStack` (`:350-369`): `MainTabs` (`:360`), `NoteEditor` modal (`:362-366`). `AuthStack` (`:371-379`): Login, Signup, ForgotPassword.
- HomeStack 23 rotas (`:94-134`), ToolsStack 19 (`:138-170`), SettingsStack 10 (`:174-203`), ArticlesStack 5 (`:207-246`). **57 registros para 27 rotas distintas.** Em 4 stacks: `Glossary`, `RefDetail`, `Dialogue`. Em 3: `Favorites`, `ReadingPlan`, `Rosary`, `ExamConscience`, `ArticleFromSearch`. Em 2: `Today`, `Notebook`, `NotebookPage`, `CategoryArticles`, `Highlights`, `Notes`, `Liturgy`, `Quiz`, `DebateStrategies`, `BibleMap`, `Legal`, e `Tools`/`ToolsMain` (mesmo componente). `ArticleDetailScreen` sob dois nomes (`ArticleDetail` `:223-227`, `ArticleFromSearch`). `Search` (`:123`) e `References` (`:106`) só no HomeStack.
- `screenOptions` de header repetido literalmente 5x: `App.js:99-103`, `143-147`, `179-183`, `212-216`, `354-358`.

## Features

| # | Feature | Propósito | Entradas (file:line) | Arquivos centrais |
|---|---|---|---|---|
| F1 | Shell, tema e idioma | Árvore de navegação, tema claro/escuro + escala de fonte, i18n de UI, primitivas visuais | `App.js:430-451`, `:381`, `:294` | `App.js`, `src/context/ThemeContext.jsx` (paletas `6-47`, `fs()` `149`), `LanguageContext.jsx`, `src/i18n/strings.js` (`translate` `489-491`), `ScrollHint.jsx` + `useScrollHints.js`, `SectionBanner.jsx`, `StickySectionList(.web).jsx`, `AppIcon.jsx`, `CrossMark.jsx`, `useModalNavBar.js`, `utils/dialog.js` |
| F2 | Auth, visitante e onboarding | Login Firebase (email + Google), visitante persistido, exclusão de conta, gate "criar conta?", onboarding de ativação | `App.js:371-379`, `:407`, `:438` | `AuthContext.jsx`, `auth/LoginScreen.jsx`, `SignupScreen.jsx`, `ForgotPasswordScreen.jsx`, `useGoogleSignIn(.web).js`, `OnboardingScreen.jsx`, `utils/onboarding.js`, `GuestGate.jsx`, `AccountPrompt.jsx`, `AuthTopToggles.jsx` |
| F3 | Início | Hero, banner litúrgico, busca, "continue lendo", objeção do dia, grid de categorias | `App.js:105` → `HomeScreen.jsx` | `HomeScreen.jsx`, `ContinueReadingCard.jsx`, `utils/liturgicalSeason.js` |
| F4 | Artigos (lista, categorias, detalhe, favoritos, plano) | 83 artigos em 6 categorias, Markdown + glossário, TTS, favoritos locais, plano em 2 trilhos com streak | `App.js:218-222`, `:223-227`/`:125`, `:111-115`, `:116`, `:118` | `ArticlesScreen.jsx`, `ArticleDetailScreen.jsx`, `CategoryArticlesScreen.jsx`, `FavoritesScreen.jsx`, `ReadingPlanScreen.jsx`, `MarkdownText.jsx`, `RelatedArticles.jsx`, `RelatedDialogues.jsx`, `ImageZoomModal.jsx`, `ReadingProgressBar.jsx`, `utils/favorites.js`, `lastRead.js`, `readingProgress.js`, `data/articles/*`, `articleCategories.js`, `articleRelations.js`, `readingPlan.js` |
| F5 | Referências | 205 referências com tradução EN, link oficial e "Ler no app" | `App.js:106`, `:126` | `ReferencesScreen.jsx`, `RefDetailScreen.jsx`, `RefSourceBlock.jsx`, `data/references.js` (helpers `2365-2535`), `references-en.js`, `referenceSources.js` |
| F6 | Bíblia | 73 livros PT/EN offline sob demanda, destaque por deep link, marcar/anotar/copiar/compartilhar, TTS, progresso local | `App.js:343` → `BibleScreen.jsx` | `BibleScreen.jsx` (1093 linhas), `services/bibleApi.js`, `hooks/useBibleReady.js`, `BibleLoadingState.jsx`, `ContinueBibleCard.jsx`, `utils/bibleProgress.js`, `ttsVoice.js`, `verseRange.js`, `data/bible.js` |
| F7 | Ferramentas (hub + treino + espiritualidade) | Hub em 3 seções; Quiz, Diálogo, Debate, Glossário, Rosário, Exame, Mapa | `App.js:149`/`:107`, e `:127`, `:128`, `:129`, `:117`, `:119`, `:120`, `:130` | `ToolsScreen.jsx`, `QuizScreen.jsx`, `DialogueScreen.jsx`, `DebateStrategiesScreen.jsx`, `GlossaryScreen.jsx`, `RosaryScreen.jsx`, `ExamConscienceScreen.jsx`, `BibleMapScreen.jsx` + `bibleMap/*`, `DialogueAnswerCard.jsx`, dados `quiz.js`, `dialogues.js`, `debateStrategies.js`, `glossary.js`, `examConscience.js`, `jesusJourney.js` |
| F8 | Conteúdo do dia | Notícias, liturgia, santo e versículo do dia; tela de liturgia | `App.js:108`, `:124` | `TodayScreen.jsx`, `LiturgyScreen.jsx`, `NewsCard.jsx`, `LiturgyCard.jsx`, `SaintTodayCard.jsx`, `VerseOfDayCard.jsx`, `ReadingText.jsx`, `services/liturgyApi.js`, `newsApi.js`, `data/dailyVerses.js`, `saints.js` |
| F9 | Busca global | Fuse.js em artigos, referências e versículos + substring na Bíblia, histórico | `App.js:123` | `SearchScreen.jsx`, `utils/searchHistory.js` |
| F10 | Dados do usuário (Firestore) | Marcações, notas e caderno em `users/{uid}/…` com `onSnapshot` | `App.js:121`, `:122`, `:362-366`, `:109`, `:110` | `services/userData.js`, `HighlightsScreen.jsx`, `NotesScreen.jsx`, `NoteEditorScreen.jsx`, `NotebookScreen.jsx`, `NotebookPageScreen.jsx`, `NotebookText.jsx`, `ReferencePickerModal.jsx`, `firestore.rules` |
| F11 | Ajustes e Legal | Perfil, aparência, idioma, voz TTS, notificações, conta, diagnóstico, doação, políticas | `App.js:185`, `:131` | `SettingsScreen.jsx` (846 linhas), `LegalScreen.jsx`, `WebDownloadBanner.jsx` |
| F12 | Compartilhamento | Texto via share sheet (web: Web Share → clipboard) e imagem via view-shot | usado por 6 telas | `utils/share.js`, `shareAsImage(.web).js`, `ShareVerseCard.jsx`, `DialogueAnswerCard.jsx` |
| F13 | Notificações locais | Versículo diário, liturgia de domingo, quiz, objeção do dia | só via `SettingsScreen.jsx:123-159` | `services/notifications(.web).js` |
| F14 | Infra | Firebase, Sentry, ErrorBoundary, atualização web | `App.js:51-59` | `services/firebase.js`, `sentry(.web).js`, `ErrorBoundary.jsx`, `utils/webUpdate(.web).js`, `app.config.js` |

## Grafo de dependências (resumo)

- F1 → F2 (`LanguageContext.jsx:5` chama `setAuthLanguage`); F1 → todas as telas (`App.js:11-43`).
- F2 → F14 (`AuthContext.jsx:15`), F2 → F10 (`:16`, `deleteAllUserData`), F2 → F7 dados (`OnboardingScreen.jsx:7`).
- F3 → F4 (`HomeScreen.jsx:8`, `ContinueReadingCard.jsx:6-7`), F3 → F7 dados (`:9`), F3 → F2 (`:10`); navega Search e References só daqui.
- F4 → F5 (`ArticleDetailScreen.jsx:8-9`), F4 → F7 dados (`MarkdownText.jsx:4`, `RelatedDialogues.jsx:5`), F4 → F2 gate (`:22`), F4 → F12 (`:11`), F4 → F6 TTS util (`:23`).
- F5 → F6 por navegação (`ReferencesScreen.jsx:242`, `RefDetailScreen.jsx:43`).
- F6 → F10 (`BibleScreen.jsx:14-17`), F6 → F2 (`:11, :13`), F6 → F12 (`:7`). Fan-in de `navigate('Bíblia')`: 9 arquivos.
- F7 → F4 (`DialogueScreen.jsx:8`, `ReadingPlanScreen.jsx:9-10`), F7 → F6 (`RosaryScreen.jsx:157`, `BibleMapScreen.jsx:32`), F7 → F12, F7 → F2.
- F8 → F12 (`VerseOfDayCard.jsx:5-7`), F8 → F6 por navegação. F9 → F4, F5, F8, F6 (`SearchScreen.jsx:5-10`).
- F10 → F14 (`userData.js:5`; `NoteEditorScreen.jsx:5-6` direto), F10 → F6, F4, F5, F2, F12.
- F11 → F2, F13 (único consumidor), F6 (TTS), F14, F1. F13 → F8, F7 dados. F12 → F1 (`share.js:2`).

## Utilitários transversais (3+ features)

`useTheme()` em 54 arquivos; `useLanguage()` em 48; `makeStyles(c, fs)` por arquivo em 48 (assinaturas variantes em `BibleLoadingState.jsx:47`, `AccountPrompt.jsx:132`, `HomeScreen.jsx:165`); ternário bilíngue inline `isEn ? : ` em 47 arquivos convivendo com `t()` em 38; `useScrollHints` + `<ScrollHint>` em 25/24 com o mesmo bloco `onScroll/onContentSizeChange/onLayout/scrollEventThrottle={32}`; `AsyncStorage` em 14 arquivos com 23 chaves; `Platform.OS === 'web'` em 21; `navigate('Bíblia', {...})` com contrato repetido à mão em 9; `navigate('ArticleFromSearch', {articleId})` em 9; `useRequireAccount()` em 3 com mensagens inline duplicadas; TTS (`expo-speech` + `ttsVoice`) em Bible, ArticleDetail, Settings.

## Fatos relevantes para as próximas fases (sem opinião)

1. `Search` e `References` só existem no HomeStack (`App.js:106, :123`).
2. Tab `Bíblia` sem stack interno (`:343`); por isso `NoteEditor` vive no `MainStack` como modal.
3. `ArticleDetailScreen` registrado sob dois nomes; `ArticleDetailScreen.jsx:230` usa `navigation.push(route.name, …)`.
4. `NoteEditorScreen.jsx:5-6, 33-47` acessa Firestore direto, fora de `userData.js`.
5. Rede fora do que o CLAUDE.md lista: `LiturgyScreen.jsx:88` (leituras EN), `bibleMap/mapHtml.js:23, 38-39, 62` (Leaflet de unpkg + tiles do CartoDB: o mapa não funciona offline), `newsApi.js:68-80` (4 proxies), `webUpdate.web.js` (`version.json`).
6. `notifications.ensureScheduled/rescheduleAll` sem chamador no boot; `hasSeenOnboarding` sem chamador; onboarding forçado por sessão (`App.js:384-388`).
7. Duplicações literais: header options (5x em `App.js`), fórmula da objeção do dia (`HomeScreen.jsx:65-67` / `notifications.js:8-12`), `APP_PROMO` (`share.js:8-10` / `LiturgyScreen.jsx:57-58`), tradução de fonte (`ReferencesScreen.jsx:17-70` vs `references.js:2394`), mensagens do gate de conta inline em 3 telas, `EN_BOOK_ID` local em `LiturgyScreen.jsx:14-41` paralelo a `bible.js`.
8. `deleteAccount` limpa 10 chaves (`AuthContext.jsx:164-172`) e deixa `lastRead:article`, `quiz:*`, `onboarding:*`, `settings:tts*`, `liturgy:cache`, cache de news.
9. `ErrorBoundary.jsx:16-18` usa `global.Sentry?.Native` em vez de `src/sentry.captureException`.
10. `citation:` e `media:` = 0 ocorrências nos dados de referências (esquema existe em `references.js:6-14` e `RefSourceBlock`, nenhuma entrada usa).

## Confiança e lacunas

Alta para `App.js`, contextos, services, hooks, utils, componentes pequenos. Média para as telas grandes (`BibleScreen`, `SettingsScreen`, `ArticleDetailScreen`, `SearchScreen`, `LiturgyScreen`, `DialogueScreen`, `QuizScreen`, `RosaryScreen`, `ReferencesScreen`, `RefDetailScreen`, `NoteEditorScreen`, `NotebookPageScreen`): lidas por cabeçalho, grep e trechos-chave. Bíblias (4 MB cada) e corpos dos dados grandes não abertos; contagens (83 artigos, 205 refs, 53 diálogos, 100 questões, 26 termos, 89 versículos, 131 santos, 76 dias de plano, 21 paradas, 20 estratégias) com margem de 1 a 2.
