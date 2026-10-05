# 04. Prompts de handoff para `/make-plan` (um por sistema)

Cada bloco é autocontido e cita os call sites do relatório de duplicação (`02b-duplicacao-entre-features.md`) e o fluxograma da feature (`01-flowcharts/`). Executar na ordem S1 → S2 e S3 → telas → S4 a S6, ou juntar S1+S2+S3 num plano só se a Fase 5 for em ondas grandes. Todos herdam as restrições da Fase 0 (sem renomear rotas, sem dependência além de expo-blur, expo-linear-gradient e expo-font, Expo Go, lint 0 erros, check:refs 0 erros, sem travessões).

## S1. Tokens e tema

````
/make-plan Criar o sistema de tokens do APPologética e ligá-lo ao tema.

Alvo: src/theme/tokens.js (novo, constantes puras) exportando space (4, 8, 12, 16, 20, 24, 32, 40), radius (sm 8, md 12, lg 20), type (largeTitle, title, section, headline, body, callout, subhead, footnote, caption, reading, readingBible, tabLabel, cada um com size, lineHeight, weight e family: Cormorant Garamond SemiBold em largeTitle/title/section via expo-font, sans do sistema no resto, Georgia/New York em reading), icon (sm 18, md 22, lg 26), motion (touch 120, layout 250, screen 350, ease-out cubic-bezier(.2,.8,.2,1), spring damping 0.8), shadow (sheet, floating). Ponto de entrada único: useTheme() em src/context/ThemeContext.jsx:139-160 passa a devolver { colors, tokens, fs, darkMode, ... } e as paletas LIGHT/DARK (ThemeContext.jsx:6-47) ganham onPrimary, danger, success e overlay. Os valores estão na tabela "Tokens" de design/preview/index.html e em docs/design/pesquisa-apple.md §12.

Call sites a reescrever (evidência em docs/design/PATHFINDER-2026-09-23/02b, C5, C15, C10, C16, C8, C13, C20): os 48 makeStyles(c, fs) de src/screens e src/components trocam todo número solto por tokens; os 44 hex literais fora da paleta (#fff em 93 pontos, #c0392b em 13, App.js:101/145/181/214/313/356/396, HomeScreen.jsx:173-174, BibleScreen.jsx:873/952/1072, LoginScreen.jsx:147/197, liturgicalSeason.js:31-35, ErrorBoundary.jsx:46-51) viram colors.*; os 43 textTransform: 'uppercase' com letterSpacing (HomeScreen.jsx:210/228, ContinueReadingCard.jsx:56, ContinueBibleCard.jsx:58, ArticleDetailScreen.jsx:385, RelatedArticles.jsx:46/72, RelatedDialogues.jsx:46, BibleScreen.jsx:1010/1079, LoginScreen.jsx:226, WebDownloadBanner.jsx:65 e os demais listados em C10) viram type.footnote com colors.text2 em caixa normal; os 23 borderLeftWidth de destaque (C8) são removidos; os 18 tamanhos de ícone (C16) viram icon.sm/md/lg; o bloco de marca em App.js:250-259, HomeScreen.jsx:80-86, LoginScreen.jsx:65-68 e OnboardingScreen.jsx:77-91 vira um componente BrandMark.

Fluxogramas: 01-flowcharts/01-shell-tema-i18n.md (tema, hidratação, fs).

Verificação: lint 0 erros; grep de "#[0-9a-fA-F]{3,6}" em src/ retorna só ThemeContext.jsx, tokens.js e as 5 cores de marcação de versículo; grep de "textTransform: 'uppercase'" retorna 0; grep de borderLeftWidth retorna 0; npx expo export -p web verde; capturas das 5 telas em claro e escuro comparadas com design/preview/index.html.

Antipadrões: não criar um "StyleProvider" ou HOC de estilo (useTheme já é o ponto de entrada); não criar tokens que ninguém usa; não manter o valor antigo comentado "por via das dúvidas"; não trocar a escala fs() por outra.
````

## S2. Componentes base

````
/make-plan Criar os componentes base do APPologética em src/components/ui/ e migrar os call sites duplicados.

Alvo: src/components/ui/index.js exportando Group e Row (lista agrupada iOS com separadores, Row com icon, title, subtitle, trailing, onPress, accessibilityRole="button", alvo 44), SectionTitle (Cormorant, tokens.type.section), Button (variant primary | secondary | plain, uma cor de fundo: colors.tint), SearchField (foco visível de 2 px em tint, sem outlineStyle: 'none', modo asButton para a barra falsa da Início), Chip, ProgressBar (3 px, colors.gold), EmptyState e GateNotice (mensagens em src/i18n/strings.js). Depende de S1 (tokens).

Call sites a reescrever (02b, C6, C7, C9, C11, C12, C17, C18, C19, C20): HomeScreen.jsx:128-142 (6 tiles → Group + 6 Row), HomeScreen.jsx:97-100 (busca falsa → SearchField asButton), HomeScreen.jsx:148 (card Referências → Row), ToolsScreen.jsx:130-139 (Row), TodayScreen e os 4 cards de src/components (NewsCard, LiturgyCard, SaintTodayCard, VerseOfDayCard → Group/Row com o conteúdo dentro), RelatedArticles.jsx:23 e RelatedDialogues.jsx:23 (Row), ArticlesScreen.jsx:91, CategoryArticlesScreen, FavoritesScreen, ReadingPlanScreen (cards de artigo → Row), ContinueReadingCard.jsx:33-58 + ContinueBibleCard.jsx:15-67 (→ um ContinueRow que só recebe props; getLastRead sobe para HomeScreen), os 8 cabeçalhos de seção de C9 (→ SectionTitle), os 7 TextInput de busca de C11 (→ SearchField; apagar as 11 ocorrências de outlineStyle: 'none'), os 15 estilos de botão de C12 (→ Button), LoginScreen.jsx:131-135 e :158-162 (um divisor só), os estados de gate/vazio de C17 (→ EmptyState/GateNotice), chips de C18, barras de C19, badges de C20 (→ texto footnote, sem caixa).

Fluxogramas: 01-flowcharts/03-inicio.md, 04-artigos.md, 08-conteudo-do-dia.md, 10-dados-do-usuario.md.

Verificação: lint 0 erros; grep de outlineStyle retorna 0 em src/; cada componente com os seis estados (vazio, carregando, erro, sucesso, foco, desabilitado) definidos; export web verde; capturas comparadas com o protótipo.

Antipadrões: não criar um "Card" genérico com 12 props para cobrir os 18 casos (Group + Row cobrem); não manter os componentes antigos exportados "para compatibilidade"; não adicionar sombra em card comum (só sheets e pílulas flutuantes).
````

## S3. Chrome e navegação

````
/make-plan Refazer o chrome global do APPologética (header com large title próprio, tab bar translúcida) e unificar o registro de rotas e os links internos.

Alvo: src/navigation/chrome.js (novo) com stackScreenOptions(colors) e o TabBar customizado (expo-blur no iOS e na web, fundo colors.material no Android, ícones tokens.icon.lg, rótulo type.tabLabel, tabBarActiveTintColor colors.tint) passado em tabBar do Tab.Navigator (App.js:294-348); src/components/ui/LargeTitleScreen.jsx (novo) com título Cormorant que encolhe no scroll via react-native-reanimated e revela o título inline, usado por Início, Bíblia (capítulo), Artigos e Ferramentas; src/navigation/sharedScreens.js (novo) com registerSharedScreens(Nav, { t, isEn }) devolvendo o conjunto de telas secundárias que os 4 stacks (App.js:94-134, 138-170, 174-203, 207-246) registram hoje um a um, sem mudar nenhum nome de rota; src/navigation/links.js (novo) com openBible(navigation, { bookId, chapter, verse, verseEnd }) e openArticle(navigation, articleId). Depende de S1.

Call sites a reescrever (02b, C1, C2, C3, C4, C14): apagar as 6 cópias de screenOptions (App.js:100-102, 144-146, 180-182, 213-215, 312-314, 355-357); apagar src/hooks/useScrollHints.js e src/components/ScrollHint.jsx e as 24 montagens (HomeScreen.jsx:157-160, ArticleDetailScreen.jsx:357-359, BibleScreen.jsx:737-738 e 893-894, ToolsScreen.jsx:119-120, SettingsScreen.jsx:635-636, TodayScreen.jsx:74-75 e as demais listadas em C14) junto com o bloco onScroll/onContentSizeChange/onLayout/scrollEventThrottle; trocar as 10 chamadas navigate('Bíblia', {...}) (BibleMapScreen.jsx:32, RosaryScreen.jsx:157, NotebookPageScreen.jsx:116, RefDetailScreen.jsx:43, TodayScreen.jsx:45, HighlightsScreen.jsx:40, SearchScreen.jsx:149 e 171, LiturgyScreen.jsx:260, ReferencesScreen.jsx:242) por openBible; trocar as 10 navigate('ArticleFromSearch'/'ArticleDetail') por openArticle; apagar os 5 registros sem chamador listados em C2; remover o prefixo "Artigo - " do título (ArticleDetailScreen.jsx:171) e o título duplicado no conteúdo da Bíblia (BibleScreen.jsx:805) e do Artigo.

Fluxogramas: 01-flowcharts/01-shell-tema-i18n.md (MainTabs e stacks), 06-biblia.md (header e tabPress), 04-artigos.md.

Verificação: lint 0 erros; grep de ScrollHint e useScrollHints retorna 0; grep de "navigate('Bíblia'" retorna só links.js; deep links nativos (App.js:71-89) continuam resolvendo; gesto de voltar do Android testado; export web verde; captura do large title encolhendo em web.

Antipadrões: não usar headerLargeTitle nativo (só iOS); não manter ScrollHint atrás de flag; não renomear rota nem reduzir o número de stacks em que as telas secundárias aparecem (o toque precisa resolver na aba ativa, CLAUDE.md); não criar um "NavigationService" global.
````

## S4. Helpers de dados bilíngues e formatação

````
/make-plan Unificar os helpers de dados bilíngues, formatação de referência bíblica e gate de conta do APPologética.

Alvo: src/utils/i18nData.js (novo) com pick(item, field, lang) e categoryLabel(id, t); src/utils/verseRef.js (novo) com formatVerseRef({ bookId, chapter, verse, verseEnd }, lang) usando um separador por idioma; useRequireAccount(reasonKey) em src/components/GuestGate.jsx lendo título e mensagem de strings.js (gate.favorites, gate.highlights, gate.tools, PT e EN); mover translateFullSource de src/screens/ReferencesScreen.jsx:17-70 para src/data/references.js ao lado de translateRef (2394); derivar EN_BOOK_ID (src/screens/LiturgyScreen.jsx:14-41) e BOOK_PT_TO_EN (references.js:2367-2392) de src/data/bible.js.

Call sites a reescrever (02b, C32, C25, C27, C24, C23): os 13 pontos de isEn ? (a.titleEn || a.title) : a.title e os 11 de rótulo de categoria (lista em C32); os 7 lugares de "Livro cap,verso" com isEn ? ':' : ',' e os 2 que ignoram o idioma (share.js:36 e VerseOfDayCard.jsx:23-24, que hoje gera "Salmo 23 1,1"); os 3 requireAccount com mensagem inline (BibleScreen.jsx:512-518, ArticleDetailScreen.jsx:199-214, ToolsScreen.jsx:78-87). Regra de produto que entra junto: favoritar artigo deixa de exigir conta (favorites.js é local), então o gate some de ArticleDetailScreen e a copy de AccountPrompt.jsx:19-20, :104-106 deixa de falar em favoritos.

Fluxogramas: 01-flowcharts/05-referencias.md, 04-artigos.md, 02-auth-visitante-onboarding.md, 12-transversal-share-notificacoes-infra.md.

Verificação: lint 0 erros; npm run check:refs 0 erros; share de versículo em EN sai com ":"; grep de "titleEn ||" retorna 0 fora de i18nData.js.

Antipadrões: não criar uma camada de "modelo" com classes; não traduzir conteúdo via strings.js (conteúdo continua em articles-en.js e references-en.js).
````

## S5 e S6. Datas do dia, TTS, Firestore direto, compartilhamento

````
/make-plan Corrigir as duplicações de lógica do APPologética que valem sozinhas: datas do dia, narração longa, acesso ao Firestore fora do serviço e compartilhamento.

Alvo: src/utils/daily.js (novo) com dailyIndex(len, date), todayKey(date) em hora local e easterDate(year), consumido por HomeScreen.jsx:65-67, src/services/notifications.js:8-12, src/data/dailyVerses.js:98-104, src/data/quiz.js:1966-1967, src/data/saints.js e src/utils/liturgicalSeason.js (Páscoa), e pelos streaks de QuizScreen.jsx:100-112 (hoje em UTC) e src/utils/readingProgress.js; src/utils/tts.js (novo) com speakLong(text, { voice, rate }) fatiando em 4000 caracteres com fila e stop, usado por BibleScreen.jsx:570-627, ArticleDetailScreen.jsx:96-125 e o preview de SettingsScreen.jsx:96-115; NoteEditorScreen.jsx:5-6 e 33-47 passando a usar getNotebookPage/getNote de src/services/userData.js:163-168 (apagar o import direto de doc/getDoc); APP_PROMO só em src/utils/share.js:8-10 e LiturgyScreen.jsx:57-58, :115 usando doShare; ShareVerseCard.jsx e DialogueAnswerCard.jsx viram um ShareCard com variant.

Fluxogramas: 01-flowcharts/03-inicio.md, 07-ferramentas.md (quiz), 08-conteudo-do-dia.md, 10-dados-do-usuario.md, 12-transversal-share-notificacoes-infra.md.

Verificação: lint 0 erros; teste mínimo (a primeira suíte do repo, ver plano da Fase 5) para dailyIndex, todayKey, easterDate e speakLong (fatiamento); grep de "getDoc(" retorna só userData.js; export web verde.

Antipadrões: não abstrair o streak em um "StreakService" (são duas regras diferentes, só a data é comum); não mexer no formato das chaves de AsyncStorage já gravadas sem migração.
````
