# Componentes base (`src/components/ui/`)

Onda 2 do plano da Fase 5. Todos leem o tema por `const { colors, tokens, text } = useTheme()`:
nenhum número solto de espaço, raio ou fonte, sempre `tokens.space.*`, `tokens.radius.*`,
`tokens.icon.*`, `tokens.motion.*` e `text('papel')`. Importe pelo índice:

```jsx
import { Group, Row, ContinueRow, SectionTitle, Button, SearchField, Field, Chip, ProgressBar, EmptyState, GateNotice, Sheet, PressScale, LargeTitleScreen } from '../components/ui';
```

Regras comuns: o alvo de toque vem do tamanho do elemento (`minHeight`/`minWidth` 44), nunca de
`hitSlop` (a web descarta). Acessibilidade portável com `role`, `aria-label`, `aria-selected`,
`aria-disabled` (RN 0.81 e react-native-web 0.21), nada de `accessibilityRole`/`accessibilityState`,
que a web avisa como deprecados. Sombra só por `boxShadow` dos tokens, nunca `shadow*`/`elevation`.

## PressScale

Pressable que encolhe ao toque (`motion.press.scale` com mola de `motion.touch` ms) e volta ao
soltar. É a base de `Row`, `Button`, `Chip` e do `SearchField` em modo botão. Aceita todas as props
do `Pressable`, `role` (default `"button"`), `haptic` (`'selection' | 'impact'`, dispara no
`onPress`) e `style` como objeto, array ou função `({ pressed }) => estilo`.

```jsx
<PressScale onPress={abrir} haptic="selection" style={{ minHeight: 44, padding: tokens.space.md }}>
  <Text>Abrir</Text>
</PressScale>
```

Não fazer: passar `hitSlop` (dê tamanho ao elemento); usar `runOnJS`; embrulhar um `PressScale`
noutro (a escala dobra); passar `children` em função esperando `pressed`, use a função em `style`.

## Group

Card de lista agrupada: fundo `card`, cantos `radius.md`, `overflow: 'hidden'` e um separador de
meia linha entre cada par de filhos, recuado por `insetLeft` (default `space.md`). `header` e
`footer` (string ou nó) ficam fora do card em footnote secundário. `style` vai no invólucro
externo, use para margens.

```jsx
<Group header="Temas" footer="Toque para ver os artigos" style={{ marginBottom: tokens.space.md }}>
  <Row icon="book-outline" title="A Bíblia" trailing="chevron" onPress={...} />
  <Row icon="people-outline" title="Outras crenças" trailing="12" onPress={...} />
</Group>
```

Não fazer: `Group` com um único filho para "dar fundo" (use uma `View` com `colors.card`);
passar `null` no meio dos filhos esperando separador (nulos são ignorados, sem linha dupla);
pôr margem no `Group` achando que é no card (é no invólucro).

## Row

Linha de lista. Props: `icon` (nome Ionicons, cor `iconColor ?? colors.tint`, caixa de 28),
`title` (body, 1 linha por default, `titleLines={0}` para quebrar), `subtitle` (subhead
secundário), `trailing` (`'chevron'`, texto ou nó), `onPress` (vira `PressScale` com fundo
escurecido enquanto pressionada), `disabled` (opacidade 0,4 e `aria-disabled`),
`accessibilityLabel` (vira `aria-label`), `children` (abaixo do subtítulo), `style`.

```jsx
<Row icon="bookmark-outline" title="Favoritos" subtitle="8 artigos" trailing="chevron" onPress={() => navigate('Favorites')} />
<Row title="Versão" trailing="1.4.0" />
<Row title="Sincronizar" trailing={<Switch value={on} onValueChange={setOn} />} />
```

Não fazer: usar fora de um `Group` (perde o card e os separadores); pôr botões dentro de uma
`Row` que já tem `onPress` (toque aninhado); `trailing="chevron"` sem `onPress`.

## SectionTitle

Título de seção em display (`text('section')`, `role="heading"` com `aria-level={2}`, o título da
tela é o nível 1) com margens `space.xl` em cima, `space.sm` embaixo e `space.md` nas laterais. `action` opcional `{ label, onPress }` à direita
em subhead na cor `tint`, com alvo de 44 que não estica a linha. `title` ou `children`.

```jsx
<SectionTitle title="Continuar lendo" action={{ label: 'Ver tudo', onPress: verTudo }} />
```

Não fazer: usar para o título da tela (é o `LargeTitleScreen`); dois `SectionTitle` seguidos sem
conteúdo entre eles; sobrescrever a fonte no `style` (mude o token, não o componente).

## Button

Variantes `primary` (fundo `tint`, texto `onTint`, 50 de altura), `secondary` (fundo `card` com
hairline `separator`, texto `tint`, 50) e `plain` (transparente, texto `tint`, 44). Rótulo em
`text('headline')` por `label` ou `children`, `icon` Ionicons opcional antes do texto,
`disabled` (opacidade 0,4, `aria-disabled`, sem toque), `loading` (`ActivityIndicator` no lugar
do rótulo, mesma altura, sem toque), `haptic`, `full` (largura total, default `true`), `style`
e `textStyle`.

```jsx
<Button label="Entrar" onPress={entrar} loading={enviando} haptic="impact" />
<Button variant="secondary" icon="logo-google" label="Continuar com Google" onPress={google} />
<Button variant="plain" label="Pular" onPress={pular} />
```

Não fazer: `disabled` para esconder um botão (esconda de verdade); dois `primary` na mesma
tela; `full={false}` numa linha horizontal esperando centralizar (o `alignSelf` age no eixo
cruzado do pai).

## SearchField

Campo de busca: caixa `card` de 44 com lupa, `TextInput` em body e botão limpar (`close-circle`,
44x44, `aria-label` de `clearLabel`, default `t('common.clear')`) quando há valor. Na web, o foco desenha
`outlineWidth: 2` na cor `tint` sobre o próprio input, que preenche a caixa, então o anel
contorna a caixa toda e substitui o do navegador. Props: `value`, `onChangeText`,
`onSubmitEditing`, `placeholder`, `autoFocus`, `returnKeyType` (default `"search"`), `style` e o
resto do `TextInput`. Aceita `ref` para focar por código. Com `asButton` e `onPress` vira um
`PressScale` com a mesma cara (`role="button"`, `aria-label` = placeholder), para abrir a tela
de busca.

```jsx
<SearchField value={q} onChangeText={setQ} placeholder="Buscar" autoFocus />
<SearchField asButton placeholder="Buscar" onPress={() => navigate('Search')} />
```

Não fazer: `outlineStyle: 'none'` em qualquer lugar (o foco precisa aparecer); um `TextInput`
solto ao lado de uma lupa em vez do componente; `asButton` sem `onPress`.

## Chip

Pílula selecionável: alvo externo de 44, pílula de 34 com `paddingHorizontal: space.md` e
`radius.full`. `selected` pinta fundo `tint` e texto `onTint`, senão fundo `card`, texto normal
e hairline. Rótulo em subhead peso 600, `icon` opcional, `haptic` (booleano, tique de seleção),
`disabled` e `role="button"`. O estado selecionado sai como `aria-pressed` na web (botão de
alternância) e `aria-selected` no nativo, porque o RN 0.81 não aceita `aria-pressed`.

```jsx
<View style={{ flexDirection: 'row', gap: tokens.space.xs }}>
  {opcoes.map((o) => <Chip key={o} label={o} selected={o === ativa} onPress={() => setAtiva(o)} haptic />)}
</View>
```

Não fazer: usar como botão de ação (é filtro ou segmento); mais de 6 numa linha sem scroll
horizontal; `accessibilityState={{ selected }}` no lugar de `selected`.

## ProgressBar

Trilha de 3 px em `separator` com preenchimento em `accent` (dourado só como preenchimento,
nunca como texto). `value` de 0 a 1 (limitado), `height` (default 3), `accessibilityLabel`,
`style`. Expõe `role="progressbar"` e `aria-valuemin/max/now` em porcentagem.

```jsx
<ProgressBar value={lidos / total} accessibilityLabel="Progresso do plano" />
```

Não fazer: passar porcentagem (0 a 100) em `value`; animar a largura por fora com `Animated`
legado; usar como barra de leitura fixa no topo (isso é o `ReadingProgressBar`).

## EmptyState

Bloco centralizado com `padding: space.xl`: ícone Ionicons em `textTertiary`, `title` em
headline, `message` em subhead secundário e `action` opcional `{ label, onPress }` como
`Button secondary` de largura própria.

```jsx
<EmptyState icon="bookmark-outline" title="Nada guardado ainda" message="Toque em Guardar num artigo para vê-lo aqui." action={{ label: 'Ver artigos', onPress: irParaArtigos }} />
```

Não fazer: usar para erro de rede (mostre a mensagem de erro e um "Tentar de novo" no lugar);
texto longo em `message` (uma frase); ícone colorido (é discreto de propósito).

## GateNotice

Aviso inline para o visitante: cadeado em `tint`, `message` em subhead e dois botões, `primary`
com `primaryLabel`/`onPrimary` (entrar) e `plain` com `secondaryLabel`/`onSecondary`
(alternativa). Fundo `card`, `radius.md`, `padding: space.md`. Os textos vêm por props; as
strings `gate.*` entram noutra onda.

```jsx
<GateNotice message={t('gate.notes')} primaryLabel={t('gate.signIn')} onPrimary={abrirLogin} secondaryLabel={t('gate.later')} onSecondary={fechar} />
```

Não fazer: bloquear a tela inteira com ele (é inline, o resto continua visível); usar sem o
`secondaryLabel` quando a pessoa tem como seguir sem conta; hardcode de texto em PT.

## Sheet

Folha inferior sobre `Modal transparent`. Props: `visible`, `onClose`, `title` (headline),
`children`, `style` (no painel). Entra com mola (`motion.spring`, dampingRatio 0,85) e backdrop
`overlay` em `motion.aba` ms. Fecha por toque no backdrop (`aria-label` de `t('common.close')`),
arrasto para baixo (mais de 120 px ou mais de 800 px/s), botão voltar do Android e Escape na web. Painel em
`elevated`, cantos `radius.lg`, pegador de 36x5, `paddingBottom` com o inset inferior,
`boxShadow` do token `shadow.sheet`, `role="dialog"` e `aria-modal`. Reduce motion é respeitado
pelo reanimated (`ReduceMotion.System` é o default).

Fechamento: o componente é controlado. Todo pedido de fechar só chama `onClose`, e é o pai que
zera `visible`; o Modal continua montado até a animação de saída acabar e então some.

```jsx
const [aberto, setAberto] = useState(false);
<Sheet visible={aberto} onClose={() => setAberto(false)} title="Versículo 16">
  <Group>
    <Row icon="color-palette-outline" title="Marcar" onPress={marcar} />
    <Row icon="create-outline" title="Anotar" onPress={anotar} />
  </Group>
</Sheet>
```

Não fazer: `runOnJS` (é `scheduleOnRN` de `react-native-worklets`); tirar o
`GestureHandlerRootView` de dentro do Modal (o gesto morre no Android); pôr um `ScrollView`
longo dentro (o Pan do painel captura o arrasto; para conteúdo rolável use uma tela);
esquecer de zerar `visible` no `onClose` (a folha não fecha sozinha).

## Field

Campo rotulado de formulário, para dentro de um `Group` (que dá o card e os separadores).
`label` em footnote secundário acima do `TextInput` em body (o rótulo também vira `aria-label`),
`error` em footnote na cor `danger` abaixo, `trailing` é um nó à direita do input (um botão de
44x44, por exemplo). Senha: com `onToggleSecure` o campo desenha sozinho o botão de olho (alvo
de 44, `aria-label` de `toggleSecureLabel`, `aria-pressed` quando o texto está visível), e o
`secureTextEntry` continua controlado pela tela, para dois campos seguirem o mesmo
interruptor. `multiline` alinha o texto ao topo (Android) e `inputStyle` entra por último no
`TextInput`, para um editor trocar o papel de texto (caderno e nota escrevem em
`text('reading')`) sem perder o anel de foco. Na web o foco desenha `outlineWidth: 2` em `tint`
no próprio input, com o recuo repartido entre invólucro e input (xs + xs) para o anel caber
dentro do `overflow: 'hidden'` do `Group`. `onFocus`/`onBlur` são repassados, `style` vai no
invólucro e o resto (`placeholder`, `keyboardType`, `autoCapitalize`...) no `TextInput`. Aceita
`ref` (vai para o `TextInput`), para um campo focar o próximo no Enter.

```jsx
<Group>
  <Field label={t('auth.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" returnKeyType="next" onSubmitEditing={() => passRef.current?.focus()} />
  <Field ref={passRef} label={t('auth.password')} value={pass} onChangeText={setPass} secureTextEntry={hide} onToggleSecure={() => setHide((h) => !h)} toggleSecureLabel={t('auth.showPassword')} error={erro} />
</Group>
<Field label={t('note.text')} value={texto} onChangeText={setTexto} multiline inputStyle={text('reading')} />
```

Não fazer: usar fora de um `Group` (perde o card); botão de olho próprio no `trailing` quando
`onToggleSecure` resolve; `outlineStyle: 'none'`; esconder o `error` com opacidade (some de
verdade, o espaço não é reservado).

## ContinueRow

Linha "continuar de onde parou" para dentro de um `Group`: `icon` (default `reader-outline`),
`title` (até duas linhas), `subtitle`, chevron e `onPress`. Com `progress` numérico (0 a 1)
desenha uma `ProgressBar` de 3 px abaixo do subtítulo, com `progressLabel` como rótulo; sem
`progress` a barra não aparece, para não desenhar uma trilha vazia. `accessibilityLabel` e
`style` seguem para a `Row`. Não lê armazenamento nenhum: quem chama resolve os dados (a Início
lê `utils/lastRead.js`, a Bíblia o capítulo onde parou) e passa aqui.

```jsx
<Group header={t('home.continue')}>
  <ContinueRow title={artigo.title} subtitle={t('home.article')} progress={lidos / total} progressLabel={t('home.progress')} onPress={() => openArticle(navigation, artigo.id)} />
</Group>
```

Não fazer: passar porcentagem (0 a 100) em `progress`; usar para uma lista de itens (é uma linha
só, a de "continuar"); ler AsyncStorage dentro dela.

## LargeTitleScreen

Contêiner de tela com large title próprio (Cormorant), igual nas três plataformas, sem o large
title nativo do iOS. O título grande rola com o conteúdo; a barra do topo (`insets.top + 44`)
fica transparente e, a partir de 40 pt de rolagem, ganha o `ChromeBackdrop` e o título inline em
headline (reanimated: `useAnimatedScrollHandler` + `interpolate` com `Extrapolation.CLAMP`). A
tela é usada com o header do stack desligado (`headerShown: false`) e com
`fullBleedContentOptions()` nas `options`, porque compensa a tab bar por dentro
(`paddingBottom: useBottomTabBarHeight() + space.xl`; fora das abas o padding é zero).

Props: `title` e `subtitle` (large title e a linha abaixo dele); `back` `{ label?, onPress,
a11yLabel? }` mostra chevron + rótulo à esquerda; `right` é um nó com as ações da direita (ícones
de 44); `children` é o conteúdo rolável, dentro de um `Animated.ScrollView`; `renderList` é a
alternativa a `children` para telas com FlatList própria, recebe `{ onScroll,
scrollEventThrottle, contentContainerStyle, header }` e deve passar tudo à sua
`Animated.FlatList` (o `header` em `ListHeaderComponent`); `scrollProps` são props extras para o
`Animated.ScrollView` do caminho `children` (`keyboardShouldPersistTaps`, `refreshControl`,
`ref`...), espalhadas antes das do componente, então `onScroll`, `scrollEventThrottle` e
`contentContainerStyle` continuam os dele; `contentStyle` é o extra no `contentContainerStyle`
(recuo lateral, padding).

```jsx
<LargeTitleScreen title={t('tab.tools')} subtitle={t('tools.subtitle')} right={<Pressable role="button" aria-label={t('header.search')} onPress={buscar} style={{ minWidth: 44, minHeight: 44 }}><Ionicons name="search-outline" size={tokens.icon.md} color={colors.tint} /></Pressable>} scrollProps={{ keyboardShouldPersistTaps: 'handled' }}>
  <SectionTitle title={t('tools.practice')} />
  <Group>...</Group>
</LargeTitleScreen>

<LargeTitleScreen title={t('header.articles')} renderList={({ header, ...listProps }) => (
  <Animated.FlatList {...listProps} data={artigos} keyExtractor={(a) => String(a.id)} ListHeaderComponent={header} renderItem={renderItem} />
)} />
```

Não fazer: `headerLargeTitle` nativo por cima; passar `onScroll` ou `contentContainerStyle` em
`scrollProps` esperando que valham (use `contentStyle`); deixar o `paddingBottom` do stack ligado
(a tela compensa a tab bar sozinha, senão o recuo dobra); `SectionTitle` como título da tela.
