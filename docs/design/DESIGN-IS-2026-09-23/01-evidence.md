# 01. Evidência por princípio (coletada por subagentes, sem notas)

Data: 2026-09-23. Cada fato traz `arquivo:linha` ou a captura de origem. Os
subagentes foram proibidos de pontuar: a nota está em `02-scorecard.md`.
Premissa corrigida pelo subagente estrutural: `VerseOfDayCard`, `SaintTodayCard`,
`LiturgyCard` e `NewsCard` não estão na Início, são montados em
`src/screens/TodayScreen.jsx:68-71` (rota `Today`, via `ToolsScreen.jsx:16`).
`RefSourceBlock` não é usado pelo Artigo, só por `RefDetailScreen.jsx:115` e
`ReferencesScreen.jsx:144`.

## 1. Evidência estrutural

### A. Elementos interativos por tela (código x captura da primeira dobra)

**Chrome global (`App.js`)**
- Tab bar: 5 abas (`App.js:333-345`), label `fontSize: 11` fixo (`:325`), altura `56 + inset` (`:322`). Visível em todas as capturas com tabs: 5.
- Headers: `App.js` não tem nenhum `TouchableOpacity`/`Pressable` (grep = 0). O botão voltar é o nativo do native-stack. Botões injetados pelas telas: Artigo 3 (`ArticleDetailScreen.jsx:134-162`), Bíblia 1 (`BibleScreen.jsx:184-192`).
- `BrandedSplash`: 0 interativos (`App.js:250-259`).

**Início (`HomeScreen.jsx`)**
- Código: barra de busca falsa (`:97`), `ContinueReadingCard` (`:102`, só renderiza se há último artigo, `ContinueReadingCard.jsx:30`), card objeção (`:105`), 6 tiles de categoria (`:128`, `ARTICLE_CATEGORIES` em `src/data/articleCategories.js:9-14`), card Referências (`:148`). Total: 10 (9 incondicionais + 1 condicional). Com tab bar: 15.
- Não interativos: hero (`:80-86`), banner da estação (`:89-95`), título de seção (`:123`), 2 `ScrollHint` com `pointerEvents="none"` (`:159-160`, `ScrollHint.jsx:48`).
- Captura `inicio-claro.png`: busca 1, objeção 1, 4 tiles inteiros + 2 cortados, tab bar 5 = 11 inteiros (13 com os cortados). "Continue lendo" não aparece. Card Referências só na 2ª dobra (`inicio-2-claro.png`). `inicio-escuro.png`: mesma estrutura.
- Conteúdo: a objeção exibida contém travessão (visível na captura); `src/data/dialogues.js` tem 34 linhas com "—" (grep), contra a convenção "Sem travessões" do CLAUDE.md.

**Artigo (`ArticleDetailScreen.jsx`)**
- Código: header 3 (`:134`, `:147`, `:154`) + voltar nativo; `Pressable` do herói (`:268`); links de glossário (`Text onPress` em `MarkdownText.jsx:110-116`, 1 por termo distinto por artigo); `toolBtn` (`:312`, só se `article.tool`); `refItem` x `article.references.length` (`:330`); `RelatedDialogues.jsx:23` x N; `RelatedArticles.jsx:23` x N; `ImageZoomModal.jsx:231` 1 `Pressable`. JSX no arquivo: TO=5, Pressable=1.
- Captura `artigo-claro.png`: voltar 1, ouvir 1, compartilhar 1, favoritar 1, herói/expandir 1, tab bar 5 = 10. Nenhum link de glossário visível na primeira dobra. `artigo-2-claro.png`: 0 interativos no corpo.
- Título aparece 2x: header truncado "Artigo - Deus Existe? Os ..." (`:171`) e corpo (`:296`).

**Bíblia, capítulo (`BibleScreen.jsx`)**
- Código, view versículos (`:802-987`): voltar (`:184`), TTS (`:806`), `verseRow` x versículos só com `onLongPress` e sem pista visual (`:858-861`), botão de nota por versículo com nota (`:879`, condicional), anterior (`:899`), próximo (`:912`), Modal: overlay (`:933`), 5 `colorDot` (`:945`, `HIGHLIGHT_COLORS :47-53`), remover marcação (`:957`), 3 `modalAction` (`:969`, `:974`, `:979`). JSX: TO=14, TextInput=1.
- View livros (`:666-741`): TextInput (`:679`), `ContinueBibleCard` (`:694`, condicional), `bookRow` x 73 (`:716`). View capítulos (`:748-787`): `chapterCell` x `totalChapters` (`:770`).
- Captura `biblia-capitulo-claro.png`: voltar 1, ouvir 1, 7 versículos (long-press), "Jo 2" 1, "Jo 4" 1, tab bar 5 = 16. "João 3" aparece 2x (header `:180` e `verseHeaderTitle :805`).
- Captura `biblia-livros-claro.png`: busca 1, 7 `bookRow`, tab bar 5 = 13. "Bíblia" no header (`:182`) e "Bíblia Sagrada" no card (`:669`).

**Onboarding (`OnboardingScreen.jsx`)**
- Código: `AuthTopToggles` 2 (`AuthTopToggles.jsx:15`, `:26`); TO=6: chip x6 (`:103`, `THEMES :16-23`), `rowChip` x4 (`:126`, `AUDIENCES :26-31`), Pular (`:161`), Começar (`:165`), Voltar (`:170`), Ver a resposta (`:176`). Por passo: 0 → 4, 1 → 10, 2 → 8, 3 → 3.
- Captura `onboarding-claro.png` (passo 0): tema 1, idioma 1, Pular 1, Começar 1 = 4. Sem tab bar (fora do `NavigationContainer`, `App.js:406-408`).

**Login (`LoginScreen.jsx`)**
- Código: `AuthTopToggles` 2; TextInput 2 (`:72`, `:86`); TO=7: olho (`:95`), esqueci (`:100`), vincular Google (`:114`, só com `linkInfo`), Entrar (`:127`), Google (`:138`, só se `!google.unavailable`), Criar conta (`:154`), sem conta (`:164`). Total 11 (9 + 2 condicionais).
- Captura `login-claro.png`: 10 interativos. Sem tab bar.
- Divisor "ou" implementado 2x com estilos distintos: `:131-135` (style `:211-213`, fs(12) minúsculo) e `:158-162` (style `:224-226`, fs(11) maiúsculo, ls 1). A captura mostra "ou" e depois "OU".

### B. Profundidade máxima de aninhamento JSX

- `App.js:432-446` (providers): 8 níveis. Navegadores até a Home: NavigationContainer (`:411`) > MainStack (`:353`) > Tab (`:309`) > HomeNav (`:98`) > tela = 5. `BrandedSplash`: 2.
- `HomeScreen.jsx:70-162`: 6, em `:134`.
- `ArticleDetailScreen.jsx:244-369`: 7 no JSX próprio (`:340`, `:284`); 9 com `MarkdownText` expandido (`MarkdownText.jsx:127-163`) num item de lista com termo do glossário.
- `BibleScreen.jsx`: livros 7 (`:722`); capítulos 4 (`:754`); versículos 7 (`:952`); lista de versículos 6 (`:886`).
- `OnboardingScreen.jsx:63-183`: 6 em `:110`.
- `LoginScreen.jsx:56-175`: 6 em `:117` (5 sem o Fragment).

### C. Padrões repetidos (mesma affordance, mesmo propósito)

1. **Dois "Continue lendo"**: `ContinueReadingCard.jsx:33-58` vs `ContinueBibleCard.jsx:15-67`. JSX idêntico (TouchableOpacity > View.iconBox > Ionicons `play` 18 `#fff`; View > Text.label > Text.title; chevron 18 textSubtle). Estilos idênticos (card row, gap 12, radius 12, padding 13, borderLeft 3 accent; iconBox 36 r18; label fs(10) accentText bold uppercase ls 1; title fs(14) primaryText '600'). Diferenças: `marginHorizontal: 16` (`ContinueBibleCard.jsx:50`), `lineHeight fs(18)` (`ContinueReadingCard.jsx:57`), barra + stats (`ContinueBibleCard.jsx:28-37`, `:61-66`). Um lê AsyncStorage por dentro (`ContinueReadingCard.jsx:18`), o outro recebe props (`ContinueBibleCard.jsx:9`). Nenhum aparece em captura.
2. **Entradas de busca**: `HomeScreen.jsx:97-100` (TouchableOpacity com cara de campo → `navigate('Search')`, `:58`) vs `BibleScreen.jsx:677-688` (TextInput real que filtra livros). Mesmo ícone (`search-outline` 18 textSubtle), estilo quase igual (`HomeScreen.jsx:190-194` paddingHorizontal 14; `BibleScreen.jsx:1000-1005` paddingHorizontal 12), comportamento diferente. No app: mais 3 (`GlossaryScreen.jsx:52`, `DebateStrategiesScreen.jsx:45`, `SearchScreen.jsx:250`).
3. **Compartilhar**: `ArticleDetailScreen.jsx:147-153` (header, 22 `#fff`), `BibleScreen.jsx:974-977` (menu long-press, 20 primaryText), `VerseOfDayCard.jsx:52-60` (2 botões, 16 accent). Fora da superfície: `HighlightsScreen.jsx:143` (18 accent), `DialogueScreen.jsx:123` (18 `#fff`), `LiturgyScreen.jsx:366` (18 accent), `NoteEditorScreen.jsx:143` (22 accent). 4 tamanhos, 3 cores.
4. **Cards de categoria**: `HomeScreen.jsx:128-142` (tile 48,5%, caixa 40 r9 badgeBg, nome fs(14), contagem uppercase, ícones de `articleCategories.js:9-14`) vs `OnboardingScreen.jsx:103-113` (chip 47%, ícone 26 solto, título fs(15) + sub, ícones fixos em `:16-23`). Mesmas 6 categorias, ícones diferentes em 3 de 6 (Igreja Católica `church` vs `home-outline`; Moral `compass-outline` vs `heart-outline`; Outras Religiões `globe-outline` vs `people-outline`). Chave `'História'` (`OnboardingScreen.jsx:22`) vs id `'História da Igreja'` (`articleCategories.js:13`). Terceira forma via `SectionBanner` (caixa 46 r11) em `ArticlesScreen.jsx:81` e `CategoryArticlesScreen.jsx:33`.
5. **Badges de contagem e eyebrows uppercase**: 43 ocorrências de `textTransform: 'uppercase'` no app, 12 na superfície. Contagens: `HomeScreen.jsx:139-141` (`:210` fs(11) accentText ls .5), `SectionBanner.jsx:20` (`:44` fs(10) ls .5), `ContinueBibleCard.jsx:32-36` (`:66` fs(11) textSubtle, sem uppercase), `BibleScreen.jsx:726-729` (`:1022`), `:756-758` (`:1041`), `:911` (`:1070`). Kickers: `HomeScreen.jsx:227-229`, `ContinueReadingCard.jsx:56`, `ContinueBibleCard.jsx:56-59`, `RelatedArticles.jsx:43-50` (centrado), `RelatedDialogues.jsx:43-50`, `RefSourceBlock.jsx:84-90` ('700', accent), `BibleScreen.jsx:1008-1011` (fs(13)), `:1079` (fs(12)), `LoginScreen.jsx:226`, `ArticleDetailScreen.jsx:385`, `VerseOfDayCard.jsx:91-97`, `LiturgyCard.jsx:93`, `NewsCard.jsx:188`, `SaintTodayCard.jsx:51`. Combinações: fs 10/11/12/13, letterSpacing 0.5/1, cores accentText/textSubtle/accent, pesos bold/'700'.
6. **Cabeçalhos de seção**: `HomeScreen.jsx:123` (`:196` fs(16) bold primaryText), `BibleScreen.jsx:714` (`:1008` fs(13) uppercase textSubtle), `:940` (`:1079` fs(12)), `:669` (`:998` fs(18)), `:750` (`:1025` fs(22)), `:805` (`:1046` fs(20)), `ArticleDetailScreen.jsx:324` (`:395` fs(15)), `RelatedArticles.jsx:21` (`:43` fs(11) uppercase centrado), `RelatedDialogues.jsx:21` (idem), `OnboardingScreen.jsx:97` (`:194` fs(22) centrado). 8 tratamentos distintos.
7. **Card com filete lateral**: 13 ocorrências na superfície, larguras 3 e 4 misturadas. 4: `HomeScreen.jsx:178`, `:223`, `VerseOfDayCard.jsx:79`, `LiturgyCard.jsx:85`, `NewsCard.jsx:181`. 3: `ArticleDetailScreen.jsx:391`, `BibleScreen.jsx:1050`, `OnboardingScreen.jsx:197`, `ContinueReadingCard.jsx:52`, `ContinueBibleCard.jsx:49`, `MarkdownText.jsx:213`, `RefSourceBlock.jsx:79`, `SaintTodayCard.jsx:47`.
8. **Caixa de ícone à esquerda do card**: `HomeScreen.jsx:205-208` (40 r9), `:215-218` (40 r9), `ContinueReadingCard.jsx:55` (36 r18), `ContinueBibleCard.jsx:52-55` (36 r18), `SaintTodayCard.jsx:50` (36 r9), `LiturgyCard.jsx:88-92` (38 r9), `NewsCard.jsx:184-187` (38 r9), `SectionBanner.jsx:38-41` (46 r11), `BibleScreen.jsx:1016-1019` (44 r10), `VerseOfDayCard.jsx:83-90` (26 r13), `OnboardingScreen.jsx:216-220` (88 r44), `ArticleDetailScreen.jsx:380` (28 r14). Tamanhos: 26/28/36/38/40/44/46/88. Raios: 9/10/11/13/14/18/44.
9. **Chevron-forward como "abre"**: 12 na superfície, 3 tamanhos, 4 cores: `HomeScreen.jsx:156` (18 textSubtle), `ContinueReadingCard.jsx:42`, `ContinueBibleCard.jsx:39`, `BibleScreen.jsx:731` (18 textSubtle), `:922` (20 primaryText), `OnboardingScreen.jsx:135` (18 textSubtle), `ArticleDetailScreen.jsx:318` (18 `#fff`), `:347` (16 accent), `RelatedArticles.jsx:33`, `RelatedDialogues.jsx:33` (16 accent), `LiturgyCard.jsx:72` (18), `NewsCard.jsx:156` (20 `#fff`). No app: 21 arquivos.
10. **Bloco de marca (cruz + APPologética + 1 Pedro 3,15)**: `App.js:253-255` (cruz "✝" em texto, fontSize 72), `HomeScreen.jsx:81-85` (CrossMark fs(34), título fs(20)), `LoginScreen.jsx:65-68` (CrossMark fs(54), título fs(28)), `OnboardingScreen.jsx:77-91` (CrossMark fs(64), h1 fs(30)). 4 lugares, 4 tamanhos de cruz, 3 de título.
11. **`screenOptions` de header copiado 6x** (mesmo objeto de 3 linhas): `App.js:100-102`, `:144-146`, `:180-182`, `:213-215`, `:312-314`, `:355-357`.
12. **`ScrollHint` em par up/down**: 48 usos no app (24 pares). Superfície: `HomeScreen.jsx:159-160`, `ArticleDetailScreen.jsx:358-359`, `BibleScreen.jsx:737-738`, `:893-894`.
13. **Rotas registradas em mais de um stack (`App.js`)**:
    - Em 4 stacks, 3 rotas: `RefDetail` (`:126`, `:163`, `:196`, `:229`), `Glossary` (`:117`, `:155`, `:187`, `:240`), `Dialogue` (`:128`, `:165`, `:200`, `:235`).
    - Em 3 stacks, 5 rotas: `ArticleFromSearch` (`:125`, `:162`, `:195`), `Favorites`, `ReadingPlan`, `Rosary`, `ExamConscience`.
    - Em 2 stacks, 11 rotas: `Today`, `Notebook`, `NotebookPage`, `CategoryArticles`, `Highlights`, `Notes`, `Liturgy`, `Quiz`, `DebateStrategies`, `BibleMap`, `Legal`.
    - Em 1 stack, 8: `HomeMain`, `References`, `Tools`, `Search`, `ToolsMain`, `SettingsMain`, `ArticlesList`, `ArticleDetail`.
    - Totais: Home 23, Tools 19, Settings 10, Articles 5 = **57 registros para 27 rotas distintas (19 duplicadas)**. `ArticleDetailScreen` sob 2 nomes (`ArticleDetail :224`, `ArticleFromSearch :125/:162/:195`). `ToolsScreen` é raiz do ToolsStack (`:149`) e também rota `Tools` do HomeStack (`:107`).
14. **Título duplicado header + conteúdo**: `BibleScreen.jsx:180` vs `:805`; `:182` vs `:669`; `ArticleDetailScreen.jsx:171` vs `:296`. Todos visíveis nas capturas.
15. **Divisor "ou" no Login**: 2 implementações (`LoginScreen.jsx:131-135`/`:211-213` e `:158-162`/`:224-226`).

### D. Lint, imports, props e estilos mortos

- `npm run lint`: 0 erros, 14 warnings, todos `react-hooks/exhaustive-deps` (baseline). Na superfície: `ArticleDetailScreen.jsx:73`, `:166`, `:172`; `BibleScreen.jsx:149`, `:195`, `:201`, `:460`; `ImageZoomModal.jsx:42`, `:154`. `eslint-disable` pontual em `BibleScreen.jsx:644`.
- Imports não usados nos 18 arquivos da superfície: 0.
- Chaves de estilo mortas: `BibleScreen.jsx:1023` `backRow` e `:1024` `backText`.
- Props aceitas que nenhum chamador passa: `MarkdownText.jsx:89` `h2Style`, `quoteStyle`, `bulletStyle`, `linkStyle`; `ScrollHint.jsx:9` `offset` (0 de 48 usos); `BibleLoadingState.jsx:13` `compacto`; `CrossMark.jsx:8` `style` (1 de 7 chamadores).
- `accessibilityRole` em Touchables: `HomeScreen.jsx` 4 TO / 0 roles; `LoginScreen.jsx` 7 / 0; `ContinueReadingCard.jsx` 1 / 0; `RelatedArticles.jsx` 1 / 0; `RelatedDialogues.jsx` 1 / 0. `OnboardingScreen`, `BibleScreen`, `AuthTopToggles`, `ContinueBibleCard` têm.

### E. Valores distintos por arquivo

| Arquivo | borderRadius | fontSize `fs()` | fontWeight | padding |
|---|---|---|---|---|
| `App.js` | nenhum | `fontSize` cru 11, 13, 30, 72 (`:325`, `:278`, `:271`, `:269`) | bold x7, '600' x1 | 6, 32 |
| `HomeScreen.jsx` | 9, 10, 12, 14 | 11, 12, 12.5 (`:232`), 13, 14, 15, 16, 20 | bold x8, '600' x3 | 12, 13, 14, 16, 30 |
| `ArticleDetailScreen.jsx` | 6, 8, 12, 14 | 10, 11, 12, 14, 15, 16, 22 | bold x4, '600' x1 | 4, 10, 14, 16, 20, 40 |
| `BibleScreen.jsx` | 2, 8, 10, 12, 19, 20 | 11, 12, 13, 14, 15, 17, 18, 20, 22 | bold x10, '600' x4, '500' x1 | 3, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 40 |
| `OnboardingScreen.jsx` | 3, 12, 14, 44 | 12, 14, 15, 16, 22, 30 | bold x5, '600' x1 | 8, 14, 16, 20, 24, 26, 40, 64 |
| `LoginScreen.jsx` | 10, 12 | 11, 12, 13, 14, 15, 16, 28 | bold x5, '600' x3 | 12, 14, 16, 24, 60 |
| `AuthTopToggles.jsx` | 14 | 11 | '600' | 6, 10 |
| `ContinueReadingCard.jsx` | 12, 18 | 10, 14 | bold, '600' | 2, 13 |
| `ContinueBibleCard.jsx` | 2, 12, 18 | 10, 11, 14 | bold, '600' | 2, 13 |
| `BibleLoadingState.jsx` | 10 | 12, 14, 13/16 condicional | bold, '600' | 11, 22, 28, 20/40 condicional |
| `MarkdownText.jsx` | nenhum | 15, 16, 18 | bold | 6, 8, 12 |
| `RelatedArticles.jsx` | 5, 10 | 10, 11, 13 | bold, '600' | 3, 8, 12 |
| `RelatedDialogues.jsx` | 10 | 11, 13 | '600' | 12 |
| `RefSourceBlock.jsx` | 10 | 11, 12, 13 | '700' | 12 |

Agregado (13 arquivos, sem `App.js`): borderRadius **13 valores** (2, 3, 5, 6, 8, 9, 10, 12, 14, 18, 19, 20, 44; 10 e 12 somam 27 de 47 usos); `fs()` **14 valores** (10 a 30, incluindo 12.5); fontWeight 4 valores ('500' x1, '600' x19, '700' x1, 'bold' x44); padding **21 valores** (2 a 64). Tamanhos de ícone na superfície: 11 valores (11 a 48). `fs()` usado fora de StyleSheet para a cruz: `HomeScreen.jsx:81` fs(34), `LoginScreen.jsx:65` fs(54), `OnboardingScreen.jsx:77` fs(64). `App.js` usa `fontSize` cru, sem `fs()`, em `:269`, `:271`, `:278`, `:325`.

### F. Lacunas (estrutural)

- Links de glossário não contados para o artigo da captura. Header nativo contado como 1 onde aparece.
- `ImageZoomModal.jsx`, `ShareVerseCard.jsx`, `AccountPrompt.jsx`/`GuestGate.jsx`: só grep.
- Sem captura de: grade de capítulos com progresso, modal de long-press, passos 1-3 do onboarding, os dois "Continue lendo", estado de erro do Login, artigo com `toolBtn`, `ImageZoomModal`.
- Fontes: `App.js` 1-451; `HomeScreen.jsx` 1-233; `ArticleDetailScreen.jsx` 1-409; `BibleScreen.jsx` 1-1093; `OnboardingScreen.jsx` 1-225; `LoginScreen.jsx` 1-251; `TodayScreen.jsx` 55-80; componentes listados; `useScrollHints.js` 1-60; `articleCategories.js` 9-14; capturas `inicio-*`, `artigo-*`, `biblia-*`, `onboarding-claro`, `login-claro`; `npm run lint`.

## 2. Peso e atrito

Instância medida: `http://127.0.0.1:8787/` servindo `dist/` (servidor local sem gzip nem latência). Playwright, 390x844, pt-BR, tema claro, visitante. Script e saídas em `scratchpad/pw/medir.js`, `medir-1x.json`, `medir-4x.json`.

### A. Bytes de JS, chunks e imagens
- `index.html` carrega 1 script: `AppEntry-….js` = **4.989.774 B bruto, 1.374.966 B gzip** (gzip -9: 1.369.044 B).
- Chunks sob demanda (`src/services/bibleApi.js:41-42`, `ensureBible`; ao vivo o pedido só apareceu ao abrir João 3): `bibleAveMaria-….js` 4.793.454 B (gzip 1.545.222 B); `bibleDouayRheims-….js` 4.722.575 B (gzip 1.422.029 B).
- Total JS em dist: 14.505.803 B bruto, 4.342.217 B gzip. `dist/assets`: 28.199.434 B em 125 arquivos (106 imagens = 24.122.594 B; 19 fontes .ttf = 4.076.840 B). Maior arquivo do build: `assets/jesus-journey/07-capernaum.jpg` 2.712.449 B. Maiores fontes: `MaterialCommunityIcons.ttf` 1.307.660 B, `FontAwesome6_Solid.ttf` 423.676 B, `Ionicons.ttf` 389.724 B. dist inteiro: 42.728.796 B.
- Imagens que a Início carrega: **0** (a cruz do hero é desenhada com Views, `CrossMark.jsx:5-6, 18-30`). A Início baixa 2 fontes: `Ionicons.ttf` (389.724 B, no gate) e `MaterialCommunityIcons.ttf` (1.307.660 B, puxada pelo ícone `church` do tile "Igreja Católica", `articleCategories.js:9` via `AppIcon.jsx:1-5`).

### B. Requisições na carga da tela primária
- Do goto até networkidle no gate (Onboarding): **4 requisições** (document, script AppEntry, fetch `/version.json` 404 disparado por `src/utils/webUpdate.web.js:73` via `App.js:52`, font Ionicons) + favicon.
- Após "Pular" até a Início ociosa: +1 (font MaterialCommunityIcons). Total **5** (6 com favicon). image 0, xhr 0.
- Externas: **0** em todas as 6 rodadas. Firebase não faz requisição em modo visitante (`AuthContext.jsx:72-83`). Liturgia (`liturgyApi.js:5`) e notícias (`newsApi.js:13-22, 68-80`) só em `TodayScreen.jsx:68-69`, não na Início.
- Artigo: +2 image (`back-icon.png` 207 B; `56-deus-existe-2.jpg` 225.263 B). Bíblia (João 3): +1 script (chunk Ave Maria).

### C. Time-to-interactive (medianas de 3 rodadas, cache frio, loopback)
| Marco | Sem throttle | CPU 4x |
|---|---|---|
| domInteractive | 16 ms | 89 ms |
| DOMContentLoaded | 294 ms | 1.051 ms |
| loadEventEnd | 296 ms | 1.063 ms |
| "Pular" visível | **412 ms** | **1.356 ms** |
| networkidle | 868 ms | 1.828 ms |
| Pular → Início visível | 125 ms | 421 ms |

O bundle de 4,99 MB foi entregue em 76 ms (loopback), então os tempos medem parse e execução, não rede. Em produção soma-se o download de 1,37 MB gzip.

### D. Animações em tela ociosa
- Único loop infinito: `src/components/ScrollHint.jsx:26-41`, `Animated.loop` (translateY ±3 px, 900 ms + 900 ms, ciclo 1,8 s) enquanto `visible`; opacidade 0,55. Montado em **23 telas** (`HomeScreen.jsx:159-160`, `ArticleDetailScreen.jsx:358-359`, `BibleScreen.jsx:737-738` e `:893-894`, e mais 19). Visibilidade por `src/hooks/useScrollHints.js:25-36`. Sem condição de reduce motion.
- Medido ao vivo (amostragem de transform/opacity + contador de rAF): Onboarding 0 elementos, 0 rAF/s. **Início: 1 elemento oscilando, 60 rAF/s contínuos.** Artigo: 180 rAF/s. Bíblia (João 3): 240 rAF/s. Acima de 60 indica loops de ScrollHint de telas anteriores da pilha que continuam montadas.
- Disparadas por interação: `AccountPrompt.jsx:60-61` (fade 180 ms + slide 220 ms), Modais `animationType` fade/slide (`ImageZoomModal.jsx:216`, `ReferencePickerModal.jsx:102`, `BibleMapScreen.jsx:162`, `BibleScreen.jsx:930`, `SettingsScreen.jsx:512, 672`).
- Timer sem interação: `NewsCard.jsx:56-64`, `setInterval` de 3.000 ms avançando o carrossel (só em "Dia de hoje").
- Spinners: `App.js:256` (splash), `LiturgyCard.jsx:36`, `NewsCard.jsx:128`, `BibleLoadingState.jsx:40`, `LiturgyScreen.jsx:154`, `SearchScreen.jsx:275`, `BibleMapScreen.jsx:180`.

### E. Notificações, badges e modais na carga inicial (visitante)
1. Splash com spinner: `App.js:249-258` enquanto `loading` do auth (`:402-404`).
2. **Gate de onboarding em toda abertura**: `App.js:406-407`; `onboardingPassed` é `useState` de sessão, não persistido (`App.js:384-388`, comentário "TEMPORÁRIO"). Exige "Pular" (`OnboardingScreen.jsx:161-163`) ou 3 passos + "Ver a resposta" (`:176-179`).
3. Início após "Pular": 0 modais, 0 `<img>`. Sem interação aparecem: banner litúrgico (`HomeScreen.jsx:89-95`), card "Objeção do dia" (`:105-120`), 6 contadores "N artigos" (`:139-141`), 1 seta ScrollHint. `ContinueReadingCard` não aparece sem último lido (`ContinueReadingCard.jsx:30`).
4. `AccountPrompt` não dispara na carga (`visible` inicia false, `AccountPrompt.jsx:27`; abre por `useRequireAccount`, `GuestGate.jsx:12-23`; consumidores `BibleScreen.jsx:61`, `ToolsScreen.jsx:47`, `ArticleDetailScreen.jsx:57`).
5. `WebDownloadBanner` ("Em breve" x2, `WebDownloadBanner.jsx:15, 36-37`) só em `SettingsScreen.jsx:225`.
6. Badges de tab: nenhum. Push: web no-op; nativo só opt-in (`notifications.js:32-39`).
7. Verificação de atualização web (`App.js:52` → `webUpdate.web.js:60-84`): fetch de `version.json` na carga, pode dar `window.location.reload()` uma vez por aba (`:79-80`).

### F. Modo escuro e reduce motion
- **`prefers-color-scheme`: ausente no app.** `ThemeContext.jsx` não usa `Appearance`/`useColorScheme`/`matchMedia`; `darkMode` inicia false (`:60`) e vem só de `appg_theme` (web, `:70-77`) ou `settings:darkMode` (`:74-81`). A landing (`docs/index.html:16`) lê o esquema do SO e grava `appg_theme`; quem abre `/app` direto não recebe. Nativo: `app.json:9` `"userInterfaceStyle": "light"` fixa o esquema claro. grep `useColorScheme|Appearance\.|prefers-color-scheme` em `src/` e `App.js`: 0.
- **Reduce motion: ausente.** grep `isReduceMotionEnabled|prefers-reduced-motion|reduceMotion` em `src/` e `App.js`: 0. Só a landing tem (`docs/index.html:365, 633`).

### G. Lacunas (peso)
Servidor local sem gzip/brotli e sem latência (tempos medem parse/execução); fluxo logado (Firebase) não medido; liturgia e notícias não exercitadas; favicon contado via PerformanceResourceTiming; animações detectadas por amostragem em 1,2 s mais contador de rAF; nativo não medido; tema escuro não remedido (mesmo bundle).

## 3. Copy e honestidade

Strings em `src/i18n/strings.js` (chave entre parênteses) ou inline (`isEn ? : `). Lista completa por tela no relatório do subagente; aqui ficam as strings que sustentam os fatos abaixo.

### A. Strings visíveis (resumo por tela)
- **Chrome**: abas `tab.home/articles/bible/tools/settings` (`strings.js:17-22`, `App.js:300-306`); ícones: Bíblia usa `bookmark`, Artigos usa `book` (`App.js:286-292`). Header "Artigo - {título}" composto em `ArticleDetailScreen.jsx:171`. Splash "✝ · APPologética · 1 Pedro 3,15" (`App.js:253-255`).
- **Início**: "APPologética" (`HomeScreen.jsx:82`), "Saiba responder, com a fonte na mão." (`:83`), versículo `home.hero.verse` (`strings.js:89`), banner litúrgico (`liturgicalSeason.js:31-35`), "Buscar em todo o app..." (`strings.js:53`), "OBJEÇÃO DO DIA" (`:55`, uppercase `HomeScreen.jsx:228`), "Ver como responder" (`:56`), "O que você quer aprender?" (`:54`), 6 categorias (`articleCategories.js:8-15`), "{n} ARTIGOS" (`HomeScreen.jsx:140`), "Versículos e Referências / Bíblia, Catecismo, documentos" (`strings.js:64-65`).
- **Artigo (chrome)**: a11y "Ouvir artigo / Parar narração" (`:137-145`), "Compartilhar artigo" (`:150-152`), "Favoritar artigo" (`:157-161`), "Ampliar imagem" (`:273`), badge de categoria uppercase (`:292`, `:385`), "Referências" + "Toque em qualquer referência para abrir o texto completo." (`strings.js:119-120`), "OBJEÇÕES RESPONDIDAS" (`RelatedDialogues.jsx:21`), "VER TAMBÉM" (`RelatedArticles.jsx:21`), modal "Salvar nos favoritos? ... crie uma conta gratuita. Seus favoritos ficam salvos e sincronizados entre dispositivos." (`:207-210`).
- **Bíblia**: "Bíblia Sagrada" (`:669`), "73 livros do cânon católico, tradução Ave Maria. Toque e segure num versículo para marcar ou anotar." (`:673`), "Buscar livro..." (`:681`), "ANTIGO/NOVO TESTAMENTO" (`:660-661`), "CONTINUE LENDO" (`ContinueBibleCard.jsx:26`), "{Livro} {n}" também dentro do conteúdo (`:805`), menu long-press "MARCAR COM COR / Anotar / Compartilhar / Copiar" (`:940-981`), "Capítulo em preparação" (`:831`, `:835`).
- **Onboarding**: "Saiba responder" (`:78`), "Quando questionarem a sua fé, tenha a resposta, com a fonte na mão. Vamos te preparar em menos de um minuto." (`:82`), citação 1 Pedro 3,15-16 (`:88-90`), "Pular / Começar / Voltar / Ver a resposta" (`:162-177`), "Qual tema mais te pega?" (`:97`), "Com quem você mais conversa sobre fé? / Só pra falarmos a sua língua." (`:122-123`), "Pronto. Aqui está sua primeira resposta" (`:147`).
- **Login**: "Entre na sua conta para continuar" (`strings.js:157`, `:68`), "Entrar", "ou" e "OU" (`:133`, `:160`), "Continuar com Google" (`:148`), "Criar conta nova" (`:155`), "Continuar sem conta" (`:166`), "Você pode explorar artigos, Bíblia, liturgia e referências. Marcações e notas exigem conta." (`:169-171`).
- **Modal de conta** (`AccountPrompt.jsx:19-20, 104-106, 111, 115`): "Criar uma conta? ... Marcações, notas e favoritos ficam salvos e sincronizados entre dispositivos." / "Sincronizado entre celulares" / "Seus favoritos protegidos" / "Criar conta grátis" / "Agora não".
- **Banner web** (`WebDownloadBanner.jsx:15, 31, 36-40`, só em `SettingsScreen.jsx:225`): "Baixe o app" / "Leve o APPologética com você, 100% offline" / "EM BREVE App Store / Google Play".

### B. Inflações (promessas sem lastro)
| # | Texto | Onde | O que o código mostra |
|---|---|---|---|
| B1 | "Vamos te preparar em menos de um minuto." | `OnboardingScreen.jsx:82` | Sem medição. 4 passos (`:46`); "Ver a resposta" → `onDone` → `App.js:406-408` → `:425` cai no **Login** na primeira abertura (`guest=false`, `AuthContext.jsx:70`). A resposta só abre depois de entrar ou "Continuar sem conta" (`HomeScreen.jsx:35-41`). E o onboarding repete em toda abertura para visitante (`App.js:384-388`, "TEMPORÁRIO"). |
| B2 | "Pronto. Aqui está sua primeira resposta" / "Preparamos uma resposta guiada" | `:147`, `:151` | A resposta não está nessa tela. `pickDialogue` (`:33-39`) escolhe o diálogo de menor `rank` da categoria: é a mesma para todos. Nada é "preparado" para a pessoa. |
| B3 | "Com quem você mais conversa sobre fé? / Só pra falarmos a sua língua." | `:122-123` | A escolha é descartada: `onPress={() => setStep(3)}` (`:129`) não grava nada. Nenhum consumidor de `AUDIENCES` fora do arquivo. Comentário `:25` admite que seria "só para uma linha de copy personalizada", que não existe. |
| B4 | "As perguntas que mais se buscam no Brasil" | `strings.js:232`, `ArticlesScreen.jsx:85` (fora da superfície) | Fonte é `documentos/top100-br.md:1-6`: compilação de listas de FAQs (Theolocast, Diocese de Formosa, GotQuestions PT, Opus Dei). Sem dado de volume de busca. `POPULAR_IDS` é "ids curados" (`articleCategories.js:31-32`). |
| B5 | "Saiba responder, com a fonte na mão." | `HomeScreen.jsx:83`; `OnboardingScreen.jsx:82` | Artigos: lastro sim (83 artigos, todos com `references`). Diálogos (a "resposta" do onboarding e da Objeção do dia): 0 de 53 têm `references`; fontes só como texto solto nos passos (ex. `dialogues.js:29`). |
| B6 | "Buscar em todo o app..." | `strings.js:53` | `SearchScreen.jsx` indexa artigos (`:24-35`), referências (`:37-48`), versículos do dia (`:51-60`) e Bíblia (`:121`). Não indexa glossário, diálogos, quiz, estratégias, santos, plano, caderno, liturgia. |
| B7 | "{n} ARTIGOS" | `HomeScreen.jsx:140` | Calculado dos dados (23/15/7/14/10/14 = 83). Lastro OK. |
| B8 | "73 livros do cânon católico, tradução Ave Maria" | `BibleScreen.jsx:673` | 73 livros, nenhum capítulo faltando (checado em node). Lastro OK. Consequência: "Capítulo em preparação" (`:831`, `:835`) é copy morta em PT. |
| B9 | "100% offline" | `WebDownloadBanner.jsx:36` | Liturgia (`liturgyApi.js:33`), notícias (`newsApi.js:37, :112`) e auth usam rede. Na web a Bíblia é chunk sob demanda (`bibleApi.js:40-41`). |
| B10 | "Baixe o app" + "Em breve" | `WebDownloadBanner.jsx:31, :15` | Caixas App Store/Google Play são `View` sem `onPress` (`:17-25`). `share.js:6` (`APP_PROMO_URL = ''`) confirma que o app não está nas lojas. Título promete download inexistente. |
| B11 | "Criar conta grátis" | `strings.js:151` | Sem IAP, paywall ou anúncios (grep). Lastro OK. |
| B12 | **"Seus favoritos ficam salvos e sincronizados entre dispositivos" / "Seus favoritos protegidos" / "Sincronizado entre celulares"** | `ArticleDetailScreen.jsx:210`; `AccountPrompt.jsx:20, :104, :106`; `ToolsScreen.jsx:84` | Favoritos vivem só em AsyncStorage (`src/utils/favorites.js:1-29`, chave `favorites:articles`), nunca vão ao Firestore. Criar conta não sincroniza favoritos. A estrela do artigo (`:199-214`) exige conta para um recurso local. **Afirmação falsa.** |
| B13 | "Marcações e notas exigem conta." | `LoginScreen.jsx:171` | Incompleto: favoritar (`ArticleDetailScreen.jsx:201`) e itens de Ferramentas (`ToolsScreen.jsx:78`) também exigem. |
| B14 | 1 Pedro 3,15 em três redações | `App.js:255`, `strings.js:89-90`, `OnboardingScreen.jsx:88-90` | Nenhuma é o texto da Ave Maria embarcada (`bibleAveMaria.js`, `1pd` 3,15: "Estai sempre prontos a responder para vossa defesa a todo aquele que vos pedir a razão de vossa esperança, mas fazei-o com suavidade e respeito."). O onboarding atribui "3,15-16", mas "suavidade e respeito" está no v. 15; o v. 16 é "Tende uma consciência reta...". |

### C. Padrões escuros
| Padrão | Estado | Evidência |
|---|---|---|
| Continuidade forçada, custo escondido, escassez falsa | Ausentes | Sem código de assinatura; "Objeção do dia" é rotação determinística (`HomeScreen.jsx:63-67`). |
| Confirmshaming | Ausente | Recusas neutras: "Agora não" (`AccountPrompt.jsx:115`), "Pular", "Continuar sem conta". |
| Nag de conta | Presente, contido, com 4 problemas | Só em ação bloqueada (`GuestGate.jsx:16-22`): long-press em versículo (`BibleScreen.jsx:512`), estrela (`ArticleDetailScreen.jsx:201`), Ferramentas (`ToolsScreen.jsx:78`). (a) "Criar conta grátis" → `exitGuest` (`AccountPrompt.jsx:69-72`, `AuthContext.jsx:95-98`) derruba a pessoa no **Login**, não no cadastro (`App.js:371-379`). (b) Protege favoritos, que são locais (B12). (c) No Login, "Continuar sem conta" sem borda e em `textMuted` (`LoginScreen.jsx:227-237`) contra primário preenchido; subtítulo "Entre na sua conta para continuar" afirma obrigação que a tela dispensa. (d) Onboarding em toda abertura + card "Você está como visitante" em Ajustes (`strings.js:213-214`). |
| Opt-in de notificação na abertura | Ausente | `requestPermissions` só nos toggles de Ajustes (`SettingsScreen.jsx:125-154`). |
| Banner de download na web | Presente | `SettingsScreen.jsx:225`; sem fechar (`WebDownloadBanner.jsx:27-43`); sem ação (`:17-25`). |
| Pergunta de personalização sem efeito | Presente | Passo 2 do onboarding (B3). |
| Rabo promocional no compartilhar, não avisado | Presente | Todo compartilhamento anexa "Enviado pelo APPologética ✝" (`share.js:10, :55`), sem mostrar o texto final. |

### D. Jargão e rótulos (leigo de 20 a 38 anos)
DOMÍNIO = manter com explicação; INTERFACE = trocar.
- Marca: "APPologética" nunca é explicada na superfície (só o wedge `HomeScreen.jsx:83`). "Quiz Apologético" (`strings.js:36`) → "Quiz de fé".
- INTERFACE: "Objeção do dia" (`:55`) → "Pergunta difícil do dia" ou "Alguém te diz" (já usado em `:137`); "Referências / Versículos e Referências" (`:19, :64, :35, :119`) → "Fontes"; "Ferramentas" (aba com Rosário, Exame, Plano, Quiz, Diálogo, Caderno; `ToolsScreen.jsx:16-38`) → "Praticar"; "Modo Diálogo" (`:37`) → "Treinar uma resposta"; "Trilho" (`:196-198`) → "caminho"; "Marcações / Marcar com cor" (`:30, :83, :164`) → "Grifos / Grifar"; "Falácias" (`:38-41`) → "erros de argumento"; "Glossário Teológico" (`:72`) → "Glossário"; "Capítulo em preparação" (`:163`) morto em PT; "Continue lendo" com dois significados (`:153` vs `:167`); "Ler no app / Abrir no Catecismo" (`:202, :204`; o segundo abre vatican.va externo, `RefDetailScreen.jsx:62-65`) → "Abrir na Bíblia / Ler no site do Vaticano".
- DOMÍNIO: Catecismo, deuterocanônico (`BibleScreen.jsx:728`), cânon católico, tradução Ave Maria (ambíguo com a oração), Tempo Comum/Pascal/Advento/Quaresma (nota atual não explica), Liturgia, Exame de Consciência, Santo Rosário.
- Inconsistências de nome do mesmo tema: "Sagrada Escritura" (Início) vs "A Bíblia" (Onboarding `:19`); "Moral" vs "Moral e vida" (`:20`); chave `'História'` (`OnboardingScreen.jsx:22`, 5 diálogos) vs id `'História da Igreja'` (`articleCategories.js:13`), e `category.História` não existe em `strings.js:219-224`. "Outras religiões (evangélicos, espiritismo)" (`:21`) e "Amigos evangélicos" (`:27`): evangélicos são cristãos; a descrição da categoria (`strings.js:229`) lista "Islã, espiritismo, ateísmo". "Email" (`strings.js:147`) vs "e-mail" (`LoginScreen.jsx:32, :107`).

### E. Descompasso rótulo → comportamento
| # | Rótulo | Handler | O que acontece |
|---|---|---|---|
| E2 | "Continue lendo" na Início (`ContinueReadingCard.jsx:39`) | `getLastRead()` (`:18-25`), gravado em `ArticleDetailScreen.jsx:61` ao abrir | É "reabrir o último artigo aberto", sem posição nem progresso; aparece mesmo para artigo lido até o fim. O homônimo da Bíblia (`ContinueBibleCard.jsx:26`) restaura a posição de verdade (`BibleScreen.jsx:437-448`). Mesmo rótulo, dois comportamentos. |
| E4 | "Pular" (`OnboardingScreen.jsx:162`) | `skip` (`:49-52`) → `App.js:425` AuthStack | Cai no Login, não no app. `hasSeenOnboarding` nunca é lido (`onboarding.js:6-12`). |
| E5 | "Começar" (`:166`) | `setStep(1)` | Só avança para a escolha de tema. |
| E6 | "Ver a resposta" (`:177`) | `start` (`:54-59`) → `App.js:425` | Na primeira abertura leva ao Login; a resposta só abre depois (`HomeScreen.jsx:35-41`). |
| E8 | "Criar conta grátis" (`AccountPrompt.jsx:111`) | `exitGuest` → AuthStack, rota inicial Login (`App.js:373-374`) | Cai em "Entrar", não em "Criar conta". |
| E9 | "Entre na sua conta para continuar" (`LoginScreen.jsx:68`) | n/a | A mesma tela oferece "Continuar sem conta" (`:166`). |
| E10 | Ícone `volume-high-outline` na Bíblia (`BibleScreen.jsx:815-816`) e no artigo (`ArticleDetailScreen.jsx:142`) | `toggleChapterTts` (`:570-627`) | Lê o capítulo inteiro com voz do sistema; sem rótulo visível, sem progresso. Alto-falante lê como "som ligado/desligado". |
| E11 | Estrela "Favoritar artigo" (`:159`) | `requireAccount` (`:199-214`) | Visitante recebe modal de conta para recurso local. |
| E12 | "Compartilhar artigo" (`:150`) | `shareArticle` (`share.js:54-57`) | Título + resumo + "Enviado pelo APPologética ✝", sem link (`:6`). |
| E13 | "Abrir no Catecismo" (`strings.js:204`) | `RefDetailScreen.jsx:62-65` | Abre vatican.va externamente, igual a "Abrir fonte oficial"; sugere tela interna que não existe. |
| E14 | "Toque em qualquer referência para abrir o texto completo." (`strings.js:120`) | `openReference` (`:189-192`) | Para refs não bíblicas, `text` é um trecho (`references.js:570, :581, :704`), não o documento. |
| E15 | Aba "Bíblia" com ícone `bookmark`; "Artigos" com `book` (`App.js:288-289`) | n/a | O livro está nos Artigos e o marcador na Bíblia. |
| E16 | Header "Artigo - {título}" (`:171`) | n/a | O prefixo empurra o título para a elipse: "Artigo - Deus Existe? Os ..." em `artigo-claro.png`. |
| E17 | Título do capítulo duas vezes (`BibleScreen.jsx:180`, `:805`) | n/a | "João 3" duas vezes em `biblia-capitulo-claro.png`. |
| E18 | "Toque e segure num versículo para marcar ou anotar." (`:673`) | `onLongPress` (`:861`) único acesso | A instrução só está na lista de livros; na tela do capítulo não há dica. |
| E19 | "Baixe o app" (`WebDownloadBanner.jsx:31`) | nenhum | Nada acontece. |

### F. Consistência de voz
- Você x vós x te: `strings.js:89` mistura "Esteja sempre pronto" com "vos pedir ... em vós"; "Vamos te preparar" (`OnboardingScreen.jsx:82`), "te pega" (`:97`), "Alguém te diz" (`strings.js:137`) contra o padrão dominante "você".
- Caixa alta forçada (`textTransform: 'uppercase'`), 12 pontos na superfície: `HomeScreen.jsx:210, :228`; `ContinueReadingCard.jsx:56`; `ContinueBibleCard.jsx:58`; `ArticleDetailScreen.jsx:385`; `RelatedArticles.jsx:46, :72`; `RelatedDialogues.jsx:46`; `BibleScreen.jsx:1010, :1079`; `LoginScreen.jsx:226`; `WebDownloadBanner.jsx:65`.
- Pontuação: placeholders com "..." ASCII (`strings.js:53, :13`; `BibleScreen.jsx:681`); subtítulos ora com ponto (`liturgicalSeason.js:31-35`) ora sem (`strings.js:61, :65, :67`); botões no infinitivo e um rótulo no imperativo ("Continue lendo").
- Travessões: 0 em `strings.js` e no JSX, mas 7 das 53 objeções em `src/data/dialogues.js` (`:308, :321, :334, :386, :399, :412, :425`) têm "—" e são exibidas na Início e no fim dos artigos. Hífen fazendo papel de travessão em "Artigo - {título}".
- Mesma ação, vários nomes: criar conta em 5 formas (`strings.js:145, :146, :151, :192, :214`); "Email" vs "e-mail".
- PT fixo que vaza para EN: `ImageZoomModal.jsx:236` ("Fechar"), `share.js:24`, `dialog.js:23` ("Cancelar"), `AccountPrompt.jsx:19-20`.

### G. Lacunas (copy)
App não executado (TTS, cache da Bíblia na web e Signup → Home com intenção pendente não verificados em runtime). Douay-Rheims não checada. Estação litúrgica é aproximada por design (`liturgicalSeason.js:2-3`, Natal termina em 6 de janeiro, `:56`). Signup e ForgotPassword fora. Capturas conferidas: as 10 principais em claro; passos 1-3 do onboarding, modal de conta e menu long-press descritos pelo código.

## 4. Evidência visual

Método: Playwright/Chromium headless, 390x844 @2x, `isMobile`, visitante; `getComputedStyle` de todos os elementos renderizados, fundo efetivo por `elementsFromPoint`, fonte real via CDP `CSS.getPlatformFontsForNode`. Scripts e dados brutos em `scratchpad/pw/measure.js`, `measure.json`, `probe2.json`, `probe3.json`. Layout idêntico nos dois temas. O que veio só do código está marcado INFERIDO.

### A. Escala de espaçamento observada (px)
Agregado das 5 telas: **24 valores distintos, 394 ocorrências**: `[1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 26, 28, 30, 32, 40, 60, 64]`.
| | valores | ocorrências |
|---|---|---|
| Múltiplos de 4 (11) | 4(20), 8(85), 12(36), 16(30), 20(8), 24(11), 28(3), 32(1), 40(2), 60(1), 64(1) | 198 (50%) |
| Fora da grade (13) | 1(1), 2(19), 3(16), 5(1), 6(26), 9(1), 10(48), 11(2), 13(4), **14(66)**, 18(9), 26(2), 30(1) | 196 (50%) |
Padding mais frequente empata em 8 e 14 (52 cada). Origem dos valores fora de 4: `padding: 13`/`marginBottom: 9` (`HomeScreen.jsx:191`), `paddingHorizontal: 14, paddingVertical: 12` (`:186`), `padding: 14` (`HomeScreen.jsx:181, 187, 198`; `BibleScreen.jsx:997`; `OnboardingScreen.jsx:202`), `marginTop: 1` (`HomeScreen.jsx:178`), `paddingTop: 3` no número do versículo (`BibleScreen.jsx:1054`), `paddingVertical: 2` (`ScrollHint.jsx:63`), `marginTop: 18`/`marginBottom: 14` (`MarkdownText.jsx:210-211`), `paddingHorizontal: 26` (`OnboardingScreen.jsx:223`), `padding: 24, paddingTop: 60` (`LoginScreen.jsx:180`), `paddingTop: 64` (`OnboardingScreen.jsx:188`), `top: 50, right: 20` (`AuthTopToggles.jsx:38`), `paddingBottom: 30` (`HomeScreen.jsx:166`), `marginTop: 28` (`ArticleDetailScreen.jsx:396`).
Blocos (Início, claro): hero 358x172 raio 14 padding 16; banner 358x54; busca 358x44; objeção 358x119; tiles 174x115 (`width: '48.5%'`, `HomeScreen.jsx:188`). Bíblia: header 64 + título interno "João 3" (y=70) + barra 3 px (y=106) + 1º versículo em y=125; barra prev/next 56 px em y=724; tab bar 64 px em y=780. Área útil de versículos: **615 de 844 px (73%)**. Artigo: coluna de texto 344 a 353 px (padding 20, `ArticleDetailScreen.jsx:375`).

### B. Escala tipográfica observada
**11 tamanhos de texto**: `[11, 12, 13, 14, 15, 16, 18, 20, 22, 28, 30]`, frequências 11(**47**), 12(6), 13(7), 14(17), 15(19), 16(14), 18(10), 20(2), 22(1), 28(1), 30(1). O mais frequente é 11 px (labels da tab bar, `verseNum`, kickers uppercase, contadores, créditos, hints). Ícones: 14, 15, 16, 18, 20, 22, 24, 25.
**Line-height**: só 7 valores explícitos (16, 17, 18, 19, 21, 23, 26). **91 de 133 textos (68%) têm `line-height: normal`**, incluindo todos os títulos (30, 28, 22, 20, 18) e labels. Corpo do artigo 16/26 (`MarkdownText.jsx:209-210`), versículo 15/23 com número 11/700 (`BibleScreen.jsx:1052-1057`).
**Pesos**: 400(59), 700(48), 600(18). Medido via CDP: 600 renderiza com `LiberationSans-Bold`, logo 600 e 700 são iguais neste Chromium.
**Família**: CSS `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` (padrão do react-native-web; o app não declara fonte de texto). Fonte de fato no Chromium/Linux: Liberation Sans. `document.fonts` só tem `ionicons` e `material-community`. Em iPhone/Android: SF/Roboto (INFERIDO).
Papéis: título do header 18/700 branco (`App.js:100`); labels da tab bar 11/400 (`App.js:325`); h2 do markdown 18/normal 700 (`MarkdownText.jsx:211`); título do artigo 22/normal 700 (`ArticleDetailScreen.jsx:386`); título interno da Bíblia 20/normal 700 (`BibleScreen.jsx:1047`); hero 20/700 (`HomeScreen.jsx:173`); h1 do onboarding 30/700 (`OnboardingScreen.jsx:194`); login 28/700 (`LoginScreen.jsx:182`). Piso `fs()` = `Math.max(11, ...)` (`ThemeContext.jsx:149`) faz `fs(10)` (`ContinueReadingCard.jsx:56`, `ArticleDetailScreen.jsx:382`) renderizar 11; `fs(12.5)` (`HomeScreen.jsx:203`) arredonda para 13.

### C. Cores
Paleta (`ThemeContext.jsx:6-47`): 17 chaves, 16 de cor; hex distintos: claro 13 (primary = primaryText = badgeText `#1a3a5c`; card = inputBg `#ffffff`), escuro 11.
**Renderizado, claro**: união de 14 cores (+1 no erro do login): `#1a3a5c`, `#6a6457`, `#dddddd`, `#c9a84c`, `#ffffff`, `#222222`, `#806418`, `#666666`, `#f5f0e8`, `#eef2f7`, `#ccd9e8`, e fora da paleta `#3a7d4b` (`liturgicalSeason.js:35`), `#db4437` (`LoginScreen.jsx:147`), `rgba(0,0,0,0.45)` (`ArticleDetailScreen.jsx:380`), `#c0392b` (`LoginScreen.jsx:197`). Não apareceram: `cardBorder`, `deepLinkHl`.
**Renderizado, escuro**: união de 15, com fora da paleta escura: `#ffffff` (12 textos e ícones: `headerTintColor: '#fff'` `App.js:101/145/181/214/313/356/396`, `heroTitle`/`heroWedge` `HomeScreen.jsx:173-174`, botões), **`#1a3a5c` como fundo de `html/body/#root` nos dois temas** (`public/index.html:60-64`), `#3a7d4b`, `#db4437`, `rgba(0,0,0,0.45)`.
**Literais no código da superfície** (grep em `App.js` + 5 telas): 44 linhas, 15 valores, **13 fora da paleta**: `#fff` x28, `#c9a84c` x3, `#ffffff`, `#1a3a5c`, `#1a1a1a` (`BibleScreen.jsx:873`), `#333` (`:952`), `#db4437`, `#c0392b`, `rgba(0,0,0,0.5)` (`:1072`), `rgba(0,0,0,0.45)`, e as 5 cores de marcação `#fff3a6`, `#c8f0c0`, `#c4dffb`, `#f8c4d3`, `#ffd9a8` (`BibleScreen.jsx:48-52`). Mais: `liturgicalSeason.js:31-35` (`#6b4c9a`, `#c9a84c`, `#3a7d4b`, iguais nos dois temas), `ErrorBoundary.jsx:46-51` (6 literais), `ContinueReadingCard.jsx:36`, `BibleLoadingState.jsx:77`.

### D. Raios e sombras (medido)
**7 raios renderizados**: 1, 3, 6, 9, 10, 12, 14 px (frequências 6, 4, 1, 7, 3, 17, 6). Início mistura 9 (ícones de categoria, `HomeScreen.jsx:194, 208`), 10 (busca/card, `:186, :191`), 12 (tiles/banner/objeção, `:175, :188, :213`) e 14 (hero, `:169`) na mesma dobra. Artigo: 6 (`catBadge` `:384`), 10, 12, 14. No código sem renderizar: 2, 8, 18, 19, 20, 22, 44.
**Sombras**: nenhuma definida no código das 5 telas. Únicas `box-shadow` renderizadas têm tamanho zero (`HeaderBackground` do react-navigation). Tab bar sem sombra, com `border-top: 1px`. `AccountPrompt.jsx:152-156` define sombra (modal, não medido).

### E. Contraste (WCAG 2.x, 252 amostras por tema)
**Claro, piores pares**:
| razão | elemento | cores | tela |
|---|---|---|---|
| **1.98:1** | chevron do ScrollHint "up" 16 px (`ScrollHint.jsx:53`) sobre o hero navy | `#6a6457` sobre `#1a3a5c` | Início |
| **2.29:1** | **label da aba ativa 11/400 + ícone 25 px** (`tabBarActiveTintColor: colors.accent`, `App.js:315`) sobre a tab bar branca; ícones accent em cards (`HomeScreen.jsx:107, 116`; `ArticleDetailScreen.jsx:352`) | `#c9a84c` sobre `#ffffff` | Início, Artigo, Bíblia (4 textos + 26 ícones) |
| 3.35:1 | ícone "expand" branco sobre `rgba(0,0,0,0.45)` | | Artigo |
| 4.29:1 | logo Google 20 px (`LoginScreen.jsx:147`) | `#db4437` sobre branco | Login |
| 4.93:1 | `accentText` 13/600 "Esqueci a senha", números de versículo 11/700, contadores 11 | `#806418` sobre `#f5f0e8` | Login, Bíblia, Início |
Texto primário: mínimo 10.26:1. Texto secundário: mínimo **2.29:1** (aba ativa). Textos abaixo de 4.5:1 no claro: 4 (todos o label da aba ativa). Ícones abaixo de 3:1: 27. Erro do login `#c0392b` sobre creme: 4.77:1.
**Escuro, piores pares**: **3.10:1** "Tempo Comum" 13/700 + ícone (`liturgicalSeason.js:35`, cor fixa) sobre card; 3.60:1 logo Google; 4.48:1 ScrollHint sobre hero; **4.68:1** `textSubtle` sobre card (labels das abas inativas, placeholder da busca, chevrons: 19 textos + 25 ícones); 5.46:1 `textSubtle` sobre bg. Texto primário mínimo 9.5:1. Aba ativa no escuro 8:1. Erro do login no escuro (calculado, não renderizado): 3.36:1.

### F. Checklist de estados
**Chrome**: ativo/inativo só por cor + ícone cheio/contorno (`App.js:284-290, 315-316`). **Foco: ausente no app**; o anel medido é o padrão do Chromium (`outline: auto 1px rgb(229,151,0)`). `-webkit-tap-highlight-color: transparent` (`public/index.html:49`). Botão voltar do header `aria-label="Go back"` em inglês (padrão do react-navigation), 30x30; na Bíblia o voltar custom mede 48x34 (`BibleScreen.jsx:183-193`). **Header do Artigo: `h1` ocupa x=68..314 e o botão "Ouvir artigo" x=292..314, sobreposição de 22 px** (visível em `artigo-claro.png`). Carregando global: `BrandedSplash` (`App.js:250-258`). Erro global: `ErrorBoundary.jsx:24-40`.
**Início**: vazio só no "Continue lendo" (`ContinueReadingCard.jsx:30`); carregando, erro, desabilitado ausentes; cards são `TouchableOpacity` sem `accessibilityRole` (DIV `tabindex=0` sem role, medido). Sem header (`App.js:104`).
**Artigo**: não encontrado presente (`:236-243`); carregando ausente (imagem local sem placeholder, `:44, :275`); erro ausente; sucesso: favorito troca ícone (`:161`), TTS troca ícone (`:142`), barra de progresso 3 px (`ReadingProgressBar.jsx:17-18`); desabilitado ausente; "Ampliar imagem" tem role button (`:271`).
**Bíblia**: carregando presente (`:826-827` → `BibleLoadingState.jsx:38-44`); erro presente com "Tentar novamente" (`BibleLoadingState.jsx:18-35`; `useBibleReady.js:32`); vazio presente (`:828-836`); desabilitado prev/next `opacity: 0.3` (`:902, :915, :1067`); foco: busca de livros ganha borda accent (`:77, :677, :1006`) mas `outlineStyle: 'none'` (`:1007`); sucesso: capítulo lido (`:771, :1035`), marcação com fundo e texto `#1a1a1a` (`:871-873`), destaque de deep link (`:1050`). **Título duplicado medido**: "João 3" 18/700 branco no header (`:179-181`) e "João 3" 20/700 navy em y=70 (`:806, :1047`). Alvos: "Ouvir capítulo" 32x34 (+ hitSlop 10, `:1048`), prev/next 153x35.
**Onboarding**: 4 dots 26x5 raio 3 (`:70-72, :190-191`); `chipOn` INFERIDO; carregando, erro, vazio, desabilitado ausentes; botões com role button. Alvos: "Pular" 49x44 (`minHeight: 44`, `:222`), "Começar" 140x48, pílulas 36x29 e 80x29 com `hitSlop 12` (`AuthTopToggles.jsx:16-26`).
**Login**: carregando presente (`ActivityIndicator` nos botões, `:115, :128, :144`); desabilitado `disabled={busy}` (`:114, :127, :141`) **sem estilo visual**; erro presente (`:125`, `:197`); **foco: `outlineStyle: 'none'` nos inputs (`:194`), medido `outline none`, sem borda, sem sombra: nenhum indicador de foco visível**; botões são DIV `tabindex=0` sem role. Alvos: inputs 342x48, botões 342x46 a 53, **"Esqueci a senha" 102x15**, **olho da senha 20x23** (`:96`, sem hitSlop).
`outlineStyle: 'none'` na superfície: `LoginScreen.jsx:194`, `BibleScreen.jsx:1007`. Fora: `SignupScreen.jsx:189`, `ForgotPasswordScreen.jsx:103`, `ReferencePickerModal.jsx:257, :269`, `NotebookPageScreen.jsx:193, :205`, `DebateStrategiesScreen.jsx:139`, `SearchScreen.jsx:365`, `GlossaryScreen.jsx:119` (11 no total).

### G. Materiais e movimento
Tab bar (medido): opaca, `colors.card` (`App.js:319`), `backdrop-filter: none`, `border-top: 1px` divider, sem sombra, 390x64 (`App.js:322`). Header (medido): opaco, `colors.primary`, 390x64, `border-bottom: 1px`, `backdrop-filter: none`, título 18/700 branco. Fundo de `html/body/#root`: `#1a3a5c` nos dois temas (`public/index.html:60-64`).
Animações no código da superfície: `ScrollHint.jsx:15-19` fade 220 ms + `:26-40` loop ±3 px 900+900 ms infinito (Início `HomeScreen.jsx:157-158`, Artigo `:357-358`, Bíblia `:893-894`); `AccountPrompt.jsx:59-62` fade 180 + slide 220 `Easing.out(cubic)`; `ImageZoomModal.jsx:59-182` reanimated `withTiming` sem duração (300 ms, INFERIDO); `BibleScreen.jsx:930` Modal fade; `activeOpacity 0.7` em 3 lugares, padrão 0.2 no resto (INFERIDO). Sem `LayoutAnimation`, sem reanimated nas 5 telas. **Transição entre telas do native-stack na web: sem animação** (`NativeStackView.js` não nativa, @react-navigation/native-stack 6.11.0; INFERIDO).

### H. Lacunas (visual)
Chromium/Linux com Liberation Sans (em iOS/Android muda fonte, hinting e peso 600); `insets.bottom = 0`; estados não renderizados (chip selecionado, passos 2-3, carregando/desabilitado do login, carregando/erro da Bíblia, marcação, erro no escuro); hover e pressed não medidos; contraste sobre imagem não medido; CDP de fontes amostrou ~25 nós; transição do native-stack na web inferida. Versões: @react-navigation/native 6.1.18, bottom-tabs 6.6.1, native-stack 6.11.0, elements 1.3.31, react-native-web 0.21.2, expo 54.0.34.
