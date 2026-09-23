# Plano da Fase 5: redesign no código (make-plan)

Data: 2026-09-23. Entrada: `DESIGN-IS-2026-09-23/04-handoff-prompt.md`, `PATHFINDER-2026-09-23/04-handoff-prompts.md` (S1 a S6), `diagnostico.md` (ordem das ondas), `design/preview/index.html` (referência visual) e `pesquisa-apple.md` §12 (tokens). Cada onda é autocontida: pode ser executada num contexto novo lendo só este arquivo e os trechos citados.

Regras válidas em todas as ondas (não repetir, cumprir):
- Branch `claude/funny-cray-ret9a0`, PR #2. Cada onda termina com `npm run lint` (0 erros, warnings sem subir de 14), `npm run check:refs` (0 erros), `npm test` (verde), `npx expo export -p web` (verde) e um commit próprio. Push depois de verificado.
- Não renomear rota nem aba (`'Início'`, `'Artigos'`, `'Bíblia'`, `'Ferramentas'`, `'Ajustes'`, e todos os nomes em `App.js`). Não mudar `firestore.rules` nem a forma dos dados do usuário.
- Dependências novas permitidas: só `expo-blur` e `expo-linear-gradient` (via `npx expo install`, versão `~15.0.8`). Nada de moti, lottie, jest.
- Sem travessão (o traço longo) em código, strings ou docs. Strings novas em `src/i18n/strings.js` nos dois idiomas.
- Copiar padrões da Fase 0 abaixo; se uma API parecer faltar, parar e conferir em `node_modules` antes de inventar.
- Lógica nova pura (sem `react-native`) nasce com teste em `tests/` escrito antes (TDD: ver o teste falhar, depois passar).

---

## Fase 0: APIs permitidas (descoberta feita, com fonte)

### Versões instaladas
expo 54.0.34, react-native 0.81.5 (Nova Arquitetura ligada por padrão), react-native-web 0.21.2, react-native-reanimated 4.1.7, react-native-worklets 0.5.1, react-native-gesture-handler 2.28.0, react-native-screens 4.16.0, @react-navigation/native 6.1.18, native-stack 6.11.0, stack 6.4.1, bottom-tabs 6.6.1, elements 1.3.31, expo-font 14.0.11, expo-haptics 15.0.8, expo-navigation-bar 5.0.10, react-native-safe-area-context 5.6.2. A instalar: expo-blur ~15.0.8, expo-linear-gradient ~15.0.8 (`node_modules/expo/bundledNativeModules.json`).

### expo-blur (a instalar)
- `import { BlurView } from 'expo-blur'`; props `tint` (união de 21 strings: `'light' | 'dark' | 'default' | 'systemChromeMaterial' | 'systemChromeMaterialLight' | 'systemChromeMaterialDark' | ...`), `intensity` 1 a 100 (default 50), `experimentalBlurMethod: 'none' | 'dimezisBlurView'` (só Android; com `'none'` **não desfoca**, vira véu semitransparente), `blurReductionFactor` (Android). Web: vira `backdrop-filter: saturate(180%) blur(intensity*0.2 px)`.
- Limitações: `borderRadius` só com `overflow: 'hidden'`; renderizar o BlurView **depois** do conteúdo dinâmico na árvore; não existem `blurType`, `blurAmount`, `blurRadius`.
- Fonte: tarball 15.0.8 (`src/BlurView.web.tsx`, `android/.../ExpoBlurView.kt`), https://docs.expo.dev/versions/v54.0.0/sdk/blur-view/.

### expo-linear-gradient (a instalar)
- `import { LinearGradient } from 'expo-linear-gradient'`; `colors` (mínimo 2), `locations`, `start`/`end` (`{x,y}`, na web só mudam o ângulo), `dither` (Android), aceita `children` e `style` com `borderRadius` + `overflow: 'hidden'`.

### expo-font 14.0.11
- `useFonts({ 'CormorantGaramond-SemiBold': require('./assets/fonts/CormorantGaramond-SemiBold.ttf') })` devolve `[loaded, error]`; a chave é o `fontFamily` nas três plataformas (`node_modules/expo-font/build/FontHooks.d.ts`, `ExpoFontLoader.web.js:167`). Funciona em Expo Go e web (o `.ttf` vai para `dist/assets/...` como os Ionicons). O plugin `"expo-font"` em `app.json` sem opções é inerte; com opções exige build EAS (não usar nesta fase).
- Fonte: `assets/fonts/CormorantGaramond-SemiBold.ttf` gerada a partir da variável oficial (`https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf`, OFL 1.1 sem nome reservado) com fonttools (`pip3 install --user fonttools` funciona sem sudo): instanciar `wght=600` com `updateFontNames=True` e subsetar `U+0000-00FF,U+0100-017F,U+2000-206F,U+20AC,U+2122` com `--layout-features='kern,liga'` → 79.168 bytes. Commitar também `assets/fonts/OFL-CormorantGaramond.txt`.

### expo-haptics 15.0.8
- `impactAsync(ImpactFeedbackStyle.Light|Medium|Heavy|Soft|Rigid)`, `notificationAsync(NotificationFeedbackType.Success|Warning|Error)`, `selectionAsync()`, `performAndroidHapticsAsync(AndroidHaptics.Segment_Tick|...)`. Na web usa `navigator.vibrate` e nunca lança; no nativo sem módulo lança `UnavailabilityError` (manter `.catch(() => {})`). Snippet do helper em `src/utils/haptics.js` (Onda 0a).

### expo-navigation-bar 5.0.10
- Com edge-to-edge (obrigatório no SDK 55, já no Expo Go 54) `setBackgroundColorAsync` vira no-op com warning; `setButtonStyleAsync('light'|'dark')` continua valendo. Trocar `ThemeContext.jsx:109-114` para chamar só `setButtonStyleAsync`.

### react-native-reanimated 4.1.7 (+ worklets 0.5.1, gesture-handler 2.28)
- `babel.config.js` já tem `react-native-worklets/plugin`. Nova Arquitetura ligada. Web funciona sem passo extra.
- Header que encolhe: `useSharedValue`, `useAnimatedScrollHandler((e) => { y.value = e.contentOffset.y })` em `Animated.ScrollView`/`Animated.FlatList`, `useAnimatedStyle`, `interpolate(x, in, out, Extrapolation.CLAMP)`. Na web só `onScroll` dispara (não usar `onEndDrag`).
- `withSpring(v, { duration, dampingRatio })` (default 550 ms perceptual, 1.0) **ou** `{ mass, stiffness, damping }`, nunca os dois; `withTiming(v, { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })`; `ReduceMotion.System` é o default (com reduce motion, spring/timing pulam para o fim); `useReducedMotion()` para decisões em JS.
- Layout: `Animated.View entering={FadeInDown.duration(260).delay(i * 40)}` funciona na web (CSS); `.springify()` é ignorado na web.
- Toque: `Animated.createAnimatedComponent(Pressable)` com `onPressIn/onPressOut` escrevendo `scale.value = withSpring(0.97, ...)`.
- Sheet: `Gesture.Pan().activeOffsetY(8).onUpdate().onEnd()` + `GestureDetector` + `scheduleOnRN(fn)` de `'react-native-worklets'` para chamar JS (não `runOnJS`).
- Removidos no 4: `useAnimatedGestureHandler`, `useWorkletCallback`; deprecados: `runOnJS/runOnUI` (usar `scheduleOnRN/scheduleOnUI`), `useScrollViewOffset` (é `useScrollOffset`), `Extrapolate` (é `Extrapolation`).
- Fonte: `node_modules/react-native-reanimated/lib/typescript/**`, https://docs.swmansion.com/react-native-reanimated/docs/.

### Navegação (native-stack 6.11, stack 6.4, bottom-tabs 6.6, screens 4.16)
- `animation: 'ios_from_right'` existe (`react-native-screens/lib/typescript/types.d.ts:14`): Android anima de verdade, iOS resolve para o padrão, **web ignora** (o `NativeStackView.js` web só alterna `display`). Para animar na web: `createStackNavigator` de `@react-navigation/stack` (instalado) com `...TransitionPresets.SlideFromRightIOS`, escolhido por `Platform.OS === 'web'`.
- `headerTransparent: true` + `headerBackground: () => <ChromeBackdrop />` + `headerShadowVisible: false` funcionam nas 3 plataformas; `headerBlurEffect`, `headerLargeTitle`, `headerBackTitleVisible`, `gestureEnabled`, `animationDuration` são só iOS. `headerTitleStyle` no nativo aceita só `fontFamily, fontSize, fontWeight, color`. Conteúdo sob header transparente compensa com `useHeaderHeight()` de `@react-navigation/elements`.
- Android: o native-stack força `gestureEnabled: false`; o voltar é JS (BackHandler), `beforeRemove` continua funcionando. Não ligar `android.predictiveBackGestureEnabled` (rn-screens 4 não suporta).
- bottom-tabs: `tabBar={(props) => <TabBar {...props} />}` recebe `{ state, descriptors, navigation, insets }`; em tab bar custom é **obrigatório** `useContext(BottomTabBarHeightCallbackContext)` e chamar no `onLayout`, senão `useBottomTabBarHeight()` fica na estimativa 49 + inset; conteúdo por baixo exige `position: 'absolute'` e `paddingBottom: useBottomTabBarHeight()` nas telas. `tabPress` cancelável com `e.preventDefault()`.
- Acessibilidade portável: `role="tab" | "tablist" | "button"`, `aria-selected`, `aria-current`, `aria-label`, `aria-hidden` (RN 0.81 e RNW 0.21); RNW **não** converte `accessibilityState` e avisa deprecated em `accessibilityRole`.
- Filhos do Navigator: `Screen`, `Group`, `Fragment`, arrays e **funções que devolvem esses** (`@react-navigation/core/lib/module/useNavigationBuilder.js:38-67`). Um componente `<SharedScreens />` lança erro.

### react-native-web 0.21.2 e estilos do RN 0.81
- RNW repassa qualquer propriedade long-form: `backdropFilter` (com `-webkit-`), `filter`, `position: 'sticky'`, `outlineWidth/Style/Color/Offset`, `boxShadow`. Rejeita shorthands (`outline`, `background`, `borderTop`...). `elevation` é ignorada na web e `shadow*` está deprecado: usar `boxShadow` (array `[{ offsetX, offsetY, blurRadius, color }]`, também nativo com Fabric).
- `Pressable` na web descarta `hitSlop` e `android_ripple`: alvo de 44 vem de `minHeight`/`minWidth`/`padding`.
- `backdropFilter` não existe no nativo: `Platform.select` ou arquivo `.web.js`. `AccessibilityInfo.isReduceMotionEnabled()` funciona nas três.

### Testes (sem dependência)
- `package.json`: `"test": "node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --import ./tests/resolve-hook.mjs --test"` (sem argumentos: pasta quebra no Node 22, glob quebra no Node 20). Pasta `tests/` (plural; `test/` faria o runner executar o hook). Hook de resolução `tests/resolve-hook.mjs` + `tests/resolve-hook-impl.mjs` (tenta `.js`, `.jsx`, `/index.js`). Módulos testáveis: puros, sem `react-native`/`expo-*`/`.jsx`/`require()` de imagem. Não adicionar `"type": "module"` ao package.json (quebra metro/babel/app.config).
- ESLint 8 (`.eslintrc.json`): erros que quebram: `no-undef`, `no-dupe-keys`, `react/jsx-key`, `react-hooks/rules-of-hooks`...; warnings que não podem subir: `no-unused-vars`, `react-hooks/exhaustive-deps`. `tests/` não é lintada.

---

## Onda 0a: infraestrutura (dependências, fonte, testes, haptics, tema)

Objetivo: tudo que as ondas seguintes consomem, sem mudar nenhuma tela.

Tarefas:
1. `npx expo install expo-blur expo-linear-gradient` (esperado `~15.0.8` cada; conferir `package.json`).
2. Fonte: gerar `assets/fonts/CormorantGaramond-SemiBold.ttf` (79 KB) e `assets/fonts/OFL-CormorantGaramond.txt` com o pipeline da Fase 0 (fonttools via `pip3 install --user`). Verificar com `python3 -c "from fontTools.ttLib import TTFont; f=TTFont('assets/fonts/CormorantGaramond-SemiBold.ttf'); print(f['name'].getDebugName(6), f['OS/2'].usWeightClass)"` → `CormorantGaramond-SemiBold 600`.
3. Testes: criar `tests/resolve-hook.mjs`, `tests/resolve-hook-impl.mjs` (copiar da Fase 0), `tests/references.test.mjs` (ids únicos e `SOURCE_IDS`) e o script `test` no `package.json`. `npm test` verde. Adicionar `- run: npm test` em `.github/workflows/deploy-web.yml` após "Check references data".
4. `src/utils/haptics.js`: copiar o helper da Fase 0 (`selection`, `success`, `warning`, `error`, `impact`), desligado na web.
5. `src/context/ThemeContext.jsx`: (a) novas chaves nas duas paletas: `tint` (claro `#1a3a5c`, escuro `#d4b86a`), `onTint` (`#ffffff` / `#0d1722`), `onPrimary` (`#ffffff` nos dois), `textTertiary` (`#948c7c` / `#7d7767`), `separator` (`rgba(26,58,92,0.14)` / `rgba(236,232,216,0.14)`), `hairline` (`rgba(0,0,0,0.14)` / `rgba(255,255,255,0.14)`), `material` (`rgba(245,240,232,0.72)` / `rgba(13,23,34,0.72)`), `elevated` (`#ffffff` / `#1e2f47`), `overlay` (`rgba(0,0,0,0.4)`), `danger` (`#b3261e` / `#f28b82`), `success` (`#2f7a4a` / `#8fd19e`), `seasonGreen` (`#2f7a4a` / `#8fd19e`), `seasonPurple` (`#5b3f8a` / `#b59ae6`); manter todas as chaves atuais. (b) Só `NavigationBar.setButtonStyleAsync(darkMode ? 'light' : 'dark')` em `:109-114` (apagar `setBackgroundColorAsync`). (c) Sem preferência salva, iniciar `darkMode` por `Appearance.getColorScheme() === 'dark'` (`import { Appearance } from 'react-native'`). (d) `app.json`: `"userInterfaceStyle": "automatic"`.
6. `src/hooks/useReduceMotion.js`: `AccessibilityInfo.isReduceMotionEnabled()` + evento `reduceMotionChanged` (snippet da Fase 0), devolvendo boolean.

Verificação: lint, check:refs, `npm test` (2 testes), export web verde; `grep -n "setBackgroundColorAsync" src/` → 0; `ls -la assets/fonts/` mostra os 2 arquivos; `git diff --stat` só nos arquivos listados.
Antipadrões: instalar versão fixa à mão (usar `expo install`); plugin `expo-font` com opções (exige EAS); `"type": "module"`; fonte baixada do gstatic como canônica.

## Onda 0b: copy honesta, primeiro uso e remoções baratas (itens 1 a 7 do diagnóstico)

Objetivo: corrigir o que mente ou desvia, sem redesenhar.

Tarefas (cada uma com o file:line de hoje):
1. Copy: apagar a promessa de sincronização de favoritos em `src/screens/ArticleDetailScreen.jsx:207-210` e `src/components/AccountPrompt.jsx:19-20, :104-106` (novo texto: "Marcações, notas e caderno ficam salvos na sua conta e sincronizados entre aparelhos."); `WebDownloadBanner` sai de `SettingsScreen.jsx:225` (componente pode ficar no repo, sem uso); `OnboardingScreen.jsx`: remover o passo "Com quem você conversa" (`AUDIENCES` `:26-31`, passo 2 `:122-131`, `setStep(3)` → `setStep(2)`), trocar `:82` para "Quando questionarem a sua fé, tenha a resposta com a fonte na mão."; 1 Pedro 3,15 com o texto da Ave Maria embarcada em `strings.js:89-90`, `OnboardingScreen.jsx:88-90` (ref "1 Pedro 3,15") e `App.js:255`; `strings.js:53` "Buscar em todo o app..." → "Buscar" (PT) / "Search" (EN); "Capítulo em preparação" (`strings.js:163`, `BibleScreen.jsx:831-836`) só aparece se o capítulo faltar (já é o caso, manter).
2. Primeiro uso: em `App.js:384-408` ler `hasSeenOnboarding()` (`src/utils/onboarding.js:6`) num `useEffect` e só mostrar o `OnboardingScreen` quando for falso; ao terminar (`onDone`), se não houver `user`, chamar `continueAsGuest()` do `AuthContext` (`AuthContext.jsx:90-93`) antes de `setOnboardingPassed(true)`, para "Ver a resposta" e "Pular" caírem no app. Login continua acessível em Ajustes (card "Você está como visitante").
3. Favoritar sem conta: `ArticleDetailScreen.jsx:199-214` chama `toggleFavorite` direto (apagar o `requireAccount` ali); `ToolsScreen.jsx:33-40` tira `Favorites` da lista gated.
4. Apagar `src/components/ScrollHint.jsx`, `src/hooks/useScrollHints.js` e as 24 montagens (lista em `PATHFINDER-2026-09-23/02b` C14: `HomeScreen.jsx:157-160`, `ArticleDetailScreen.jsx:357-359`, `BibleScreen.jsx:737-738, :893-894`, `ToolsScreen.jsx:119-120`, `SettingsScreen.jsx:635-636`, `TodayScreen.jsx:74-75`, `ArticlesScreen`, `ReferencesScreen.jsx:308-309`, `GlossaryScreen.jsx:103-104`, `ReadingPlanScreen.jsx:151-152`, `SearchScreen.jsx:334-335`, `QuizScreen.jsx:269-270`, `DialogueScreen.jsx:203-204`, `LiturgyScreen.jsx:342-343`, `RosaryScreen.jsx:294-295`, `RefDetailScreen.jsx:146-147`, `DebateStrategiesScreen.jsx:123-124`, `HighlightsScreen.jsx:149-150`, `ExamConscienceScreen.jsx:80-81`, `FavoritesScreen.jsx:80-81`, `NotesScreen.jsx:97-98`, `NotebookScreen.jsx:110-111`, `CategoryArticlesScreen.jsx:61-62`) junto com o bloco `onScroll/onContentSizeChange/onLayout/scrollEventThrottle` que só existia para elas.
5. Aba ativa: `App.js:315` `tabBarActiveTintColor: colors.tint`; cor da estação litúrgica: `src/utils/liturgicalSeason.js:31-35` passa a devolver a chave do tema (`seasonGreen`, `seasonPurple`, `accent`) e `HomeScreen.jsx:89-95` lê `colors[key]`.
6. `src/data/articleCategories.js:9` ícone `church` (MaterialCommunityIcons) → Ionicons `business-outline`... **não**: usar Ionicons `home-outline` para Igreja Católica? Escolha: `'ios-church'` não existe em Ionicons; usar `'people-circle-outline'`? Decisão: `library-outline` para Igreja Católica (livros e magistério) e remover o `lib: 'mci'` do `AppIcon` quando nenhum consumidor restar (grep `mci` em `src/`).
7. `App.js:171` (ArticleDetail `title`): tirar o prefixo "Artigo - " (`headerTitle: article.title`).

Verificação: lint (warnings ≤ 14, provavelmente cai), check:refs, `npm test`, export web; `grep -rn "ScrollHint\|useScrollHints" src/ App.js` → 0; `grep -rn "sincronizados" src/` só nas frases novas; abrir o build web em Playwright: primeira carga mostra onboarding, "Pular" cai na Início como visitante, segunda carga (localStorage `onboarding:done`) vai direto para a Início; `MaterialCommunityIcons.ttf` não é baixada na Início (`page.on('request')`).
Antipadrões: apagar `AccountPrompt`/`GuestGate` (marcações e notas continuam gated); mexer em `firestore.rules`; trocar nomes de rota.

## Onda 1: tokens e tipografia (S1)

Objetivo: `src/theme/tokens.js` puro, testado, e o tema expondo tokens.

Tarefas:
1. TDD: `tests/tokens.test.mjs` primeiro: `space` = {xxs 4, xs 8, sm 12, md 16, lg 20, xl 24, xxl 32, xxxl 40}; `radius` = {xs 4, sm 8, md 12, lg 18, full 9999}; `type.body` = {size 17, lineHeight 22, weight '400', family 'sans'}; `type.largeTitle` = {size 34, lineHeight 41, weight '600', family 'display'}; `type.tabLabel.fixed === true`; `textStyle('body', (n) => n)` devolve `{ fontSize: 17, lineHeight: 22, fontWeight: '400', fontFamily: FONT_FAMILY.sans }`; `textStyle('body', (n) => Math.round(n*1.35))` devolve fontSize 23 e lineHeight 30; `textStyle('tabLabel', fs)` ignora `fs`; `icon` = {sm 18, md 22, lg 26}; `motion` = {touch 150, layout 350, screen 350, aba 200, stagger 40, easing [0.25,0.1,0.25,1], press {scale 0.97}}; `shadow.floating` tem `boxShadow` com 1 item. Rodar `npm test` e ver falhar.
2. Implementar `src/theme/tokens.js` (sem importar react-native): `FONT_FAMILY = { display: 'CormorantGaramond-SemiBold', sans: undefined, serif: 'Georgia' }` (undefined deixa o sistema; no Android `serif` genérico: exportar `FONT_FAMILY_BY_PLATFORM` puro com `{ ios: {...}, android: { serif: 'serif' }, web: { serif: 'Georgia, "Times New Roman", serif' } }` e o `ThemeContext` escolhe por `Platform.OS`), `space`, `radius`, `type` (tabela de `pesquisa-apple.md` §12.4 mais `section` 22/28 display, `reading` 18/28 serif, `readingBible` 19/30 serif, `tabLabel` 11/13 fixed), `textStyle(role, fs)`, `icon`, `motion`, `shadow` (`card` só no claro, `floating`, `sheet`, no formato `boxShadow` array). Ver `npm test` passar.
3. `ThemeContext.jsx`: `useTheme()` passa a devolver `tokens` (com `fontFamily` resolvido por plataforma) e `text(role)` = `textStyle(role, fs)`; `FONT_SCALES` ganha `muitoGrande 1.65` e `maximo 2.0` (Ajustes mostra as opções novas com `t('settings.font.*')`).
4. `App.js`: `useFonts({ 'CormorantGaramond-SemiBold': require('./assets/fonts/CormorantGaramond-SemiBold.ttf') })` no `RootNavigation`, gate junto do `BrandedSplash` (`if (loading || (!fontsLoaded && !fontsError)) return <BrandedSplash />`).
5. `src/components/BrandMark.jsx`: cruz em Views (28x36 no `md`, 44x56 no `lg`, 18x24 no `sm`) + nome opcional, cores por tokens; substitui `CrossMark` nos 4 blocos de marca (`App.js:250-259`, `HomeScreen.jsx:80-86`, `LoginScreen.jsx:65-68`, `OnboardingScreen.jsx:77-91`). `CrossMark.jsx` some se não sobrar consumidor.

Verificação: `npm test` (tokens), lint, export web; captura web mostra títulos em Cormorant (checar `document.fonts.check('16px CormorantGaramond-SemiBold')` no Playwright).
Antipadrões: `tokens.js` importando `react-native` (quebra o teste); `fontWeight: 'bold'` esperando escolher arquivo; criar `StyleProvider`/HOC; tokens sem uso.

## Onda 2: componentes base (S2) e movimento

Objetivo: `src/components/ui/` com os sete componentes do protótipo mais `PressScale` e `Sheet`.

Tarefas (copiar os snippets da Fase 0 de reanimated e os estilos do protótipo `design/preview/index.html`, classes `.group`, `.row`, `.section-title`, `.btn*`, `.search`, `.progress`, `.sheet`):
1. `PressScale.jsx`: `Animated.createAnimatedComponent(Pressable)`, `onPressIn` → `withSpring(0.97, { duration: 150, dampingRatio: 0.9 })`, `onPressOut` → 1; `role="button"`; `haptics.selection()` opcional por prop.
2. `Group.jsx` + `Row.jsx`: fundo `colors.surface` (nova chave = `card`), `radius.md`, separador de 0,5 px (`StyleSheet.hairlineWidth`) com inset `space.md`; `Row` com `icon`, `title`, `subtitle`, `trailing` (`'chevron' | string | node`), `onPress` (vira `PressScale`), `minHeight: 44`, `accessibilityRole`/`role="button"` e `aria-label`.
3. `SectionTitle.jsx` (`text('section')`), `Button.jsx` (`variant: 'primary' | 'secondary' | 'plain'`, `minHeight: 50` ou 44 no plain, `disabled` com opacidade 0,4 e `aria-disabled`, `loading` com `ActivityIndicator`), `SearchField.jsx` (`TextInput` com `outlineWidth: 2, outlineColor: colors.tint` no foco via estado, `asButton`), `Chip.jsx`, `ProgressBar.jsx` (3 px, `colors.gold`), `EmptyState.jsx`, `GateNotice.jsx` (mensagens `gate.*` em strings.js).
4. `Sheet.jsx`: snippet da Fase 0 (Pan + withSpring + `scheduleOnRN`), `Modal transparent` no nativo, backdrop `colors.overlay`, `radius.lg` no topo, `GestureHandlerRootView` dentro do `Modal`.
5. `src/components/ui/index.js` exportando tudo; `docs/design/componentes.md` curto com o uso de cada um (10 linhas cada).

Verificação: lint; export web; página de teste temporária NÃO (usar a Onda 4 para ver); `grep -rn "outlineStyle" src/components/ui` → 0; cada componente tem os estados relevantes (`disabled`, `loading`, foco) por inspeção.
Antipadrões: `hitSlop` como único alvo; `accessibilityState` para selecionado; `shadow*`/`elevation` (usar `boxShadow` só onde o token manda); `runOnJS`.

## Onda 3: chrome e navegação (S3)

Objetivo: header translúcido com large title próprio, tab bar translúcida, registro compartilhado, links.

Tarefas:
1. `src/navigation/ChromeBackdrop.jsx` (+ `.web.jsx`): nativo `BlurView tint={darkMode ? 'dark' : 'light'} intensity={darkMode ? 60 : 80} experimentalBlurMethod="dimezisBlurView"` sobre `colors.material`; web `View` com `backgroundColor: colors.material, backdropFilter: 'blur(16px) saturate(180%)'`.
2. `src/navigation/TabBar.jsx`: snippet "Opção B" da Fase 0: `role="tablist"`, `BottomTabBarHeightCallbackContext` no `onLayout`, `position: 'absolute'`, altura `49 + insets.bottom`, `ChromeBackdrop` atrás, itens `Pressable role="tab" aria-selected` com Ionicons (`ICONS` de `App.js:286-292`, corrigindo: Artigos `book`, Bíblia `book-outline`... decisão do diagnóstico E15: Artigos = `newspaper`/`newspaper-outline`, Bíblia = `book`/`book-outline`, Ferramentas = `sparkles`/`sparkles-outline` com rótulo "Praticar" (`strings.js` `tab.tools`), Ajustes = `settings`), rótulo `text('tabLabel')`, `haptics` nenhum na troca de aba.
3. `src/navigation/chrome.js`: `stackScreenOptions(colors, tokens)` = `{ headerTransparent: true, headerBackground: () => <ChromeBackdrop />, headerShadowVisible: false, headerTintColor: colors.tint, headerTitleStyle: { fontFamily: undefined, fontSize: 17, fontWeight: '600', color: colors.text }, headerBackTitleVisible: false, animation: 'ios_from_right', contentStyle: { backgroundColor: colors.bg } }` e `createAppStack()` = `Platform.OS === 'web' ? createStackNavigator` (com `...TransitionPresets.SlideFromRightIOS` e `headerMode: 'screen'`) `: createNativeStackNavigator`. Apagar as 6 cópias (`App.js:100-102, 144-146, 180-182, 213-215, 312-314, 355-357`).
4. `src/components/ui/LargeTitleScreen.jsx`: snippet do header que encolhe (Fase 0, reanimated): barra absoluta de `insets.top + 44` com `ChromeBackdrop` que aparece por opacidade quando `scrollY > 40`, título inline `text('headline')`, `back` opcional com chevron e rótulo, `right` (ações), `Animated.ScrollView`/`Animated.FlatList` com `contentContainerStyle={{ paddingTop: insets.top + 44, paddingBottom: tabBarHeight + space.xl }}`, large title `text('largeTitle')` + `subtitle` no topo do conteúdo. Usa `useBottomTabBarHeight()` com try/catch (fora de tab devolve 0).
5. Enquanto as telas não migram: nos 4 stacks, `contentStyle: { paddingBottom: tabBarHeight }` calculado com `useBottomTabBarHeight()` dentro de `HomeStackScreen` etc. (as telas migradas passam `contentStyle: { paddingBottom: 0 }` nas próprias `options`). Bíblia (aba sem stack) ganha `paddingBottom` no próprio `BibleScreen` até a Onda 6.
6. `src/navigation/sharedScreens.js`: função `sharedScreens(Nav, { t, isEn })` devolvendo `<Nav.Group>` com as telas registradas hoje em 2+ stacks (`App.js:106-131, 150-167, 186-200, 228-243`), mantendo cada nome; apagar os 5 registros sem chamador listados em `02b` C2; `HomeStack` mantém `References`, `Tools`, `Search` próprios.
7. `src/navigation/links.js`: `bibleParams({ bookId, chapter, verse, verseEnd })` puro (TDD em `tests/links.test.mjs`: devolve `{ bookId, chapter, highlightVerse, highlightVerseEnd }` e omite `highlightVerseEnd` quando falta) e `openBible(navigation, ref)`, `openArticle(navigation, id)`; trocar os 10 + 10 chamadores (lista em `02b` C3, C4).
8. `App.js`: `Tab.Navigator tabBar={(p) => <TabBar {...p} />}`, `screenOptions` sem `tabBarStyle`; `BibleScreen` header nativo desligado (`headerShown: false`) porque a Onda 6 dá o large title próprio (até lá, `BibleScreen` mostra um título simples no topo).

Verificação: `npm test` (links); lint; export web; Playwright: Início → Artigos → artigo: header translúcido, botão voltar em PT ("Voltar" via `headerBackTitle`? só iOS; usar `headerBackAccessibilityLabel`... conferir em `types.d.ts`; na web o elements usa "Go back" fixo: aceitar e registrar), tab bar com `role="tablist"` e `aria-selected="true"` no item ativo (medir com `page.locator('[role=tab][aria-selected=true]').count() === 1`), transição visível na web (stack JS); Android: gesto de voltar funciona (só com o usuário; registrar como pendência de smoke).
Antipadrões: `<SharedScreens />` como componente; `useNavigation()` dentro do `tabBar`; `tabBar` custom sem reportar altura; `headerLargeTitle` nativo; `accessibilityState`; renderizar o `BlurView` antes do conteúdo.

## Onda 4: Início

Objetivo: `HomeScreen.jsx` igual ao mock "Depois" da Início.

Tarefas: `LargeTitleScreen title="Início" subtitle={data por extenso}`; `SearchField asButton` → `navigate('Search')`; card da objeção (`radius.lg`, `text('section')` em itálico? não há itálico empacotado: usar `CormorantGaramond-SemiBold` normal, 26/31, cor `tint`) com `Button primary "Ver como responder"`; `Group` com a linha da estação (miniatura `assets/design/estacao-*.jpg` por `getLiturgicalSeason().key`) e o `ContinueRow` (novo componente em `ui/`, recebe `title`, `subtitle`, `progress`, `onPress`; `HomeScreen` faz o `getLastRead`); `SectionTitle "Temas"` + `Group` com 6 `Row` (nomes do diagnóstico: "A Bíblia", "Moral e vida", "Outras crenças" via `strings.js` `category.*` só no rótulo, ids intocados) com contagem em `trailing`; `Group` com "Versículos e fontes". Apagar `ContinueReadingCard.jsx` e os estilos antigos; zero número solto (tudo `tokens`).

Verificação: lint; export web; captura Playwright claro e escuro vs `design/preview/index.html` (Início); `grep -n "fontSize: fs(\|borderRadius: [0-9]\|textTransform" src/screens/HomeScreen.jsx` → 0; a11y: `page.locator('#... [role=button]')` cobre os cards.

## Onda 5: Artigo

Objetivo: `ArticleDetailScreen.jsx` e `MarkdownText.jsx` como o mock.

Tarefas: header nativo translúcido (Onda 3) com `headerTitle` curto (primeiras 3 palavras ou `article.shortTitle` se existir) e `headerRight` com 3 `icon-btn` de 44 (ouvir, compartilhar, guardar) com `aria-label`; `ReadingProgressBar` de 2 px logo abaixo do header; conteúdo com `paddingTop: useHeaderHeight()`; imagem `radius.lg` com legenda `text('caption1')`; categoria em `text('footnote')` secundário (sem badge); título `text('title')` display; corpo `MarkdownText` com `text('reading')` (Georgia/serif), h2 `text('section')`, citações com filete? não: bloco com `surface` e `radius.md`; "Fontes citadas" e "Objeções respondidas" como `Group`/`Row` (apagar os cards de `RelatedArticles.jsx`/`RelatedDialogues.jsx` em favor de `Row`); `ImageZoomModal` intocado.

Verificação: lint; export web; captura vs mock; `grep -n "'#fff'\|textTransform\|borderLeftWidth" src/screens/ArticleDetailScreen.jsx src/components/MarkdownText.jsx` → 0; header não sobrepõe o título (medir `boundingBox` no Playwright).

## Onda 6: Bíblia (capítulo)

Objetivo: `BibleScreen.jsx` views de livros e capítulo com o chrome novo; menu por toque (sheet).

Tarefas: `LargeTitleScreen` em cada uma das 3 views (livros: "Bíblia" + `SearchField`; capítulos: nome do livro; versículos: "João 3" com subtítulo "Evangelho segundo João, capítulo 3 de 21" e `back`); apagar o título duplicado (`:805`); versículos com `text('readingBible')`, número em `text('caption1')` `gold-text`; `verseRow` com `onPress` abrindo o `Sheet` (ações: cores, Anotar, Copiar, Compartilhar) e `onLongPress` mantido; pílula flutuante (`Group` em `position: 'absolute'`, `radius.full`, `ChromeBackdrop`, `boxShadow` `shadow.floating`) com anterior/próximo e "3 de 21", some ao rolar para baixo (`useAnimatedScrollHandler` + `withTiming` opacidade); `paddingBottom` da tab bar; `ContinueBibleCard` → `ContinueRow`; estilos mortos `backRow/backText` apagados.

Verificação: lint; export web; captura vs mock; teclado: `page.keyboard.press('Enter')` num versículo focado abre o sheet (`[role=dialog]` visível); área de leitura > 85% da altura (medir).

## Onda 7: Onboarding e Login (mais Signup e ForgotPassword com os mesmos componentes)

Tarefas: `OnboardingScreen.jsx` = mock aprovado (fundo `colors.bg` + `LinearGradient` radial? não existe radial: usar `LinearGradient colors={[gold a 10%, transparent]} start {0.5,0} end {0.5,0.34}`; `BrandMark md` à esquerda; título `text('largeTitle')` 40/44; lead `text('body')`; citação `text('reading')` itálico? Georgia tem itálico no sistema: `fontStyle: 'italic'`; 3 segmentos; `Button primary "Começar"`, `Button plain "Pular"`); `LoginScreen.jsx` = mock (`BrandMark`, título "Entrar" `text('title')`, `Group` com 2 `Field` rotulados, `Button primary "Entrar"`, `plain "Esqueci a senha"`, divisor "ou" único, `secondary "Continuar com Google"`, `secondary "Criar conta"`, `plain "Continuar sem conta"`, hint); `SignupScreen`/`ForgotPasswordScreen` com os mesmos `Field`/`Button` (sem redesenho de fluxo); `AuthTopToggles` com 36 de altura vira 44.

Verificação: lint; export web; capturas; foco visível nos inputs (Playwright: `outline-width` computado 2px ao focar); Enter no campo de senha submete (`onSubmitEditing`).

## Onda 8: helpers e correções (S4, S5, S6)

Tarefas (TDD para os puros): `src/utils/i18nData.js` (`pick`, `categoryLabel`) + `tests/i18nData.test.mjs`; `src/utils/verseRef.js` (`formatVerseRef`) + teste (PT "João 3,3-5", EN "John 3:3-5"; caso "Salmo 23" sem número repetido) e uso em `share.js:36`, `VerseOfDayCard.jsx:23-24` e os 7 lugares de `02b` C25; `src/utils/daily.js` (`dailyIndex`, `todayKey`, `easterDate`) + teste (Páscoa 2026 = 5 de abril; `dailyIndex(53, new Date(2026, 0, 1))` estável) e uso em `HomeScreen.jsx:65-67`, `notifications.js:8-12`, `dailyVerses.js:98-104`, `quiz.js:1966-1967`, `saints.js`, `liturgicalSeason.js`, `QuizScreen.jsx:100-112` (hora local); `src/utils/tts.js` (`speakLong`) + teste do fatiamento (função pura `chunkText(text, 4000)` separada) e uso nos 3 lugares; `NoteEditorScreen.jsx:5-6, :33-47` via `userData.js`; `APP_PROMO` único e `LiturgyScreen.jsx:115` via `doShare`; `useRequireAccount(reasonKey)` com `gate.*` em strings.js; `translateFullSource` para `references.js`; `EN_BOOK_ID` derivado de `bible.js`.

Verificação: `npm test` (todos), lint, check:refs, export web; `grep -rn "titleEn ||" src/` → só `i18nData.js`; `grep -rn "getDoc(" src/` → só `userData.js`.

## Onda 9: demais telas (passada de tokens)

Objetivo: nenhuma tela com número solto, todas com o chrome novo (`LargeTitleScreen` nas raízes de aba Artigos, Ferramentas, Ajustes; `Group/Row` nas listas de Ferramentas, Ajustes, Today, Referências, Glossário, Debate, Quiz, Diálogo, Plano, Favoritos, Marcações, Notas, Caderno). Uma feature por commit, na ordem: Artigos (lista, categoria), Ferramentas (hub), Ajustes, Conteúdo do dia, Referências, Busca, Treino (Quiz, Diálogo, Debate, Glossário), Espiritualidade (Rosário, Exame, Mapa), Dados do usuário.

Verificação por commit: lint, export web, captura da tela, `grep` de números soltos no arquivo.

## Onda final: verificação e revisão

1. `verification-before-completion`: rodar tudo (`npm run lint`, `npm run check:refs`, `npm test`, `npx expo export -p web`), capturar as 5 telas em claro e escuro em 390 e 1280 e comparar com o protótipo; medir no build: contraste da aba ativa, alvos ≥ 44, `role=tab` + `aria-selected`, foco visível, sem loop de rAF em tela parada (`requestAnimationFrame` contador = 0 na Início parada), bundle web gzip ≤ baseline + 150 KB (baseline 1.374.966 B).
2. `requesting-code-review` + `/code-review` + `/simplify` + `/security-review` (toca auth e onboarding).
3. `CLAUDE.md`: seção de testes (`npm test`, `tests/`, módulos puros), `src/theme/tokens.js`, `src/components/ui/`, `src/navigation/`; `GUIA-DO-PROJETO.md`; Diário e Aprendizados no brain; PR #2 com o checklist final e pronto para revisão (tirar de rascunho só se o dono pedir).

## Antipadrões (consolidado, para o agente de verificação grep-ar)
- `grep -rn "ScrollHint\|useScrollHints\|runOnJS\|useAnimatedGestureHandler\|Extrapolate\b\|useScrollViewOffset" src/ App.js` → 0.
- `grep -rn "outlineStyle: 'none'" src/` → 0. `grep -rn "hitSlop" src/components/ui` → 0 (alvo por tamanho).
- `grep -rn "accessibilityState" src/` → só onde ainda não migrou (meta: 0 nas telas migradas).
- `grep -rnE "#[0-9a-fA-F]{3,6}" src/ --include=*.jsx` fora de `ThemeContext.jsx`, `tokens.js` e as 5 cores de marcação → 0 nas telas migradas.
- `grep -rn "textTransform: 'uppercase'\|borderLeftWidth" src/screens/{Home,ArticleDetail,Bible,Onboarding}Screen.jsx src/screens/auth/LoginScreen.jsx` → 0.
- `grep -rn "setBackgroundColorAsync\|'Artigo - '\|Artigo - " src/ App.js` → 0.
- `grep -rn "\"type\": \"module\"" package.json` → 0. `grep -rn "expo-font\", {" app.json` → 0 (plugin sem opções).
- Nada de `<SharedScreens` como JSX; nada de `headerLargeTitle`; nada de `shadowColor|shadowOpacity|elevation:` nos componentes novos.
