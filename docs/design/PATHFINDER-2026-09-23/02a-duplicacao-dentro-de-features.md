# 02a. Duplicação dentro de cada feature (Pathfinder)

Data: 2026-09-23. Base: commit `114a08b` (branch `claude/funny-cray-ret9a0`, `src/` e `App.js` intocados desde `f00ef6d`). Levantamento somente leitura por subagente do Pathfinder. Cada caso abaixo foi conferido no código atual com `sed -n` e `grep -n`; os números de linha dos fluxogramas foram reconferidos e corrigidos onde havia diferença de 1 a 2 linhas.

Escopo: só o que se repete **dentro da própria feature** (limites em `00-features.md`). O que cruza features aparece em uma nota curta "fora do escopo interno" no fim de cada seção, sem contar, para o `02b` tratar.

Legenda das colunas:
- **Locais**: `arquivo:linhas`. Caminhos relativos a `src/`, salvo `App.js`.
- **Divergências**: o que muda de uma cópia para outra (padding, raio, `fs`, cor, texto, comportamento).
- **Custo**: baixo (extrair helper ou componente com props, sem mudar comportamento), médio (precisa de decisão de design ou tocar em vários arquivos de features diferentes), alto (envolve comportamento sensível a plataforma ou conteúdo que exige revisão humana).
- **Tipo**: acidental (cópia sem motivo) ou legítima (há razão técnica; registrada para o redesign saber que não deve unificar sem cuidado).

Convenção de IDs: `F1-3` é o terceiro caso da feature F1. O total no fim conta só as linhas numeradas das tabelas.

---

## F1. Shell, tema e idioma

`App.js`, `context/ThemeContext.jsx`, `context/LanguageContext.jsx`, primitivas (`SectionBanner`, `ScrollHint`, `CrossMark`, `AppIcon`, `useModalNavBar`, `utils/dialog.js`).

| ID | O que se repete | Locais | Divergências | Custo | Tipo |
|---|---|---|---|---|---|
| F1-1 | Objeto de `screenOptions` do header (`headerStyle: { backgroundColor: colors.primary }`, `headerTintColor: '#fff'`, `headerTitleStyle: { fontWeight: 'bold' }`) | `App.js:99-103` (HomeStack), `:143-147` (ToolsStack), `:179-183` (SettingsStack), `:212-216` (ArticlesStack), `:312-314` (MainTabs, misturado com props da tab bar), `:354-358` (MainStack) | Nenhuma entre as 5 cópias literais. A 6ª (MainTabs) está dentro de uma função de `route` | Baixo: uma constante `headerOptions(colors)` num só lugar | Acidental |
| F1-2 | Função de título de rota copiada porque a rota está em dois stacks | `CategoryArticles`: `App.js:114` e `:153`. `Legal`: `App.js:131` e `:186` | Nenhuma | Baixo: função nomeada reutilizada nos dois registros | Acidental (efeito do registro múltiplo de rotas, ver `00-features.md`) |
| F1-3 | Bloco `if (Platform.OS === 'web') { try { window.localStorage.getItem/setItem } catch {} }` | `ThemeContext.jsx:72-74` (get `appg_theme`), `:97-99` (set), `LanguageContext.jsx:22-24` (get `appg_lang`), `:43-45` (set) | Só a chave e get/set | Baixo: `utils/webStorage.js` com `get(key)`/`set(key, v)` | Acidental |
| F1-4 | `darkMode ? DARK : LIGHT` recalculado em cada efeito | `ThemeContext.jsx:111` (NavigationBar), `:121` (CSS de autofill), `:139` (value) | Nenhuma | Baixo: derivar `colors` uma vez e usar nos efeitos | Acidental |
| F1-5 | `NavigationBar.setButtonStyleAsync(darkMode ? 'light' : 'dark').catch(() => {})` | `ThemeContext.jsx:113`, `hooks/useModalNavBar.js:12`, `:16` | Nenhuma na expressão. O hook reaplica ao abrir e fechar modal | Baixo: função `applyNavBarButtons(darkMode)` exportada pelo tema | Legítima em parte (o modal precisa reaplicar), acidental na expressão copiada |
| F1-6 | Dois mapas paralelos indexados pelas mesmas 5 strings PT (`ICONS` e `LABELS`) e `LABELS[route.name] \|\| route.name` duas vezes | `App.js:286-292` (ICONS), `:300-306` (LABELS), `:324` (`title`), `:326` (`tabBarLabel`) | Nenhuma | Baixo: um array `TABS` com `{ name, labelKey, iconOn, iconOff }` | Acidental |
| F1-7 | Branco fixo `'#fff'` para texto de header e da tab, fora da paleta | `App.js:101`, `:145`, `:181`, `:214`, `:313`, `:356` (`headerTintColor`), `:396` (`navTheme.colors.text`) | Nenhuma | Baixo: token `onPrimary` em `LIGHT`/`DARK` | Acidental (pesa no modo escuro e nos tokens) |
| F1-8 | As 4 chaves de tamanho de fonte declaradas duas vezes | `ThemeContext.jsx:49-54` (`FONT_SCALES`), `screens/SettingsScreen.jsx:30-35` (`FONT_OPTIONS`, rótulos PT fixos + `sample`) | Settings tem `label` PT fixo e `sample`; o tema tem só a escala | Baixo: `FONT_OPTIONS` exportado pelo tema com `labelKey` | Acidental |
| F1-9 | Chave `'settings:language'` declarada em dois arquivos e lida duas vezes no boot | `LanguageContext.jsx:7`, `:26`; `context/AuthContext.jsx:20`, `:54` | A leitura do Auth ignora `appg_lang` da web, corrigida depois por `setAuthLanguage` (`LanguageContext.jsx:30`) | Baixo para a constante (exportar), médio para a leitura dupla (AuthContext fica acima do LanguageContext) | Legítima na ordem dos providers, acidental na string duplicada |
| F1-10 | Três convenções de estilo nas primitivas | `components/SectionBanner.jsx:11`, `:26-44` (`makeStyles(c, fs)`), `components/ScrollHint.jsx:60-67` (`StyleSheet` estático + inline em `:44`, `:49`), `components/CrossMark.jsx:19-28` (só inline) | Sem `fs` e sem tema no ScrollHint/CrossMark | Baixo | Acidental (inconsistência de convenção) |
| F1-11 | Strings de UI em PT fixas fora de `strings.js` dentro do shell | `utils/dialog.js:23` (`'Cancelar'`), `:25` (`'OK'`); `App.js:254-255` (splash "APPologética", "1 Pedro 3,15") | Nenhuma | Baixo em `dialog.js` (receber `t` ou defaults por idioma cacheado). O splash roda antes do `LanguageProvider` | Legítima no splash, acidental em `dialog.js` |
| F1-12 | Cores da marca literais no splash em vez da paleta | `App.js:256`, `:266`, `:269`, `:279` (`#1a3a5c`, `#c9a84c`) vs `ThemeContext.jsx:8`, `:10` | Nenhuma no valor | Baixo: `brand.js` com `navy`/`gold` importado pelo tema e pelo splash | Legítima (splash antes do tema), acidental na literalidade |

Fora do escopo interno (para o `02b`): o par `useScrollHints` + `<ScrollHint>` + 4 props de scroll em 23 telas (`grep -rl "<ScrollHint" src/screens`); `#fff` fixo em headerRight de `NotebookScreen.jsx:27` e `NotebookPageScreen.jsx:85`, `:89`; `ErrorBoundary` (F14) com as mesmas cores fixas do splash.

---

## F2. Auth, visitante e onboarding

`screens/auth/*`, `context/AuthContext.jsx`, `hooks/useGoogleSignIn(.web).js`, `screens/OnboardingScreen.jsx`, `components/GuestGate.jsx`, `AccountPrompt.jsx`, `AuthTopToggles.jsx`.

| ID | O que se repete | Locais | Divergências | Custo | Tipo |
|---|---|---|---|---|---|
| F2-1 | Linha de input (`inputRow` com ícone, `TextInput`, olho de senha) e o estilo `input` com o hack de outline web | JSX: `LoginScreen.jsx:70-98`, `SignupScreen.jsx:66-118`, `ForgotPasswordScreen.jsx:63-74`. Estilos: `LoginScreen.jsx:184-194`, `SignupScreen.jsx:180-189`, `ForgotPasswordScreen.jsx:94-103` | Login tem `width: '100%'` no `inputRow`; os outros não. O resto é idêntico (card, raio 12, `paddingHorizontal` 16, `marginBottom` 12, `gap` 12, `height` 48, `fs(15)`) | Baixo: `AuthInput` com `icon`, `secure` | Acidental |
| F2-2 | Botão primário (`primaryBtn`/`primaryBtnText`) | `LoginScreen.jsx:203-210`, `SignupScreen.jsx:195-202`, `ForgotPasswordScreen.jsx:105-112` | Login: `width: '100%'`, sem `marginTop`. Signup e Forgot: `marginTop: 12`. Mesmo `paddingVertical` 14, raio 12, `fs(16)` bold branco | Baixo: `PrimaryButton` | Acidental |
| F2-3 | Divisor "ou" (linha, texto, linha) | `LoginScreen.jsx:131-135` (`divider`, estilos `:211-213`), `:158-162` (`guestDivider`, `:224-226`), `SignupScreen.jsx:141-145` (`:204-206`) | Na mesma tela de Login existem dois: `dividerText` `fs(12)`, `marginVertical` 20 vs `guestDividerText` `fs(11)`, uppercase, `letterSpacing` 1, `gap` 12, `marginTop` 28. Signup: `marginVertical` 18 | Baixo: `OrDivider` com um só visual | Acidental (dois visuais do mesmo divisor na mesma tela) |
| F2-4 | Botão "Continuar com Google" (JSX e estilo) | `LoginScreen.jsx:137-152` + `:238-250`, `SignupScreen.jsx:147-162` + `:207-218` | Signup exige `ageOk` antes de chamar `google.signIn` (`:150`); Login tem `width: '100%'`. Texto "Continuar com Google"/"ou" inline nos dois, sem chave em `strings.js` | Baixo: `GoogleButton` com `onBeforeSignIn` | Acidental |
| F2-5 | Invólucro `KeyboardAvoidingView` + `ScrollView keyboardShouldPersistTaps="handled"` com `behavior={Platform.OS === 'ios' ? 'padding' : undefined}` | `LoginScreen.jsx:57-63`, `SignupScreen.jsx:50-56`, `ForgotPasswordScreen.jsx:31-35` (o mesmo `behavior` em `NoteEditorScreen.jsx:112` e `NotebookPageScreen.jsx:129`, F10) | `content` padding 24, `paddingTop` 60 nos três; Login centraliza (`alignItems: 'center'`) | Baixo: `AuthScreenShell` | Acidental |
| F2-6 | `email.trim().toLowerCase()` no chamador | `LoginScreen.jsx:36`, `SignupScreen.jsx:42`, `ForgotPasswordScreen.jsx:22` | Nenhuma | Baixo: normalizar dentro de `signIn`/`signUp`/`resetPassword` | Acidental |
| F2-7 | `try { ... } catch (e) { return { ok: false, error: errorMessage(e.code) } }` | `AuthContext.jsx:101-109` (signUp), `:113-118` (signIn), `:126-132` (link), `:142-147` (reset), `:157-181` (deleteAccount) | `deleteAccount` tem um ramo `requires-recent-login` (`:177-179`) que produz o mesmo resultado do genérico (`:180`) | Baixo: `withAuthResult(fn)` | Acidental |
| F2-8 | Vermelho de erro `'#c0392b'` literal | `LoginScreen.jsx:197`, `SignupScreen.jsx:190`, `ForgotPasswordScreen.jsx:104` (fora de F2: `SettingsScreen.jsx:499-506`, `:515`, `:844`; `NoteEditorScreen.jsx:175`, `:223`; `NotebookPageScreen.jsx:165`, `:212`) | Nenhuma no valor; o estilo `error` difere em `marginBottom` 12 + `width: '100%'` (Login) vs `marginVertical` 12 | Baixo: token `danger` na paleta | Acidental (importa para o modo escuro) |
| F2-9 | Ternário bilíngue inline convivendo com `t('auth.*')` na mesma tela | `LoginScreen.jsx:32`, `:44`, `:107-118`, `:133`, `:148`, `:160`, `:169-171`; `SignupScreen.jsx:25-31`, `:63`, `:70`, `:97`, `:112`, `:125`, `:131`, `:143`, `:158`, `:166`; `ForgotPasswordScreen.jsx:20`, `:45-49`, `:58-60` | Nenhuma de forma | Médio: volume (cerca de 25 strings) e criação das chaves nos dois idiomas | Acidental |
| F2-10 | A mesma promessa "marcações e notas ficam salvas e sincronizadas" em quatro redações | `LoginScreen.jsx:169-171` (guestHint), `SignupScreen.jsx:63` (subtítulo), `AccountPrompt.jsx:20` + `:104-106` (mensagem e benefícios), `SettingsScreen.jsx:176-177` e `:519-520` (aviso de exclusão) | Redação diferente em cada uma; a do favorito promete sincronia de algo que é local (`ArticleDetailScreen.jsx:209-210`) | Baixo: uma chave `auth.syncPromise` | Acidental |
| F2-11 | Mensagens do gate "criar conta?" inline no chamador, e default PT resolvido para EN por comparação de string | `AccountPrompt.jsx:18-22` (DEFAULT_OPTS PT), `:95-100` (EN só se o texto for igual ao default); chamadores `screens/BibleScreen.jsx:514-519`, `screens/ToolsScreen.jsx:80-84`, `screens/ArticleDetailScreen.jsx:206-212` | Título, mensagem e ícone diferentes por contexto, todos com PT e EN inline | Médio: `AccountPrompt` aceitar `context: 'highlight' \| 'favorite' \| 'study'` e resolver por `t()`; tocar 3 telas | Acidental |
| F2-12 | `isPasswordUser` calculado com a mesma expressão | `SettingsScreen.jsx:54`, `AuthContext.jsx:156` | Nenhuma | Baixo: expor `isPasswordUser` no contexto | Acidental |
| F2-13 | As duas variantes do hook Google mantêm o mesmo tratamento de `account-exists-with-different-credential` e o mesmo objeto de retorno de 7 chaves | `hooks/useGoogleSignIn.js:37-41` / `.web.js:25-30`; retorno `:66-74` / `:40-48` | Web: `pendingCred` pode ser `null` (`.web.js:29`). Mensagens de erro PT fixas nos dois | Médio: extrair o estado comum (`needsLink`, `error`, `busy`) para um hook base; a chamada Firebase continua por plataforma | Legítima na divisão por plataforma (convenção do app), acidental no estado copiado |
| F2-14 | Bloco de marca (cruz + "APPologética" ou frase + verso) | `LoginScreen.jsx:64-68` (`CrossMark` 54 + título + `t('auth.subtitle')`), `OnboardingScreen.jsx:77-91` (`CrossMark` 64 + h1 inline + lead + verso 1 Pedro 3,15-16 inline), `App.js:250-259` (`BrandedSplash`, glifo `✝` em `Text`, cores fixas) | Tamanhos 54/64/72, textos diferentes, o splash não usa `CrossMark` nem o tema | Médio: `BrandBlock` com `size`, `title`, `subtitle`; o splash pode usar o mesmo componente com cores fixas | Legítima no splash, acidental entre Login e Onboarding |
| F2-15 | `AuthTopToggles` montado à mão em 3 das 4 telas de entrada | `OnboardingScreen.jsx:65`, `LoginScreen.jsx:61`, `SignupScreen.jsx:54`; ausente em `ForgotPasswordScreen.jsx` | Em Signup divide o topo com a seta de voltar (`:57-59`) | Baixo: o `AuthScreenShell` de F2-5 monta os toggles uma vez | Acidental (omissão, registrada como inconsistência) |
| F2-16 | Botão "voltar" manual (`arrow-back` 24, `primaryText`) com estilo `backBtn` | `SignupScreen.jsx:57-59` + `:177`, `ForgotPasswordScreen.jsx:36-38` + `:95` | Nenhuma | Baixo: usar o header do `AuthStack` ou um `BackButton` | Acidental |

Fora do escopo interno: `AuthTopToggles.jsx:15-29` vs os chips de tema/idioma de `SettingsScreen.jsx:256-267`, `:307-324` (F11); `#1a3a5c` literal em `AccountPrompt.jsx:110`, `:198`; `Constants.executionEnvironment === 'storeClient'` em `useGoogleSignIn.js:17` e `sentry.js:9` (F14).

---

## F3. Início

`screens/HomeScreen.jsx`, `components/ContinueReadingCard.jsx`, `utils/liturgicalSeason.js`.

| ID | O que se repete | Locais | Divergências | Custo | Tipo |
|---|---|---|---|---|---|
| F3-1 | Caixa de ícone 40x40, raio 9, `badgeBg` definida duas vezes na mesma tela | `HomeScreen.jsx:205-208` (`categoryIcon`), `:215-218` (`cardIcon`) | `categoryIcon` tem `marginBottom: 10` a mais | Baixo: um estilo com o `marginBottom` no tile | Acidental |
| F3-2 | Dois cards com filete esquerdo de 4 px | `HomeScreen.jsx:175-179` (`seasonBanner`: padding 12, cor da estação), `:221-224` (`objectionCard`: padding 14, `accent`) | Padding 12 vs 14; um é `row` com `gap` 12, o outro coluna | Baixo: `AccentCard` com `borderColor` | Acidental |
| F3-3 | Kicker em caixa alta (`fs(11)`, `accentText`, bold, uppercase, `letterSpacing` 0.5) | `HomeScreen.jsx:210` (`categoryCount`), `:226-229` (`objectionKicker`); `ContinueReadingCard.jsx:55` (`label`: `fs(10)`, `letterSpacing` 1) | `fs` 11/11/10; `letterSpacing` 0.5/0.5/1 | Baixo: token de texto `kicker` | Acidental |
| F3-4 | Três contêineres "linha em card" com raio e padding diferentes na mesma tela | `HomeScreen.jsx:190-194` (`searchBar`: raio 10, `paddingVertical` 12, `paddingHorizontal` 14, `gap` 10), `:211-214` (`card`: raio 10, padding 13, `gap` 12, `marginBottom` 9), `:198-204` (`categoryTile`: raio 12, padding 14, `marginBottom` 12) | Raio 10/10/12, padding 12-14/13/14, margem 12/9/12 | Baixo: tokens `radius.card` e `space` | Acidental |
| F3-5 | Bilíngue inline ao lado de `t()` na mesma tela | Inline: `HomeScreen.jsx:83` (wedge), `:114` (objeção), `:137` (nome de categoria em PT vem do id), `:140` (plural de artigo). Via `t()`: `:84-85`, `:99`, `:110`, `:117`, `:124`, `:152-153` | O plural inline repete `ArticlesScreen.jsx:64-65` e `CategoryArticlesScreen.jsx:27-29` (F4) | Baixo: chaves `home.wedge`, `articles.count` com interpolação | Acidental |

Fora do escopo interno: `card`/`cardIcon`/`cardLabel`/`cardSub` de `HomeScreen.jsx:211-220` são literalmente iguais a `ToolsScreen.jsx:130-139` (F7); `ContinueReadingCard.jsx:49-57` vs `ContinueBibleCard.jsx:46-65` (F6); a fórmula da objeção do dia `HomeScreen.jsx:65-67` vs `services/notifications.js:8-12` (F13) e as sementes de `data/dailyVerses.js:98-104` (F8) e `data/quiz.js:1966-1967` (F7); `easterDate` de `liturgicalSeason.js:6-28` vs `data/saints.js:166-188` (F8); a barra de busca falsa `HomeScreen.jsx:97-100` vs os campos reais de F6, F7 e F9.

---

## F4. Artigos (lista, categorias, detalhe, favoritos, plano)

`screens/ArticlesScreen.jsx`, `CategoryArticlesScreen.jsx`, `ArticleDetailScreen.jsx`, `FavoritesScreen.jsx`, `ReadingPlanScreen.jsx`, `components/RelatedArticles.jsx`, `RelatedDialogues.jsx`, `MarkdownText.jsx`, `ReadingProgressBar.jsx`.

| ID | O que se repete | Locais | Divergências | Custo | Tipo |
|---|---|---|---|---|---|
| F4-1 | Card de artigo (título + resumo, às vezes categoria e chevron) com `StyleSheet` próprio em cada tela | `ArticlesScreen.jsx:89-102` + `:114-122`; `CategoryArticlesScreen.jsx:52-58` + `:71-78`; `FavoritesScreen.jsx:66-77` + `:91-97`; `ReadingPlanScreen.jsx:115-147` + `:176-184`; `components/RelatedArticles.jsx:23-34` + `:51-61` | Padding 16/16/14/13/12; `marginTop` 12 vs `marginBottom` 12/8/8/8; raio 12/12/12/12/10; título `fs(16)` bold / `fs(16)` bold / `fs(14)` 600 / `fs(14)` 600 / `fs(13)` 600; chevron 16 `textSubtle` / ausente / 16 `textSubtle` / 16 `textSubtle` / 16 `accent`; borda 1 `divider` só em RelatedArticles; layout coluna nas duas primeiras, linha nas outras | Médio: `ArticleCard` com variantes `list`, `compact`, `inline`; decidir os valores | Acidental |
| F4-2 | Fallback de idioma `isEn ? (a.titleEn \|\| a.title) : a.title` (e o mesmo para `summary`) | `ArticlesScreen.jsx:96`, `:99`; `CategoryArticlesScreen.jsx:56-57`; `FavoritesScreen.jsx:73-74`; `ReadingPlanScreen.jsx:139`; `RelatedArticles.jsx:32`; `ArticleDetailScreen.jsx:47`, `:112` (fora de F4: `ContinueReadingCard.jsx:40`, `SearchScreen.jsx:192-193`, `DialogueScreen.jsx:79`, `ReferencePickerModal.jsx:50`, `:73`, `:150`) | Nenhuma | Baixo: `articleTitle(a, isEn)`/`articleSummary` em `data/articles/index.js` | Acidental |
| F4-3 | Rótulo de categoria `isEn ? t(\`category.${x}\`) : x` | `ArticlesScreen.jsx:84`, `CategoryArticlesScreen.jsx:36`, `FavoritesScreen.jsx:72`, `RelatedArticles.jsx:30`, `ArticleDetailScreen.jsx:292` (fora de F4: `App.js:114`, `:153`; `HomeScreen.jsx:137`; `SearchScreen.jsx:191`) | `ArticlesScreen.jsx:84` tem a exceção `popular` | Baixo: `categoryLabel(id, t, isEn)` em `data/articleCategories.js` | Acidental |
| F4-4 | `ArticlesScreen` e `CategoryArticlesScreen` repetem a mesma lógica de lista | `sortByRank(articles.filter(...))` `ArticlesScreen.jsx:56` / `CategoryArticlesScreen.jsx:22`; `countLabel` `:64-65` / `:27-29`; string vazia `:74` / `:46`; estilo `empty` `:123` / `:79` (idênticos); `SectionBanner` com os mesmos props `:80-87` / `:33-39` | Navegam para nomes de rota diferentes do mesmo componente (`'ArticleDetail'` `:93` vs `'ArticleFromSearch'` `:54`) | Médio: `CategoryArticles` pode ser `ArticlesScreen` com filtro, ou os dois consumirem helpers de `articleCategories.js` | Acidental |
| F4-5 | Busca de artigo por id sem helper `articles.find((a) => a.id === id)` | `ArticlesScreen.jsx:50`, `ArticleDetailScreen.jsx:33`, `FavoritesScreen.jsx:25`, `ReadingPlanScreen.jsx:113`, `ContinueReadingCard.jsx:21` (F3), `DialogueScreen.jsx:78` (F7) | Nenhuma | Baixo: `articleById` em `data/articles/index.js` | Acidental |
| F4-6 | `RelatedArticles` e `RelatedDialogues` têm `container`, `label` e `card` idênticos e a mesma estrutura de lista | `RelatedArticles.jsx:42-61` / `RelatedDialogues.jsx:42-61` | Só o miolo do card (badge + título vs ícone + objeção em itálico) | Baixo: `RelatedList` com `renderItem` | Acidental |
| F4-7 | Dois padrões de estado vazio dentro da feature | Texto solto `empty` (`ArticlesScreen.jsx:74` + `:123`, `CategoryArticlesScreen.jsx:46` + `:79`) vs bloco centrado com ícone 56, título e texto (`FavoritesScreen.jsx:41-53` + `:88-90`) | O primeiro é um `Text` com `marginTop` 40; o segundo é `center`/`emptyTitle`/`muted`, igual às telas de F10 | Baixo: `EmptyState` | Acidental |
| F4-8 | `useScrollHints` + 2 `<ScrollHint>` + as 4 props de scroll | `ArticlesScreen.jsx:61`, `:75-78`, `:104-105`; `CategoryArticlesScreen.jsx:24`, `:47-50`, `:61-62`; `FavoritesScreen.jsx:34`, `:61-64`, `:80-81`; `ReadingPlanScreen.jsx:52`, `:107-110`, `:151-152`; `ArticleDetailScreen.jsx:233`, `:260-263`, `:358-359` | ArticleDetail compõe o `onScroll` com o progresso (`:216-222`) e usa throttle 16 | Baixo: `HintedList`/`HintedScroll` | Acidental |
| F4-9 | `contentContainerStyle={{ padding: 16, paddingBottom: 40 }}` inline | `CategoryArticlesScreen.jsx:45`, `FavoritesScreen.jsx:60`, `ReadingPlanScreen.jsx:106` | Nenhuma | Baixo: token de lista | Acidental |
| F4-10 | Salvar a posição de scroll antes de navegar | `ArticleDetailScreen.jsx:190` (`openReference`), `:308` (`onOpenGlossary`) | Nenhuma | Baixo: `navigateKeepingScroll(route, params)` | Acidental |
| F4-11 | Duas barras de progresso na feature | `ReadingPlanScreen.jsx:169-170` (`bar`/`barFill`: altura 6, raio 3) vs `components/ReadingProgressBar.jsx:5-15` (altura 3, sem raio), usada em `ArticleDetailScreen.jsx:246` | Altura 6 vs 3, raio 3 vs 0 | Baixo: `ProgressBar` com `height` | Acidental |

Fora do escopo interno: TTS de `ArticleDetailScreen.jsx:96-125` e os efeitos de parada `:59-82` vs `BibleScreen.jsx:570-627`, `:631-641` (F6); `segment` de `ReadingPlanScreen.jsx:161-165` vs `ReferencePickerModal.jsx:249-253` (F10); `dayBubble` `:178` vs `numBubble`/`listNum` de F7; `requireAccount` inline em `:206-212` (F2-11); `center`/`emptyTitle`/`muted` de `FavoritesScreen.jsx:88-90` vs F10-4.

---

## F5. Referências

`screens/ReferencesScreen.jsx`, `RefDetailScreen.jsx`, `components/RefSourceBlock.jsx`, `data/references.js` (helpers), `referenceSources.js`.

| ID | O que se repete | Locais | Divergências | Custo | Tipo |
|---|---|---|---|---|---|
| F5-1 | O card de referência inteiro (badge, ref, fonte, meta, tópico, texto, `originalLanguage`, `RefSourceBlock`, ações) em duas cópias de JSX | `ReferencesScreen.jsx:88-165` (`RefCard`) / `RefDetailScreen.jsx:76-144` | Rótulo Strong `'Strong Concordance'` (`:139`) vs `` `Strong's ${...}` `` (`:110`); badge "Content available in Portuguese only" só na lista (`:118-123`); botão "Abrir no Catecismo" só no detalhe (`:127-135`); `fullSource` traduzido só na lista (`:101`); no detalhe a badge tem `alignSelf`/`marginBottom` (`:169-171`) | Médio: um `ReferenceCard` com `expanded` fixo no detalhe (o comentário em `RefSourceBlock.jsx:10-11` já apontou a terceira cópia) | Acidental |
| F5-2 | `makeStyles` com 20 chaves iguais | `ReferencesScreen.jsx:318-367` / `RefDetailScreen.jsx:158-214` (`card`, `badge`, `badgeText`, `cardRef`, `cardFullSource`, `cardMeta`, `cardTopic`, `expanded`, `cardText`, `origBox`, `origHeader`, `origLabel`, `origWord`, `origTransliteration`, `origMeaning`, `origStrongs`, `actions`, `actionBtn`, `actionBtnPrimary`, `actionText`, `actionTextPrimary`) | Card com borda `accent` sempre (`:162-163`) vs só quando aberto (`cardOpen`, `:323`) | Baixo: resolvido junto com F5-1 | Acidental |
| F5-3 | Duas tabelas PT para EN de nomes bíblicos | `ReferencesScreen.jsx:17-74` (`translateFullSource`: `FS_GOSPEL` + 22 prefixos, só a lista usa) vs `data/references.js:2367-2392` (`BOOK_PT_TO_EN`, 60 livros, usada por `translateRef`) | `RefDetailScreen.jsx:81` e `ArticleDetailScreen.jsx:342` mostram `fullSource` em PT quando falta `fullSourceEn` | Médio: mover para `references.js` e usar nos três lugares; envolve dado | Acidental |
| F5-4 | Fusão PT+EN de duas formas na mesma feature | `ReferencesScreen.jsx:76-79` (spread no módulo) vs `RefDetailScreen.jsx:25` (objeto `en` campo a campo); por isso `resolveRefUrl(item, item, isEn)` (`:156-157`) vs `resolveRefUrl(item, en, isEn)` (`:58`) | Fora de F5 há mais duas formas: `ArticleDetailScreen.jsx:336` e `ReferencePickerModal.jsx:39-45` | Baixo: `withEn(ref)` em `references.js` | Acidental |
| F5-5 | Lookup por id refeito | `data/references.js:2365` (`referenceById`, usado por `ArticleDetailScreen.jsx:327`) vs `RefDetailScreen.jsx:22` (`references.find`) | Nenhuma | Baixo | Acidental |
| F5-6 | Contrato `navigate('Bíblia', { bookId, chapter, highlightVerse, highlightVerseEnd })` copiado | `ReferencesScreen.jsx:242-247` / `RefDetailScreen.jsx:43-48` (mais 7 arquivos fora de F5) | Nenhuma entre as duas | Baixo: `openBibleRef(navigation, nav)` | Acidental |
| F5-7 | `(isEn && item.bibleNavEn) \|\| item.bibleNav` | `ReferencesScreen.jsx:150` / `RefDetailScreen.jsx:41` (comentário explicativo só no detalhe, `:39-40`) | Nenhuma | Baixo: `bibleNavFor(item, isEn)` | Acidental |
| F5-8 | Catecismo resolvido por dois caminhos | `RefDetailScreen.jsx:12-13` (`VATICAN_BASE_PT/EN`) e `:62-65` (`openInCatechism` abre `item.url` cru) vs `references.js:2522-2535` (`resolveRefUrl` já reescreve para `ENG0015`) | Em EN a mesma ref `cic-` abre destinos diferentes conforme a tela; contradiz `references.js:2516-2519` e `RefDetailScreen.jsx:55-57` | Baixo: remover `openInCatechism` e usar `sourceUrl` | Acidental |
| F5-9 | `Linking.openURL(url).catch(() => {})` | `ReferencesScreen.jsx:234-237`, `RefDetailScreen.jsx:51-54`, `:62-65` (fora de F5: `SettingsScreen.jsx:575`) | Nenhuma | Baixo: `openExternal(url)` em `utils/` | Acidental |
| F5-10 | Strings fora do i18n convivendo com `t('ref.*')` | `ReferencesScreen.jsx:121` (EN fixo), `:130`, `:139`, `:272-273` (`countLabel`), `:296` (PT fixo); `RefDetailScreen.jsx:33`, `:101`, `:110` | `:296` "Nenhuma referência encontrada." só em PT | Baixo | Acidental |
| F5-11 | Tratamento de `highlightId` na lista (expandir + 3 `scrollToLocation` + listener `focus`) que duplica a responsabilidade do `RefDetail` e não tem chamador | `ReferencesScreen.jsx:190-224`; `components/StickySectionList.web.jsx:42-68` reimplementa `scrollToLocation` para servir esse caminho | O único `navigate('References')` (`HomeScreen.jsx:148`) não passa params | Baixo: remover (35 linhas + parte do web) | Acidental (código morto) |

Fora do escopo interno: `actionBtn`/`actionBtnPrimary` (`:354-367`) vs `VerseOfDayCard.jsx:106-117` (F8); `empty` `:368` = `ArticlesScreen.jsx:123` (F4); `center`/`muted` de `RefDetailScreen.jsx:156-157` vs F10-4; `StickySectionList` e `SectionBanner` compartilhados com F4.

---

## F6. Bíblia

`screens/BibleScreen.jsx` (1093 linhas), `services/bibleApi.js`, `hooks/useBibleReady.js`, `components/BibleLoadingState.jsx`, `ContinueBibleCard.jsx`, `utils/bibleProgress.js`, `ttsVoice.js`, `verseRange.js`.

| ID | O que se repete | Locais | Divergências | Custo | Tipo |
|---|---|---|---|---|---|
| F6-1 | Três barras de progresso (`View` fina com `width: pct%` e cor `accent`) | `components/ReadingProgressBar.jsx:5-15` (altura 3, sem raio; usada em `BibleScreen.jsx:824`); `BibleScreen.jsx:1039-1040` + JSX `:752-755` (`bookProgressTrack/Fill`: altura 4, raio 2); `components/ContinueBibleCard.jsx:61-65` + JSX `:28-30` (`track/fill`: altura 3, raio 2, `marginTop` 6) | Altura 3/4/3, raio 0/2/2 | Baixo: `ProgressBar` com `height` e `radius` | Acidental |
| F6-2 | O mesmo título renderizado no header do navigator e no corpo | `BibleScreen.jsx:180` (`headerTitle` `${bn(book)} ${chapter}`) vs `:805` (`verseHeaderTitle`); `:181` (livro) vs `:750` (`bookHeader`) | Nenhuma no texto; o corpo tem `fs(20)`/`fs(22)` bold | Baixo: decidir um dos dois (afeta o chrome) | Acidental |
| F6-3 | Dois `navigation.addListener('blur')` e dois cleanups de desmontagem no mesmo componente | Progresso: `:366` (blur) + `:382` (unmount). TTS: `:634-641` (blur) + `:631-633` (unmount) | Responsabilidades diferentes (flushSave vs Speech.stop) | Baixo: um efeito `onLeave` que chama os dois | Legítima na separação, acidental na forma |
| F6-4 | Separador de referência `isEn ? ':' : ','` | `BibleScreen.jsx:554` (copiar), `:936` (modal), `services/bibleApi.js:107` (resultado de busca); fora de F6: 5 pontos em F10 e vírgula fixa em `utils/share.js:36`, `:48` | `share.js` ignora o idioma | Baixo: `formatVerseRef({ book, chapter, verse, verseEnd }, isEn)` em `utils/` | Acidental |
| F6-5 | Estilos mortos | `BibleScreen.jsx:1023-1024` (`backRow`, `backText`, sobra do botão que migrou para o header `:171-182`) | n/a | Baixo: apagar | Acidental |
| F6-6 | Três linhas de ação do modal com o mesmo markup (ícone 20 `primaryText` + texto) | `BibleScreen.jsx:969-972`, `:974-977`, `:979-982` (estilo `modalAction` `:1084-1087`) | Só ícone, rótulo e handler | Baixo: `map` sobre uma lista de ações | Acidental |
| F6-7 | Bilíngue inline ao lado de `t('bible.*')` | Inline: `:660-661` (AT/NT), `:669-674` (intro), `:681` (placeholder), `:727-728` (capítulos/deuterocanônico), `:812-814` (a11y do TTS), `:831-836` (capítulo em preparação), `:936`. Via `t()`: `:757`, `:940`, `:970`, `:975`, `:980` | Nenhuma de forma | Médio: cerca de 12 chaves novas | Acidental |
| F6-8 | Lógica "scroll meu vs do usuário" e restauração de posição espalhadas por 12 `useRef`, 3 gatilhos e 4 caminhos de restauração | Refs `:82-84`, `:102-123`; `tryRestore` `:247-273`; `marcarLeitura` `:392-395`; `onVerseScroll` `:397-421`; `onVerseLayout`/`onVerseContentSize` `:424-434`; JSX `:848-849` (`onScrollBeginDrag` + `onTouchMove` com o mesmo handler) | O comentário `:386-390` explica diferenças web/nativo (react-native-web não dispara `onScrollBeginDrag`) | Alto: extrair `useRestoreScroll` exige validar em Android, iOS e web | Legítima na necessidade (plataformas), acidental na dispersão |

Fora do escopo interno: `toggleChapterTts` `:570-627` vs `ArticleDetailScreen.jsx:96-125` (F4) e a prévia de `SettingsScreen.jsx:96-116` (F11); campo de busca de livro `:677-688` + `:1000-1007` vs `GlossaryScreen.jsx:51-68`, `DebateStrategiesScreen.jsx:44-61` (F7), `SearchScreen.jsx:249-272` (F9) e `ReferencePickerModal.jsx:182-188` (F10); `intro` `:997-999` vs as caixas de introdução de F7; `bookRow` `:715-733` + `:1012-1022` (quadrado 44 `primary` + nome + meta + chevron 18) vs as linhas de F7-4; `ContinueBibleCard` vs `ContinueReadingCard` (F3); mensagens do gate `:514-519` (F2-11); `EN_BOOK_ID` de `LiturgyScreen.jsx:14-39` (F8) paralelo a `data/bible.js`.

---

## F7. Ferramentas (hub, treino, espiritualidade)

`screens/ToolsScreen.jsx`, `QuizScreen.jsx`, `DialogueScreen.jsx`, `DebateStrategiesScreen.jsx`, `GlossaryScreen.jsx`, `RosaryScreen.jsx`, `ExamConscienceScreen.jsx`, `BibleMapScreen.jsx` + `bibleMap/*`, `components/DialogueAnswerCard.jsx`.

| ID | O que se repete | Locais | Divergências | Custo | Tipo |
|---|---|---|---|---|---|
| F7-1 | Barra de busca (ícone `search-outline` 18, `TextInput` com `focused`, botão `close-circle`) e seus estilos `searchRow`/`searchRowFocused`/`input` | `DebateStrategiesScreen.jsx:44-61` + `:132-139`; `GlossaryScreen.jsx:51-68` + `:112-119` | Debate tem `marginBottom: 8`; placeholder por `t('debate.search')` no Debate e inline no Glossário (`:59`); nenhum dos dois tem `accessibilityRole` no botão limpar (o de `SearchScreen.jsx:262-271` tem) | Baixo: `SearchField` | Acidental |
| F7-2 | Card expansível `expanded === item.id` com chevron `up`/`down` e estilos `card`/`cardOpen`/`headRow` | `DebateStrategiesScreen.jsx:95-118` + `:148-150`; `GlossaryScreen.jsx:88-99` + `:120-122`; `ExamConscienceScreen.jsx:55-78` + `:94-96` | Debate e Glossário: o card inteiro é `TouchableOpacity`. Exame: só o cabeçalho, corpo com `borderTop` (`:99`); chevron 18 vs 16; padding 14 no card vs 14 no `cardHead` | Baixo a médio: `ExpandableCard` com `header` e `children` | Acidental |
| F7-3 | Filtro por substring em 4 campos com `trim().toLowerCase().includes` | `DebateStrategiesScreen.jsx:18-30`, `GlossaryScreen.jsx:33-43` | Debate acrescenta o filtro de `section` | Baixo: `matchesQuery(item, q, fields)` (sem acentos, como `bibleApi.js:93-95`) | Acidental |
| F7-4 | Linha "ícone ou número + rótulo + subtítulo + chevron" com `StyleSheet` próprio em 5 telas | `ToolsScreen.jsx:56-71` + `:130-139` (ícone 40 raio 9 `badgeBg`, padding 13, raio 10, `marginBottom` 9, chevron 18); `QuizScreen.jsx:54-67` + `:393-399` (`iconBox` 48 raio 12, padding 14, raio 12, `marginBottom` 10); `DialogueScreen.jsx:195-198` + `:217-221` (sem ícone, padding 14, raio 10, `marginBottom` 8, texto itálico); `BibleMapScreen.jsx:127-146` + `:259-270` (`listNum` círculo 28, padding 10, raio 8, `marginBottom` 4, chevron 16); `RosaryScreen.jsx:211-231` + `:502-510` (`numBubble` 36 `primary`, padding 12, raio 12, sem chevron) | Ícone 40/48/nenhum/28/36; padding 13/14/14/10/12; raio 10/12/10/8/12; margem 9/10/8/4/8; chevron 18/18/18/16/nenhum | Médio: `ListRow` com slot `leading` e `trailing`; decidir uma escala | Acidental |
| F7-5 | Botões primário cheio e secundário com contorno reescritos em cada tela | Cheio: `DialogueScreen.jsx:243-246` (`nextBtn`) e `QuizScreen.jsx:425-428` (`nextBtn`, idênticos: `paddingVertical` 14, raio 10, `gap` 8); `DialogueScreen.jsx:249-252` (`shareBtn`: 13, raio 10, `minHeight` 48); `RosaryScreen.jsx:524` (`advanceBtn`: 10, raio 8); `BibleMapScreen.jsx:224-227` (`bibleBtn`: 14, raio 10). Contorno `accent`: `DialogueScreen.jsx:256-259` (`readBtn`: `paddingVertical` 12, borda 1); `QuizScreen.jsx:435-439` (`practiceBtn`: 16, `minHeight` 54, borda 1.5); `RosaryScreen.jsx:511` (`toggleBtn`: padding 12, borda 1), `:527` (`resetBtn`: 10, raio 8); `BibleMapScreen.jsx:251-254` (`navBtn`: 10, raio 10, borda 1) | `paddingVertical` de 10 a 16; raio 8 ou 10; borda 1 ou 1.5; `minHeight` só em dois | Médio: `Button variant="primary" \| "outline"` com tokens; 10 locais só em F7 | Acidental |
| F7-6 | Caixa de introdução em card com filete `accent` de 3 px | `ExamConscienceScreen.jsx:88` (padding 16, `marginBottom` 14), `BibleMapScreen.jsx:233` (14, 12, `sub` `fs(12)`), `RosaryScreen.jsx:493` (14, 14, `sub` `fs(13)`); mesmo traço em `DialogueScreen.jsx:223-226` (`objBox`: raio 10, `marginBottom` 16) e `QuizScreen.jsx:417-420` (`explainBox`: raio 10, `marginTop` 8). Sem filete: `DialogueScreen.jsx:213-215` (`intro` da lista) | Padding 16/14/14/14/14; raio 12/12/12/10/10; margem 14/12/14/16/8 | Baixo: `IntroCard` | Acidental |
| F7-7 | Chips de filtro (linha de pílulas com estado ativo) | `DebateStrategiesScreen.jsx:63-76` + `:140-147` (`paddingVertical` 7, `paddingHorizontal` 14, raio 20, ativo `badgeBg` + borda `accent`, texto `primaryText`); `RosaryScreen.jsx:193-205` + `:496-500` (7, 12, raio 18, ativo `primary`, texto branco bold) | Raio 20 vs 18, ativo dourado-claro vs azul, texto `fs(13)` 600 vs `fs(12)` | Baixo: `Chip` (ver também `fontChip` de F11-3) | Acidental |
| F7-8 | "Sequência com próximo": índice + botão avançar + condição de fim, e o contador "n / total" | Avanço: `QuizScreen.jsx:118-124` (múltipla escolha), `:299-303` (V ou F), `DialogueScreen.jsx:114-118`, `RosaryScreen.jsx:160-164`, `BibleMapScreen.jsx:25-27`. Contador: `QuizScreen.jsx:164`, `:316`; `RosaryScreen.jsx:239`; `BibleMapScreen.jsx:73-78` (com `progressBar` `:241-242`) | Rosário tem haptics; Mapa tem anterior/próximo; Diálogo avança sem contador | Médio: um `useStepper` só vale se o visual do contador unificar; a lógica é de 3 linhas | Legítima na semântica de cada tela, acidental no contador |
| F7-9 | Cores de acerto e erro fora da paleta | `QuizScreen.jsx:175-180`, `:193` (múltipla escolha) e `:326-327` (V ou F): `#e6f4ea`/`#3a7d4b`/`#f8d7da`/`#a02020` no claro, `#1f3a28`/`#3a1f1f` no escuro | Nenhuma no valor | Baixo: tokens `successBg`, `successBorder`, `dangerBg`, `dangerBorder` em `LIGHT`/`DARK` | Acidental |
| F7-10 | `MultipleChoiceGame` e `TrueFalseGame` repetem os mesmos blocos de JSX | Cabeçalho com contador `QuizScreen.jsx:163-165` / `:315-317`; cálculo de `bg`/`border` por opção `:171-181` / `:322-328`; `explainBox` `:199-210` / `:345-355`; `nextBtn` `:224-229` / `:359-364`; `scoreBox` com "jogar de novo" + "outros modos" `:231-257` / `:366-383` | V ou F não tem `ScrollHint` (`:314`), nem `relatedBtn`, nem streak; `explainTitle` do V ou F concatena a resposta correta inline | Médio: `QuizGame` com `renderOptions` e `explanation` | Acidental |
| F7-11 | Persistência em `AsyncStorage` inline na tela, enquanto o resto do app usa `utils/*` | `QuizScreen.jsx:88` (leitura do streak), `:103-112` (histórico + streak, dia em UTC) | Regra de streak diferente da de `utils/readingProgress.js:24-34` (F4): string vs objeto, UTC vs local | Baixo: `utils/quizProgress.js` | Acidental |
| F7-12 | `openInBible(nav, ref)` idêntico | `RosaryScreen.jsx:155-158` / `BibleMapScreen.jsx:29-38` (o Mapa também fecha o modal); `verseEndFromRef(ref)` inline nos dois | Nenhuma | Baixo: `openBibleRef` (ver F5-6) | Acidental |
| F7-13 | Bolha numerada | `RosaryScreen.jsx:505` (`numBubble` 36, `primary`, ativa `accent`), `BibleMapScreen.jsx:265` (`listNum` 28, `divider`, feita `accent`) (fora de F7: `ReadingPlanScreen.jsx:178`, 36 `badgeBg`) | Tamanho 36/28, cor base `primary`/`divider` | Baixo: `NumberBadge` | Acidental |
| F7-14 | Estado vazio de lista (`empty`) | `DebateStrategiesScreen.jsx:87` + `:161`, `GlossaryScreen.jsx:84` + `:125` (estilos idênticos: `fs(14)`, `textSubtle`, `marginTop` 40) | Só o texto | Baixo: `EmptyState` (ver F4-7) | Acidental |
| F7-15 | Bloco `useScrollHints` + 2 `<ScrollHint>` + 4 props de scroll | `ToolsScreen.jsx:47`, `:105-108`, `:118-119`; `QuizScreen.jsx:126`, `:144-148`, `:269-270`; `DialogueScreen.jsx:157`, `:177-180`, `:203-204`; `DebateStrategiesScreen.jsx:32`, `:82-86`, `:123-124`; `GlossaryScreen.jsx:45`, `:80-83`, `:103-104`; `RosaryScreen.jsx:153`, `:179-182`; `ExamConscienceScreen.jsx:15`, `:21-24`, `:81-82` | Ausente em `TrueFalseGame` (`QuizScreen.jsx:314`) e em `BibleMapScreen.jsx:45` (que tem `scrollEnabled` próprio) | Baixo: `HintedScroll` | Acidental |
| F7-16 | Conteúdo fora de `src/data/` dentro de F7 | `RosaryScreen.jsx:14-59` (`MYSTERIES`), `:61-82` (`ORACOES`); `QuizScreen.jsx:28-45` (`MODES` com textos PT/EN inline) | O resto da feature lê `data/*.js` | Baixo: mover para `data/rosary.js` e `strings.js` | Acidental |
| F7-17 | `contentContainerStyle` padding 16 / `paddingBottom` 40 | Inline: `DebateStrategiesScreen.jsx:81`, `ExamConscienceScreen.jsx:20`, `GlossaryScreen.jsx:75`, `RosaryScreen.jsx:178`, `BibleMapScreen.jsx:45`. Em estilo: `DialogueScreen.jsx:211`, `QuizScreen.jsx:404` | `ToolsScreen.jsx:103` usa `30 + insets.bottom` | Baixo: token de lista | Acidental |
| F7-18 | Rótulo em caixa alta com `letterSpacing` em 11 variantes só em F7 | `DialogueScreen.jsx:216` (`section`: `fs(12)`, `textSubtle`), `:228` (`objLabel`: `fs(11)`), `:240` (`stepLabel`: `fs(12)`, `textMuted`); `BibleMapScreen.jsx:240` (`stepLabel`: `fs(11)`), `:258` (`allTitle`: `fs(13)`); `RosaryScreen.jsx:501` (`daysLabel`: `fs(12)`, `accentText`), `:515` (`prayerTitle`: `fs(13)`, `accentText`, `letterSpacing` 0.5), `:520` (`currentStepLabel`: `fs(10)`, `letterSpacing` 0.8); `ExamConscienceScreen.jsx:97` (`cardLabel`: `fs(11)`, `accentText`, 0.5); `DebateStrategiesScreen.jsx:159` (`fieldLabel`: `fs(11)`, `textSubtle`, 0.5); `QuizScreen.jsx:408` (`badgeText`: `fs(11)`, `accentText`, 0.5) | `fs` de 10 a 13; `letterSpacing` 0.5, 0.8 ou 1; cor `textSubtle`, `textMuted` ou `accentText` | Baixo: dois tokens de texto (`kicker`, `sectionLabel`) | Acidental |

Fora do escopo interno: `ToolsScreen.jsx:130-139` = `HomeScreen.jsx:211-220` (F3); mensagens do gate `ToolsScreen.jsx:80-84` (F2-11); streak do quiz vs `utils/readingProgress.js` (F4); compartilhar como imagem `DialogueScreen.jsx:27`, `:81-87`, `:145-149`, `:254` vs `VerseOfDayCard.jsx` (F8), tratado em F12; `#1a3a5c` literal em `DialogueScreen.jsx:239` e `#c9a84c` em `RosaryScreen.jsx:329`; `Dialogue` registrada em 4 stacks e `ArticleFromSearch` em 3 (F1).

---

## F8. Conteúdo do dia

`screens/TodayScreen.jsx`, `LiturgyScreen.jsx`, `components/NewsCard.jsx`, `LiturgyCard.jsx`, `SaintTodayCard.jsx`, `VerseOfDayCard.jsx`, `ReadingText.jsx`, `services/liturgyApi.js`, `newsApi.js`, `data/dailyVerses.js`, `saints.js`.

| ID | O que se repete | Locais | Divergências | Custo | Tipo |
|---|---|---|---|---|---|
| F8-1 | Card "filete esquerdo + caixa de ícone + rótulo em caixa alta" com `makeStyles` próprio em cada um dos 4 cards do Today | `NewsCard.jsx:179-188` (`card`/`head`/`icon`/`label`), `LiturgyCard.jsx:80-93` (`card`/`row`/`icon`/`label`), `SaintTodayCard.jsx:40-51` (`card`/`iconBox`/`label`), `VerseOfDayCard.jsx:74-97` (`card`/`headerRow`/`headerIcon`/`headerLabel`) | Filete 4/4/3/4 com cor `accent`/litúrgica/`primary`/`accent`; ícone 38 raio 9 `badgeBg` / 38 raio 9 `badgeBg` / 36 raio 9 `primary` com ícone branco / 26 redondo `badgeBg`; rótulo `fs(11)` `textSubtle` / 11 `textSubtle` / 10 `accentText` / 11 `textSubtle`, todos `letterSpacing` 1; padding 12/12/13/14; `marginBottom` 10/10/12/10; chevron 18 só na Liturgia | Médio: `TodayCard` (shell) e conteúdo por card; decidir a caixa de ícone | Acidental |
| F8-2 | Padrão cache-first em 4 passos escrito duas vezes | `services/liturgyApi.js:13-61` (por `dateKey`) e `services/newsApi.js:145-203` (por TTL 3 h): cache válido, rede com `AbortController` + `setTimeout(8000)` (`:31-32` / `:34-35`), `setItem(...).catch(() => {})` (`:38-41` / `:182-185`), fallback `source: 'stale'` (`:45-52` / `:190-195`), erro com `code` (`:57-59` / `:200-202`) | Validade por dia vs por TTL; `liturgyApi.js:34` só limpa o timer no sucesso; `newsApi.getNews` aceita `force` sem chamador | Médio: `cachedFetch({ key, isFresh, fetcher, timeout })` | Acidental |
| F8-3 | `getLiturgy()` chamado duas vezes por visita e o regex do título EN em dois lugares | `LiturgyCard.jsx:17` / `LiturgyScreen.jsx:72`; regex `/(\d+)[aª°]?\s*semana/i` em `LiturgyCard.jsx:46` / `LiturgyScreen.jsx:211` | A tela combina com `enReadings.season` (`:212-216`); o card só com o dia da semana | Baixo: `liturgyTitle(liturgy, { isEn, season })` no service | Acidental |
| F8-4 | Tabela de nomes EN de livros vivendo na tela | `LiturgyScreen.jsx:14-39` (`EN_BOOK_ID`, 75 chaves com aliases `Psalm`/`Psalms`, `Song of Songs`/`Song of Solomon`, `Sirach`) | O vocabulário da API não bate com `nameEn` de `data/bible.js` (F6) nem com `BOOK_PT_TO_EN` de `references.js` (F5) | Médio: `data/bibleAliases.js` com os aliases, consumido por `bible.js` | Legítima nos aliases, acidental por viver na tela |
| F8-5 | Compartilhamento próprio, fora de `utils/share.js` | `LiturgyScreen.jsx:57-58` (`APP_PROMO_PT/EN`, redefinição do promo de `share.js:6-10`, este só em PT), `:108-116` (`shareReading` com `Share.share` direto, sem o fallback de clipboard da web que `doShare` tem em `share.js:15-33`) | Na web desktop a Liturgia não faz nada ao compartilhar; os outros 6 pontos copiam e avisam | Baixo: `shareReading` em `share.js` e promo bilíngue lá | Acidental |
| F8-6 | Contrato `navigate('Bíblia')` em dois formatos | `TodayScreen.jsx:44-45` (sem `highlightVerseEnd`) / `LiturgyScreen.jsx:260-262` (com) | Nenhuma além do campo | Baixo: `openBibleRef` (F5-6) | Acidental |
| F8-7 | Rótulos bilíngues inline ao lado de chaves que já existem | `LiturgyScreen.jsx:118-146` (objeto `L` com 13 pares), `:155`, `:166`, `:172-174`; `LiturgyCard.jsx:39`; `SaintTodayCard.jsx:8-11`, `:30`; `NewsCard.jsx:17-18`. Já em `strings.js`: `news.title`, `news.offline`, `liturgy.errorTitle`, `common.tryAgain` | O objeto `L` é um mini-dicionário paralelo ao `strings.js` | Médio: mover `L` para chaves `liturgy.*` | Acidental |
| F8-8 | Locale escolhido de duas formas | `LiturgyScreen.jsx:387-391` (`formatTime` fixa `'pt-BR'`) vs `TodayScreen.jsx:36-42` (`dateLabel`) e `NewsCard.jsx:19` (`relDate`) por idioma | Rodapé da liturgia em PT mesmo em EN | Baixo: `localeFor(isEn)` em `utils/` | Acidental |
| F8-9 | `Section` e `ReadingSection` recriam `makeStyles(theme.colors, theme.fs)` a cada render, 9 vezes por tela | `LiturgyScreen.jsx:348-356` / `:358-385`; chamadas em `:277`, `:283`, `:288`, `:295`, `:304`, `:312`, `:321`, `:327`, `:333` | `ReadingSection` acrescenta o botão de share e `emphasize` | Baixo: passar `styles` por prop ou `useMemo` | Acidental |
| F8-10 | Referência do versículo derivada da string de exibição embora os campos estruturados existam | `VerseOfDayCard.jsx:22-27` (`bookName`/`chapter` por regex sobre `ref`) vs `:33` (`verse.bookId`, `verse.chapter`, `verse.verse`) | Produz "Salmo 23 1,1" no texto compartilhado (simulado no fluxograma 08) | Baixo: usar `bookName(getBook(verse.bookId), isEn)` | Acidental |
| F8-11 | Botão com contorno `accent` em três variantes na feature | `VerseOfDayCard.jsx:106-117` (`actionBtn`: raio 8, `paddingVertical` 6, `flex: 1`), `LiturgyScreen.jsx:442-445` (`enChip`: raio 10, padding 10), `:401` (`retryBtn`: cheio `accent`, raio 10) | Raio 8/10, padding 6/10, cheio vs contorno | Baixo: `Button` (ver F7-5) | Acidental |

Fora do escopo interno: `easterDate`/`addDays` de `data/saints.js:166-188` vs `utils/liturgicalSeason.js:6-28` (F3); semente diária de `data/dailyVerses.js:98-104` vs `HomeScreen.jsx:65-67` (F3), `notifications.js:8-12` (F13), `quiz.js:1966-1967` (F7); `ShareVerseCard` e o wrapper `offscreen` de `VerseOfDayCard.jsx:65-67`, `:131` tratados em F12; `NewsCard.jsx:17-18` e `SaintTodayCard.jsx:8-11` vs os mini-dicionários de F11.

---

## F9. Busca global

`screens/SearchScreen.jsx`, `utils/searchHistory.js`.

| ID | O que se repete | Locais | Divergências | Custo | Tipo |
|---|---|---|---|---|---|
| F9-1 | Quatro renderers de resultado com o mesmo invólucro (`card` + `cardIcon` 40 + kicker + título/sub) | `SearchScreen.jsx:186-197` (artigo), `:201-212` (versículo curado), `:216-227` (versículo da Bíblia), `:231-243` (referência); estilos `:389-401` | Só ícone (`book-outline`/`bookmark-outline`/`book`/`library-outline`), campos e `numberOfLines` (2/3/3/2) | Baixo: `ResultRow` com `icon`, `kicker`, `title`, `sub` | Acidental |
| F9-2 | Cabeçalhos de seção em ternário inline, enquanto o resto da tela usa `t('search.*')` | Inline: `:156`, `:158`, `:160`, `:162`, `:257` (placeholder), `:266`, `:307`, `:313`. Via `t()`: `:281`, `:283`, `:303`, `:309` | Nenhuma de forma | Baixo: 8 chaves | Acidental |
| F9-3 | O mesmo versículo pode aparecer nas seções "Versículos" e "Na Bíblia" | `:51-60` (`verseIndex` sobre `DAILY_VERSES`) e `:121` (`searchBible`), sem dedupe em `:155-164`; os dois cards chamam `openVerse` (`:203`, `:217`) | `DAILY_VERSES` tem `bookId`/`chapter`/`verse` (usados em `VerseOfDayCard.jsx:33`), então dá para deduplicar por chave | Médio: decidir se a seção curada continua existindo | Acidental |
| F9-4 | Histórico lido duas vezes por escrita | `:88` (montagem) e `:97` (depois de `addSearchHistory`, que não devolve a lista, `utils/searchHistory.js:15-23`) | Nenhuma | Baixo: `addSearchHistory` devolver a lista | Acidental |
| F9-5 | Três estilos de rótulo em caixa alta na mesma tela | `:345` (`histLabel`: `fs(11)`, bold), `:383-387` (`sectionHeader`: `fs(12)`, bold, margens), `:394-397` (`cardCategory`: `fs(10)`, `accentText`) | `fs` 10/11/12; cor `textSubtle`/`textSubtle`/`accentText` | Baixo: tokens `kicker`/`sectionLabel` (ver F7-18) | Acidental |

Fora do escopo interno: `searchRow`/`input`/botão limpar `:249-272` + `:350-366` vs F6 (`BibleScreen.jsx:677-688`), F7-1 e `ReferencePickerModal.jsx:254-258` (F10); `empty`/`emptyTitle`/`emptySub` `:367-369` vs `center`/`emptyTitle`/`muted` de F4-7 e F10-4; placeholder `:257` "O que você procura?" vs `t('home.search')` "Buscar em todo o app..." na barra falsa da Home (F3); as duas buscas de artigos e de referências em `ReferencePickerModal.jsx:47-62` (F10) com campos diferentes dos índices Fuse `:24-48`.

---

## F10. Dados do usuário (Firestore)

`services/userData.js`, `screens/HighlightsScreen.jsx`, `NotesScreen.jsx`, `NoteEditorScreen.jsx`, `NotebookScreen.jsx`, `NotebookPageScreen.jsx`, `components/NotebookText.jsx`, `ReferencePickerModal.jsx`.

| ID | O que se repete | Locais | Divergências | Custo | Tipo |
|---|---|---|---|---|---|
| F10-1 | Guard de uid, guard de visitante nos `watch*` e `snap.docs.map((d) => ({ id: d.id, ...d.data() }))` | uid: `userData.js:8-9` (`userCol`), `:41-42`, `:92-93`, `:101-102`, `:148-149`, `:158-159`. Visitante: `:48-51`, `:61-64`, `:107-110`, `:119-122`, `:171-174`. Map: `:54`, `:71`, `:113`, `:129`, `:177` | `getNotebookPage` (`:164-165`) devolve `null` em vez de lançar | Baixo: `userDoc(sub, id)` e `watchQuery(q, cb)` | Acidental |
| F10-2 | Leitura de nota direto no Firestore, fora do serviço | `NoteEditorScreen.jsx:5-6`, `:37-38` (`getDoc(doc(db, 'users', uid, 'notes', noteId))`) vs `userData.js:163-168` (`getNotebookPage`, mesmo padrão para o caderno) | O editor não trata rejeição (spinner permanente, `:30`, `:34-35`) | Baixo: `getNote(noteId)` em `userData.js` | Acidental |
| F10-3 | Tela gated de visitante (ícone `lock-closed-outline` 56, `t('empty.createAccount')`, texto, botão com estilo inline literal chamando `exitGuest`), mais o bloco de loading e o `useEffect [user]` que assina o `watch*` | Gate: `HighlightsScreen.jsx:65-83`, `NotesScreen.jsx:45-63`, `NotebookScreen.jsx:48-66` (botão inline em `:76`, `:56`, `:59`, e repetido no vazio do caderno `:80`). Loading: `:61-63`, `:41-43`, `:44-46`. Efeito: `:27-37`, `:19-29`, `:33-40` | Só o texto explicativo; o `center` de Notes e Notebook recebe o `backgroundColor` inline (`:47`, `:50`) porque o estilo não tem | Baixo: `GuestGateScreen` + `useUserCollection(watchFn)` | Acidental |
| F10-4 | Lista `FlatList` + `contentContainerStyle={{ padding: 16, paddingBottom: 40 }}` + hints + estilos `center`/`emptyTitle`/`muted`/`card` | `HighlightsScreen.jsx:111-148` + `:157-166`; `NotesScreen.jsx:79-96` + `:107-110`; `NotebookScreen.jsx:88-110` + `:120-123` | `card` padding 12/14/14; `center` com `backgroundColor` só em Highlights; `emptyTitle` sem `marginTop` (Favorites, F4, tem 12) | Baixo: `EmptyState` + `ListScreen` | Acidental |
| F10-5 | Formatação de referência `${livro} ${cap}${sep}${verso}` com `sep = isEn ? ':' : ','` e o intervalo `a === b ? a : a-b` | Referência: `HighlightsScreen.jsx:121-124` + `:136`, `NotesScreen.jsx:31-36`, `NoteEditorScreen.jsx:52-57`, `ReferencePickerModal.jsx:95-96` (com `bookShort`). Intervalo: `NotesScreen.jsx:33`, `NoteEditorScreen.jsx:56` (fora de F10: `BibleScreen.jsx:554`, `:936`, `bibleApi.js:107`, `share.js:45` com vírgula fixa) | `bookName` vs `bookShort`; `share.js` ignora o idioma | Baixo: `formatVerseRef` em `utils/` (ver F6-4) | Acidental |
| F10-6 | Texto do versículo buscado à mão `getChapter(...)?.verses?.find((v) => v.n === X)?.t \|\| ''` | `HighlightsScreen.jsx:122-123`, `NoteEditorScreen.jsx:131-132` (variação em `ReferencePickerModal.jsx:89-94` para validar) | Nenhuma | Baixo: `getVerseText(bookId, chapter, verse, lang)` em `bibleApi.js` | Acidental |
| F10-7 | Regex do token do caderno mantida duas vezes | `components/NotebookText.jsx:11` (`REF_RE`) e `NotebookScreen.jsx:12` (`stripRefs`, mesma gramática com grupo não capturante) | Nenhuma | Baixo: exportar `REF_RE` e `stripRefs` de um módulo | Acidental |
| F10-8 | Dois editores com o mesmo esqueleto | `KeyboardAvoidingView` `NoteEditorScreen.jsx:110-113` / `NotebookPageScreen.jsx:127-130`; salvar com `busy` + `try` + `notify` `:59-82` / `:42-62`; `confirmAction` destrutivo `:84-97` / `:64-77`; botão excluir com `paddingBottom: 14 + Math.max(insets.bottom, 8)` e `#c0392b` `:170-178` + `:214-223` / `:160-168` + `:208-212`; spinner `:101-107` / `:122-124` | NoteEditor tem header próprio (`:114-149`, modal do `MainStack`) e bloqueia texto vazio com `notify` (`:60-64`); NotebookPage usa o header do navigator (`:80-93`) e volta em silêncio (`:43-46`) | Médio: `useEditorSave` + `DeleteFooter`; a hospedagem (modal vs stack) fica | Legítima na hospedagem, acidental no resto |
| F10-9 | `confirmAction` destrutivo com `onConfirm` chamando `remove*` sem `catch` | `HighlightsScreen.jsx:47-56`, `NoteEditorScreen.jsx:86-96`, `NotebookPageScreen.jsx:66-76` | Nenhuma | Baixo: `confirmRemove({ title, message, run })` que trata rejeição | Acidental |
| F10-10 | Preparo da Bíblia por dois caminhos | `useBibleReady` bloqueante em `HighlightsScreen.jsx:22`, `:87-93` vs `ensureBible(...).catch(() => {})` sem bloquear em `NoteEditorScreen.jsx:24` e `ReferencePickerModal.jsx:22` | A lista de marcações precisa do texto; o editor só no compartilhar | Baixo | Legítima (registrada para o redesign não "corrigir") |
| F10-11 | `ReferencePickerModal` repete 3 inputs, 3 `FlatList` e 3 filtros | Inputs `:135-141`, `:157-163`, `:182-188` (estilo `input` `:254-258`; `numInput` `:266-270` é quase igual, `fs(16)` vs `fs(15)`); `FlatList` com `keyboardShouldPersistTaps="handled"` + `style={{ maxHeight: 320 }}` + `listRow` `:142-153`, `:164-179`, `:189-200`; filtros `:47-53`, `:55-62`, `:64-70` | Só os campos filtrados e o ícone da linha | Baixo: `PickerList({ placeholder, data, filter, renderRow })` | Acidental |
| F10-12 | `headerRight` montado à mão com `'#fff'` literal | `NotebookScreen.jsx:23-31` (botão `+`), `NotebookPageScreen.jsx:80-93` (salvar/editar; `headerBtn` `:189` branco) | Nenhuma | Baixo: token `onPrimary` (F1-7) e um `HeaderButton` | Acidental |

Fora do escopo interno: mensagens do gate em `AccountPrompt.jsx:18-22` (F2-11); `segment` do picker `:249-253` vs `ReadingPlanScreen.jsx:161-165` (F4); `contentContainerStyle` padding 16/40 (F4-9, F7-17); `useScrollHints` em 3 telas (F1); `#c0392b` (F2-8).

---

## F11. Ajustes e Legal

`screens/SettingsScreen.jsx` (846 linhas), `LegalScreen.jsx`, `components/WebDownloadBanner.jsx`.

| ID | O que se repete | Locais | Divergências | Custo | Tipo |
|---|---|---|---|---|---|
| F11-1 | Linha de configuração montada à mão 16 vezes (`row` + `rowLeft` + ícone 22 + `rowLabel` + opcional `rowSub` + trailing) | `SettingsScreen.jsx:256`, `:269`, `:296`, `:329`, `:363`, `:395`, `:415`, `:433`, `:451`, `:470`, `:497`, `:503`, `:547`, `:574`, `:589`, `:599` (estilos `:815-821`) | Variantes: `row` puro com `Switch` (`:256`, `:395`, `:415`, `:433`, `:451`); coluna com override inline `{ flexDirection: 'column', alignItems: 'flex-start' \| 'stretch' }` (`:269`, `:296`, `:329`, `:363`); `TouchableOpacity` com chevron 18 (`:329`, `:589`, `:599`), com `open-outline` (`:574`) ou sem trailing (`:470`, `:497`, `:503`, `:547`); `rowLabel` com cor inline `#c0392b` (`:500`, `:506`) | Médio: `SettingsRow({ icon, label, sub, trailing, children, onPress, danger })`; é a tela inteira | Acidental |
| F11-2 | `Switch` com `trackColor={{ true: colors.accent, false: '#ccc' }}` e `thumbColor="#fff"` | `:264`, `:410`, `:428`, `:446`, `:464` | Nenhuma; `'#ccc'` e `'#fff'` fora da paleta | Baixo: `ThemedSwitch` | Acidental |
| F11-3 | Os chips `fontGrid`/`fontChip`/`fontChipActive`/`fontChipLabel` servem 3 grupos de escolha única com 3 formatos de opção | `:274-292` (fonte, `FONT_OPTIONS` com `label` PT fixo e `sample`), `:307-324` (idioma, dois botões escritos à mão), `:371-388` (velocidade, `RATE_OPTIONS` `:653-658` com `labelPt`/`labelEn`) | Nome do estilo é "font" para todos; o de idioma não passa por lista | Baixo: `ChoiceChips({ options, value, onChange })` com opções `{ key, label }` | Acidental |
| F11-4 | Quatro toggles com o mesmo esqueleto (se ligar, pedir permissão; `setNotifPrefs` otimista; chamar `setXEnabled`) | `:123-131`, `:133-141`, `:143-150`, `:152-159` | Só versículo e liturgia checam `res.ok` (`:130`, `:140`); quiz e objeção ignoram | Baixo: `makeToggle(field, setter)` | Acidental |
| F11-5 | Prévia de voz: `Speech.stop()` + `Speech.speak(frase, { language, voice, rate, pitch })` | `:96-104` (`previewVoice`), `:106-116` (`changeRate`) | Frase e velocidade | Baixo: `speakPreview(text, voice, rate)` | Acidental |
| F11-6 | `confirmAction` com título/mensagem/`confirmText` inline PT/EN e `destructive: true` | `:161-170` (sair), `:172-183` (excluir) | Só os textos | Baixo | Legítima nos dois fluxos, forma copiada |
| F11-7 | Dois modais na mesma tela com tratamento e estilo diferentes | Exclusão `:512-543` (estilos `:836-845`: backdrop `rgba(0,0,0,0.5)` centrado, sheet `card` raio 16; sem `useModalNavBar`, sem `statusBarTranslucent`) vs `VoicePickerModal` `:665-737` (`useModalNavBar` `:667`, `statusBarTranslucent` `:674`; `pickerStyles` `:741-751`: backdrop `rgba(13,23,34,0.75)` no rodapé, sheet `bg` raio 18) | Backdrop, posição, raio, cor de fundo e a barra Android | Médio: `AppModal` (no app há mais 4 modais com estilos próprios: `AccountPrompt.jsx`, `ReferencePickerModal.jsx:245-246`, `BibleMapScreen.jsx:209-213`, `BibleScreen.jsx:1076-1080`) | Acidental |
| F11-8 | Card de perfil e card de visitante com o mesmo `profileCard`/`avatar` e overrides inline | `:227-239` vs `:241-252` (`borderWidth`/`borderColor`/`backgroundColor` inline no segundo) | Visitante tem borda `accent`, avatar `accent` e chevron | Baixo: `ProfileCard` com `variant` | Acidental |
| F11-9 | Dica de plataforma na linha Voz com o mesmo markup e override inline | `:347-353` (iOS), `:354-360` (Android), ambos `[styles.rowSub, { marginTop: 8, marginLeft: 34 }]` | Só o texto | Baixo: um `Text` com o texto escolhido por `Platform.select` | Acidental |
| F11-10 | Cerca de 38 ternários `isEn ? ... : ...` inline ao lado de 26 chaves `t('settings.*')` | `:89-121`, `:163-196`, `:303`, `:340`, `:350-358`, `:402-403`, `:421`, `:439`, `:455-457`, `:475-481`, `:506`, `:516-538`, `:552-558`, `:614-632`, `:679-689` | "Objeção do dia" (`:455`) é inline enquanto os três vizinhos usam `t()` (`:399`, `:419`, `:437`) | Médio: volume | Acidental |
| F11-11 | Textos legais em três cópias divergentes | `LegalScreen.jsx:32-149` (PT+EN, data "23 de maio de 2026", contato `deusosfera@gmail.com`, 8 + 7 seções) vs `docs/privacy.html` e `docs/terms.html` (só PT, "22 de maio de 2026", 11 e 13 seções, contato `appologetica@proton.me`; linhas conforme o fluxograma 11, não reconferidas aqui) | Data, contato, número de seções e o processo de exclusão de conta (o app tem exclusão em Ajustes `:503-508`, o texto manda enviar e-mail) | Alto: conteúdo legal exige revisão humana e uma fonte única que sirva app e site | Legítima na existência das duas mídias, acidental nas divergências |

Fora do escopo interno: rota `Legal` em dois stacks (F1-2); `FONT_OPTIONS` (F1-8); `DEFAULT_PREFS` parcial em `:55` (F13-4); `AuthTopToggles` (F2); `section` `:810-814` vs os outros cabeçalhos em caixa alta (F7-18, F9-5); `Linking.openURL` `:575` (F5-9); `try/catch` morto do diagnóstico `:549-560` (não é duplicação; registrado no fluxograma 11).

---

## F12. Compartilhamento

`utils/share.js`, `shareAsImage.js`, `shareAsImage.web.js`, `components/ShareVerseCard.jsx`, `DialogueAnswerCard.jsx`, mais o código de share dentro dos consumidores (`VerseOfDayCard.jsx`, `DialogueScreen.jsx`).

| ID | O que se repete | Locais | Divergências | Custo | Tipo |
|---|---|---|---|---|---|
| F12-1 | Dois cards offscreen 1080x1080 com estilos paralelos e cores literais | `ShareVerseCard.jsx:30-49` / `DialogueAnswerCard.jsx:28-39`: `card` `#1a3a5c`, padding 80, `space-between`; cruz `#c9a84c` (110 vs 34); `brand` "APPologética" `#c9a84c` bold `letterSpacing` 2 (28 vs 30); `footer` | O do versículo centraliza a cruz no miolo; o do diálogo põe cruz e marca no rodapé; `DialogueAnswerCard.jsx:11`, `:14` têm "Objeção"/"Resposta" só em PT | Baixo: `ShareCanvas` (fundo, rodapé com marca) e miolo por card | Acidental |
| F12-2 | Wrapper offscreen `{ position: 'absolute', left: -10000, top: -10000, opacity: 0 }` + `pointerEvents="none"` + `collapsable={false}` | `VerseOfDayCard.jsx:65-67` + `:131`; `DialogueScreen.jsx:145-149` + `:254` | Diálogo só monta fora da web (`:145`); versículo monta sempre e esconde o botão na web (`:56`) | Baixo: `OffscreenCapture` | Acidental |
| F12-3 | Texto de fallback da imagem montado à mão no consumidor, diferente do que `share.js` produz | `VerseOfDayCard.jsx:30` (`"${text}"\n\n${ref}`) vs `share.js:36` (`shareVerse`, com `APP_PROMO` e vírgula fixa); `DialogueScreen.jsx:85` vs `share.js:60-63` (`shareDialogue`) | Fallback sem promo; separador do versículo diferente | Baixo: exportar `buildVerseMessage`/`buildDialogueMessage` de `share.js` | Acidental |
| F12-4 | Ramo web `navigator.share` ou `navigator.clipboard` escrito duas vezes | `share.js:15-33` (`doShare`, com `notify('Copiado')`) / `shareAsImage.web.js:5-17` (sem aviso) | `shareAsImage.web.js` é inalcançável (`:3-4`, `VerseOfDayCard.jsx:56`, `DialogueScreen.jsx:82`) | Baixo: o web reexportar `doShare` ou ser removido | Acidental |
| F12-5 | `Share.share({ message: fallbackMessage }).catch(() => {})` três vezes na mesma função | `shareAsImage.js:28`, `:38`, `:47` | Nenhuma | Baixo: `const fallback = () => ...` | Acidental |
| F12-6 | Separador fixo `,` nas mensagens, enquanto todos os chamadores escolhem por idioma | `share.js:36` (`shareVerse`), `:48` (`shareNote`) vs `isEn ? ':' : ','` em F6-4 e F10-5 | Em EN o compartilhado sai "Matthew 16,18" e o copiado "Matthew 16:18" | Baixo: `formatVerseRef` (F6-4) recebendo `isEn` | Acidental |
| F12-7 | Código sem chamador ou com nome errado dentro de F12 | `share.js:40-42` (`shareHighlight` é alias puro de `shareVerse`), `ShareVerseCard.jsx:8-9` (`variant: 'story'` 1080x1920 sem chamador), `shareAsImage.js:42` (`dialogTitle: 'Compartilhar versículo'` também para o diálogo) | n/a | Baixo: limpeza | Acidental |
| F12-8 | Cores da marca como literais nos artefatos de imagem | `ShareVerseCard.jsx:32`, `:37`, `:46`, `:48`; `DialogueAnswerCard.jsx:29`, `:31`, `:37`, `:38` (fora de F12: `ErrorBoundary.jsx:46-51`, `App.js:256-279`, `AccountPrompt.jsx:110`, `:198`, `DialogueScreen.jsx:239`, `RosaryScreen.jsx:329`, `bibleMap/mapHtml.js:28`) | Nenhuma no valor | Baixo: `brand.js` (`navy`, `gold`) | Legítima (a imagem não segue o tema), acidental na literalidade |

Fora do escopo interno: `APP_PROMO_PT/EN` e `Share.share` direto em `LiturgyScreen.jsx:57-58`, `:115` (F8-5); intervalo `share.js:45` (F10-5); `expo-clipboard` em `BibleScreen.jsx:556` vs `navigator.clipboard` em `share.js:23` (dois clientes de clipboard, F6).

---

## F13. Notificações locais

`services/notifications.js`, `notifications.web.js`; único consumidor `SettingsScreen.jsx:123-159`, `:470-483`.

| ID | O que se repete | Locais | Divergências | Custo | Tipo |
|---|---|---|---|---|---|
| F13-1 | Quatro `setXEnabled` com o mesmo corpo (`getPrefs`, muda um campo, `savePrefs`, `rescheduleAll`) | `notifications.js:73-78`, `:80-85`, `:88-95`, `:97-102` | `setDailyVerseEnabled` também grava hora e minuto | Baixo: `setPref(patch)` | Acidental |
| F13-2 | Quatro blocos de agendamento com a mesma forma (`identifier`, `content` com título/corpo/`data`, `trigger`) | `:111-126`, `:128-143`, `:145-159`, `:160-175` | Gatilho `DAILY` x3 e `WEEKLY` x1; corpo calculado no agendamento em dois (`getVerseOfDay` `:112`, `objectionOfDay` `:161`) | Baixo: tabela `SCHEDULES` percorrida por `rescheduleAll` | Acidental |
| F13-3 | Cinco `cancelScheduledNotificationAsync(...).catch(() => {})` em sequência | `:65-69` | Nenhuma | Baixo: `Promise.all(IDS.map(...))` | Acidental |
| F13-4 | `DEFAULT_PREFS` em três versões | `notifications.js:32-39`, `notifications.web.js:6-13` (idênticos), `SettingsScreen.jsx:55` (parcial, sem `objectionOfDay`, por isso o 4º `Switch` recebe `undefined` até `getPrefs` resolver, `:462`) | A do Settings falta um campo | Baixo: `notificationsPrefs.js` comum importado pelas duas variantes e pela tela | Legítima na variante web (precisa espelhar a interface), acidental no objeto copiado |
| F13-5 | Títulos e corpos das notificações fixos em PT | `:116-118`, `:132-133`, `:149-151`, `:165-166`, `:196-197` | Nenhuma de forma | Médio: o serviço não tem `t()`; precisa do idioma cacheado (como `AuthContext.jsx:53-60`) | Acidental |

Fora do escopo interno: `objectionOfDay` `:8-12` (F3); os 4 toggles de `SettingsScreen.jsx:123-159` (F11-4); `ensureScheduled` `:182-186` sem chamador (fato do fluxograma 12, não é duplicação).

---

## F14. Infra

`services/firebase.js`, `sentry.js`, `sentry.web.js`, `components/ErrorBoundary.jsx`, `utils/webUpdate.js`, `webUpdate.web.js`, `app.config.js`.

| ID | O que se repete | Locais | Divergências | Custo | Tipo |
|---|---|---|---|---|---|
| F14-1 | Dois caminhos para capturar exceção no Sentry, um deles morto | `ErrorBoundary.jsx:16-18` (`global.Sentry?.Native?.captureException`, nunca atribuído em `src/` ou `App.js`) vs `sentry.js:33-36` (`captureException` com guarda de Expo Go, único chamador `SettingsScreen.jsx:550`) | O `ErrorBoundary` não importa o wrapper porque fica acima dos providers, mas `sentry.web.js` já é no-op | Baixo: importar `captureException` de `../sentry` | Acidental |
| F14-2 | Detecção de Expo Go | `sentry.js:9` e `hooks/useGoogleSignIn.js:17` (F2), ambos `Constants.executionEnvironment === 'storeClient'` | Nenhuma | Baixo: `utils/env.js` com `isExpoGo` | Acidental |
| F14-3 | Tela fora do tema e do idioma com as mesmas cores fixas e textos PT | `ErrorBoundary.jsx:28-36`, `:46-51` vs `App.js:250-283` (`BrandedSplash`, F1) | Ambas antes de `LanguageProvider`/`ThemeProvider` (`App.js:433-436`); o Auth resolve o mesmo problema com `_cachedLang` (`AuthContext.jsx:53-60`) | Baixo: `brand.js` + idioma cacheado para os dois textos | Legítima na posição na árvore, acidental na literalidade |
| F14-4 | Variantes `.web.js` que espelham a interface da nativa à mão | `sentry.web.js:3-9` (3 exports), `webUpdate.web.js` (2), `notifications.web.js:15-47` (8, F13), `shareAsImage.web.js:5` (1, F12), `useGoogleSignIn.web.js:40-48` (7 chaves, F2) | Sem teste que garanta que as assinaturas batem | Baixo para documentar, médio para automatizar (script que compara `export`s) | Legítima (convenção do Metro registrada no CLAUDE.md); registrada como risco de manutenção, não como cópia acidental |

---

## Ranking: as 15 duplicações internas que mais pesam para o redesign

Critério: número de locais x impacto visual (o quanto o padrão aparece na tela e o quanto o redesign de tokens/chrome/telas esbarra nele). Os IDs remetem às tabelas.

| # | Duplicação | Locais | Por que pesa |
|---|---|---|---|
| 1 | **F11-1** linha de Ajustes montada à mão | 16 na mesma tela | É a tela inteira de Ajustes; qualquer token de card, ícone ou chevron precisa ser trocado 16 vezes |
| 2 | **F4-1** card de artigo em 5 telas (mais 2 fora de F4) | 5 (+2) | É o card mais visto do app (lista, categoria, favoritos, plano, relacionados, busca, continue lendo), com 5 combinações de padding/raio/`fs` |
| 3 | **F7-5** botões primário e secundário reescritos | 10 só em F7 (mais F2-2, F8-11, F10-3) | Um `Button` com tokens é pré-requisito do redesign; hoje há `paddingVertical` de 10 a 16 e raio 8 ou 10 |
| 4 | **F7-4** linha "ícone + rótulo + sub + chevron" | 5 layouts em F7 (+ Home, Bible `bookRow`, Settings) | É o padrão de navegação de todos os hubs; cinco escalas de ícone (28 a 48) |
| 5 | **F8-1** os 4 cards do "Dia de hoje" | 4 (+ ContinueReading/ContinueBible) | Filete 3 ou 4 px, caixa de ícone 26 a 38, rótulo `fs` 10 ou 11: o mesmo card com 4 desenhos na mesma coluna |
| 6 | **F2-1 a F2-4** input, botão, divisor e Google nas telas de auth | 11 blocos em 3 telas | Primeira impressão do app; dois visuais de "ou" na mesma tela de Login |
| 7 | **F5-1 / F5-2** card de referência em duas cópias | 2 telas x cerca de 60 linhas de estilo | Redesenhar o card obriga a mexer nas duas cópias e ainda deixa as divergências (Strong, badge PT, Catecismo) |
| 8 | **F1-1 / F1-7** header dos stacks e branco fixo | 6 + 7 | É o chrome de todas as telas; dark mode e tokens passam por aqui |
| 9 | **F7-18 (+ F3-3, F8-1, F9-5)** rótulo em caixa alta | 11 variantes só em F7, 3 em F9, 2 em F3, 4 em F8 | `fs` 10 a 13, `letterSpacing` 0.5 a 1, três cores: a tipografia secundária não tem token |
| 10 | **F10-3 / F10-4** tela gated + loading + lista + vazio | 3 telas x 3 blocos (+ F4-7, F9) | Estados vazios e de visitante aparecem em todo o "Meu Estudo"; o botão de criar conta é estilo inline literal |
| 11 | **F7-1 / F7-2** campo de busca e card expansível | 2 + 3 em F7 (mais F6, F9, F10 no campo) | Sete `TextInput` de busca no app com 4 combinações de raio/altura; um `SearchField` resolve a maioria |
| 12 | **F11-7** modais com tratamento e estilo próprios | 2 em F11 (+ 4 no app) | Backdrop, raio e barra Android divergem; um `AppModal` afeta 6 pontos |
| 13 | **F7-6** caixa de introdução com filete | 5 em F7 (+ Bible, Onboarding `verseBox`, ArticleDetail `translationNotice`) | Mesmo desenho com padding 14 ou 16, raio 10 ou 12 |
| 14 | **F11-3 / F7-7** chips de escolha única e de filtro | 3 + 2 | Dois visuais de "ativo" (dourado-claro com borda vs azul cheio) e nomes de estilo errados (`fontChip` para idioma e velocidade) |
| 15 | **F6-1 / F4-11** barras de progresso | 3 + 1 | Altura 3, 4 ou 6 e raio 0, 2 ou 3 para a mesma barra; pequeno, mas aparece na Bíblia, no artigo, no plano e no "continue lendo" |

Logo abaixo da linha de corte, pelo mesmo critério: F10-8 (dois editores), F12-1 (dois cards de imagem com cores literais), F9-1 (quatro renderers da busca), F7-9 (cores de acerto e erro fora da paleta), F7-10 (múltipla escolha vs V ou F), F8-2 (cache-first duplicado, sem impacto visual mas alto em manutenção).

---

## Confiança e lacunas

- **Alta** para todo `file:line` das tabelas: cada faixa foi lida com `sed -n` nesta sessão no commit `114a08b`, e as contagens (`Switch`, `styles.row`, `borderLeftWidth`, `outlineStyle`, `contentContainerStyle`, `chevron-forward`, `textTransform: 'uppercase', letterSpacing: 1`) vieram de `grep -n`/`grep -c` no código atual. Onde meu número difere do fluxograma em 1 a 2 linhas (por exemplo `QuizMenu` card, `DialogueScreen` botão avançar, `NotebookScreen` estilos), vale o número daqui.
- **Média** para F11-11 (textos legais): `docs/privacy.html` e `docs/terms.html` não foram reabertos; datas, contatos e contagem de seções vêm do fluxograma 11.
- **Média** para F6-8 (restauração de scroll): as linhas foram conferidas por `grep`, mas o corpo de `tryRestore` (`:247-273`) e `onVerseScroll` (`:397-421`) não foi relido inteiro nesta sessão; a descrição segue o fluxograma 06.
- **Não lidos** nesta sessão: `components/BibleLoadingState.jsx`, `MarkdownText.jsx`, `ImageZoomModal.jsx`, `RefSourceBlock.jsx`, `utils/favorites.js`, `lastRead.js`, `readingProgress.js`, `bibleProgress.js`, `ttsVoice.js`, `data/*` além dos trechos citados. Pode haver duplicação interna de F4 nos três utilitários de AsyncStorage (mesmo esqueleto `getItem` + `JSON.parse` + `catch`) que não entrou na contagem por falta de leitura.
- **Julgamentos de custo** são estimativas de leitura, sem executar nada nem medir lint. "Legítima" registra que existe uma razão técnica visível no código ou em comentário; não é recomendação de manter.
- Nada foi executado; nenhum arquivo além deste foi criado ou alterado.

## Fontes consultadas

| Arquivo | Faixas lidas nesta sessão |
|---|---|
| `docs/design/PATHFINDER-2026-09-23/00-features.md` | íntegra |
| `docs/design/PATHFINDER-2026-09-23/01-flowcharts/01` a `12` | íntegra (12 arquivos, 4080 linhas) |
| `App.js` | 94-104, 248-284, 286-332, 350-360, 390-400; grep de `headerStyle`, `LABELS`, `ICONS`, `name="Legal"`, `name="CategoryArticles"` |
| `src/context/ThemeContext.jsx` | 60-140; grep |
| `src/context/LanguageContext.jsx`, `AuthContext.jsx` | grep; `AuthContext.jsx:95-135`, `150-185` |
| `src/hooks/useScrollHints.js` | 1-66 |
| `src/hooks/useModalNavBar.js`, `useGoogleSignIn(.web).js` | grep |
| `src/screens/auth/LoginScreen.jsx` | 55-100, 125-175, 180-251 |
| `src/screens/auth/SignupScreen.jsx` | 48-120, 138-170, 176-219 |
| `src/screens/auth/ForgotPasswordScreen.jsx` | 15-115 |
| `src/screens/OnboardingScreen.jsx` | 60-100, 155-225; grep |
| `src/components/AuthTopToggles.jsx`, `GuestGate.jsx` | íntegra |
| `src/components/AccountPrompt.jsx` | 1-48, 85-130; grep de estilos |
| `src/screens/HomeScreen.jsx` | 55-70, 80-95, 95-160, 165-233 |
| `src/screens/ArticlesScreen.jsx` | 45-124 |
| `src/screens/CategoryArticlesScreen.jsx` | 18-80 |
| `src/screens/FavoritesScreen.jsx` | 34-98 |
| `src/screens/ReadingPlanScreen.jsx` | 100-185 |
| `src/screens/ArticleDetailScreen.jsx` | 59-82, 96-127, 199-214, 320-355, 370-409; grep |
| `src/components/RelatedArticles.jsx`, `RelatedDialogues.jsx`, `ContinueReadingCard.jsx`, `ContinueBibleCard.jsx` (20-67), `ReadingProgressBar.jsx`, `SectionBanner.jsx` (9-45) | íntegra ou faixa indicada |
| `src/screens/ReferencesScreen.jsx` | 14-80, 84-168, 226-252, 312-371 |
| `src/screens/RefDetailScreen.jsx` | 10-70, 74-148, 150-215 |
| `src/data/references.js` | 2365-2400, 2516-2535 |
| `src/screens/BibleScreen.jsx` | 360-384, 511-524, 550-567, 568-646, 665-690, 712-735, 745-760, 800-826, 925-990, 993-1093; grep de refs, listeners, estilos |
| `src/screens/ToolsScreen.jsx` | 10-140 |
| `src/screens/QuizScreen.jsx` | 25-72, 80-116, 118-270, 276-390, 390-441; grep |
| `src/screens/DialogueScreen.jsx` | 72-150, 154-267; grep |
| `src/screens/DebateStrategiesScreen.jsx` | 10-162 |
| `src/screens/GlossaryScreen.jsx` | 30-126 |
| `src/screens/ExamConscienceScreen.jsx` | 15-102 |
| `src/screens/RosaryScreen.jsx` | 140-300, 482-529; grep |
| `src/screens/BibleMapScreen.jsx` | 20-150, 206-271; grep |
| `src/components/NewsCard.jsx` (170-211), `LiturgyCard.jsx` (24-101), `SaintTodayCard.jsx` (14-54), `VerseOfDayCard.jsx` (10-36, 36-132) | faixas indicadas |
| `src/services/liturgyApi.js` (10-62), `newsApi.js` (26-56, 143-203) | faixas indicadas |
| `src/screens/LiturgyScreen.jsx` | 14-16, 40-60, 104-150, 200-275, 345-449; grep |
| `src/screens/TodayScreen.jsx` | 28-58 |
| `src/screens/SearchScreen.jsx` | 153-246, 248-300, 337-402 |
| `src/services/userData.js` | íntegra |
| `src/screens/HighlightsScreen.jsx` (20-172), `NotesScreen.jsx` (15-113), `NotebookScreen.jsx` (1-126), `NoteEditorScreen.jsx` (20-224), `NotebookPageScreen.jsx` (20-213) | faixas indicadas |
| `src/components/NotebookText.jsx` (1-20), `ReferencePickerModal.jsx` (30-100, 130-200, 236-273) | faixas indicadas; grep |
| `src/screens/SettingsScreen.jsx` | 26-60, 116-200, 225-330, 330-495, 495-640, 640-846; grep |
| `src/screens/LegalScreen.jsx` | 1-32, 150-158 |
| `src/utils/share.js`, `shareAsImage.js`, `shareAsImage.web.js`, `dialog.js` | íntegra |
| `src/components/ShareVerseCard.jsx`, `DialogueAnswerCard.jsx`, `ErrorBoundary.jsx` | íntegra |
| `src/services/notifications.js`, `notifications.web.js` | íntegra |
| `src/sentry.js`, `sentry.web.js` | íntegra |
| Greps em `src/` e `App.js` | `articles.find(`, `titleEn \|\|`, `t(\`category.`, `Linking.openURL`, `#c0392b`, `#1a3a5c\|#c9a84c`, `executionEnvironment`, `trackColor`, `styles.row`, `Speech.`, `useModalNavBar`, `contentContainerStyle={{ padding: 16, paddingBottom: 40 }}`, `empty: { textAlign`, `center: { flex: 1`, `lock-closed-outline" size={56}`, `marginTop: 16, backgroundColor: colors.accent`, `common.loading`, `textTransform: 'uppercase', letterSpacing: 1`, `chevron-forward" size={1[68]}`, `borderLeftWidth`, `outlineStyle`, `offscreen:`, `behavior={Platform.OS === 'ios'`, `backgroundColor: c.badgeBg` com `width`, `card: {`, `backgroundColor: c.primary` em botões, `getLiturgy\|semana`, `function easterDate`, `getFullYear() \* 7`, `section: {\|sectionTitle: {`, `<FlatList\|maxHeight: 320\|styles.listRow`, `headerRight\|color="#fff"`, `<ScrollHint`, `scrollEventThrottle` |
