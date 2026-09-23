# 07. Ferramentas (hub, treino, espiritualidade)

Data: 2026-09-23. Base: commit `f6a5858` (branch `claude/funny-cray-ret9a0`, `src/` intocado). Mapa feito por um subagente somente leitura. Toda linha citada foi conferida no código atual.

## Escopo

Feature F7 do inventário (`00-features.md`): o hub `ToolsScreen` e as sete ferramentas que ele abre e que não pertencem a outra feature.

| Tela | Arquivo | Registros em `App.js` |
|---|---|---|
| Hub | `src/screens/ToolsScreen.jsx` | `ToolsMain` `:149` (raiz do ToolsStack) e `Tools` `:107` (HomeStack, sem chamador em `src/`) |
| Quiz | `src/screens/QuizScreen.jsx` | `:127` (Home), `:164` (Tools) |
| Diálogo | `src/screens/DialogueScreen.jsx` + `src/components/DialogueAnswerCard.jsx` | `:128` (Home), `:165` (Tools), `:200` (Settings), `:234-238` (Articles) |
| Debate | `src/screens/DebateStrategiesScreen.jsx` | `:129`, `:166` |
| Glossário | `src/screens/GlossaryScreen.jsx` | `:117`, `:155`, `:187`, `:239-243` |
| Rosário | `src/screens/RosaryScreen.jsx` | `:119`, `:157`, `:189` |
| Exame | `src/screens/ExamConscienceScreen.jsx` | `:120`, `:158`, `:190` |
| Mapa | `src/screens/BibleMapScreen.jsx` + `src/screens/bibleMap/{MapView.native.jsx, MapView.web.jsx, mapHtml.js}` | `:130`, `:167` |

Dados (só por estrutura, corpos não lidos): `quiz.js` (`QUIZ` `:6` 100 perguntas, 54 com `relatedArticle`; `TRUE_FALSE` `:1753` 100; `DAILY_QUESTIONS` `:1860`, nenhuma com `relatedArticle`), `dialogues.js` (`DIALOGUES` `:6` 53, todas com `relatedArticle`, 20 com `rank`; `getDialogueById` `:698-700`; `getDialoguesByCategory` `:702-704`), `debateStrategies.js` (`:6`, 9 `tatica` + 12 `falacia` = 21; `getStrategyById` `:212`), `glossary.js` (`:5` 26 termos; `glossaryById` `:242`; `glossaryByTerm` `:243-247`), `examConscience.js` (`:4` 8 seções; "Nao armazena respostas" `:2`), `jesusJourney.js` (`:8` 21 paradas, todas com `photo: require(...)` local e `nav`). Os mistérios do Rosário e as orações não estão em `src/data/`: vivem dentro da tela (`RosaryScreen.jsx:14-59` e `:61-82`).

Fora do escopo, só citados como destino: `Today`, `ReadingPlan` (F8/F4), `Notebook`/`Favorites`/`Highlights`/`Notes` (F10/F4), `ArticleFromSearch` (F4), `Bíblia` (F6), `AccountPrompt`/`GuestGate` (F2), `share.js`/`shareAsImage(.web).js` (F12).

## Fluxogramas

### 1. Hub: tab Ferramentas até cada ferramenta, com gate de conta

Espiritualidade (6 cards) e Treino (3 cards) navegam direto (`ToolsScreen.jsx:60`). Meu Estudo (4 cards) passa por `requireAccount` (`:78-87`) e mostra cadeado quando `!user` (`:94-96`). Todos os destinos existem no ToolsStack (`App.js:150-167`), então a tab bar segue visível.

```mermaid
flowchart TD
  TAB["Tab 'Ferramentas' (nome de rota fixo)<br/>App.js:344"] --> STACK["ToolsStackScreen<br/>App.js:138-170"]
  STACK --> HUB["ToolsScreen como ToolsMain<br/>App.js:149"]
  HOMEROUTE["Rota Tools do HomeStack, sem navigate('Tools') em src/<br/>App.js:107"] -.-> HUB
  HUB --> SP["buildSpirituality: 6 cards<br/>ToolsScreen.jsx:14-23"]
  HUB --> TR["buildTraining: 3 cards<br/>ToolsScreen.jsx:25-31"]
  HUB --> ST["buildStudy: 4 cards<br/>ToolsScreen.jsx:33-40"]
  SP --> RC["renderCard: navigation.navigate(item.screen)<br/>ToolsScreen.jsx:56-71"]
  TR --> RC
  RC --> TODAY["Today (F8)<br/>App.js:150"]
  RC --> PLAN["ReadingPlan (F4)<br/>App.js:156"]
  RC --> ROS["Rosary<br/>App.js:157"]
  RC --> EXAM["ExamConscience<br/>App.js:158"]
  RC --> GLO["Glossary<br/>App.js:155"]
  RC --> MAP["BibleMap<br/>App.js:167"]
  RC --> QUIZ["Quiz (abre em mode menu)<br/>App.js:164"]
  RC --> DLG["Dialogue (abre na lista)<br/>App.js:165"]
  RC --> DEB["DebateStrategies<br/>App.js:166"]
  ST --> RSC["renderStudyCard: requireAccount(cb, {title, message, icon})<br/>ToolsScreen.jsx:73-99"]
  RSC --> GATE{"user logado?<br/>GuestGate.jsx:17"}
  GATE -- sim --> STUDY["Notebook / Favorites / Highlights / Notes (F10, F4)<br/>App.js:151, 154, 159, 160"]
  GATE -- não --> PROMPT["AccountPromptModal (show com opts da tela)<br/>AccountPrompt.jsx:28-31, 49-121"]
  PROMPT -- "Criar conta" --> EXIT["onClose + exitGuest → AuthStack (F2)<br/>AccountPrompt.jsx:69-72"]
  PROMPT -- "Agora não" --> CLOSE["hide, fica no hub<br/>AccountPrompt.jsx:33, 114"]
```

### 2. Quiz: menu, pergunta diária com streak, praticar, verdadeiro ou falso

Uma única rota `Quiz` com `route.params.mode` (`QuizScreen.jsx:17`). O menu faz `navigation.push('Quiz', { mode })` (`:56`), então cada modo é uma nova entrada na pilha e "Outros modos" é `goBack` (`:251`, `:262`, `:377`). Só o modo `daily` grava algo.

```mermaid
flowchart TD
  IN["QuizScreen: mode = route.params.mode ou 'menu'<br/>QuizScreen.jsx:17"] --> M{"mode?<br/>QuizScreen.jsx:20-23"}
  M -- menu --> MENU["QuizMenu: 3 cards (daily, practice, truefalse)<br/>QuizScreen.jsx:27-70"]
  MENU --> PUSH["navigation.push('Quiz', {mode})<br/>QuizScreen.jsx:56"]
  PUSH --> IN
  M -- daily --> DAILY["getQuizOfDay: DAILY_QUESTIONS[seed do dia do ano]<br/>QuizScreen.jsx:84 / quiz.js:1964-1969"]
  M -- practice --> PRAC["getRandomQuestions(10) de QUIZ<br/>QuizScreen.jsx:86 / quiz.js:1972-1975"]
  M -- truefalse --> TF["TrueFalseGame: getRandomTrueFalse(10)<br/>QuizScreen.jsx:276-387, :283 / quiz.js:1978-1981"]
  DAILY --> LOADS["AsyncStorage.getItem('quiz:streak') → parseInt<br/>QuizScreen.jsx:88"]
  PRAC --> LOADS
  LOADS --> MC["MultipleChoiceGame: badge categoria, pergunta, 4 opções<br/>QuizScreen.jsx:138-196"]
  MC --> CH["choose(i): selected, showResult, score<br/>QuizScreen.jsx:93-97"]
  CH --> ISD{"mode === 'daily'?<br/>QuizScreen.jsx:99"}
  ISD -- sim --> HIST["hist[hoje em UTC] = {id, correct}; setItem('quiz:history')<br/>QuizScreen.jsx:100-106"]
  HIST --> OK{"acertou?<br/>QuizScreen.jsx:107"}
  OK -- sim --> STK["streak = hist[ontem].correct ? streak+1 : 1; setItem('quiz:streak')<br/>QuizScreen.jsx:108-112"]
  OK -- "não (streak intocado)" --> EXP
  STK --> EXP["explainBox: Acertou / Resposta correta + why; badge chama com streak<br/>QuizScreen.jsx:154-159, 198-210"]
  ISD -- não --> EXP
  EXP --> REL{"current.relatedArticle? (nunca em DAILY_QUESTIONS)<br/>QuizScreen.jsx:211"}
  REL -- sim --> ART["navigate('ArticleFromSearch', {articleId})<br/>QuizScreen.jsx:214"]
  REL -- não --> NX{"index + 1 >= questions.length?<br/>QuizScreen.jsx:135"}
  NX -- não --> NEXT["next(): index+1, limpa seleção<br/>QuizScreen.jsx:118-124"]
  NEXT --> MC
  NX -- "sim, practice" --> SCORE["scoreBox: t('quiz.scoreText') + Praticar de novo / goBack<br/>QuizScreen.jsx:230-257"]
  NX -- "sim, daily" --> BACK["Ver outros modos: goBack<br/>QuizScreen.jsx:259-267"]
  TF --> TFC["choose(true/false), score, sem persistência<br/>QuizScreen.jsx:293-297"]
  TFC --> TFN{"idx + 1 >= total?<br/>QuizScreen.jsx:291"}
  TFN -- não --> TFNEXT["next(): idx+1<br/>QuizScreen.jsx:299-303"]
  TFNEXT --> TF
  TFN -- sim --> TFS["scoreBox: Jogar de novo (restart) / goBack<br/>QuizScreen.jsx:305-310, 365-383"]
```

### 3. Diálogo: lista de objeções, conversa guiada em 4 passos, compartilhar como imagem

A mesma tela é lista e conversa: `activeId` nulo mostra `DialogueList` (`DialogueScreen.jsx:68-70`). Cinco entradas diferentes chegam aqui. `openedFromListRef` (`:26`) decide o que o "voltar" faz.

```mermaid
flowchart TD
  E1["Hub Treino<br/>ToolsScreen.jsx:28"] --> IN
  E2["Objeção do dia na Home<br/>HomeScreen.jsx:107"] --> IN
  E3["Intenção do onboarding (AsyncStorage onboarding:startIntent)<br/>HomeScreen.jsx:37-38 / onboarding.js:27-35"] --> IN
  E4["Artigo: RelatedDialogues filtra relatedArticle === article.id<br/>ArticleDetailScreen.jsx:224-226 / RelatedDialogues.jsx:16"] --> IN
  E5["Deep link dialogo/:dialogueId (só nativo)<br/>App.js:71, 81"] --> IN
  IN["DialogueScreen: activeId = route.params.dialogueId ou null; novo param reabre<br/>DialogueScreen.jsx:20-21, 31-38"] --> HAS{"getDialogueById(activeId) existe?<br/>DialogueScreen.jsx:40, 68"}
  HAS -- não --> LIST["DialogueList: agrupa por categoria (PT ou EN), ordena por rank<br/>DialogueScreen.jsx:154-207, 159-169"]
  LIST --> CHOOSE["onChoose: openedFromListRef = true, activeId = id, stepIndex = 0<br/>DialogueScreen.jsx:69"]
  CHOOSE --> HAS
  HAS -- sim --> STEPS["objBox 'Alguém diz' + passos 0..stepIndex<br/>DialogueScreen.jsx:92-112"]
  STEPS --> LAST{"stepIndex + 1 >= steps.length?<br/>DialogueScreen.jsx:72"}
  LAST -- não --> NEXT["Próximo passo: stepIndex+1<br/>DialogueScreen.jsx:114-119"]
  NEXT --> STEPS
  LAST -- sim --> SHARE["Compartilhar esta resposta (objeção + último passo + título do artigo)<br/>DialogueScreen.jsx:76-79, 121-126"]
  SHARE --> PLAT{"Platform.OS === 'web'?<br/>DialogueScreen.jsx:82"}
  PLAT -- sim --> WEB["shareDialogue: navigator.share, senão clipboard + notify PT<br/>share.js:59-64, 15-33"]
  PLAT -- não --> IMG["captureAndShareImage(shareCardRef, texto)<br/>DialogueScreen.jsx:85 / shareAsImage.js:25-49"]
  IMG --> CARD["DialogueAnswerCard offscreen 1080x1080, collapsable=false<br/>DialogueScreen.jsx:145-149 / DialogueAnswerCard.jsx:7-24"]
  IMG --> FALL{"view-shot e expo-sharing disponíveis?<br/>shareAsImage.js:26, 36, 45"}
  FALL -- sim --> SHEET["captureRef png + Sharing.shareAsync (dialogTitle 'Compartilhar versículo')<br/>shareAsImage.js:31-43"]
  FALL -- não --> TXT["Share.share(texto)<br/>shareAsImage.js:28, 38, 47"]
  LAST -- sim --> REL{"dialogue.relatedArticle?<br/>DialogueScreen.jsx:128"}
  REL -- sim --> ART["Ler artigo: navigate('ArticleFromSearch', {articleId})<br/>DialogueScreen.jsx:131"]
  REL -- não --> NOBTN["sem botão; source '' e card sem linha de fonte<br/>DialogueScreen.jsx:78-79, 128 / DialogueAnswerCard.jsx:16"]
  STEPS --> OTHER["Escolher outra objeção: activeId = null<br/>DialogueScreen.jsx:138-141"]
  OTHER --> LIST
  STEPS --> BACK{"voltar: hardware (BackHandler) ou header (beforeRemove)<br/>DialogueScreen.jsx:44-54, 57-66"}
  BACK -- "openedFromListRef = true" --> LIST
  BACK -- "openedFromListRef = false" --> EXITS["sai da tela (não intercepta)<br/>DialogueScreen.jsx:46, 59"]
```

### 4. Debate: busca + filtro por chip + card expansível

```mermaid
flowchart TD
  IN["DebateStrategiesScreen: expanded, query, filter='all'<br/>DebateStrategiesScreen.jsx:11-16"] --> SRC["DEBATE_STRATEGIES: 9 táticas + 12 falácias<br/>debateStrategies.js:6"]
  IN --> SEARCH["TextInput query (limpar com close-circle)<br/>DebateStrategiesScreen.jsx:44-61"]
  IN --> CHIPS["chips all / tatica / falacia<br/>DebateStrategiesScreen.jsx:36-40, 63-76"]
  SEARCH --> FILT["useMemo filtered: section + substring em name/definition PT e EN<br/>DebateStrategiesScreen.jsx:18-30"]
  CHIPS --> FILT
  SRC --> FILT
  FILT --> EMPTY{"filtered vazio?<br/>DebateStrategiesScreen.jsx:87"}
  EMPTY -- sim --> NONE["ListEmptyComponent 'Nada encontrado.'<br/>DebateStrategiesScreen.jsx:87"]
  EMPTY -- não --> LIST["FlatList: badge Tática ou Falácia + nome<br/>DebateStrategiesScreen.jsx:79-109"]
  LIST --> TAP["tap: expanded = isOpen ? null : item.id (um aberto por vez)<br/>DebateStrategiesScreen.jsx:95-98"]
  TAP --> BODY["definition + Exemplo + (Como responder | Como usar)<br/>DebateStrategiesScreen.jsx:110-118"]
```

### 5. Glossário: lista com busca e destaque por `highlightTerm`

```mermaid
flowchart TD
  E1["Hub Espiritualidade<br/>ToolsScreen.jsx:20"] --> IN
  E2["Artigo: termo marcado no Markdown ou auto-scan → onOpenGlossary<br/>MarkdownText.jsx:76, 113 / ArticleDetailScreen.jsx:308"] --> IN
  IN["GlossaryScreen: expanded, query, listRef<br/>GlossaryScreen.jsx:10-15"] --> HL{"route.params.highlightTerm?<br/>GlossaryScreen.jsx:18-19"}
  HL -- sim --> FIND["glossaryByTerm: igualdade case-insensitive em term ou termEn<br/>GlossaryScreen.jsx:21 / glossary.js:243-247"]
  FIND --> FOUND{"entrada encontrada?<br/>GlossaryScreen.jsx:22"}
  FOUND -- sim --> EXPAND["setExpanded(id), setQuery(''), scrollToIndex após 150 ms<br/>GlossaryScreen.jsx:23-30"]
  EXPAND --> FAILS["onScrollToIndexFailed: scrollToOffset estimado + retry em 80 ms<br/>GlossaryScreen.jsx:76-79"]
  FOUND -- não --> LIST
  HL -- não --> LIST["FlatList glossary (26) filtrado por query em term/definition PT e EN<br/>GlossaryScreen.jsx:33-43, 71-102"]
  EXPAND --> LIST
  LIST --> EMPTY{"filtered vazio?<br/>GlossaryScreen.jsx:84"}
  EMPTY -- sim --> NONE["'Nenhum termo encontrado.'<br/>GlossaryScreen.jsx:84"]
  EMPTY -- não --> TAP["tap: expanded toggle → definition<br/>GlossaryScreen.jsx:88-98"]
```

### 6. Rosário: mistério do dia, sequência de 65 contas, SVG, haptics, "Ler na Bíblia"

`buildSequence` (`RosaryScreen.jsx:96-133`) gera 65 passos: 2 na cruz, 5 no rabo, medalhão, 5 dezenas de 11 (Pai-Nosso + 10 Aves, slots 1..54), Glória final, Salve Rainha, cruz. Nada é persistido: fechar a tela zera `stepIndex`.

```mermaid
flowchart TD
  IN["RosaryScreen: tipo, showOracoes, stepIndex<br/>RosaryScreen.jsx:143-149"] --> DAY["detectTodayMysterio pelo dia da semana<br/>RosaryScreen.jsx:135-141, 147"]
  DAY --> CHIPS["chips gozosos / luminosos / dolorosos / gloriosos<br/>RosaryScreen.jsx:193-205 / MYSTERIES :14-59"]
  CHIPS --> CARDS["5 cards do mistério: nome, ref, fruto; card ativo pela dezena atual<br/>RosaryScreen.jsx:211-231"]
  CARDS -- "tap na ref" --> BIB["openInBible → navigate('Bíblia', {bookId, chapter, highlightVerse, highlightVerseEnd: verseEndFromRef(ref)})<br/>RosaryScreen.jsx:155-158 / verseRange.js:5-9"]
  IN --> SEQ["buildSequence(isEn): 65 passos com pos e dec<br/>RosaryScreen.jsx:96-133, 150"]
  SEQ --> VIS["RosaryVisual: SVG com 54 contas do loop, medalhão, 5 do rabo, cruz (não clicável)<br/>RosaryScreen.jsx:304-480"]
  VIS --> COLOR["colorFor: atual laranja, passado primary, futuro bege; Dimensions.get na render<br/>RosaryScreen.jsx:306, 380-396"]
  SEQ --> STEP["Passo n / 65 + label + link do mistério da dezena<br/>RosaryScreen.jsx:171-173, 237-249"]
  STEP -- "tap no mistério" --> BIB
  STEP --> ADV["Próxima conta: advanceStep<br/>RosaryScreen.jsx:160-164, 252-259"]
  ADV --> END{"stepIndex + 1 >= sequence.length?<br/>RosaryScreen.jsx:161, 253-255"}
  END -- não --> HAP1["setStepIndex + Haptics.impactAsync(Light).catch<br/>RosaryScreen.jsx:162-163"]
  HAP1 --> VIS
  END -- sim --> DIS["botão disabled, sem mensagem de fim<br/>RosaryScreen.jsx:255"]
  STEP --> RST["Reiniciar: stepIndex = 0 + Haptics Medium<br/>RosaryScreen.jsx:166-169, 260-263"]
  RST --> VIS
  IN --> PRAY["Mostrar orações: 5 textos PT/EN inline<br/>RosaryScreen.jsx:267-292 / ORACOES :61-82"]
```

### 7. Exame de consciência: 8 seções expansíveis e um link fixo ao artigo 83

```mermaid
flowchart TD
  IN["ExamConscienceScreen: expanded<br/>ExamConscienceScreen.jsx:10-13"] --> INTRO["intro + 1 João 1,9<br/>ExamConscienceScreen.jsx:26-39"]
  INTRO --> LEARN["'Entenda e defenda os Mandamentos' → navigation?.navigate('ArticleFromSearch', {articleId: 83})<br/>ExamConscienceScreen.jsx:40-49"]
  LEARN --> ART["artigo 83 'Os Dez Mandamentos' (id fixo na tela)<br/>src/data/articles/moral.js:290"]
  IN --> LIST["examConscience.map: 8 mandamentos com título<br/>ExamConscienceScreen.jsx:52-65 / examConscience.js:4"]
  LIST --> TAP["tap no cabeçalho: expanded toggle<br/>ExamConscienceScreen.jsx:56-65"]
  TAP --> Q["questoes ou questoesEn, uma linha por pergunta<br/>ExamConscienceScreen.jsx:66-75"]
  Q --> NOSAVE["nenhuma resposta gravada (sem AsyncStorage nem Firestore)<br/>examConscience.js:2"]
```

### 8. Mapa "Nos Passos de Jesus": WebView/iframe, rede e mensagens

`MapView` é escolhido pelo Metro pelo sufixo (`BibleMapScreen.jsx:7` importa `./bibleMap/MapView`). Os dois renderizadores recebem o mesmo HTML de `buildMapHtml` (`mapHtml.js:7-142`) e trocam mensagens em direções opostas: passo desce para o mapa, clique no pino sobe para a tela.

```mermaid
flowchart TD
  IN["BibleMapScreen: step, selected, mapInteracting<br/>BibleMapScreen.jsx:14-19"] --> HTML["buildMapHtml(isEn): JESUS_JOURNEY vira JSON dentro do HTML<br/>BibleMapScreen.jsx:41 / mapHtml.js:7-19, 41"]
  HTML --> PLAT{"plataforma (sufixo .native / .web escolhido pelo Metro)<br/>BibleMapScreen.jsx:7"}
  PLAT -- nativo --> WV["WebView source html, originWhitelist *, mixedContentMode always, startInLoadingState<br/>MapView.native.jsx:21-33"]
  PLAT -- web --> IF["iframe srcDoc<br/>MapView.web.jsx:25-30"]
  WV --> NET["rede: leaflet.css, leaflet.js 1.9.4 e polylineDecorator 1.6.0 de unpkg.com<br/>mapHtml.js:23, 38-39"]
  IF --> NET
  NET --> OFF{"scripts carregaram?<br/>mapHtml.js:38-39"}
  OFF -- não --> BLANK["L indefinido: fica só o fundo bege e o hint; sem onError, sem NetInfo, sem fallback<br/>mapHtml.js:26, 37 / MapView.native.jsx:21-33"]
  OFF -- sim --> TILES["L.tileLayer basemaps.cartocdn.com voyager<br/>mapHtml.js:61-64"]
  TILES --> MARK["21 markers + polyline até o passo + setas + panTo<br/>mapHtml.js:68-75, 91-131"]
  IN --> TL["timeline: Passo n / 21, card atual, Anterior / Próximo<br/>BibleMapScreen.jsx:25-27, 71-118"]
  IN --> ALL["lista Todas as paradas: goToStep(idx)<br/>BibleMapScreen.jsx:120-148"]
  TL --> SETSTEP["setStep(n)<br/>BibleMapScreen.jsx:25-27"]
  ALL --> SETSTEP
  SETSTEP -- nativo --> INJ["injectJavaScript window.setStep(n)<br/>MapView.native.jsx:9-11 / mapHtml.js:133-137"]
  SETSTEP -- web --> PM["contentWindow.postMessage {type:'setStep', n}<br/>MapView.web.jsx:20-22 / mapHtml.js:54-59"]
  INJ --> MARK
  PM --> MARK
  MARK -- "click no pino" --> EMIT["emitSelect: ReactNativeWebView.postMessage ou window.parent.postMessage(msg, '*')<br/>mapHtml.js:44-51, 73"]
  EMIT --> ONMSG["onMessage (nativo) ou window 'message' (web) → onSelectPlace(idx)<br/>MapView.native.jsx:13-18 / MapView.web.jsx:9-18"]
  ONMSG --> MODAL["PlaceModal: foto local via require com loading/erro + descrição<br/>BibleMapScreen.jsx:66, 156-204 / jesusJourney.js:19"]
  TL -- "tap no card atual" --> MODAL
  MODAL --> BIB["Ler na Bíblia → navigate('Bíblia', {bookId, chapter, highlightVerse, highlightVerseEnd})<br/>BibleMapScreen.jsx:29-38, 193-198"]
  IN --> TOUCH["mapWrapper onTouchStart/End/Cancel → ScrollView scrollEnabled = !mapInteracting<br/>BibleMapScreen.jsx:45, 57-62"]
```

## Efeitos colaterais

| Tipo | Onde | Detalhe |
|---|---|---|
| AsyncStorage (leitura) | `QuizScreen.jsx:88` | `quiz:streak` como string, `parseInt(v) || 0`, só nos modos `daily` e `practice` |
| AsyncStorage (escrita) | `QuizScreen.jsx:103-106` | `quiz:history` = `{ 'AAAA-MM-DD': { id, correct } }`; a data é `toISOString().slice(0,10)`, isto é, UTC |
| AsyncStorage (escrita) | `QuizScreen.jsx:108-112` | `quiz:streak` só quando acertou; "ontem" também em UTC (`Date.now() - 86400000`) |
| AsyncStorage (leitura indireta) | `HomeScreen.jsx:37-38` | `consumeStartIntent` lê e apaga `onboarding:startIntent` e abre `Dialogue` (F2/F3, citado porque desemboca aqui) |
| Haptics | `RosaryScreen.jsx:163`, `:168` | `impactAsync(Light)` a cada conta, `Medium` no reiniciar, ambos com `.catch(() => {})`. Único uso de `expo-haptics` no app (grep) |
| Rede | `mapHtml.js:23`, `:38`, `:39` | `unpkg.com/leaflet@1.9.4` (css + js) e `unpkg.com/leaflet-polylinedecorator@1.6.0` |
| Rede | `mapHtml.js:62` | tiles `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/...` (subdomínios a-d). É a única rede da feature; fotos das paradas são `require` local (`jesusJourney.js:19`) |
| Share (nativo) | `DialogueScreen.jsx:85` → `shareAsImage.js:31-43` | `react-native-view-shot` `captureRef` (png, tmpfile) + `expo-sharing` `shareAsync`; fallback `Share.share(texto)` em `:28`, `:38`, `:47` |
| Share (web) | `DialogueScreen.jsx:83` → `share.js:15-33` | `navigator.share`, senão `navigator.clipboard.writeText` + `notify('Copiado', ...)` em PT fixo (`:24`); acrescenta `APP_PROMO` (`:6-10`) |
| BackHandler | `DialogueScreen.jsx:44-54` | `hardwareBackPress` dentro de `useFocusEffect`; retorna `true` (consome) só se `activeId !== null && openedFromListRef.current` |
| Header back | `DialogueScreen.jsx:57-66` | `navigation.addListener('beforeRemove')` com `e.preventDefault()` na mesma condição |
| JS em WebView | `MapView.native.jsx:10` | `injectJavaScript` a cada `step`; `originWhitelist={['*']}` `:23`, `mixedContentMode="always"` `:31` |
| postMessage | `mapHtml.js:49`, `MapView.web.jsx:21` | target `'*'` nos dois sentidos; o listener web aceita qualquer origem e só filtra por `type` (`MapView.web.jsx:13`) |
| Timers | `GlossaryScreen.jsx:27-30`, `:78` | `setTimeout` 150 ms (com cleanup) e 80 ms (sem cleanup) para `scrollToIndex` |
| Navegação para fora | `RosaryScreen.jsx:157`, `BibleMapScreen.jsx:32` | `navigate('Bíblia', {...})`, sobe até o Tab (`App.js:343`) |
| Navegação para fora | `QuizScreen.jsx:214`, `DialogueScreen.jsx:131`, `ExamConscienceScreen.jsx:42` | `navigate('ArticleFromSearch', { articleId })` |
| Pilha | `QuizScreen.jsx:56` | `push('Quiz')` empilha a mesma rota; `goBack` em `:251`, `:262`, `:377` |
| Scroll | `BibleMapScreen.jsx:45`, `:57-62` | desliga o scroll da página enquanto o dedo está no mapa |

Sem efeitos: Debate, Glossário (além dos timers), Exame e Rosário (além de haptics) não gravam nada. Nenhuma tela desta feature toca Firestore, Sentry ou notificações (grep em `src/screens/{Exam,Rosary,BibleMap,DebateStrategies,Glossary,Dialogue}*`: 0 ocorrências de `AsyncStorage|firestore|userData`).

## Ramos

**Visitante em itens gated (Meu Estudo).** `renderStudyCard` (`ToolsScreen.jsx:73-99`) chama `requireAccount` com título/mensagem/ícone inline em PT e EN (`:81-85`). `GuestGate.jsx:16-22`: com `user`, executa o `navigate`; sem `user`, `show(opts)`. O modal (`AccountPrompt.jsx:49-121`) tem "Criar conta" (`exitGuest`, `:69-72`, o app cai no `AuthStack` por F2) e "Agora não" (`:114`, só fecha). Os cards de Espiritualidade e Treino não passam pelo gate: Quiz, Diálogo, Rosário etc. funcionam em modo visitante, inclusive o streak do quiz (AsyncStorage local).

**Mapa sem rede.** O HTML é inline (`source={{ html }}` `MapView.native.jsx:24`, `srcDoc` `MapView.web.jsx:28`), então a página abre, mas `<script src="https://unpkg.com/...">` (`mapHtml.js:38-39`) falha e `L.map` (`:61`) lança `ReferenceError`. Resultado: fundo `#e8dcb8` (`:26`, e o mesmo em `BibleMapScreen.jsx:236-237`) com o hint "Pinça pra zoom" (`:37`), sem pinos e sem rota. Não há `onError`/`onHttpError` no `WebView`, `NetInfo`, nem timeout (grep em `bibleMap/` e `BibleMapScreen.jsx`: só o `onError` da foto em `:188`). A timeline, a lista de paradas, o modal com foto local e o "Ler na Bíblia" continuam funcionando sem rede. Com rede parcial (scripts em cache, tiles não), Leaflet roda e os tiles ficam cinza.

**Diálogo sem `relatedArticle`.** Botão "Ler artigo" só renderiza com `dialogue.relatedArticle` (`DialogueScreen.jsx:128`). `relArticle`/`source` (`:78-79`) usam `articles.find`, então um id ausente vira `source = ''`, e o card omite a linha de fonte (`DialogueAnswerCard.jsx:16`) e o texto compartilhado omite o parêntese (`:85`). Hoje as 53 objeções têm `relatedArticle` (contagem por regex), então o ramo "não" só ocorre se um id apontar para artigo inexistente.

**Diálogo: origem determina o "voltar".** `openedFromListRef` fica `true` só em `onChoose` (`:69`); qualquer chegada por `route.params.dialogueId` zera para `false` (`:34`). Com `true`, hardware back (`:46-50`) e header back (`:59-63`) voltam à lista; com `false`, saem da tela. Chegar por `navigate` quando a tela já está montada dispara o `useEffect` de `:31-38` e troca o diálogo aberto sem passar pela lista.

**Diálogo aberto pela aba Artigos e "Ler artigo".** `ArticlesStack` registra `Dialogue` (`App.js:234-238`) mas não `ArticleFromSearch` (`:218-243`). O `navigate('ArticleFromSearch')` de `DialogueScreen.jsx:131` não é tratado pelo ArticlesStack nem pelo Tab; em `@react-navigation/core` 6.4.17 a ação passa então aos navegadores filhos montados (`node_modules/@react-navigation/core/lib/module/useOnAction.js:70-79`), ou seja, um stack irmão (Home, Tools ou Settings, o que estiver montado) trata e a aba muda. Confiança média: lido no código da lib, não executado.

**Quiz diário.** Não há guarda de "já respondido hoje": `choose` (`:99-115`) sobrescreve `hist[hoje]` e, ao acertar, soma `streak + 1` de novo (`:110`). Errar não zera nem grava o streak (`:107`); no dia seguinte, `had.correct === false` leva a `newStreak = 1`. Dia em UTC (`:100`, `:108`): entre 21h e 0h em Brasília a "pergunta do dia" já é a de amanhã. `DAILY_QUESTIONS` não tem `relatedArticle` (0 ocorrências após `quiz.js:1860`), então o botão "Ler artigo" (`:211`) nunca aparece no modo diário, só em `practice` (54 de 100 em `QUIZ`).

**Quiz sem perguntas.** `if (!current) return null` (`:129`, `:287`): tela vazia enquanto o `useEffect` (`:82-89`, `:283`) não popula. Com os bancos atuais é só o primeiro render.

**Glossário.** `highlightTerm` sem correspondência (`:22`) ou fora do índice (`:26`) cai na lista normal sem aviso. `scrollToIndex` sem layout medido dispara `onScrollToIndexFailed` (`:76-79`). A busca é reiniciada (`setQuery('')` `:24`) ao chegar por link.

**Debate e Glossário sem resultado.** `ListEmptyComponent` (`DebateStrategiesScreen.jsx:87`, `GlossaryScreen.jsx:84`).

**Rosário.** Fim da sequência desativa "Próxima conta" (`:253-255`) sem mensagem; "Reiniciar" continua ativo. `Haptics` na web ou em dispositivo sem motor rejeita e é engolido pelo `.catch` (`:163`, `:168`). Trocar o mistério (`:198`) não reinicia `stepIndex`: a dezena atual passa a apontar para o mistério do novo grupo (`:173`).

**Exame.** Único ramo: `navigation?.navigate` com optional chaining (`:42`); `articleId: 83` está fixo na tela, sem ligação com `examConscience.js`.

## Dependências externas (file:line)

| Pacote / host | Versão (`package.json`) | Uso |
|---|---|---|
| `@react-native-async-storage/async-storage` | 2.2.0 | `QuizScreen.jsx:4`, `:88`, `:103-112` |
| `expo-haptics` | ~15.0.8 | `RosaryScreen.jsx:6`, `:163`, `:168` |
| `react-native-svg` | 15.12.1 | `RosaryScreen.jsx:3`, `:400-477` (`Svg`, `Ellipse`, `Circle`, `Line`, `G`, `Defs`, `LinearGradient`, `Stop`) |
| `react-native-webview` | 13.15.0 | `MapView.native.jsx:2`, `:21-33` |
| `react-native-view-shot` | 4.0.3 | `shareAsImage.js:14`, `:31-35` (require dinâmico com try/catch) |
| `expo-sharing` | ~14.0.8 | `shareAsImage.js:20`, `:36-43` |
| `@react-navigation/native` | ^6.1.17 (core 6.4.17) | `useFocusEffect` `DialogueScreen.jsx:4`; `useNavigation` `ToolsScreen.jsx:3`, `RosaryScreen.jsx:5`; `beforeRemove` `DialogueScreen.jsx:58` |
| `@expo/vector-icons` (Ionicons) | (Expo SDK 54) | todas as telas do escopo |
| `unpkg.com` | leaflet 1.9.4, leaflet-polylinedecorator 1.6.0 | `mapHtml.js:23`, `:38`, `:39` (sem SRI, sem cópia local) |
| `basemaps.cartocdn.com` | rastertiles/voyager | `mapHtml.js:62-64` (atribuição "© OSM, © CARTO") |
| `react-native` `Share`, `BackHandler`, `Platform`, `Dimensions` | RN do SDK 54 | `shareAsImage.js:8`; `DialogueScreen.jsx:2`; `RosaryScreen.jsx:2`, `:306` |
| Web APIs | navegador | `navigator.share`/`clipboard` (`share.js:18-26`, `shareAsImage.web.js:7-13`), `window.postMessage`/`addEventListener('message')` (`MapView.web.jsx:16`, `:21`), `iframe srcDoc` (`:28`) |

Internas a outras features, consumidas aqui: `useRequireAccount` (`GuestGate.jsx:12`), `AccountPromptProvider` (`AccountPrompt.jsx:24`), `articles` (`DialogueScreen.jsx:8`), `verseEndFromRef` (`verseRange.js:5`), `shareDialogue` (`share.js:59`), `captureAndShareImage` (`shareAsImage.js:25` / `.web.js:5`), `useScrollHints` + `ScrollHint` (todas as telas menos `TrueFalseGame` e `BibleMapScreen`), `t()`/`isEn` (`LanguageContext`), `colors`/`fs` (`ThemeContext`).

## Duplicações observadas (fatos, sem solução)

1. **Hub registrado duas vezes.** `ToolsScreen` é `ToolsMain` no ToolsStack (`App.js:149`) e `Tools` no HomeStack (`App.js:107`). Não há `navigate('Tools')` em `src/` (grep por `'Tools'` e `"Tools"` só encontra os `t('header.tools')`/`t('tab.tools')`). Os 9 destinos do hub estão registrados nos dois stacks (`:108-130` e `:150-167`).
2. **Barra de busca e card expansível iguais em Debate e Glossário.** `DebateStrategiesScreen.jsx:44-61` e `GlossaryScreen.jsx:51-68` (mesmo JSX: ícone, `TextInput`, `focused`, botão limpar); estilos `searchRow`/`searchRowFocused`/`input`/`card`/`cardOpen`/`headRow`/`empty` repetidos (`:132-139`, `:148-150`, `:161` vs `:112-125`); filtro `useMemo` com o mesmo `toLowerCase().includes` em 4 campos (`:18-30` vs `:33-43`); `expanded = isOpen ? null : id` em Debate `:97`, Glossário `:90` e Exame `:57`.
3. **Cards de lista com chevron.** `ToolsScreen.jsx:56-71`, `QuizMenu` `:53-66`, `DialogueList` `:195-198`, lista de paradas `BibleMapScreen.jsx:127-146`, cards de mistério `RosaryScreen.jsx:211-231`: cinco layouts de "ícone + rótulo + subtítulo + chevron" com `StyleSheet` próprio.
4. **Dois streaks com regras diferentes.** Quiz: `quiz:streak` string + `quiz:history` JSON, dia em UTC, lógica inline na tela (`QuizScreen.jsx:11-12`, `:99-115`). Plano de leitura: `reading:streak` objeto `{count, lastDate}`, dia local (`readingProgress.js:5`, `:9-11`, `:13-34`), em `utils/`, exibido em `ReadingPlanScreen.jsx:29-30`, `:86-89`. Ambos exibem "N dias" com ícone `flame` (`QuizScreen.jsx:156`, `ReadingPlanScreen.jsx:87-89`).
5. **Persistência inline vs `utils/`.** O quiz é a única tela da feature que chama `AsyncStorage` direto; favoritos, progresso, último lido e Bíblia têm módulos em `src/utils/`. O `00-features.md` (fato 8) registra que `deleteAccount` não limpa `quiz:*`.
6. **Compartilhar como imagem: dois cards, um utilitário.** `DialogueScreen.jsx:27`, `:81-87`, `:145-149` + `DialogueAnswerCard.jsx` e `VerseOfDayCard.jsx:16`, `:29-30`, `:56-60` + `ShareVerseCard.jsx` seguem o mesmo padrão (ref, view offscreen `collapsable={false}` de 1080x1080, `Platform.OS !== 'web'`, `captureAndShareImage`). Diferenças: `DialogueScreen` decide web/nativo na tela (`:82`) enquanto `VerseOfDayCard` esconde o botão na web (`:56`); `shareAsImage.js:42` usa `dialogTitle: 'Compartilhar versículo'` também para o diálogo; `DialogueAnswerCard.jsx:11`, `:14` têm "Objeção"/"Resposta" só em PT, sem `isEn`.
7. **`openInBible` idêntico em Rosário e Mapa.** `RosaryScreen.jsx:155-158` e `BibleMapScreen.jsx:29-38` montam o mesmo objeto `{ bookId, chapter, highlightVerse, highlightVerseEnd: verseEndFromRef(ref) }` (o Mapa também fecha o modal). São 2 dos 9 chamadores de `navigate('Bíblia')` listados no `00-features.md`.
8. **"Sequência com Próximo" em quatro telas.** Estado de índice + botão avançar + condição de fim: `QuizScreen.jsx:118-124` e `:299-303`, `DialogueScreen.jsx:114-119`, `RosaryScreen.jsx:160-164`, `BibleMapScreen.jsx:25-27`. Barra ou contador "n / total": `QuizScreen.jsx:161`, `:316`, `RosaryScreen.jsx:239`, `BibleMapScreen.jsx:73-78`.
9. **Chips de filtro com dois estilos.** `DebateStrategiesScreen.jsx:63-76` (`:141-147`) e `RosaryScreen.jsx:193-205` (`:496-500`): mesmo widget, cores e raios diferentes.
10. **Caixa de introdução repetida.** `intro` com `borderLeftWidth: 3, borderLeftColor: accent` em `ExamConscienceScreen.jsx:88`, `BibleMapScreen.jsx:233`, `RosaryScreen.jsx:493`, e o mesmo traço em `objBox` (`DialogueScreen.jsx:223-226`) e `explainBox` (`QuizScreen.jsx:417-420`).
11. **Dados fora de `src/data/`.** `MYSTERIES` e `ORACOES` vivem em `RosaryScreen.jsx:14-82`, enquanto o conteúdo equivalente das outras ferramentas está em `src/data/*.js`.
12. **Helpers de dados sem consumidor de tela.** `getStrategyById` (`debateStrategies.js:212`) e `glossaryById` (`glossary.js:242`) não são importados fora de `src/data/`; `getDialoguesByCategory` (`dialogues.js:702-704`) só em `OnboardingScreen.jsx:34`.
13. **Bilíngue por dois caminhos na mesma tela.** `QuizScreen.jsx:32-44`, `:157`, `:254` usam `isEn ? :` inline e `:217`, `:225`, `:232-234` usam `t()`; idem `DialogueScreen.jsx:95` (`t`) vs `:124`, `:183-187` (inline). Já contado no `00-features.md` como transversal.
14. **`scrollEventThrottle={32}` + `useScrollHints`.** Mesmo bloco em `ToolsScreen.jsx:105-108`, `QuizScreen.jsx:142-145`, `DialogueScreen.jsx:177-180`, `DebateStrategiesScreen.jsx:83-86`, `GlossaryScreen.jsx:80-83`, `RosaryScreen.jsx:179-182`, `ExamConscienceScreen.jsx:21-24`; ausente em `TrueFalseGame` (`QuizScreen.jsx:314`) e `BibleMapScreen.jsx:45`.
15. **Rota Dialogue registrada em 4 stacks e ArticleFromSearch em 3.** `App.js:128`, `:165`, `:200`, `:234-238` vs `:125`, `:162`, `:195`. É o que produz o ramo "Diálogo aberto pela aba Artigos" acima.

## Confiança e lacunas

- **Alta**: `ToolsScreen.jsx`, `QuizScreen.jsx`, `DialogueScreen.jsx`, `DebateStrategiesScreen.jsx`, `GlossaryScreen.jsx`, `ExamConscienceScreen.jsx`, `BibleMapScreen.jsx`, os três arquivos de `bibleMap/`, `DialogueAnswerCard.jsx`, `GuestGate.jsx`, `AccountPrompt.jsx`, `shareAsImage(.web).js`, `share.js`, `verseRange.js`, trechos de `App.js` (`:55-90`, `:90-260`, `:286-345`): lidos por inteiro com número de linha.
- **Alta** para `RosaryScreen.jsx:1-13` e `:60-520` (lidos); as linhas `:14-59` (tabela `MYSTERIES`) foram lidas só por `grep` (4 grupos, 20 itens, cada um com `nav`).
- **Média** para os dados: `quiz.js`, `dialogues.js`, `debateStrategies.js`, `glossary.js`, `examConscience.js`, `jesusJourney.js` lidos por cabeçalho, exports e contagem por regex (margem de 1). O `00-features.md` fala em 20 estratégias; a contagem por `section:` deu 21 (9 + 12).
- **Média** para o bubbling do `navigate('ArticleFromSearch')` a partir do ArticlesStack: confirmado em `useOnAction.js:70-79` da lib instalada, não executado.
- **Não verificado em execução**: comportamento real do WebView/iframe sem rede (deduzido do HTML), rejeição de `Haptics` na web, e se `Sharing.isAvailableAsync` retorna falso em algum simulador. Nenhum app foi rodado; nenhum lint foi executado (não houve mudança em `src/`).
- **Fora do mapa**: `TodayScreen` e `ReadingPlanScreen` (destinos do hub, pertencem a F8/F4), consumo da notificação `objection-of-day` (`notifications.js:167` grava `dialogueId`, não achei `addNotificationResponseReceivedListener` em `App.js`/`notifications.js`; é F13).

## Fontes consultadas

`App.js` (`:55-90`, `:90-260`, `:286-345`), `src/screens/ToolsScreen.jsx`, `src/screens/QuizScreen.jsx`, `src/screens/DialogueScreen.jsx`, `src/screens/DebateStrategiesScreen.jsx`, `src/screens/GlossaryScreen.jsx`, `src/screens/RosaryScreen.jsx`, `src/screens/ExamConscienceScreen.jsx`, `src/screens/BibleMapScreen.jsx`, `src/screens/bibleMap/MapView.native.jsx`, `src/screens/bibleMap/MapView.web.jsx`, `src/screens/bibleMap/mapHtml.js`, `src/components/DialogueAnswerCard.jsx`, `src/components/GuestGate.jsx`, `src/components/AccountPrompt.jsx`, `src/components/VerseOfDayCard.jsx` (`:1-60`), `src/components/ShareVerseCard.jsx` (`:1-30`), `src/components/RelatedDialogues.jsx` (`:11-33`), `src/components/MarkdownText.jsx` (grep), `src/utils/shareAsImage.js`, `src/utils/shareAsImage.web.js`, `src/utils/share.js`, `src/utils/verseRange.js`, `src/utils/readingProgress.js` (`:1-40`, `:75-85`), `src/utils/onboarding.js`, `src/screens/HomeScreen.jsx` (`:30-45`, `:100-112`, grep), `src/screens/ArticleDetailScreen.jsx` (grep), `src/screens/ReadingPlanScreen.jsx` (grep), `src/services/notifications.js` (`:155-175`), `src/i18n/strings.js` (`:485-495`), `src/data/quiz.js`, `dialogues.js`, `debateStrategies.js`, `glossary.js`, `examConscience.js`, `jesusJourney.js` (estrutura, exports, contagens), `src/data/articles/moral.js:288-294`, `package.json`, `node_modules/@react-navigation/core/lib/module/useOnAction.js`, `docs/design/PATHFINDER-2026-09-23/00-features.md`.
