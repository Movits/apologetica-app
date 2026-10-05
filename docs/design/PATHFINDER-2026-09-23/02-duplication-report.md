# 02. Relatório de duplicações (síntese do orquestrador)

Dois subagentes independentes levantaram a repetição no código, cada um com locais `arquivo:linha` reconferidos por grep no commit `114a08b`:

- **Dentro de cada feature**: `02a-duplicacao-dentro-de-features.md`, 137 duplicações internas (F1 12, F2 16, F3 5, F4 11, F5 11, F6 8, F7 18, F8 11, F9 5, F10 12, F11 11, F12 8, F13 5, F14 4), com divergências de valores, custo e tipo (acidental ou legítima).
- **Entre features**: `02b-duplicacao-entre-features.md`, 37 concerns transversais (C1 a C37) com histórico plausível por commit, veredito e o que se perde ao unificar, mais um ranking por locais x impacto / custo.

Este arquivo cruza os dois e fica com o que importa para o redesign. Regra do pathfinder: toda alegação abaixo cita pelo menos dois locais; os demais estão nos apêndices.

## 1. As duplicações que sustentam a proposta unificada

| # | Concern (02b) e casos internos (02a) | Locais (amostra, o total está nos apêndices) | Acidental ou legítima | Vai para |
|---|---|---|---|---|
| 1 | **Sem escala de tokens** (C5) com 48 `makeStyles` e escalas próprias; internamente F4-1 (card de artigo com 5 combinações de padding/raio/fs), F11-1 (16 linhas de Ajustes à mão) | `HomeScreen.jsx:165-233`, `ArticleDetailScreen.jsx:370-409`, `BibleScreen.jsx:993-1093`, `SettingsScreen.jsx` (16 linhas), `ArticlesScreen.jsx:91` | Acidental: cada tela nasceu com números próprios | S1 tokens |
| 2 | **Cores literais fora da paleta** (C15): 44 hex, `#fff` em 93 pontos; internamente F1-7 (branco fixo no header em 7 pontos), F2 (`#c0392b` em 3 telas de auth), F7-9 (verde e vermelho do quiz) | `App.js:101, :145, :181, :214, :313, :356, :396`; `LoginScreen.jsx:147, :197`; `BibleScreen.jsx:873, :952, :1072`; `liturgicalSeason.js:31-35`; `ErrorBoundary.jsx:46-51` | Acidental (faltam `onPrimary`, `danger`, `success`, `overlay`) | S1 |
| 3 | **Kickers em caixa alta** (C10): 43 definições, 5 tamanhos, 6 espaçamentos, 4 cores; internamente F7-18 (11 variantes só em Ferramentas), F3-3, F8-1, F9-5 | `HomeScreen.jsx:210, :228`; `ContinueReadingCard.jsx:56`; `ContinueBibleCard.jsx:58`; `RelatedArticles.jsx:46, :72`; `RelatedDialogues.jsx:46`; `BibleScreen.jsx:1010, :1079`; `LoginScreen.jsx:226`; `WebDownloadBanner.jsx:65` | Acidental, e marcador datado (Rams 7) | S1 (some como padrão) |
| 4 | **Filete lateral** (C8) em 23 lugares com 3 larguras; internamente F7-6 (caixa de introdução com filete em 5 telas), F8-1 (4 cards do dia com 3 ou 4 px) | `HomeScreen.jsx:178, :223`; `VerseOfDayCard.jsx:79`; `LiturgyCard.jsx:85`; `NewsCard.jsx:181`; `ArticleDetailScreen.jsx:391`; `BibleScreen.jsx:1050`; `OnboardingScreen.jsx:197`; `MarkdownText.jsx:213` | Acidental | S1 (removido) |
| 5 | **Card de navegação e card de conteúdo** (C6, C7): 18 + 17 implementações; internamente F7-4 (5 layouts "ícone + rótulo + chevron"), F4-1, F5-1/F5-2 (card de referência em duas cópias de JSX com 20 estilos), F8-1 | `HomeScreen.jsx:128-142, :148`; `ToolsScreen.jsx:130-139`; `ContinueReadingCard.jsx:33-58` vs `ContinueBibleCard.jsx:15-67`; `ReferencesScreen.jsx` vs `RefDetailScreen.jsx` (card de referência); `RelatedArticles.jsx:23`; `RelatedDialogues.jsx:23` | Acidental (a lógica por trás dos "continue lendo" é legítima e fica nas telas) | S2 Group/Row |
| 6 | **Botões** (C12): 15 estilos, 2 cores de fundo, 4 alturas; internamente F7-5 (10 botões só em Ferramentas), F2-2 (auth), F8-11, F10-3 | `LoginScreen.jsx:203-223`; `OnboardingScreen.jsx:222-224`; `BibleLoadingState.jsx`; `QuizScreen.jsx`, `DialogueScreen.jsx`, `RosaryScreen.jsx` (F7-5); `AccountPrompt.jsx:109, :114` | Acidental | S2 Button |
| 7 | **Cabeçalhos de seção** (C9) em 8 tratamentos | `HomeScreen.jsx:123/:196`; `BibleScreen.jsx:714/:1008, :669/:998, :750/:1025, :805/:1046`; `ArticleDetailScreen.jsx:324/:395`; `RelatedArticles.jsx:21/:43`; `OnboardingScreen.jsx:97/:194` | Acidental | S2 SectionTitle |
| 8 | **Campos de busca** (C11): 7 `TextInput` + 1 barra falsa, 11 hacks de outline; internamente F7-1, F9-1 | `HomeScreen.jsx:97-100`; `BibleScreen.jsx:677-688, :1007`; `SearchScreen.jsx:249-259, :365`; `GlossaryScreen.jsx:52, :119`; `DebateStrategiesScreen.jsx:45, :139`; `LoginScreen.jsx:194` | Acidental | S2 SearchField |
| 9 | **Estados de gate, carregando e vazio** (C17); internamente F10-3/F10-4 (3 telas x 3 blocos), F4-7 | `HighlightsScreen.jsx`, `NotesScreen.jsx`, `NotebookScreen.jsx` (tela gated + loading + vazio); `FavoritesScreen.jsx`; `SearchScreen.jsx` (vazio) | Acidental | S2 EmptyState, GateNotice |
| 10 | **Chips, barras de progresso, badges** (C18, C19, C20); internamente F11-3/F7-7 (chips com dois visuais de "ativo"), F6-1/F4-11 (barras com altura 3, 4 ou 6) | `SettingsScreen.jsx` (`fontChip` usado para letra, idioma e velocidade); `ReadingProgressBar.jsx:17-18`; `ContinueBibleCard.jsx:61-66`; `BibleScreen.jsx:1039`; `ArticleDetailScreen.jsx:384`; `SectionBanner.jsx:44` | Acidental | S2 Chip, ProgressBar, texto |
| 11 | **Header dos stacks copiado 6x e branco fixo** (C1; F1-1/F1-7) | `App.js:100-102, :144-146, :180-182, :213-215, :312-314, :355-357` | Acidental | S3 chrome |
| 12 | **ScrollHint em 24 telas** (C14) | `HomeScreen.jsx:157-160`; `ArticleDetailScreen.jsx:357-359`; `BibleScreen.jsx:737-738, :893-894`; `ToolsScreen.jsx:119-120`; `SettingsScreen.jsx:635-636`; `TodayScreen.jsx:74-75`; mais 17 em `01-flowcharts` e C14 | Acidental, e animação ociosa (Rams 9) | S3 (apagado) |
| 13 | **Rotas em vários stacks e contratos de navegação à mão** (C2, C3, C4) | `App.js:94-246` (57 registros); `navigate('Bíblia')` em `BibleMapScreen.jsx:32`, `RosaryScreen.jsx:157`, `RefDetailScreen.jsx:43`, `SearchScreen.jsx:149, :171`, `LiturgyScreen.jsx:260`, `ReferencesScreen.jsx:242`, `HighlightsScreen.jsx:40`, `NotebookPageScreen.jsx:116`, `TodayScreen.jsx:45` | A duplicação dos registros é **legítima** (CLAUDE.md: o toque resolve na aba ativa); a forma de registrar e os contratos são acidentais | S3 registerSharedScreens, openBible, openArticle |
| 14 | **Dados bilíngues e formatação de versículo** (C32, C25, C24, C23) | `titleEn \|\| title` em 13 pontos (`ArticlesScreen.jsx`, `CategoryArticlesScreen.jsx`, `FavoritesScreen.jsx`, `ReadingPlanScreen.jsx`, `SearchScreen.jsx`, `DialogueScreen.jsx`, ...); separador `isEn ? ':' : ','` em 7 lugares e `share.js:36` com vírgula fixa; `ReferencesScreen.jsx:17-70` vs `references.js:2394-2446`; `LiturgyScreen.jsx:14-41` vs `bible.js` vs `references.js:2367-2392` | Acidental | S4 |
| 15 | **Gate de conta com mensagem inline** (C27; F10-4) | `BibleScreen.jsx:512-518`; `ArticleDetailScreen.jsx:199-214`; `ToolsScreen.jsx:78-87`; `AccountPrompt.jsx:19-20` (defaults só em PT) | Acidental | S4 |
| 16 | **"Item do dia", Páscoa e chave de data** (C21, C30, C28) | `HomeScreen.jsx:65-67`; `notifications.js:8-12`; `dailyVerses.js:98-104`; `quiz.js:1966-1967`; `saints.js` e `liturgicalSeason.js` (`easterDate` idêntica); `QuizScreen.jsx:100-112` (UTC) vs `readingProgress.js` (local) | Acidental (as regras de streak são legítimas, a data não) | S5 |
| 17 | **Narração, Firestore direto, compartilhamento** (C26, C35, C22, C36) | `BibleScreen.jsx:570-627` vs `ArticleDetailScreen.jsx:96-125` vs `SettingsScreen.jsx:96-115`; `NoteEditorScreen.jsx:5-6, :33-47` vs `userData.js:163-168`; `share.js:8-10` vs `LiturgyScreen.jsx:57-58, :115`; `ShareVerseCard.jsx` vs `DialogueAnswerCard.jsx` | Acidental | S6 |

## 2. O que é especialização legítima e fica como está

- Variantes por plataforma (`.web.js`, `.native.jsx`): `sentry.web.js`, `notifications.web.js`, `useGoogleSignIn.web.js`, `shareAsImage.web.js`, `StickySectionList.web.jsx`, `MapView.web.jsx` (F14-4). Convenção do projeto.
- `useBibleReady` (bloqueante, com estado de erro) vs `ensureBible` (dispara e segue) (F10-10): dois usos distintos.
- Restauração de scroll da Bíblia espalhada por 12 `useRef` (F6-8): custo alto, depende do comportamento da FlatList em 3 plataformas; não entra no redesign.
- `BrandedSplash` e `ErrorBoundary` fora do tema (F1-12, F14-3): ficam acima dos providers por design; recebem as cores da marca de `tokens.js` (constantes puras), não do contexto.
- Cache-first de liturgia e de notícias (C29, F8-2): TTL e formato diferentes.
- Streaks do quiz e do plano (C28): regras de produto diferentes; só a data passa a ser comum.
- Telas secundárias registradas em vários stacks (C2): intencional; muda o jeito de registrar, não o resultado.
- Textos legais em 3 cópias divergentes (F11-11: `LegalScreen.jsx` vs `docs/privacy.html` vs `docs/terms.html`): não é design, é conteúdo jurídico e exige revisão humana. Registrado como pendência para o dono do projeto.

## 3. Números que resumem o estado

| Medida | Valor | Fonte |
|---|---|---|
| Registros de rota / rotas distintas | 57 / 27 | C2 |
| Cópias literais do `screenOptions` de header | 6 | C1 |
| `makeStyles` sem escala compartilhada | 48 | C5 |
| Cores hex literais fora da paleta | 44 (`#fff` 93x) | C15 |
| Rótulos em caixa alta | 43 | C10 |
| Filetes laterais | 23 | C8 |
| Implementações do card de navegação / de conteúdo | 18 / 17 | C6, C7 |
| Estilos de botão | 15 (20 com 02a) | C12, F7-5 |
| Campos de busca / hacks de outline | 8 / 11 | C11 |
| Telas com ScrollHint | 24 | C14 |
| Duplicações internas por feature | 137 | 02a |
| Concerns entre features | 37 | 02b |

## 4. Leitura

Quase tudo que se repete é a **ausência de três coisas**: um arquivo de tokens, sete componentes base e um chrome comum. Resolvidos esses três (S1, S2, S3 da proposta), 12 dos 17 blocos acima desaparecem por consequência. O resto (S4 a S6) é lógica pequena que vale unificar quando a tela for tocada, com três exceções que valem sozinhas por corrigirem bug: separador do versículo no share em EN, narração de artigo longo sem fila, e streak do quiz em UTC.
