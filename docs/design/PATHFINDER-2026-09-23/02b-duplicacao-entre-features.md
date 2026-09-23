# 02b. Duplicação ENTRE features (Pathfinder)

Data: 2026-09-23. Base: commit `114a08b` (HEAD, `src/` e `App.js` idênticos aos de `f00ef6d`/`d54a5f2` usados nos fluxogramas). Levantamento somente leitura: todo `arquivo:linha` foi conferido com `grep -n` / `sed -n` no código deste commit. Caminhos relativos a `src/` salvo `App.js` e `docs/`.

Método: (1) leitura de `00-features.md`, dos 12 fluxogramas em `01-flowcharts/` (seções "Duplicações observadas" e "Dependências externas") e de `DESIGN-IS-2026-09-23/01-evidence.md` §1 C e §4; (2) para cada candidato, confirmação no código e busca de locais que os fluxogramas não listaram; (3) datação pelo `git log -S` (o repositório começa em `4a0cc0f`, 2026-06-05, com 72 commits até hoje, então a maior parte da duplicação já entrou pronta e o "histórico plausível" é inferido de comentários, nomes e dos poucos commits posteriores que copiaram código).

Cada concern traz: (a) o que é, (b) todos os locais, (c) por que divergiram, (d) se a especialização é legítima ou acidental, (e) o que se perde ao unificar. A numeração é única (C1 a C37) e agrupada em Chrome, Estilo e Lógica. O ranking no fim usa os 20 mais bem pontuados.

Convenção nas tabelas: "Valores" descreve o que diverge entre cópias. Quando o fluxograma já tinha a tabela completa, ela é citada e só o que foi reconferido ou acrescentado aparece aqui.

---

## Chrome (navegação e cabeçalhos)

### C1. `screenOptions` de header copiado em 6 navigators

(a) O mesmo objeto de três linhas (`headerStyle: { backgroundColor: colors.primary }`, `headerTintColor: '#fff'`, `headerTitleStyle: { fontWeight: 'bold' }`) está escrito à mão em cada navigator, e cada função de stack chama `useTheme()` e `useLanguage()` só para montar isso e os `title: t('header.*')` (50 chamadas `t('header.` em `App.js`).

(b) Locais:

| Navigator | Linhas | Diferença |
|---|---|---|
| `HomeNav.Navigator` | `App.js:99-103` | usa `isEn` também (`:96`) para o título de `CategoryArticles` (`:114`) |
| `ToolsNav.Navigator` | `App.js:143-147` | idem (`:140`, `:153`) |
| `SettingsNav.Navigator` | `App.js:179-183` | só `t` (`:176`) |
| `ArticlesNav.Navigator` | `App.js:212-216` | só `t` (`:209`) |
| `Tab.Navigator` (`MainTabs`) | `App.js:312-314` | mesmo trio espalhado dentro de `screenOptions={({ route }) => ({...})}` junto com `tabBar*` (`:315-326`) |
| `Stack.Navigator` (`MainStack`) | `App.js:355-357` | sem `useLanguage` (`:351`), só `NoteEditor` usa header (`:362-366`) |

`'#fff'` do header também está fixo em `navTheme.colors.text` (`App.js:396`). O `BibleScreen` sobrescreve o título do tab por `navigation.setOptions` (`BibleScreen.jsx:179-182`) porque a tab `Bíblia` não tem stack (`:343`).

(c) Por que divergiram: nunca divergiram, são cópias literais. O padrão nasceu com um stack e foi colado a cada stack novo (o `ToolsStack` e a tab `Ferramentas` entraram no "Lote 4", commit `132befd` de 2026-06-05, já com a cópia). Nenhum navigator precisou de um header diferente, então nunca houve pressão para extrair.

(d) Acidental. Não existe um único navigator com header diferente, e o `Tab.Navigator` nem usa header (todas as telas de tab que têm stack passam `headerShown: false` na tab, `App.js:333-345`), então as linhas `:312-314` são código morto na prática.

(e) Nada visual se perde. Perde-se apenas a possibilidade (hoje não usada) de um stack ter header próprio, e isso volta com um `mergeOptions` se um dia for preciso.

### C2. Mesmas rotas registradas em 2 a 4 stacks (57 registros para 27 rotas) e `ArticleDetailScreen` sob dois nomes

(a) Para o "voltar" ficar dentro da aba ativa, as telas secundárias foram registradas em cada stack de tab onde poderiam ser alcançadas. Resultado: 19 rotas duplicadas, dois `options` de título repetidos com função, e a mesma tela de artigo registrada como `ArticleDetail` (ArticlesStack) e `ArticleFromSearch` (os outros três).

(b) Locais (registro por stack, conferido com `grep -n "Nav.Screen" App.js`):

| Rota | HomeStack (`:105-131`) | ToolsStack (`:149-167`) | SettingsStack (`:185-200`) | ArticlesStack (`:218-243`) | Chamadores reais |
|---|---|---|---|---|---|
| `RefDetail` | `:126` | `:163` | `:196` | `:228-232` | `ArticleDetailScreen.jsx:191`, `SearchScreen.jsx:175`, `NotebookPageScreen.jsx:120` |
| `Glossary` | `:117` | `:155` | `:187` | `:239-243` | `ToolsScreen`, `SettingsScreen` |
| `Dialogue` | `:128` | `:165` | `:200` | `:234-238` | `HomeScreen.jsx:38,107`, `ToolsScreen`, `RelatedDialogues`, `LINKING :77` |
| `ArticleFromSearch` | `:125` | `:162` | `:195` | (registrada como `ArticleDetail` `:223-227`) | 10 chamadas em 9 arquivos (C4) |
| `Favorites`, `ReadingPlan`, `Rosary`, `ExamConscience` | `:116,:118,:119,:120` | `:154,:156,:157,:158` | `:191,:188,:189,:190` | | só `ToolsScreen.jsx:17,36` e `SettingsScreen` (fluxograma 04, fato 11: Home nunca navega para elas) |
| `Today`, `Notebook`, `NotebookPage`, `Highlights`, `Notes`, `Liturgy`, `Quiz`, `DebateStrategies`, `BibleMap` | `:108-110,:121-122,:124,:127,:129-130` | `:150-152,:159-161,:164,:166-167` | | | `ToolsScreen`, `TodayScreen`, `NotebookScreen`, `HomeScreen` (Today via card) |
| `CategoryArticles` | `:111-115` (options com função) | `:153` (mesma função) | | | só `HomeScreen.jsx:60-61` |
| `Legal` | `:131` (options com função) | | `:186` (mesma função) | | só `SettingsScreen.jsx:590,600` |
| `Tools` / `ToolsMain` | `:107` | `:149` | | | nenhum `navigate('Tools')` em `src/` (fluxograma 07, item 1) |

`ArticleDetailScreen.jsx:230` faz `navigation.push(route.name, …)` justamente para funcionar sob os dois nomes. O `LINKING` nativo aponta `artigo/:articleId` para `ArticleFromSearch` no stack `Início` (`App.js:79`).

(c) Por que divergiram: a decisão de "resolver na aba ativa" está documentada no comentário de `App.js:192-199` ("Favoritos e Plano de Leitura abrem artigos via 'ArticleFromSearch'…"). Cada vez que uma tela ganhou um novo ponto de entrada em outra aba, a rota foi copiada para aquele stack. `ArticleFromSearch` nasceu como "artigo vindo da busca" e virou o nome genérico quando a busca deixou de ser a única origem (o `RefDetailScreen.jsx:15-18` conta a mesma história: o componente ainda se chama `SearchedRefScreen`).

(d) Parte legítima, parte acidental. Legítimo: o objetivo de manter a pilha dentro da aba é uma escolha de UX válida no react-navigation, e sem um stack raiz compartilhado a duplicação de registro é o mecanismo disponível. Acidental: (i) o mesmo componente sob dois nomes, (ii) `Favorites`/`ReadingPlan` no HomeStack e no SettingsStack sem chamador, (iii) `CategoryArticles` no ToolsStack sem chamador, (iv) `Tools` no HomeStack sem chamador, (v) `options` com função copiados (`:114` = `:153`, `:131` = `:186`).

(e) Ao unificar por uma lista de rotas compartilhada (`SHARED_ROUTES.map(...)` dentro de cada stack) nada se perde. Ao unificar num único stack raiz (todas as secundárias fora das tabs) perde-se o "voltar dentro da aba" e a tab bar visível nas telas secundárias, que hoje é comportamento intencional. Unificar o nome (`ArticleDetail` em todo lugar) quebra o `LINKING :79` e os 10 chamadores até serem atualizados juntos.

### C3. Contrato de `navigate('Bíblia', {...})` montado à mão em 10 chamadas (9 arquivos)

(a) A tab `Bíblia` é o único consumidor (`BibleScreen.jsx:131-149`) e lê quatro campos: `bookId`, `chapter`, `highlightVerse`, `highlightVerseEnd`. Cada chamador monta o objeto na mão, com nomes de variável diferentes e com ou sem o quarto campo.

(b) Locais:

| Chamador | Linha | Passa `highlightVerseEnd`? | Origem do intervalo |
|---|---|---|---|
| `ReferencesScreen.jsx` | `:242-247` | sim, `nav.verseEnd` | `bibleNav`/`bibleNavEn` do dado (`:150`) |
| `RefDetailScreen.jsx` | `:43-48` | sim, `nav.verseEnd` | idem (`:41`), cópia literal do anterior |
| `RosaryScreen.jsx` | `:157` | sim, `verseEndFromRef(ref)` | regex sobre a string (`verseRange.js:5-9`) |
| `BibleMapScreen.jsx` | `:32-37` | sim, `verseEndFromRef(ref)` | idem, e fecha o modal antes (`:31`) |
| `LiturgyScreen.jsx` | `:260-262` | sim, `nav.verseEnd` | `parseReadingRef` (`:43-48`) que chama `verseEndFromRef` (`:47`) |
| `HighlightsScreen.jsx` | `:40-44` | não | marcação tem um só verso |
| `NotebookPageScreen.jsx` | `:116` | não | token `v:book/ch/vs` (`NotebookText.jsx:11`) |
| `SearchScreen.jsx` | `:149`, `:171` | não | versículo curado e resultado da Bíblia |
| `TodayScreen.jsx` | `:44-45` | não | `VerseOfDayCard` (`:33`) |

O deep link nativo cobre só `bookId`/`chapter` (`App.js:84`). A tela limpa os quatro params depois de consumir (`BibleScreen.jsx:146`).

(c) Por que divergiram: o quarto campo (`highlightVerseEnd`) foi acrescentado depois para destacar intervalos (o comentário de `verseRange.js:1-4` explica) e só os chamadores que tinham intervalo foram atualizados. Os chamadores de verso único ficaram como estavam, o que é correto, mas deixou dois "formatos" do mesmo contrato sem um lugar que os declare.

(d) Legítima na intenção (alguns destinos não têm intervalo), acidental na forma (cada tela conhece a chave de rota `'Bíblia'` e os nomes dos quatro params). O que é especialização de verdade cabe num parâmetro opcional.

(e) Nada se perde com um `openInBible(navigation, { bookId, chapter, verse, verseEnd })` em `utils/`: o objeto é o mesmo. O único cuidado é o `BibleMapScreen.jsx:31` que fecha o modal antes de navegar (fica no chamador).

### C4. `navigate('ArticleFromSearch', { articleId })` em 9 arquivos, `'ArticleDetail'` em 1, `'RefDetail'` em 3

(a) Mesmo problema do C3, para artigos e referências: cada tela conhece o nome de rota e o formato do param, e o nome muda conforme a aba de origem.

(b) Locais:

| Rota | Chamadas |
|---|---|
| `ArticleFromSearch` | `HomeScreen.jsx:56`, `SearchScreen.jsx:146,:167`, `DialogueScreen.jsx:131`, `QuizScreen.jsx:214`, `ExamConscienceScreen.jsx:42` (id fixo 83), `NotebookPageScreen.jsx:118`, `CategoryArticlesScreen.jsx:54`, `FavoritesScreen.jsx:68`, `ReadingPlanScreen.jsx:119` (com `fromPlanDay`/`fromPlanTrack`) |
| `ArticleDetail` | `ArticlesScreen.jsx:27,:93` |
| `push(route.name)` | `ArticleDetailScreen.jsx:230` ("Ver também") |
| `RefDetail` | `ArticleDetailScreen.jsx:191`, `SearchScreen.jsx:175`, `NotebookPageScreen.jsx:120` |

(c) Por que divergiram: consequência direta do C2. `ArticlesScreen` está no único stack que registra `ArticleDetail`, todo o resto usa `ArticleFromSearch`. O `push(route.name)` é a gambiarra que faz o detalhe funcionar sob os dois nomes.

(d) Acidental. O param extra do plano (`ReadingPlanScreen.jsx:119`) é a única especialização real e cabe como campo opcional.

(e) Nada se perde com `openArticle(navigation, id, extra?)`. Se C2 for resolvido (um nome só), este concern desaparece junto.

---

## Estilo (tokens, componentes visuais, primitivas)

### C5. `makeStyles(c, fs)` por arquivo (48 definições) sem escala compartilhada

(a) Não existe módulo de tokens de espaçamento, raio ou tipografia. Cada arquivo define um `makeStyles` local e escolhe números soltos. Três assinaturas divergentes: `HomeScreen.jsx:165` (`c, fs, topInset = 0`), `BibleLoadingState.jsx:47` (`c, fs, compacto`), `AccountPrompt.jsx:132` (`c, fs, darkMode`).

(b) Locais e dispersão (grep em `src/`):

| Medida | Valores distintos | Frequência (top) | Onde a dispersão é visível |
|---|---|---|---|
| `borderRadius` | 20 (2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 19, 20, 26, 32, 44) | 12 (61x), 10 (51x), 8 (13x), 18 (9x), 6 (8x), 9 (6x), 14 (5x) | Home mistura 9/10/12/14 na primeira dobra (`HomeScreen.jsx:169,:186,:191,:194,:208,:213`) |
| `fontSize: fs(n)` | 17 (9 a 30, incluindo 12.5 em `HomeScreen.jsx:203`) | 13 (70x), 15 (62x), 14 (56x), 11 (53x), 12 (47x) | piso `fs()` de 11 faz `fs(9)` e `fs(10)` (15 usos) renderizarem 11 (`ThemeContext.jsx:149`) |
| `fontSize` cru (sem `fs`) | `App.js:269,:271,:278,:325`, `ErrorBoundary.jsx:47-51`, `ShareVerseCard.jsx:37-48`, `DialogueAnswerCard.jsx:31-38`, `ImageZoomModal.jsx:261` | | splash, erro e cards de imagem ignoram a escala de fonte do usuário |
| `padding` | 21 valores (evidência §1 E), 50% fora da grade de 4 | 14 (66 ocorrências medidas), 13 (Home/Tools/Continue*) | `padding: 13` em `HomeScreen.jsx:213`, `ToolsScreen.jsx:132`, `ContinueReadingCard.jsx:50`, `ContinueBibleCard.jsx:48`, `SaintTodayCard.jsx:45`, `ReadingPlanScreen.jsx:176` |
| `letterSpacing` | 6 (0.3, 0.5, 0.8, 1, 2, 3) | 1 (26x), 0.5 (15x) | C10 |
| `activeOpacity` | 0.7 (8x), 0.85 (2x), 1 (1x), padrão 0.2 no resto | | pressed state inconsistente |

Os 48 arquivos com `makeStyles` são todas as telas de `src/screens/` e os componentes com tema, exceto `ScrollHint.jsx` e `CrossMark.jsx` (estilo inline) e os três de estilo estático (`ErrorBoundary`, `ShareVerseCard`, `DialogueAnswerCard`, `ReadingProgressBar`).

(c) Por que divergiram: o padrão `makeStyles(colors, fs)` resolveu tema e escala de fonte cedo (já está no commit inicial), mas parou aí: nunca existiu um `tokens.js` de espaçamento/raio. Cada tela nova copiou os números da tela vizinha, com pequenos ajustes ("13 em vez de 14"), e as três assinaturas extras foram remendos locais (inset da Home, variante compacta do loading, sombra do modal por tema).

(d) Acidental na dispersão (20 raios e 17 tamanhos não expressam 20 intenções). Legítima em parte: `fs()` como função de escala é uma boa decisão e deve ficar, e as variantes `compacto`/`darkMode` são parâmetros reais de componente, só estão no lugar errado (poderiam ser props resolvidas antes do `makeStyles`).

(e) Ao introduzir `tokens` (`space`, `radius`, `type`) nada funcional se perde, mas cada arquivo precisa ser tocado. Perde-se a liberdade de "13 aqui, 14 ali", que hoje ninguém defende. Risco real: o piso de 11 px do `fs()` mascara `fs(9)`/`fs(10)`; ao normalizar para um tamanho mínimo real (11 ou 12) os kickers ficam 1 px maiores do que o código diz hoje.

### C6. Card de navegação "caixa de ícone + rótulo + subtítulo + chevron"

(a) A affordance "toque aqui para abrir" é sempre a mesma linha (ícone numa caixa à esquerda, um ou dois textos, `chevron-forward` à direita), reimplementada com números diferentes em cada lugar.

(b) Locais (JSX e estilo):

| Tela / componente | JSX | Estilo do card | Caixa do ícone | Chevron | Filete |
|---|---|---|---|---|---|
| `HomeScreen.jsx` (Referências) | `:148-157` | `:211-214` r10 p13 mb9 gap12 | `:215-218` 40 r9 `badgeBg` | 18 `textSubtle` | não |
| `HomeScreen.jsx` (tile de categoria) | `:128-142` | `:187-194` r12 p14 | `:205-208` 40 r9 `badgeBg` + mb10 | não | não |
| `ToolsScreen.jsx` (`renderCard`) | `:56-71` | `:130-133` r10 p13 mb9 gap12 (igual à Home) | `:134-137` 40 r9 | `:69` 18 `textSubtle` | não |
| `ToolsScreen.jsx` (`renderStudyCard`) | `:74-97` | mesmos estilos | idem | `:97` 18 | não |
| `QuizScreen.jsx` (menu) | `:53-66` | `:393-396` | `:397` 48 r12 `badgeBg` | `:65` 18 | não |
| `SettingsScreen.jsx` (`row`) | 12 usos: `:256,:395,:415,:433,:451,:470,:497,:503,:547,:574,:589,:599` | `:815-818` r12 p16 mb8, ícone 22 solto (sem caixa) | não | `:250,:345,:596,:606` 18 | não |
| `ContinueReadingCard.jsx` | `:34-44` | `:49-53` r12 p13 mb12 | `:55` 36 r18 `accent` | `:42` 18 | 3 `accent` |
| `ContinueBibleCard.jsx` | `:15-40` | `:46-51` r12 p13 mh16 mb12 | `:52-55` 36 r18 `accent` | `:39` 18 | 3 `accent` |
| `SaintTodayCard.jsx` | `:25-37` | `:40-49` r12 p13 mb12 | `:50` 36 r9 `primary` | não | 3 `primary` |
| `LiturgyCard.jsx` | `:28-75` | `:80-86` r12 p12 mb10 | `:88-92` 38 r9 `badgeBg` | `:72` 18 | 4 (cor litúrgica) |
| `NewsCard.jsx` | `:119-160` | `:179-182` r12 p12 mb10 | `:184-187` 38 r9 `badgeBg` | `:156` 20 `#fff` | 4 `accent` |
| `VerseOfDayCard.jsx` | `:36-62` | `:74-80` r12 p14 mb10 | `:83-90` 26 r13 `badgeBg` | não | 4 `accent` |
| `SearchScreen.jsx` (card de resultado) | `:185-245` | `:388-391` r12 p14 mb8 gap12 | `:392-395` 40 r10 `badgeBg` | não | não |
| `BibleScreen.jsx` (`bookRow`) | `:718-731` | `:1012-1015` r10 p12 mb6 gap12 | `:1016-1019` 44 r10 `primary` (abreviação) | `:731` 18 | não |
| `BibleMapScreen.jsx` (`listRow`) | `:127-146` | `:259-262` r8 p10 mb4 gap12 | `:265` 28 r14 número | `:145` 16 | não |
| `DialogueScreen.jsx` (lista) | `:195-198` | `:217-220` r10 p14 mb8 | não | `:197` 18 | não |
| `OnboardingScreen.jsx` (`rowChip`) | `:128-137` | `:210-214` r12 ph16 minH56 | ícone solto | `:135` 18 | não |
| `SectionBanner.jsx` (cabeçalho de lista, não navega) | `:9-24` | `:28-37` sem raio, borda inferior | `:38-41` 46 r11 `badgeBg` | não | não |

Total: 18 implementações, caixa de ícone em 8 tamanhos (26, 28, 36, 38, 40, 44, 46, 48) e 6 raios (9, 10, 11, 12, 13, 14, 18), chevron em 3 tamanhos e 3 cores. A evidência §1 C.8-9 já mediu 12 delas na superfície.

(c) Por que divergiram: cada card nasceu junto com a tela ou com o "card do dia" que o exigia (Saint/Liturgy/News/Verse são de F8, os Continue* de F3/F6, o hub de F7). O `ContinueBibleCard` foi copiado do `ContinueReadingCard` em `60e81eb` (2026-09-08) e ganhou barra e stats. O `SettingsScreen` usa uma "linha de ajuste" (sem caixa, com `Switch` à direita em 5 delas), que é uma família própria mas repete o mesmo trio. Nunca houve um `<NavCard>` porque o primeiro card foi escrito inline na Home e o segundo (Tools) copiou os estilos com os mesmos números, o que dá a impressão de consistência sem componente.

(d) Acidental na maior parte. Especializações legítimas: (i) linha de Ajustes com `Switch` (é um controle, não uma navegação); (ii) `ContinueBibleCard` com progresso; (iii) `bookRow` da Bíblia com abreviação em vez de ícone; (iv) `NewsCard` com imagem; (v) `SectionBanner` que é cabeçalho e não card. Tudo isso cabe em variantes (`leading`, `trailing`, `progress`) de um único componente. O que não é legítimo: 8 tamanhos de caixa e 6 raios para o mesmo desenho.

(e) Ao unificar num `<Row>`/`<NavCard>` com slots, perde-se o ajuste fino por tela (o `padding: 13` da Home vs `16` dos Ajustes), que é exatamente o que o redesign quer eliminar. Risco: `SettingsScreen` tem 12 linhas e o `Switch` precisa continuar acessível (o `accessibilityRole` já falta em vários cards, evidência §1 D).

### C7. Card de item de conteúdo (artigo, referência, glossário, debate, notas) sem componente

(a) Distinto do C6: aqui o card mostra conteúdo (título + resumo, ou termo + definição) e pode ser navegável ou expansível. Seis telas de artigo e sete de outros conteúdos, cada uma com o próprio `card`.

(b) Locais (a tabela do fluxograma 04, item 2, cobre as de artigo; abaixo o conjunto reconferido e ampliado):

| Tela | Estilo `card` | Título | Expansível? | Chevron |
|---|---|---|---|---|
| `ArticlesScreen.jsx:114-119` | r12 p16 mt12, `itemWrap` ph16 | fs16 bold (`:121`) | não | 16 `textSubtle` (`:97`) |
| `CategoryArticlesScreen.jsx:71-76` | r12 p16 mb12 | fs16 bold mb4 (`:77`) | não | nenhum |
| `FavoritesScreen.jsx:91-94` | row r12 p14 mb8 gap12 | fs14 600 (`:96`) | não | 16 (`:76`) |
| `ReadingPlanScreen.jsx:176` | row r12 p13 mb8 gap12, `cardDone` opacity .7 | fs14 600 lh18 (`:183`) | não | 16 (`:146`) |
| `RelatedArticles.jsx:51-61` | row r10 p12 mb8 borda 1 `divider` gap10 | fs13 600 lh18 (`:75-81`) | não | 16 `accent` (`:33`) |
| `RelatedDialogues.jsx:51-61` | idêntico ao anterior | | não | 16 `accent` (`:33`) |
| `SearchScreen.jsx:388-391` | row r12 p14 mb8 gap12 | fs15 600 (`:400`) | não | nenhum |
| `ReferencesScreen.jsx:318-323` | r12 p16, `cardOpen` borda `accent` | `cardRef` fs15 bold (`:327`) | sim (`expanded`) | nenhum |
| `RefDetailScreen.jsx:158-164` | r12 p16 borda `accent` sempre | idem (fluxograma 05, item 2: `makeStyles` quase idênticos entre as duas) | não | nenhum |
| `GlossaryScreen.jsx:120-121` | r12 p14 mb8, `cardOpen` borda `accent` | `term` fs15 bold (`:123`) | sim (`:90`) | chevron-down/up |
| `DebateStrategiesScreen.jsx:148-149` | idêntico ao Glossário | `name` fs15 bold (`:151`) | sim (`:97`) | chevron-down/up |
| `ExamConscienceScreen.jsx:94-95` | r12 mb8, `cardOpen` borda `accent`, `cardHead` p14 | fs14 600 (`:98`) | sim (`:57`) | |
| `HighlightsScreen.jsx:160-167` | row r12 p12 mb8 + `colorBar` 6 px | `ref` fs14 bold | não | share |
| `NotesScreen.jsx:110` | r12 p14 mb8 | `ref` fs13 bold `accentText` | não | |
| `NotebookScreen.jsx:123` | r12 p14 mb8 | fs15 bold | não | |
| `DialogueScreen.jsx:217-220` (lista) | row r10 p14 mb8 | `cardText` | não | 18 |
| `RosaryScreen.jsx:502` | r12 p12 mb8, `cardActive` | | não | |

Padrão `expanded = isOpen ? null : id` copiado em `DebateStrategiesScreen.jsx:97`, `GlossaryScreen.jsx:90`, `ExamConscienceScreen.jsx:57`.

(c) Por que divergiram: mesma dinâmica do C6, uma tela por vez. As de artigo divergem em `padding` (12/13/14/16), `marginTop` vs `marginBottom`, presença de chevron e tamanho do título (13/14/15/16), sem que nenhuma diferença corresponda a um contexto diferente. As expansíveis (Glossário, Debate, Exame) são cópias visíveis entre si (o fluxograma 07, item 2, já registra o mesmo JSX).

(d) Acidental. Legítimo apenas: (i) o `colorBar` das marcações (cor do destaque), (ii) a borda permanente do detalhe de referência (é uma tela de um só item), (iii) `cardDone` do plano. São variantes, não componentes.

(e) Um `<ContentCard>` com `title`, `meta`, `body`, `expanded?`, `onPress?` cobre tudo. Perde-se a possibilidade de `ArticlesScreen` usar `marginTop` + `itemWrap` (arranjo de sticky headers), que precisa ser reproduzido pelo `contentContainerStyle`.

### C8. Filete lateral (`borderLeftWidth`) como marcador de "destaque" em 23 lugares, com 3 larguras

(a) A borda esquerda colorida é usada para "card em evidência" (Continue lendo, cards do dia, intro de ferramenta, citação de Markdown, versículo alcançado por deep link, aviso de tradução).

(b) Locais:

| Largura | Onde |
|---|---|
| 3 | `ContinueReadingCard.jsx:52`, `ContinueBibleCard.jsx:49`, `SaintTodayCard.jsx:47`, `RefSourceBlock.jsx:79`, `MarkdownText.jsx:213` (citação), `WebDownloadBanner.jsx:53`, `RefDetailScreen.jsx:185`, `ReferencesScreen.jsx:338`, `BibleScreen.jsx:1050` (`verseRowDeepLink`), `DialogueScreen.jsx:225` (`objBox`), `QuizScreen.jsx:419` (`explainBox`), `ArticleDetailScreen.jsx:391` (`translationNotice`), `ExamConscienceScreen.jsx:88`, `BibleMapScreen.jsx:233`, `RosaryScreen.jsx:493` (as três `intro`), `OnboardingScreen.jsx:197` (`verseBox`) |
| 4 | `HomeScreen.jsx:178` (`seasonBanner`), `:223` (objeção), `VerseOfDayCard.jsx:79`, `LiturgyCard.jsx:85`, `NewsCard.jsx:181` |
| 6 | `LiturgyScreen.jsx:407` (`headerCard`) |

Cores: `accent` na maioria, `primary` no santo (`SaintTodayCard.jsx:48`), cor litúrgica dinâmica em `LiturgyCard` e `LiturgyScreen`, cor da estação em `HomeScreen.jsx:91`.

(c) Por que divergiram: o filete começou como detalhe dos cards de F8 (4 px) e do "Continue lendo" (3 px), e cada nova caixa de introdução (`intro` em três ferramentas, `explainBox`, `objBox`) copiou o de 3 px. A `LiturgyScreen` escolheu 6 px para o cabeçalho com a cor do dia, por ser um bloco maior.

(d) Acidental na largura (3 vs 4 não expressa hierarquia: a Home usa 4 no banner e 3 nos Continue, lado a lado). Legítima na cor dinâmica (litúrgica e da estação), que é conteúdo e deve continuar sendo prop.

(e) Nada se perde com um token `accentBar: 3` (ou 4) e um estilo compartilhado `accentLeft(color)`. O `LiturgyScreen.jsx:407` de 6 px fica como exceção declarada ou cai para o padrão.

### C9. Cabeçalhos de seção em 8 tratamentos

(a) O "título de seção dentro de uma tela" existe em duas famílias (título forte `primaryText` 16 e kicker uppercase `textSubtle` 12/13) mais variações soltas, sem componente.

(b) Locais:

| Família | Onde | Valores |
|---|---|---|
| Forte, 16 bold `primaryText` | `HomeScreen.jsx:196` (mb10 mt0), `ToolsScreen.jsx:129` (mb10 mt18) | iguais salvo `marginTop` |
| Uppercase 13 `textSubtle` ls1 | `BibleScreen.jsx:1008-1011` (mt16 mb8), `SettingsScreen.jsx:810-813` (mt16 mb8 ph4), `BibleMapScreen.jsx:258` (mt12 mb8) | quase iguais |
| Uppercase 12 `textSubtle` ls1 | `BibleScreen.jsx:1079` (`modalSection`, mb10), `SearchScreen.jsx:383-386` (mt8 mb8), `DialogueScreen.jsx:216` (mb8 mt4), `LiturgyScreen.jsx:420` (sem margem) | |
| Uppercase 11 `textSubtle` ls1 centrado | `RelatedArticles.jsx:43-50`, `RelatedDialogues.jsx:43-50` (mb10, `textAlign: 'center'`) | |
| Uppercase 13 `textSubtle` ls0.5 | `TodayScreen.jsx:88-91` (`dateLabel`, mb12) | |
| Uppercase 13 `accentText` ls0.5 | `RosaryScreen.jsx:515` (`prayerTitle`, mb8) | cor diferente |
| Forte 15 bold `primaryText` | `ArticleDetailScreen.jsx:395` (`refTitle`, mb4), `LegalScreen.jsx:156` (mb6) | |
| Forte 22 bold centrado | `OnboardingScreen.jsx:194` (`h2`) | |
| Markdown `h2` 18 bold | `MarkdownText.jsx:211` | |

(c) Por que divergiram: as telas de lista (Bíblia, Ajustes, Busca, Diálogo, Mapa) convergiram sozinhas para o kicker uppercase `textSubtle`, mas cada uma escolheu 11, 12 ou 13 e uma margem. Home e Tools ficaram com o título forte porque são hubs. `RelatedArticles` centralizou porque fica ao fim do artigo.

(d) Acidental. Duas famílias fazem sentido (título de bloco vs rótulo de grupo de lista); oito não. A centralização de `Related*` é a única especialização de layout com motivo.

(e) Nada se perde com `<SectionTitle variant="strong" | "label">`. Perde-se a margem sob medida de cada tela, que cabe no `style` externo.

### C10. Kickers/eyebrows uppercase: 43 definições, 5 tamanhos, 6 espaçamentos, 4 cores

(a) O rótulo pequeno em caixa alta acima de um título (o "eyebrow") é o padrão tipográfico mais repetido do app e o menos padronizado.

(b) Locais (`grep -rn "textTransform: 'uppercase'" src`, 43 linhas): combinações observadas

| fs | ls | cor | Onde (amostra completa por combinação) |
|---|---|---|---|
| 10 | 1 | `accentText` bold | `ContinueReadingCard.jsx:56`, `ContinueBibleCard.jsx:56-59`, `SaintTodayCard.jsx:51`, `SearchScreen.jsx:398` (`cardCategory`) |
| 10 | 0.5 | `accentText` bold | `SectionBanner.jsx:44`, `FavoritesScreen.jsx:95`, `RosaryScreen.jsx:520` (`textSubtle`) |
| 10 | 0.3 | `accentText` bold | `RelatedArticles.jsx:72` (`category`) |
| 11 | 1 | `textSubtle` bold | `LiturgyCard.jsx:93`, `NewsCard.jsx:188`, `VerseOfDayCard.jsx:95`, `RelatedArticles.jsx:46`, `RelatedDialogues.jsx:46`, `RefSourceBlock.jsx:88` (`accent` 700), `DialogueScreen.jsx:228`, `LoginScreen.jsx:226`, `BibleMapScreen.jsx:240`, `ReferencePickerModal.jsx:265`, `LiturgyScreen.jsx:441` |
| 11 | 0.5 | `accentText` bold | `HomeScreen.jsx:210`, `ArticleDetailScreen.jsx:385`, `ReadingPlanScreen.jsx:181`, `ExamConscienceScreen.jsx:97`, `QuizScreen.jsx:408`, `DebateStrategiesScreen.jsx:159` (`textSubtle`), `SearchScreen.jsx:345`, `NewsCard.jsx:197` (`accent`) |
| 12 | 1 | `textSubtle` bold | `BibleScreen.jsx:1079`, `SearchScreen.jsx:385`, `DialogueScreen.jsx:216`, `LiturgyScreen.jsx:420`, `DialogueScreen.jsx:240`, `HomeScreen.jsx:228` (0.5) |
| 12 | 0.5 | `accentText` | `RosaryScreen.jsx:501` |
| 13 | 1 | `textSubtle` bold | `BibleScreen.jsx:1010`, `SettingsScreen.jsx:812`, `BibleMapScreen.jsx:258`, `RosaryScreen.jsx:515` (`accentText` 0.5), `TodayScreen.jsx:90` (0.5) |
| 9 | | `textSubtle` | `WebDownloadBanner.jsx:65` |
| 26 | 3 | `#c9a84c` | `DialogueAnswerCard.jsx:31` (card de imagem, escala própria) |

`letterSpacing` global: 1 (26x), 0.5 (15x), 2 (2x), 0.3 (2x), 3 (1x), 0.8 (1x). Cor: `accentText` quando o rótulo é "categoria/dia/continuar" (informação), `textSubtle` quando é "seção" (estrutura), mas com exceções nos dois sentidos (`SearchScreen.jsx:398` vs `:385`, `RosaryScreen.jsx:520`).

(c) Por que divergiram: sem token de tipografia, cada autor "ajustou no olho". A regra implícita (accent para conteúdo, subtle para estrutura) existe, mas nunca foi escrita, então metade das cópias errou.

(d) Acidental. Existem no máximo duas intenções (rótulo de conteúdo e rótulo de estrutura) e talvez uma terceira (contador). O `DialogueAnswerCard` é escala de imagem 1080 px, legítimo.

(e) Nada se perde com dois tokens (`type.eyebrow`, `type.eyebrowMuted`). Ao consolidar em fs(11) (o piso do `fs()`) os `fs(10)` de hoje não mudam de tamanho renderizado.

### C11. Campos de busca: 7 `TextInput` + 1 barra falsa, 5 estilos de caixa, 3 botões de limpar, 11 hacks de outline

(a) O fluxograma 09 tem a tabela completa (comportamento, placeholder, normalização). Aqui entra o que importa ao redesign: as caixas e o botão limpar são cópias com números diferentes, e o supressor de outline da web está em 11 inputs (não só nos de busca).

(b) Locais:

| Onde | JSX | Estilo da caixa | Input | Limpar |
|---|---|---|---|---|
| `HomeScreen.jsx` (falsa) | `:97-100` | `:190-194` r10 ph14 pv12, sem foco | `Text` fs14 (`:195`) | não |
| `SearchScreen.jsx` | `:249-271` | `:350-356` r12 minH52 m16 ph14 borda 1.5 | `:358-366` fs15 pv12 | `:262-271` com `accessibilityRole`, `accessibilityLabel`, `hitSlop` |
| `BibleScreen.jsx` | `:677-688` | `:1000-1005` r10 mh16 mb8 ph12 borda 1.5, sem `gap` | `:1007` h42 fs15 | não |
| `GlossaryScreen.jsx` | `:51-68` | `:112-117` r12 minH48 m16 ph14 borda 1.5 | `:119` fs14 pv10 | `:63-67` sem a11y |
| `DebateStrategiesScreen.jsx` | `:44-61` | `:132-137` idem + mb8 | `:139` idem | `:56-60` sem a11y |
| `ReferencePickerModal.jsx` (3 abas) | `:135-141`, `:157-163`, `:182-188` | `:254-258` r10 h46 sem ícone, sem foco | | não |

Ícone `search-outline` 18 em Home/Bíblia/Glossário/Debate, 20 na Busca (`SearchScreen.jsx:250`). Hack `outlineStyle: 'none'` (web): `SearchScreen.jsx:365`, `GlossaryScreen.jsx:119`, `DebateStrategiesScreen.jsx:139`, `BibleScreen.jsx:1007`, `ReferencePickerModal.jsx:257,:269`, `NotebookPageScreen.jsx:193,:205`, `LoginScreen.jsx:194`, `SignupScreen.jsx:189`, `ForgotPasswordScreen.jsx:103`. Só a Busca global tem foco visível na caixa e nenhum input tem foco visível no próprio campo (evidência §4 F).

(c) Por que divergiram: Glossário e Debate são cópia um do outro (fluxograma 07, item 2); a Bíblia tem o filtro de livros mais antigo (sem `gap`, altura fixa); a Busca global foi a mais trabalhada (a11y, `autoFocus`) e não voltou para as outras. O hack de outline foi colado em cada `TextInput` conforme o problema aparecia na web.

(d) Acidental nas caixas e no botão limpar. Legítima na Home (é um botão que parece campo, decisão de UX declarada no `TouchableOpacity`) e no `ReferencePickerModal` (três inputs num modal denso, sem ícone). O comportamento de busca (Fuse vs substring, `norm()` só em `bibleApi.js:93-95`) é outro concern, fora do escopo visual.

(e) Um `<SearchField>` (ícone, input, limpar com a11y, foco) elimina 5 caixas e 11 hacks. Perde-se o `autoFocus` só da Busca (vira prop) e a altura 42 da Bíblia (some).

### C12. Botões primários, secundários e de "tentar de novo": 15 estilos, 2 cores de fundo, 4 alturas

(a) Não existe `<Button>`. O botão de ação principal aparece com fundo `primary` (navy) nas telas de auth/onboarding/loading e com fundo `accent` (dourado) nos modais, gates e retries, com raios 10/12 e `paddingVertical` 10/11/12/14.

(b) Locais:

| Onde | Estilo | Fundo | Raio | pv | Texto |
|---|---|---|---|---|---|
| `LoginScreen.jsx:203-210` | `primaryBtn` | `c.primary` | 12 | 14 | `#fff` 16 bold |
| `SignupScreen.jsx:195-202` | `primaryBtn` | `c.primary` | 12 | 14 | idem (+ mt12) |
| `ForgotPasswordScreen.jsx:105-112` | `primaryBtn` | `c.primary` | 12 | 14 | idem |
| `OnboardingScreen.jsx:223-224` | `primaryBtn` | `c.primary` | 12 | 14, ph26, minH48 | `#fff` 15 bold |
| `BibleLoadingState.jsx:70-77` | `botao` | `c.primary` | 10 | 11, ph22 | `#fff` 14 bold |
| `AccountPrompt.jsx:187-201` | `btnPrimary` | `c.accent` | 10 | 14 | `#1a3a5c` 15 bold (literal) |
| `HighlightsScreen.jsx:76-80`, `NotesScreen.jsx:56-60`, `NotebookScreen.jsx:59-63` | inline | `colors.accent` | 10 | 12, ph24 | `#fff` 14 bold |
| `LiturgyScreen.jsx:400-401` | `retryBtn` | `c.accent` | 10 | 10, ph18 | `#fff` 14 bold |
| `ErrorBoundary.jsx:50-51` | `btn` | `#c9a84c` | 10 | 12, ph24 | `#1a3a5c` 15 bold |
| `QuizScreen.jsx:425-429`, `DialogueScreen.jsx:243-247` | `nextBtn` | `c.primary` | 10 | 14 | `#fff` 15 bold |
| `ReferencesScreen.jsx:365`, `RefDetailScreen.jsx:212` | `actionBtnPrimary` | `c.accent` | 8 | | `#fff` 13 600 |
| `SearchScreen.jsx:370-380` | `suggestionBtn` | `c.card` borda `accent` | 12 | 14 | |
| Secundários: `LoginScreen.jsx:227-236` (`guestBtn`, sem fundo), `:238-250` (`googleBtn`, `card` + borda), `SignupScreen.jsx:207-218` (`googleBtn` igual), `AccountPrompt.jsx:202-210` (`btnSecondary`), `OnboardingScreen.jsx:222` (`skip`), `ExamConscienceScreen.jsx:92` (`learnBtn`), `DialogueScreen.jsx:258-260` (`readBtn` borda `accent`) | | | | | |

Texto `'#fff'` fixo em todos os primários e `#1a3a5c` literal em dois (contraste `#fff` sobre `accent` é 2.29:1, evidência §4 E, e `#1a3a5c` sobre `accent` é o par correto).

(c) Por que divergiram: a família "navy" é das telas de auth (escritas juntas, mesmo autor, mesmo estilo); a família "dourado" é dos gates e modais posteriores (`AccountPrompt`, gates das telas de dados), que escolheram o accent por ser "chamada". `ErrorBoundary` fica acima do tema e copiou as cores da marca. Os gates inline das três telas de dados são cópia literal entre si.

(d) Acidental na forma (15 estilos), mas há uma escolha semântica não resolvida: primário = navy ou dourado? Hoje as duas coexistem sem regra. Especialização legítima: `googleBtn` (marca de terceiro), `suggestionBtn` (é um card-sugestão), `skip` (texto).

(e) Ao criar `<Button variant="primary|secondary|ghost">` perde-se a decisão local de cor, que precisa ser tomada uma vez (o par dourado + texto navy é o único que passa contraste). O `ErrorBoundary` não pode usar o tema (está acima do provider) e precisará de uma versão estática.

### C13. Bloco de marca em 4 telas (+2 cards de imagem +1 erro) e cores da marca como literais

(a) "Cruz + APPologética + versículo" aparece com quatro tamanhos de cruz e três de título, e as cores `#1a3a5c`/`#c9a84c` estão fixas em 8 + 15 ocorrências fora do `ThemeContext`.

(b) Locais:

| Onde | Cruz | Título | Versículo/wedge | Tema |
|---|---|---|---|---|
| `App.js:250-284` (`BrandedSplash`) | `✝` em `Text` 72 (`:269`) | 30 `#ffffff` (`:270-276`) | "1 Pedro 3,15" 13 (`:277-282`) | fixo `#1a3a5c` (`:266`) |
| `HomeScreen.jsx:80-86` + `:169-176` | `CrossMark` fs(34) | 20 `#fff` | wedge inline PT/EN + `t('home.hero.verse')` | `c.primary` |
| `LoginScreen.jsx:64-68` + `:182` | `CrossMark` fs(54) | 28 `primaryText` | `t('auth.subtitle')` | tema |
| `OnboardingScreen.jsx:77-91` + `:193-199` | `CrossMark` fs(64) | h1 30 | verso 1 Pedro 3,15-16 inline (redação diferente de `strings.js:89-90`) | tema |
| `ShareVerseCard.jsx:30-49` | `✝` 110 | brand 28 ls2 | | fixo |
| `DialogueAnswerCard.jsx:28-39` | `✝` 34 | brand 30 ls2 | | fixo |
| `ErrorBoundary.jsx:44-51` | | 22 `#fff` | | fixo |
| `SettingsScreen.jsx:612` (`aboutTitle`), `App.js:421` (`document.title`) | | | | |

Literais: `#1a3a5c` em `App.js:266`, `AccountPrompt.jsx:110,:198`, `DialogueAnswerCard.jsx:29`, `ErrorBoundary.jsx:46,:51`, `ShareVerseCard.jsx:32`, `DialogueScreen.jsx:239`; `#c9a84c` em `App.js:256,:269,:279`, `DialogueAnswerCard.jsx:31,:37,:38`, `ErrorBoundary.jsx:48,:50`, `ShareVerseCard.jsx:37,:46,:48`, `RosaryScreen.jsx:329`, `liturgyApi.js:75`, `liturgicalSeason.js:32,:34`. Mais `app.json:12,:21,:31` e `public/index.html:60-64` (fundo `#1a3a5c` nos dois temas).

(c) Por que divergiram: `CrossMark` foi introduzido na onda de acessibilidade (`55dcee2`, 2026-07-08) e substituiu o `✝` de texto nas telas com tema, mas não no splash (que "não depende do ThemeContext" por decisão, comentário `App.js:248-249`), nem nos cards de imagem (que precisam de cores fixas para a captura), nem no `ErrorBoundary` (acima do provider). O `DialogueAnswerCard` foi copiado do `ShareVerseCard` em `b5b5c1a` (2026-07-08).

(d) Parcialmente legítima: splash, cards de imagem e `ErrorBoundary` têm motivo real para não ler o tema. O que é acidental é (i) as cores da marca não existirem como constante única (`BRAND = { navy, gold }`) importável por quem não pode usar o hook, (ii) quatro tamanhos de cruz e três redações do versículo.

(e) Uma constante `brand.js` e um `<BrandLockup size>` não perdem nada. O splash continuará estático (é o correto), mas passa a importar a constante.

### C14. `useScrollHints` + par de `<ScrollHint>` + bloco de 4 props em 24 telas, `contentContainerStyle` literal em 12

(a) O hook exige que cada tela ligue `onScroll`, `onContentSizeChange`, `onLayout` e `scrollEventThrottle={32}` no scroller e renderize dois `<ScrollHint>` fora dele. O próprio hook documenta a receita (`useScrollHints.js:6-15`) e 24 telas a copiam.

(b) Locais: `grep -rl "<ScrollHint" src/screens` = 24 arquivos: `ArticleDetailScreen`, `ArticlesScreen`, `BibleScreen` (dois pares, `:737-738` e `:893-894`), `CategoryArticlesScreen`, `DebateStrategiesScreen`, `DialogueScreen`, `ExamConscienceScreen`, `FavoritesScreen`, `GlossaryScreen`, `HighlightsScreen`, `HomeScreen`, `LiturgyScreen`, `NotebookScreen`, `NotesScreen`, `QuizScreen`, `ReadingPlanScreen`, `RefDetailScreen`, `ReferencesScreen`, `RosaryScreen`, `SearchScreen`, `SettingsScreen`, `TodayScreen`, `ToolsScreen`. `scrollEventThrottle={32}` aparece 24 vezes (e `{16}` uma vez em `ArticleDetailScreen.jsx:263`, para a barra de progresso). Ausente em `BibleMapScreen.jsx:45` e no `TrueFalseGame` (`QuizScreen.jsx:314`). `contentContainerStyle={{ padding: 16, paddingBottom: 40 }}` literal em `BibleMapScreen.jsx:45`, `RosaryScreen.jsx:178`, `DebateStrategiesScreen.jsx:82`, `HighlightsScreen.jsx:114`, `ExamConscienceScreen.jsx:20`, `FavoritesScreen.jsx:60`, `NotesScreen.jsx:82`, `SearchScreen.jsx:323`, `NotebookScreen.jsx:91`, `CategoryArticlesScreen.jsx:45`, `GlossaryScreen.jsx:75`, `ReadingPlanScreen.jsx:106`.

(c) Por que divergiram: o hook foi desenhado como "receita para colar", não como wrapper, provavelmente para funcionar com `ScrollView`, `FlatList` e `SectionList` sem envolver cada um. Funcionou, e a receita foi colada 24 vezes.

(d) Acidental. A única variação real é o throttle 16 do artigo (que precisa de progresso fino) e o `ref` do scroller em algumas telas (Home, Glossário) para `scrollTo`.

(e) Um `<HintedScroll as={FlatList} …>` (ou um hook que devolva `scrollProps` para spread) reduz cada tela a duas linhas. Perde-se nada funcional; o `ref` precisa ser encaminhado com `forwardRef`.

### C15. Cores literais fora da paleta: 44 valores hex distintos em `src/` (mais `rgba`)

(a) Além das cores da marca (C13), o app tem famílias inteiras de cor fora do `ThemeContext`, iguais nos dois temas.

(b) Locais (`grep -rnoE "#[0-9a-fA-F]{3,8}"` excluindo `ThemeContext.jsx`, `data/` e `mapHtml`):

| Família | Valores | Onde |
|---|---|---|
| Branco de texto sobre navy/dourado | `#fff` 93x, `#ffffff` 1x | `App.js` (7), `SettingsScreen` (3), `RosaryScreen` (3), `OnboardingScreen` (3), `ArticleDetailScreen` (3), mais 15 arquivos |
| Vermelho de erro/destrutivo | `#c0392b` 13x | `SettingsScreen.jsx:499,:500,:505,:506,:515,:844`, `NoteEditorScreen.jsx:175,:223`, `NotebookPageScreen.jsx:165,:212`, `LoginScreen.jsx:197`, `SignupScreen.jsx:190`, `ForgotPasswordScreen.jsx:104` |
| Trilha do `Switch` | `#ccc` 5x | `SettingsScreen.jsx:264,:410,:428,:446,:464` |
| Google | `#DB4437` 2x | `LoginScreen.jsx:147`, `SignupScreen.jsx:157` |
| Cores litúrgicas | `#fafafa`, `#3a7d4b`, `#a02020`, `#5d3a85`, `#d88aaa`, `#1a1a1a`, `#c9a84c`, `#888` | `liturgyApi.js:66-80` (`getLiturgicalColorHex`) |
| Estações | `#6b4c9a`, `#c9a84c`, `#3a7d4b` | `liturgicalSeason.js:31-35` (`#3a7d4b` duplica o verde litúrgico) |
| Quiz certo/errado | `#e6f4ea`, `#1f3a28`, `#3a7d4b`, `#3a1f1f`, `#a02020`, `#f8d7da` | `QuizScreen.jsx:175-180,:193,:326-327` (repete o verde e o vermelho litúrgicos) |
| Contas do rosário (SVG) | `#b8a878`, `#a8861a`, `#e09010`, `#7a4e0a`, `#8a7a52`, `#c9a84c`, `#c8a040`, `#8a6818`, `#5a3a10`, `#7a5418`, `#f4c842`, `#fde8a8`, `#e8dcb8`, `#fff4d8` | `RosaryScreen.jsx:323-329,:404,:431,:441` |
| Marcações de versículo | `#fff3a6`, `#c8f0c0`, `#c4dffb`, `#f8c4d3`, `#ffd9a8` + texto `#1a1a1a` | `BibleScreen.jsx:48-52,:873` |
| Diversos | `#333` (`BibleScreen.jsx:952`), `#000` sombra (`AccountPrompt.jsx:152`), `rgba(0,0,0,0.45)` (`ArticleDetailScreen.jsx:380`), `rgba(0,0,0,0.5)` (`BibleScreen.jsx:1072`), `#ffd` (`ErrorBoundary.jsx:49`), `#eaf1f8`/`#b9cadb` (`DialogueAnswerCard.jsx:32,:35`) | |

(c) Por que divergiram: a paleta do tema tem 17 chaves e nenhuma para "erro", "sucesso", "sobre-cor-forte" (branco), "sobreposição" ou "cores litúrgicas". Sem chave, cada tela escreveu o hex. O vermelho `#c0392b` foi copiado 13 vezes de forma consistente (bom sinal: é um token que falta, não uma dispersão). O verde `#3a7d4b` aparece em três módulos sem relação (liturgia, estação, quiz).

(d) Parte legítima: cores litúrgicas, marcações e contas do rosário são conteúdo, não tema, e devem ser iguais nos dois modos (mas podem viver num `palette.js` de domínio). Acidental: `#fff` como "texto sobre primário" (deveria ser `c.onPrimary`), `#c0392b` como erro, `#ccc` como trilha, o verde e o vermelho semânticos repetidos.

(e) Ao adicionar `onPrimary`, `danger`, `success`, `overlay` ao tema e um `palette.liturgical` compartilhado, nada se perde. Risco: no modo escuro, `#c0392b` sobre card escuro dá 3.36:1 (evidência §4 E), então o token de erro precisará de valor escuro próprio (hoje ninguém escolheu um).

### C16. Tamanhos de ícone (18 valores) e o `chevron-forward` (28 usos, 3 tamanhos, 4 cores)

(a) Não há escala de ícones. O chevron de "abre" varia sem regra.

(b) Locais: `size={…}` em `src/`: 18 (55x), 16 (36x), 20 (33x), 22 (29x), 14 (14x), 24 (8x), 56 (7x), 26 (5x), 48 (4x), 15 (4x), 44, 32, 160 (2x cada), 12 (2x), 11, e três via `fs()` (`HomeScreen.jsx:81`, `LoginScreen.jsx:65`, `OnboardingScreen.jsx:77`). `chevron-forward` (28): 18 em `ContinueBibleCard.jsx:39`, `ContinueReadingCard.jsx:42`, `LiturgyCard.jsx:72`, `BibleScreen.jsx:731`, `ToolsScreen.jsx:69,:97`, `HomeScreen.jsx:156`, `DialogueScreen.jsx:197`, `SettingsScreen.jsx:250,:345,:596,:606`, `QuizScreen.jsx:65`, `ArticleDetailScreen.jsx:318` (`#fff`), `OnboardingScreen.jsx:135`; 16 em `RelatedArticles.jsx:33` (`accent`), `RelatedDialogues.jsx:33` (`accent`), `BibleMapScreen.jsx:145`, `RosaryScreen.jsx:257` (`#fff`), `ExamConscienceScreen.jsx:48` (`accent`), `FavoritesScreen.jsx:76`, `LiturgyScreen.jsx:269` (`accent`), `ArticleDetailScreen.jsx:347` (`accent`), `ReadingPlanScreen.jsx:146`, `ArticlesScreen.jsx:97`; 20 em `NewsCard.jsx:156` (`#fff`), `BibleMapScreen.jsx:115`, `BibleScreen.jsx:922`. O ícone de compartilhar tem 4 tamanhos e 3 cores (evidência §1 C.3).

(c) Por que divergiram: mesmo motivo do C5, sem escala. O `accent` no chevron dos `Related*` e do Exame marca "link inline" vs `textSubtle` para "linha de lista", uma distinção que talvez seja intencional mas não é declarada.

(d) Acidental na maioria. Legítimo: 56 para o estado vazio, 160 para a marca d'água do artigo, `fs()` para a cruz da marca.

(e) Uma escala `icon.sm/md/lg` (16/20/24) e um `<Chevron>` não perdem nada. O tamanho 18 (o mais usado) cai para 16 ou sobe para 20, mudança de 2 px visível só em comparação lado a lado.

### C17. Estados de gate, carregando e vazio copiados (3 telas de dados + 2 de lista + 4 textos de "nada encontrado")

(a) As três telas de Firestore têm o mesmo `useEffect [user]` que assina o `watch*`, o mesmo bloco `loading` e a mesma tela de visitante (cadeado 56, `t('empty.createAccount')`, frase, botão inline). Favoritos e Busca copiam os estilos de vazio. Quatro listas copiam o `empty` de texto.

(b) Locais:

| Tela | Efeito `[user]` | Loading | Gate de visitante | Estilos `center`/`emptyTitle`/`muted` |
|---|---|---|---|---|
| `HighlightsScreen.jsx` | `:27-37` | `:61-63` | `:65-83` (botão `:76-80`) | `:157-159` |
| `NotesScreen.jsx` | `:19-29` | `:41-43` | `:45-63` (`:56-60`) | `:107-109` |
| `NotebookScreen.jsx` | `:33-40` | `:44-46` | `:48-66` (`:59-63`) | `:120-122` |
| `FavoritesScreen.jsx` | (local) | `:37-39` | não tem gate na tela (o gate é no card do hub, fluxograma 04 fato 12) | `:88-90` |
| `SearchScreen.jsx` | | `:275` (`ActivityIndicator`) | | `:367-369` (`empty`, `emptyTitle`) |
| `RefDetailScreen.jsx` | | | | `:156-157` |
| `BibleScreen.jsx` | | `BibleLoadingState` (`:826-827`) | | `:1058` |
| Texto "Nenhum … encontrado" | `ArticlesScreen.jsx:123`, `CategoryArticlesScreen.jsx:79`, `GlossaryScreen.jsx:125`, `DebateStrategiesScreen.jsx:161`, `ReferencesScreen.jsx:368` | | | fs 14/15, mt40 |

Loading: `t('common.loading')` em texto nas 4 telas de dados, `ActivityIndicator` em `SearchScreen.jsx:275`, `LiturgyScreen.jsx:154`, `NoteEditorScreen.jsx:104`, `NotebookPageScreen.jsx:123`, `BibleLoadingState.jsx:40`. As três frases do gate são redações diferentes da mesma promessa (fluxograma 02, item 8).

(c) Por que divergiram: as três telas de dados foram escritas em sequência (mesmo commit inicial) copiando uma da outra. `BibleLoadingState` é o único estado "componente" e nasceu depois, para a Bíblia sob demanda. O texto de vazio das listas é uma linha e ninguém viu motivo para extrair.

(d) Acidental. A única especialização é a frase por tipo de dado (marcações/notas/caderno), que é prop.

(e) Um `<EmptyState icon title body action>` e um `useUserCollection(watchFn)` eliminam ~90 linhas. Nada se perde.

### C18. Chips de escolha única: 5 implementações

(a) Seleção exclusiva por "pílulas" com estado ativo, cada tela com a sua.

(b) Locais: `SettingsScreen.jsx:822-827` (`fontChip`, usado para fonte `:278`, idioma `:309,:317` e velocidade `:375`; ativo = `primary`), `DebateStrategiesScreen.jsx:141-147` (r20, ativo = `badgeBg` + borda `accent`), `RosaryScreen.jsx:497-498` (r18, ativo = `primary`), `AuthTopToggles.jsx:40-43` (`pill` r14, sem estado ativo), `OnboardingScreen.jsx:201-205` (`chip` grande r14, ativo = `primary`) e `:210-214` (`rowChip`).

(c) Por que divergiram: cada tela precisou de um seletor e escreveu o seu; o de Ajustes foi reaproveitado por nome errado dentro da própria tela (fluxograma 11, item 2). Debate escolheu um "ativo suave" (badgeBg) diferente dos outros ("ativo forte" navy).

(d) Acidental. Onboarding `chip` é um card de escolha (com ícone e sub), legítimo como variante.

(e) `<Chip selected>` com dois tamanhos não perde nada; a decisão "ativo suave vs forte" precisa ser tomada uma vez.

### C19. Barras de progresso: 5 implementações do mesmo `View` de 3 a 4 px

(a) Trilha + preenchimento em `accent` com `width: pct%`, sem componente comum (existe um, `ReadingProgressBar`, usado só pelo artigo e pela Bíblia).

(b) Locais: `ReadingProgressBar.jsx:5-19` (h3, usado em `ArticleDetailScreen.jsx:246` e `BibleScreen.jsx:824`), `BibleScreen.jsx:753-754` + `:1039-1040` (`bookProgressTrack` h4 r2), `ContinueBibleCard.jsx:28-30` + `:61-65` (h3 r2), `ReadingPlanScreen.jsx:82` + `:169-170` (`barFill`), `BibleMapScreen.jsx:77` + `:241-242` (`progressFill`).

(c) Por que divergiram: `ReadingProgressBar` foi feito como "barra fina no topo" (comentário `:4`) e os outros usos precisavam de raio ou de altura 4, então copiaram.

(d) Acidental. Altura e raio são props.

(e) Nada se perde.

### C20. Badges de categoria/fonte: 7 definições

(a) Caixinha `badgeBg` com texto pequeno em 7 arquivos.

(b) Locais: `RelatedArticles.jsx:62-74` (r5, fs10 ls0.3), `ArticleDetailScreen.jsx:384-385` (r6 ph10 pv4, fs11 ls0.5), `QuizScreen.jsx:407-408` (r6 ph10 pv4, fs11 uppercase ls0.5), `ReferencesScreen.jsx:325-326` (r6 ph8 pv2, fs11 `badgeText`), `RefDetailScreen.jsx:165-173` (idem + `alignSelf`), `DebateStrategiesScreen.jsx:152-158` (r6 ph8 pv2, fs10), `SettingsScreen.jsx:777-784` (fs10 600 ls0.3).

(c) e (d) Mesma história do C10: acidental, uma intenção (rótulo de categoria/fonte). (e) Nada se perde com `<Badge>`.

---

## Lógica (regras, dados, serviços)

### C21. Fórmula "item do dia" em 4 módulos

(a) Rotação determinística `(diaDoAno + ano × semente) mod N` reescrita quatro vezes, com duas grafias do divisor e duas sementes.

(b) Locais:

| Onde | Linhas | Semente | Divisor | Consumidor |
|---|---|---|---|---|
| `HomeScreen.jsx` (objeção) | `:63-67` | `ano * 7` | `86400000` | card da Home, recalculado a cada render (fluxograma 03) |
| `notifications.js` (`objectionOfDay`) | `:7-12` | `ano * 7` | `86400000` | corpo da notificação `:160-167`, só PT |
| `dailyVerses.js` (`getVerseOfDay`) | `:97-104` | `ano * 7` | `1000*60*60*24` | `VerseOfDayCard`, `notifications.js:112,:192`, Busca |
| `quiz.js` (`getQuizOfDay`) | `:1963-1969` | `ano * 13` | `1000*60*60*24` | `QuizScreen.jsx:84` |

(c) Por que divergiram: `getVerseOfDay` é o original (comentário em `HomeScreen.jsx:63-64`: "igual ao getVerseOfDay"). A Home copiou inline em `8c54590` (2026-06-12) e a semente anual entrou em `2ed40e1` no mesmo dia; `notifications.js` copiou da Home em `bf4efc7` (2026-07-08) com o comentário "mesma rotação determinística da Home". O quiz usou `13` para não coincidir com o versículo.

(d) Acidental. A semente diferente do quiz é a única especialização e é um parâmetro.

(e) `pickOfDay(list, seed = 7, date)` em `utils/` não perde nada. Ganha: a Home e a notificação passam a ser garantidamente o mesmo item (hoje são iguais por cópia, não por contrato).

### C22. `APP_PROMO` e o caminho de compartilhamento: 2 promos, 2 folhas, 2 textos de fallback de imagem

(a) O rodapé de compartilhamento e a folha de share existem em `share.js` (com fallback de clipboard na web) e de novo em `LiturgyScreen` (com versão EN e sem fallback). Os cards de imagem remontam o texto à mão.

(b) Locais: `share.js:6-10` (`APP_PROMO`, só PT, URL vazia), `:15-33` (`doShare`), `:36,:50,:55,:62` (anexa a promo); `LiturgyScreen.jsx:57-58` (`APP_PROMO_PT/EN`), `:114-115` (`Share.share` direto); `VerseOfDayCard.jsx:29-30` e `DialogueScreen.jsx:81-87` (texto de fallback sem promo); `shareAsImage.js:42` (`dialogTitle: 'Compartilhar versículo'` também para diálogo).

(c) Por que divergiram: `LiturgyScreen` precisou de EN antes de `share.js` ter EN, e resolveu localmente. Os cards de imagem passam o texto ao `captureAndShareImage` como fallback e não reaproveitam `shareVerse`/`shareDialogue` porque essas funções já disparam a folha.

(d) Acidental. Nenhuma tela quer uma promo diferente.

(e) Nada se perde ao `share.js` expor `promo(isEn)` e `buildVerseMessage(...)`. Ganho lateral: o share EN passa a usar `:` (C25).

### C23. Nomes de livro em 4 tabelas paralelas

(a) Mapear nome de livro (PT, EN, abreviação) para `bookId` está em quatro vocabulários que não coincidem.

(b) Locais:

| Tabela | Onde | Direção | Cobertura | Observação |
|---|---|---|---|---|
| `BIBLE_BOOKS` (`name`, `nameEn`, `short`, `shortEn`) | `bible.js:5-96`, helpers `:98-110` | id → nomes | 73 livros | fonte canônica |
| `EN_BOOK_ID` | `LiturgyScreen.jsx:14-41`, usado em `:45` | nome EN da API → id | 75 chaves, com sinônimos (`Psalm`/`Psalms`, `Song of Songs`/`Song of Solomon`, `Sirach`) | vocabulário de terceiro (`catholic-readings-api`) |
| `BOOK_PT_TO_EN` | `references.js:2367-2392`, usado por `translateRef :2394-2404` | nome PT da ref → nome EN | 60 entradas + `Catecismo` | também troca `,` por `:` (`:2403`) |
| `FS_GOSPEL` + `biblePrefixes` | `ReferencesScreen.jsx:17-19,:40-63` | `fullSource` PT longo → EN longo | 4 + 22 | forma verbosa ("Evangelho segundo São Mateus, capítulo…") |

(c) Por que divergiram: cada tabela responde a um formato de entrada diferente: a API de leituras devolve nomes EN com variantes, `references.js` guarda `ref` em PT curto, `fullSource` é texto bibliográfico. Nenhuma foi derivada de `bible.js` porque `bible.js` não tem os sinônimos nem os nomes longos.

(d) Parcialmente legítima: os vocabulários de entrada são de fato diferentes (API externa, dado curado, texto longo). Acidental: as três tabelas não referenciam `bookId` como chave comum, então "Sirach" em `EN_BOOK_ID` e "Eclesiástico" em `BOOK_PT_TO_EN` não sabem que são o mesmo `eclo`.

(e) Ao centralizar em `bible.js` (com `aliasesEn` por livro e `nameLong`), perde-se a tabela de 22 prefixos verbosos, que teria de virar dado por referência (`fullSourceEn`, hoje presente em 35 de 130 entradas EN). Custo alto, impacto visual nulo.

### C24. Tradução de rótulos de fonte: helper local vs helpers de `references.js`

(a) `ReferencesScreen` mantém `translateFullSource` (57 linhas) que só ela usa, enquanto `references.js` exporta `translateRef`, `translateAuthor`, `translateYear` e `referenceSources.js` exporta `translateSource`.

(b) Locais: `ReferencesScreen.jsx:17-74` (definição), `:101` (uso, com fallback `item.fullSourceEn || translateFullSource(...)`); `RefDetailScreen.jsx:81` e `ArticleDetailScreen.jsx:342` mostram `fullSource` PT quando falta `fullSourceEn` (sem chamar o helper); `references.js:2394` (`translateRef`), `:2428` (`translateAuthor`), `:2446` (`translateYear`); `referenceSources.js:31` (`translateSource`, usado em `ReferencesScreen.jsx:92,:279`, `RefDetailScreen.jsx:78`, `SearchScreen.jsx:230`).

(c) Por que divergiram: o helper nasceu dentro da lista para cobrir refs sem `fullSourceEn`, e não foi movido para `references.js` quando o detalhe foi criado. Resultado: lista e detalhe mostram rótulos diferentes para a mesma referência em EN (fluxograma 05, item 3).

(d) Acidental. É um helper de dados dentro de uma tela.

(e) Mover para `references.js` (ou terminar `fullSourceEn` nos 95 que faltam e apagar o helper) não perde nada.

### C25. Formatação "Livro cap,verso" e o separador `isEn ? ':' : ','` em 7 lugares, mais 2 que ignoram o idioma

(a) A referência de versículo é montada à mão em cada tela, com o separador decidido localmente. Duas saídas usam vírgula fixa e uma extrai a referência da string exibida por regex.

(b) Locais:

| Onde | Linhas | Formato |
|---|---|---|
| `bibleApi.js` (`searchBible`) | `:107`, `:126` | `${name} ${chapter}${sep}${verse}` |
| `BibleScreen.jsx` (copiar) | `:554-555` | `${bn(book)} ${chapter}${sep}${n}\n${t}` |
| `BibleScreen.jsx` (modal) | `:936` | inline no JSX |
| `HighlightsScreen.jsx` | `:124` (+ `:121-123` texto do verso) | |
| `NotesScreen.jsx` (`formatRef`) | `:31-36` | com intervalo `a-b` |
| `NoteEditorScreen.jsx` | `:52-57` | com intervalo, cópia do anterior |
| `ReferencePickerModal.jsx` | `:95-96` | com `bookShort` |
| `share.js` | `:36`, `:45-48` | **vírgula fixa**, intervalo repetido (`:45`) |
| `VerseOfDayCard.jsx` | `:22-25` | regex sobre `ref` exibido (fluxograma 08, item 12: gera "Salmo 23 1,1") |
| `references.js` (`translateRef`) | `:2403` | `,` → `:` por regex |

Busca do texto do verso `getChapter(...)?.verses?.find((v) => v.n === X)?.t || ''` em `HighlightsScreen.jsx:122-123` e `NoteEditorScreen.jsx:131-132`.

(c) Por que divergiram: o suporte a EN (Douay-Rheims, `:`) chegou depois das telas PT (`,`), e cada tela que renderiza referência foi atualizada com o ternário; `share.js` e `VerseOfDayCard` ficaram para trás (o compartilhado em EN sai `Matthew 16,18`, o copiado sai `Matthew 16:18`).

(d) Acidental. O único caso legítimo de diferença é `bookShort` no token do caderno (espaço curto).

(e) `formatVerseRef({ bookId, chapter, verse, verseEnd }, isEn, { short })` em `utils/` não perde nada e corrige dois bugs (share EN, regex do card).

### C26. Narração (TTS) em 3 lugares com o mesmo esqueleto

(a) `isSpeakingAsync` → `stop`, `Promise.all([resolveVoice, getSavedRate])`, `defaultLang` `en-US`/`pt-BR`, objeto de opções com `pitch: 1.0`, e efeitos de parar no blur e no unmount, escritos duas vezes, com uma terceira variante de prévia.

(b) Locais: `ArticleDetailScreen.jsx:59-82` (efeitos), `:96-126` (`onToggleSpeak`, texto inteiro, `stripMarkdownForTts`); `BibleScreen.jsx:568-627` (`toggleChapterTts`, `speakingRef`, fila por versículo acima de 4000 chars, `notify` no erro), `:629-641` (efeitos); `SettingsScreen.jsx:94-115` (`previewVoice`, `changeRate`, `fallbackLang`); `ttsVoice.js:203` (`getSavedRate`), `:220` (`resolveVoice`). `Speech.stop()` aparece 10 vezes em `src/`.

(c) Por que divergiram: a Bíblia precisou da fila (limite do Android, comentário `:568-569`) e do aviso de erro com dica de Ajustes; o artigo não. As duas nasceram juntas (commit inicial) e o fix de "parar ao sair da tela" (`936e00d`, 2026-07-08) foi aplicado nos dois lugares em paralelo, o que confirma que já eram cópias.

(d) Parcialmente legítima: fila por versículo e mensagem de erro são comportamentos que o artigo também deveria ter (20 de 83 artigos passam de 4000 chars, fluxograma 04 fato 3), então a "especialização" é na verdade uma diferença de maturidade.

(e) Um `useNarration({ getText, lang })` com fila e stop-on-blur não perde nada e corrige o artigo longo. A prévia dos Ajustes fica fora (é `speak` simples).

### C27. `requireAccount` com título/mensagem/ícone inline em 3 telas e `DEFAULT_OPTS` só em PT

(a) O gate de conta é um hook (`GuestGate.jsx:12-22`) que aceita `opts`; cada chamador escreve o par PT/EN na chamada e o default do modal é PT com "tradução" por comparação de string.

(b) Locais: `BibleScreen.jsx:511-522`, `ToolsScreen.jsx:76-88` (interpola `item.label`), `ArticleDetailScreen.jsx:199-214`; `AccountPrompt.jsx:18-22` (`DEFAULT_OPTS`), `:95-100` (compara `opts.title === DEFAULT_OPTS.title && isEn`), `:102-106` (benefícios inline). Mesma promessa "salvos e sincronizados" em 4 redações (fluxograma 02, item 8) e uma delas é falsa para favoritos (fluxograma 04, fato 2).

(c) Por que divergiram: o hook foi feito genérico e a customização por contexto veio como `opts` livre. Sem chaves `gate.*` em `strings.js`, cada tela escreveu o texto.

(d) Acidental. O contexto (ícone e verbo) é legítimo, cabe num `reason: 'highlight' | 'favorite' | 'study'` que o modal traduz.

(e) Nada se perde. Ganha coerência de copy e a chance de corrigir a promessa dos favoritos.

### C28. Dois streaks com regras diferentes

(a) Quiz e plano de leitura contam "dias seguidos" com formatos, fusos e lugares diferentes.

(b) Locais: `QuizScreen.jsx:11-12` (chaves), `:88` (leitura), `:99-115` (regra inline, dia em UTC via `toISOString`, string), `:154-158` (exibe `flame` + "N dias" inline); `readingProgress.js:5,:9-11,:13-34` (`getStreak`/`bumpStreak`, dia local, objeto `{count, lastDate}`), `:81` (bump ao marcar dia); `ReadingPlanScreen.jsx:29-30,:86-90` (exibe `flame` + `t('plan.streak')`).

(c) Por que divergiram: o streak do quiz é do commit inicial; `bumpStreak` entrou em `0dbf73d` (2026-07-08) como utilitário novo para o plano, sem migrar o quiz.

(d) Acidental. Dois contadores independentes são legítimos como produto (quiz e leitura são hábitos diferentes), mas a regra de "ontem" deveria ser uma só (o quiz usa UTC e pode quebrar à noite no Brasil).

(e) `streak.js` com `bump(key)`/`get(key)` não perde nada. A exibição (`flame` + número) vira um `<StreakBadge>`.

### C29. Cache-first duplicado em `liturgyApi` e `newsApi`

(a) Os dois serviços de rede seguem os mesmos 4 passos (cache válido → rede com `AbortController` 8 s → cache antigo `stale` → erro com `code`), escritos duas vezes.

(b) Locais: `liturgyApi.js:13-61` (chave por dia, `:31-32` timeout), `newsApi.js:26-28,:34-35,:145-203` (TTL 3 h por idioma, dedupe, imagens). `AsyncStorage.setItem(...).catch(() => {})` em `liturgyApi.js:38-41` e `newsApi.js:182-185`.

(c) Por que divergiram: ambos do commit inicial, escritos para APIs com semânticas de validade diferentes (dia vs TTL).

(d) Legítima em parte: a política de validade é um parâmetro (`isFresh(entry)`), o resto é igual.

(e) `cachedFetch(key, fetcher, { isFresh })` não perde nada. Impacto visual nulo, custo médio, baixa prioridade para o redesign.

### C30. Algoritmo da Páscoa idêntico em 2 arquivos e "chave de hoje" em 4 formatos

(a) `easterDate` + `addDays` são cópia linha a linha (diff vazio) entre `saints.js` e `liturgicalSeason.js`. A formatação de "data de hoje como chave" aparece em quatro formas.

(b) Locais: `saints.js:166-182` (`easterDate`), `:184-188` (`addDays`), `:191` (`md`); `liturgicalSeason.js:6-22`, `:24-28`. Chaves de data: `liturgyApi.js:63-64` (`YYYY-MM-DD` com pad), `readingProgress.js:9-11` (`YYYY-M-D` sem pad), `QuizScreen.jsx:100,:108` (`toISOString().slice(0,10)`, UTC), `LiturgyScreen.jsx:94-95` (mm/dd com pad), `saints.js:191` (`MM-DD`).

(c) Por que divergiram: `liturgicalSeason.js` entrou em `9cb11b8` (2026-07-08, "Onda 10") e copiou o algoritmo de `saints.js` em vez de exportá-lo (o comentário de cabeçalho o chama de "aproximado o suficiente para decoração").

(d) Acidental (a Páscoa é uma só). As chaves de data têm formatos diferentes por acidente e um deles (UTC no quiz) é bug latente.

(e) `utils/dates.js` com `easterDate`, `addDays`, `localDateKey` não perde nada. Migrar a chave do quiz muda o formato gravado (precisa tolerar o antigo).

### C31. Detecção de Expo Go em 2 módulos

(a) `Constants.executionEnvironment === 'storeClient'` escrito duas vezes, com nomes diferentes.

(b) Locais: `sentry.js:9` (`isExpoGo`, usado em `:12,:30,:34`), `useGoogleSignIn.js:17` (`IS_EXPO_GO`, usado em `:55`). `SettingsScreen.jsx:121` tem um `expoGoNote` textual que não detecta, só avisa. `ErrorBoundary.jsx:16-18` procura `global.Sentry?.Native` em vez de usar `sentry.captureException` (`sentry.js:33-36`), que já tem o guard.

(c) Por que divergiram: dois módulos de infra escritos separadamente para problemas diferentes (módulo nativo ausente vs redirect URI do Google).

(d) Acidental. (e) `env.js` com `isExpoGo` não perde nada.

### C32. Acesso a campos bilíngues dos dados sem helper: `titleEn || title` em 13 pontos, rótulo de categoria em 11, busca por id em 5

(a) Todo consumidor de artigo resolve o idioma na mão com o mesmo ternário de fallback, e o rótulo de categoria repete outro ternário com template literal.

(b) Locais:

| Expressão | Onde |
|---|---|
| `isEn ? (a.titleEn \|\| a.title) : a.title` | `RelatedArticles.jsx:32`, `ContinueReadingCard.jsx:40`, `ReferencePickerModal.jsx:50,:73,:150`, `DialogueScreen.jsx:79`, `FavoritesScreen.jsx:73`, `SearchScreen.jsx:192`, `CategoryArticlesScreen.jsx:56`, `ArticleDetailScreen.jsx:47,:112`, `ReadingPlanScreen.jsx:139`, `ArticlesScreen.jsx:96` (e o mesmo para `summaryEn` em `ArticlesScreen.jsx:99`, `CategoryArticlesScreen.jsx:57`, `FavoritesScreen.jsx:74`) |
| `isEn ? t(\`category.${x}\`) : x` | `RelatedArticles.jsx:30`, `HomeScreen.jsx:137`, `FavoritesScreen.jsx:72`, `SearchScreen.jsx:191`, `CategoryArticlesScreen.jsx:36`, `ArticleDetailScreen.jsx:292`, `ArticlesScreen.jsx:84`, `App.js:114,:153` |
| `articles.find((a) => a.id === id)` | `DialogueScreen.jsx:78`, `FavoritesScreen.jsx:25`, `ArticleDetailScreen.jsx:33`, `ReadingPlanScreen.jsx:113`, `ArticlesScreen.jsx:50` (não existe `articleById` em `data/articles/index.js`) |
| `references.find` vs `referenceById` | `RefDetailScreen.jsx:22` refaz o que `references.js:2365` exporta e `ArticleDetailScreen.jsx:327` usa |
| Fusão PT+EN de referência | 4 formas (fluxograma 05, item 4): `ReferencesScreen.jsx:76-79`, `RefDetailScreen.jsx:25`, `ArticleDetailScreen.jsx:336`, `ReferencePickerModal.jsx:39-45` |

Padrão paralelo nos outros dados: `isEn ? (d.objectionEn || d.objection) : d.objection` (`DialogueScreen.jsx:196`, `HomeScreen.jsx:114`), `isEn ? (item.nameEn || item.name) : item.name` (`DebateStrategiesScreen.jsx:106`), `isEn ? p.nameEn : p.name` sem fallback (`BibleMapScreen.jsx:142-143`), `isEn ? m.nameEn : m.name` (`RosaryScreen.jsx:218`).

(c) Por que divergiram: as traduções EN foram adicionadas como campos `*En` opcionais nos dados (`articles-en.js` mesclado em `articles/index.js`), e a regra "EN com fallback PT" ficou implícita, resolvida no ponto de uso.

(d) Acidental. O `category` em PT funciona como id, chave de i18n, param de rota e filtro (fluxograma 04, fato 17), o que força o template literal em cada tela.

(e) `articleTitle(a, isEn)`, `categoryLabel(id, t, isEn)`, `articleById(id)` em `data/` não perdem nada e removem 29 ternários.

### C33. Ternário bilíngue inline `isEn ? … : …` em 46 arquivos convivendo com `t()` em 32

(a) Dois mecanismos de i18n de UI coexistem: `strings.js` (346 chaves, `translate` com fallback PT) e o ternário inline. 29 arquivos usam os dois na mesma tela.

(b) Locais (contagem de `isEn ?` por arquivo, top): `SettingsScreen.jsx` 38, `QuizScreen.jsx` 26, `BibleScreen.jsx` 23, `RosaryScreen.jsx` 20, `ReferencePickerModal.jsx` 17, `OnboardingScreen.jsx` 16, `BibleMapScreen.jsx` 16, `SearchScreen.jsx` 15, `SignupScreen.jsx` 14, `ArticleDetailScreen.jsx` 14, `NoteEditorScreen.jsx` 13, `RefDetailScreen.jsx` 11, `ReferencesScreen.jsx` 10, `ReadingPlanScreen.jsx` 10, `DialogueScreen.jsx` 10. Exemplos de vizinhança incoerente já listados nos fluxogramas: `SettingsScreen.jsx:455` inline entre `:399,:419,:437` com `t()` (fluxograma 11); `HomeScreen.jsx:83,:114,:140` inline vs `:84-85,:99,:123` com `t()` (fluxograma 03); `LiturgyScreen.jsx:118-146` objeto `L` inteiro inline com `news.title`, `common.tryAgain` já em `strings.js` (fluxograma 08). Strings PT fixas fora dos dois mecanismos: `dialog.js:23,:25`, `ErrorBoundary.jsx:28-36`, `SettingsScreen.jsx:31-34`, `App.js:254-255`, `share.js:24`, `shareAsImage.js:42`, `notifications.js:116,:131-132`, `useGoogleSignIn.js:43-62`.

(c) Por que divergiram: `strings.js` cobre bem os cabeçalhos, tabs e rótulos "de sistema"; o conteúdo de tela (placeholders, subtítulos, mensagens de erro) foi escrito inline por ser mais rápido, e o padrão se espalhou. Não há regra escrita de "o que vai para `strings.js`".

(d) Parcialmente legítima: strings que carregam dados (`${item.label}`) ou vêm dos dados (`objectionEn`) não pertencem a `strings.js`. Tudo o mais (centenas de literais) é acidental.

(e) Migrar tudo para `t()` é caro (46 arquivos) e não muda pixel nenhum. O que se perde ao não migrar: qualquer terceira língua exige tocar 46 arquivos. Para o redesign, basta uma regra e migrar as telas que forem reescritas.

### C34. AsyncStorage inline no Quiz vs `utils/`, chaves espalhadas em 14 arquivos, lista de limpeza fixa

(a) Toda persistência local tem módulo em `utils/` (favoritos, progresso, último lido, Bíblia, histórico de busca, onboarding, TTS) exceto o quiz, que chama `AsyncStorage` na tela. As 23 chaves estão declaradas onde são usadas e `deleteAccount` mantém uma lista à mão.

(b) Locais: `QuizScreen.jsx:11-12,:88,:103-112` (inline); utilitários `favorites.js`, `lastRead.js`, `readingProgress.js`, `bibleProgress.js`, `searchHistory.js`, `onboarding.js`, `ttsVoice.js`; serviços `liturgyApi.js:6`, `newsApi.js:28`, `notifications.js`; contextos `ThemeContext.jsx:76-77,:95,:103`, `LanguageContext.jsx:26,:41`, `AuthContext.jsx:54,:74,:83,:92,:97,:138,:164-172`. `deleteAccount` (`AuthContext.jsx:164-172`) apaga 9 chaves e deixa `lastRead:article`, `quiz:*`, `reading:streak`, `reading:plan:objecoes-protestantes`, `onboarding:*`, `settings:tts*`, `liturgy:cache`, `news:cache:*` (fluxogramas 02 e 04).

(c) Por que divergiram: o quiz foi escrito como tela autônoma; os `utils/` foram criados conforme cada dado precisou ser lido de dois lugares. A lista de limpeza foi escrita uma vez e não acompanhou as chaves novas.

(d) Acidental. (e) Um `storageKeys.js` com registro central e `clearUserLocalData()` derivado dele não perde nada. Impacto visual nulo.

### C35. Firestore direto em `NoteEditorScreen` fora de `userData.js`

(a) `userData.js` encapsula as três coleções, mas o editor de nota monta `doc(db, 'users', uid, 'notes', noteId)` e chama `getDoc` na tela.

(b) Locais: `NoteEditorScreen.jsx:5-6` (import de `firebase/firestore`), `:33-49` (`getDoc`); `userData.js:163-168` tem `getNotebookPage` (o equivalente para o caderno) e nada para notas; guards de `uid` repetidos 6 vezes dentro do próprio `userData.js` (`:8-9,:41-42,:92-93,:101-102,:148-149,:158-159`).

(c) Por que divergiram: `updateNote` existe (`userData.js:91`) mas `getNote` não; o editor precisou ler e resolveu no lugar.

(d) Acidental. (e) `getNote(id)` em `userData.js` não perde nada e fecha o único vazamento de Firestore fora do serviço (relevante para `firestore.rules`).

### C36. Card offscreen de "compartilhar como imagem" em 2 componentes e 2 telas

(a) `ShareVerseCard` e `DialogueAnswerCard` são o mesmo cartaz 1080 px (fundo navy, padding 80, marca dourada, cruz) com estilos estáticos paralelos; as duas telas repetem o wrapper `offscreen` e a decisão web/nativo de formas diferentes.

(b) Locais: `ShareVerseCard.jsx:11-24,:30-49` (`variant: 'story'` sem chamador, `:8-9`), `DialogueAnswerCard.jsx:9,:28-39` (rótulos "Objeção"/"Resposta" só PT, `:11,:14`), `VerseOfDayCard.jsx:64-66,:131` (`offscreen`, esconde o botão na web `:56`), `DialogueScreen.jsx:146,:254` (`offscreen`, decide web/nativo em `:82`), `shareAsImage.js:42` (`dialogTitle` fixo).

(c) Por que divergiram: `DialogueAnswerCard` foi copiado de `ShareVerseCard` em `b5b5c1a` (2026-07-08) para o diálogo, com conteúdo diferente.

(d) Parcialmente legítima: os dois cartazes têm layouts diferentes (citação centrada vs objeção + resposta). O que é acidental: moldura (fundo, padding, rodapé de marca), `offscreen` e a política web/nativo.

(e) `<ShareCanvas>` (moldura + rodapé) com `children` e um `useShareAsImage()` não perde nada. O `variant: 'story'` morto pode ir junto.

### C37. Micro-utilitários repetidos (7 padrões, 35 pontos)

(a) Trechos de 1 a 5 linhas copiados entre features, individualmente baratos, coletivamente ruidosos.

(b) Locais:

| Padrão | Pontos |
|---|---|
| `Linking.openURL(url).catch(() => {})` | `RefDetailScreen.jsx:53,:64`, `ReferencesScreen.jsx:236`, `SettingsScreen.jsx:575` |
| `KeyboardAvoidingView` + `ScrollView keyboardShouldPersistTaps` | `LoginScreen.jsx:57-63`, `SignupScreen.jsx:50-56`, `ForgotPasswordScreen.jsx:31-35`, `NoteEditorScreen.jsx:110-113`, `NotebookPageScreen.jsx:127-130` |
| `if (Platform.OS === 'web') { try { window.localStorage… } catch {} }` | `ThemeContext.jsx:72-74,:97-99`, `LanguageContext.jsx:22-24,:43-45` |
| `setExpanded(isOpen ? null : id)` | `DebateStrategiesScreen.jsx:97`, `GlossaryScreen.jsx:90`, `ExamConscienceScreen.jsx:57` |
| `confirmAction({... destructive ...})` com `onConfirm` sem `catch` | `HighlightsScreen.jsx:48`, `NoteEditorScreen.jsx:86`, `NotebookPageScreen.jsx:66`, `SettingsScreen.jsx:162,:173`, `ReadingPlanScreen.jsx:37` |
| `<Modal>` com e sem `statusBarTranslucent`/`useModalNavBar` | 7 modais (`ImageZoomModal.jsx:216`, `AccountPrompt.jsx:77`, `ReferencePickerModal.jsx:102`, `BibleMapScreen.jsx:162`, `BibleScreen.jsx:927`, `SettingsScreen.jsx:512,:669`), só 2 com `statusBarTranslucent` (`AccountPrompt.jsx:81`, `SettingsScreen.jsx:674`) e `useModalNavBar` |
| Locale de data fixo vs por idioma | `LiturgyScreen.jsx:390` (`'pt-BR'` fixo), `LiturgyCard.jsx:45` e `LiturgyScreen.jsx:210` (`'en-US'` fixo para o nome do dia), `TodayScreen.jsx:38` e `NewsCard.jsx:19` (por `isEn`) |
| `DEFAULT_PREFS` de notificação | `notifications.js:32-39`, `notifications.web.js:6-13`, versão parcial em `SettingsScreen.jsx:55` |
| `NavigationBar.setButtonStyleAsync(darkMode ? 'light' : 'dark')` | `ThemeContext.jsx:113`, `useModalNavBar.js:12,:16` |

(c) Por que divergiram: são idiomas de plataforma (web vs nativo) e de biblioteca colados onde o problema apareceu. Nenhum tem dono.

(d) Acidental em todos, exceto os modais: `statusBarTranslucent` só importa para modais de tela cheia no Android, então a diferença pode ser intencional (não verificado em execução).

(e) `openUrl()`, `<FormScreen>`, `webStorage.get/set`, `useExpandable()`, `<AppModal>` e `formatDate(d, isEn)` não perdem nada. Custo baixo cada um, valor baixo cada um.

---

## Ranking dos 20 concerns

Fórmula pedida: **Pontuação = L × I / K**, com L = número de locais (o total da tabela do concern: pontos de código ou arquivos, conforme indicado), I = impacto no redesign visual (1 a 5: 5 = muda a cara de muitas telas, 1 = invisível), K = custo de unificar (1 a 5: 1 = um utilitário e substituições mecânicas, 5 = toca dezenas de arquivos com decisão caso a caso). A fórmula premia amplitude barata, por isso itens de token (kickers, ícones, cores) ficam acima do componente de card, que é mais profundo. A coluna "Depende de" corrige isso na prática: um concern que consome tokens só deve ser atacado depois do C5.

| # | Concern | L | I | K | Pontos | Depende de |
|---|---|---|---|---|---|---|
| 1 | C10 Kickers uppercase | 43 | 4 | 2 | 86 | C5 |
| 2 | C16 Tamanhos de ícone e chevron | 28 | 3 | 1 | 84 | C5 |
| 3 | C15 Cores literais fora da paleta | 44 | 5 | 3 | 73 | (base) |
| 4 | C8 Filete lateral | 23 | 3 | 1 | 69 | C5 |
| 5 | C13 Bloco de marca e cores da marca | 31 | 4 | 2 | 62 | C15 |
| 6 | C5 `makeStyles` sem escala (tokens) | 48 | 5 | 4 | 60 | (base) |
| 7 | C32 Campos bilíngues sem helper | 29 | 2 | 1 | 58 | |
| 8 | C12 Botões | 20 | 5 | 2 | 50 | C5, C15 |
| 9 | C14 ScrollHint + bloco de scroll | 24 | 3 | 2 | 36 | |
| 10 | C37 Micro-utilitários (7 padrões) | 35 | 2 | 2 | 35 | |
| 11 | C9 Cabeçalhos de seção | 17 | 4 | 2 | 34 | C5, C10 |
| 12 | C6 Card de navegação | 18 | 5 | 3 | 30 | C5, C16, C8 |
| 13 | C33 Ternário inline vs `t()` | 46 | 3 | 5 | 28 | |
| 14 | C11 Campos de busca | 19 | 4 | 3 | 25 | C5 |
| 15 | C1 `screenOptions` de header | 6 | 4 | 1 | 24 | C15 (`onPrimary`) |
| 16 | C7 Card de item de conteúdo | 17 | 4 | 3 | 23 | C5, C20 |
| 17 | C20 Badges | 7 | 3 | 1 | 21 | C5, C10 |
| 18 | C3 Contrato `navigate('Bíblia')` | 10 | 2 | 1 | 20 | |
| 19 | C25 Formatação "Livro cap,verso" | 10 | 2 | 1 | 20 | |
| 20 | C2 Rotas em vários stacks | 19 | 3 | 3 | 19 | |

Fora do top 20, em ordem: C17 estados vazio/gate (18), C4 `ArticleFromSearch`/`RefDetail` (16, depende de C2), C27 `requireAccount` inline (12), C19 barras de progresso (10), C18 chips (9), C30 Páscoa e chaves de data (7), C22 `APP_PROMO` (6), C21 fórmula do dia (4), C36 cards offscreen (4), C31 Expo Go (3), C34 AsyncStorage inline (3), C26 TTS (2), C28 streaks (2), C35 Firestore direto (2), C24 `translateFullSource` (1.5), C23 tabelas de livros (1), C29 cache-first (1).

Leitura do ranking para o redesign, em três frases: os oito primeiros são quase todos "tokens que faltam" (tipografia de rótulo, ícone, cor, filete, marca, escala) e se resolvem juntos num `tokens.js` + 4 chaves novas de tema (`onPrimary`, `danger`, `success`, `overlay`); em seguida vêm os cinco componentes visuais que consomem esses tokens (botão, cabeçalho de seção, card de navegação, campo de busca, card de conteúdo) e que são o que o usuário vê mudar; a lógica (C21 a C35) tem impacto visual baixo e deve entrar só onde a tela for reescrita de qualquer forma, com três exceções de correção de bug que valem sozinhas: C25 (share EN com vírgula e regex do versículo do dia), C26 (artigo longo sem fila de TTS) e C30/C28 (dia em UTC no quiz).

Ordem sugerida por dependência (não por pontuação): C5 e C15 → C10, C16, C8, C20, C13 → C12, C9, C6, C7, C11, C17, C18, C19 → C1, C14 → C2 → C3, C4 → C32, C25, C27 → resto da lógica conforme as telas forem tocadas.

## Confiança e lacunas

- **Alta** para tudo o que veio de `grep -n` sobre `src/` e `App.js` (contagens de arquivos, ocorrências, valores de `borderRadius`/`fs()`/`size=`/`letterSpacing`/hex, chamadores de `navigate`, `ScrollHint`, `requireAccount`, `isEn ?`, `t('`) e para `App.js`, que foi lido integralmente nos trechos de navegação (`:94-246`, `:250-284`, `:286-306`, `:308-320`, `:350-359`).
- **Alta** para os trechos lidos com `sed -n` e citados por faixa: todos os `makeStyles` das tabelas dos C6, C7, C9, C10, C11, C12, C17, C18, C19, C20, os quatro blocos de marca (C13), as quatro fórmulas do dia (C21), `share.js` inteiro (C22), as três tabelas de livros e `translateFullSource` (C23, C24), os sete pontos de formatação de referência (C25), as duas narrações e a prévia (C26), os três `requireAccount` e o `DEFAULT_OPTS` (C27), os dois streaks (C28), os dois serviços de cache (C29), `easterDate` nos dois arquivos com `diff` vazio (C30), `NoteEditorScreen.jsx:30-50` (C35), `dialog.js` e `verseRange.js` inteiros.
- **Média** para as faixas de JSX das telas grandes (`BibleScreen`, `SettingsScreen`, `QuizScreen`, `RosaryScreen`, `DialogueScreen`, `LiturgyScreen`, `NewsCard`) citadas nos C6 e C7: os estilos foram lidos, o JSX foi conferido por `grep` do nome do estilo e pelos fluxogramas, não linha a linha.
- **Média** para "por que divergiram": o repositório começa em `4a0cc0f` (2026-06-05) já com quase tudo, então só cinco cópias são datáveis por commit (`objectionOfDay` bf4efc7, `ContinueBibleCard` 60e81eb, `DialogueAnswerCard` b5b5c1a, `bumpStreak` 0dbf73d, `liturgicalSeason` 9cb11b8, e a extração de `CrossMark` em 55dcee2). O resto é inferência por comentários e nomes.
- **Não verificado em execução**: nada foi rodado. A diferença de `statusBarTranslucent` entre modais (C37) pode ser intencional no Android; a diferença de contraste dos botões dourados (C12) vem das medidas da evidência §4, não de captura própria; o efeito do piso de 11 px do `fs()` nos kickers (C10) é leitura do código.
- **Contagens com margem**: "12 linhas" de Ajustes no C6 é o número de `style={styles.row}` (o fluxograma 11 conta 16 incluindo `profileCard` e variantes); "44 valores hex" exclui `data/`, `mapHtml.js` e `ThemeContext.jsx` e não conta `rgba(...)`; "46 arquivos com `isEn ?`" inclui usos legítimos com dados (`objectionEn`), que o C33 já separa como especialização válida.
- **Não coberto**: corpo dos dados (`bibleAveMaria.js`, `bibleDouayRheims.js`, `articles/*`, `quiz.js` fora de `:1960-1970`); `docs/*.html` (landing) e `public/index.html` além do que os fluxogramas citam; `StickySectionList.web.jsx`, `ImageZoomModal.jsx` e `MapView.*` (só grep); duplicação dentro de um mesmo arquivo (por exemplo os 7 `useRef` de scroll da Bíblia), que é assunto de `/simplify`, não deste levantamento.

## Fontes consultadas

Documentos:
- `docs/design/PATHFINDER-2026-09-23/00-features.md` (íntegra).
- `docs/design/PATHFINDER-2026-09-23/01-flowcharts/01` a `12` (íntegra de 01 e 03; seções "Escopo", "Dependências externas", "Duplicações observadas", "Fatos" e "Confiança" dos demais).
- `docs/design/DESIGN-IS-2026-09-23/01-evidence.md` §1 C, D, E, F (`:55-113`) e §4 A a H (`:246-303`).

Código (faixas lidas com `sed -n`; o restante por `grep -n`):
- `App.js:94-104, 138-148, 174-184, 207-217, 248-284, 286-306, 308-320, 350-359` e lista completa de `*.Screen`.
- `src/context/ThemeContext.jsx:6-26`.
- `src/screens/HomeScreen.jsx:62-68, 71-79, 80-86, 96-101, 146-157, 157-161, 167-176, 186-195, 203-220`.
- `src/screens/ToolsScreen.jsx:54-71, 73-90, 128-140`.
- `src/screens/SettingsScreen.jsx:66-80, 94-116, 812-822` e greps de `styles.row`, `fontChip`, `#c0392b`, `#ccc`.
- `src/screens/QuizScreen.jsx:9-14, 52-67, 84-116` e greps de `card`, `iconBox`, `nextBtn`, `badge`, cores.
- `src/screens/BibleScreen.jsx:129-150, 509-523, 550-559, 568-642, 676-689, 933-942, 1000-1022` e greps.
- `src/screens/ArticleDetailScreen.jsx:59-82, 94-127, 199-214, 375-400`.
- `src/screens/SearchScreen.jsx:248-272, 350-400`.
- `src/screens/GlossaryScreen.jsx:50-80, 112-128`; `DebateStrategiesScreen.jsx:43-61, 90-110, 132-165`; `ExamConscienceScreen.jsx:38-52, 86-100`.
- `src/screens/DialogueScreen.jsx:80-90, 190-200, 216-220, 243-275`; `RosaryScreen.jsx:155-158, 211-231` e greps de `chip`, `card`, cores.
- `src/screens/BibleMapScreen.jsx:29-38, 127-146, 258-266`; `OnboardingScreen.jsx:75-92, 101-114, 192-226`.
- `src/screens/auth/LoginScreen.jsx:63-69, 180-184, 203-251`; `SignupScreen.jsx:195-219`; `ForgotPasswordScreen.jsx:105-113`.
- `src/screens/ArticlesScreen.jsx:89-102, 112-124`; `CategoryArticlesScreen.jsx:50-60, 70-80`; `FavoritesScreen.jsx:64-78, 86-98`; `ReadingPlanScreen.jsx:113-148, 170-185`.
- `src/screens/HighlightsScreen.jsx:20-38, 38-45, 59-84, 118-127, 160-172`; `NotesScreen.jsx:13-30, 30-39, 39-64, 105-116`; `NotebookScreen.jsx:15-67, 118-130`; `NoteEditorScreen.jsx:30-60`; `NotebookPageScreen.jsx:112-121`.
- `src/screens/ReferencesScreen.jsx:14-80, 240-248, 314-330, 360-368`; `RefDetailScreen.jsx:38-49, 152-170, 208-215`; `LiturgyScreen.jsx:12-50, 57-58, 104-124, 258-263, 400-402`; `TodayScreen.jsx:42-46`.
- `src/components/ContinueReadingCard.jsx:33-58`; `ContinueBibleCard.jsx:44-67`; `SaintTodayCard.jsx:38-55`; `LiturgyCard.jsx:78-95`; `NewsCard.jsx:177-190`; `VerseOfDayCard.jsx:15-34, 72-98`; `RelatedArticles.jsx:40-81`; `RelatedDialogues.jsx:40-62`; `SectionBanner.jsx:9-45`; `AccountPrompt.jsx:16-23, 93-107, 185-210`; `GuestGate.jsx:1-30`; `BibleLoadingState.jsx:10-90`; `ErrorBoundary.jsx:14-20, 44-52`; `AuthTopToggles.jsx:12-45`; `ShareVerseCard.jsx:28-50`; `DialogueAnswerCard.jsx:26-40`; `ReferencePickerModal.jsx:90-99, 133-142, 254-258`; `ReadingProgressBar.jsx:1-30`.
- `src/services/notifications.js:6-13, 73-102`; `liturgyApi.js:1-62, 66-82`; `newsApi.js:26-40, 143-205`; `bibleApi.js:100-130`; `userData.js` (exports); `firebase.js` (grep).
- `src/utils/share.js:1-66`; `dialog.js:1-39`; `verseRange.js:1-9`; `liturgicalSeason.js:1-30`; `readingProgress.js:1-35`; `ttsVoice.js` (exports); `bibleProgress.js`, `favorites.js`, `lastRead.js`, `searchHistory.js`, `onboarding.js` (exports).
- `src/data/dailyVerses.js:95-105`; `quiz.js:1960-1970`; `saints.js:160-200`; `references.js:2360-2432`; `bible.js:1-8` e exports; `referenceSources.js:31`; `i18n/strings.js` (contagem de chaves, linhas de `pt:`/`en:`).
- `src/sentry.js:5-14, 33-37`; `hooks/useGoogleSignIn.js:14-20, 50-58`; `hooks/useScrollHints.js:1-22`; `context/AuthContext.jsx:160-175`.
- Git: `git log --reverse` (primeiro commit), `git log -S` para 37 cadeias, `git log` por arquivo para 14 módulos, `git rev-list --count HEAD` (72).
