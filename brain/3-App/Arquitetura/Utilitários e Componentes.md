---
tags: [arquitetura]
atualizado: 2026-07-08
---

# Utilitários e Componentes

Duas pastas de apoio às telas: `src/utils/` (helpers sem UI, aprox. 11 arquivos em julho de 2026) e `src/components/` (aprox. 24 componentes reutilizáveis). Variantes `.web.js`/`.web.jsx` substituem o irmão nativo na web.

## src/utils/

| Arquivo | Propósito | Principais consumidores |
| --- | --- | --- |
| `src/utils/dialog.js` | Confirmações e alertas multiplataforma (Alert nativo, window.confirm na web) | `BibleScreen`, `SettingsScreen`, `NoteEditorScreen`, telas do caderno |
| `src/utils/favorites.js` | Favoritos de artigos em AsyncStorage | `FavoritesScreen`, `ArticleDetailScreen` |
| `src/utils/lastRead.js` | Guarda o último artigo aberto para o card "Continue lendo" | `ContinueReadingCard`, `ArticleDetailScreen` |
| `src/utils/onboarding.js` | Flag de onboarding visto (`onboarding:done`) | `OnboardingScreen` |
| `src/utils/readingProgress.js` | Artigos lidos e progresso do plano de leitura | `ArticleDetailScreen`, `ReadingPlanScreen` |
| `src/utils/searchHistory.js` | Histórico das últimas buscas (máx. 8) | `SearchScreen` |
| `src/utils/share.js` | Compartilhar texto com assinatura do app, ver [[Compartilhamento]] | `BibleScreen`, `ArticleDetailScreen`, `HighlightsScreen`, `VerseOfDayCard` |
| `src/utils/shareAsImage.js` | Captura uma View como PNG e abre o sheet de compartilhar | `VerseOfDayCard` |
| `src/utils/shareAsImage.web.js` | Variante web: compartilha texto ou copia, sem captura | `VerseOfDayCard` na web |
| `src/utils/ttsVoice.js` | Escolha de voz e velocidade da leitura em voz alta, ver [[Leitura em Voz Alta (TTS)]] | `BibleScreen`, `ArticleDetailScreen`, `SettingsScreen` |
| `src/utils/verseRange.js` | Extrai o versículo final de um intervalo no texto da referência | `RosaryScreen`, `LiturgyScreen`, `BibleMapScreen` |

## src/components/

| Componente | Propósito | Principais consumidores |
| --- | --- | --- |
| `AccountPrompt.jsx` | Modal "Criar uma conta?" e seu provider global | `App.js`, aberto pelo GuestGate |
| `AppIcon.jsx` | Ícone Ionicons ou MaterialCommunityIcons conforme metadado | `HomeScreen` |
| `AuthTopToggles.jsx` | Pílulas de tema e idioma nas telas de entrada | `OnboardingScreen`, `LoginScreen`, `SignupScreen` |
| `ContinueReadingCard.jsx` | Card "Continue lendo" baseado no último artigo aberto | `HomeScreen` |
| `CrossMark.jsx` | Cruz decorativa desenhada com Views, adapta ao tema | `TodayScreen`, `ArticleDetailScreen` |
| `ErrorBoundary.jsx` | Captura erros de render e mostra tela amigável | `App.js` |
| `GuestGate.jsx` | Hook `requireAccount(cb)`: executa logado, senão abre o AccountPrompt | `BibleScreen`, `ToolsScreen`, `ArticleDetailScreen` |
| `ImageZoomModal.jsx` | Visualizador de imagem em tela cheia com zoom | `ArticleDetailScreen` |
| `LiturgyCard.jsx` | Resumo da liturgia do dia | `TodayScreen` |
| `MarkdownText.jsx` | Renderiza o markdown simples do corpo dos artigos | `ArticleDetailScreen` |
| `NewsCard.jsx` | Lista de notícias católicas com data relativa | `TodayScreen` |
| `NotebookText.jsx` | Texto do caderno com tokens de referência clicáveis | `NotebookPageScreen` |
| `ReadingProgressBar.jsx` | Barra fina de % lido no topo do artigo | `ArticleDetailScreen` |
| `ReadingText.jsx` | Texto das leituras da Missa com números de versículo destacados | `LiturgyScreen` |
| `ReferencePickerModal.jsx` | Modal para inserir referência (versículo ou artigo) no caderno | `NotebookPageScreen` |
| `RelatedArticles.jsx` | Seção "Ver também" no fim do artigo | `ArticleDetailScreen` |
| `SaintTodayCard.jsx` | Santo do dia | `TodayScreen` |
| `ScrollHint.jsx` | Setinha discreta indicando conteúdo abaixo | quase todas as telas com lista |
| `SectionBanner.jsx` | Cabeçalho de seção com ícone, título e contagem, opaco para sticky | `ArticlesScreen`, `ReferencesScreen`, `CategoryArticlesScreen` |
| `ShareVerseCard.jsx` | Card visual do versículo renderizado offscreen para virar imagem | `VerseOfDayCard` |
| `StickySectionList.jsx` | SectionList com cabeçalhos fixos (comportamento nativo) | `ArticlesScreen`, `ReferencesScreen` |
| `StickySectionList.web.jsx` | Recria o sticky nativo na web com position sticky por seção | os mesmos, na web |
| `VerseOfDayCard.jsx` | Versículo do dia com compartilhar texto ou imagem | `TodayScreen` |
| `WebDownloadBanner.jsx` | Banner só na web convidando a baixar o app | `SettingsScreen` |

## Relacionadas

- [[Serviços]] cobre a camada de dados e rede.
- [[Conteúdo do Dia]] usa boa parte dos cards listados acima.
- [[Estado Global e Tema]] explica os contexts que quase todo componente consome.
