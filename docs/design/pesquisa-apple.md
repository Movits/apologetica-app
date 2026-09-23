# Pesquisa: convenções de UI/UX da Apple adaptadas ao APPologética

**Data:** 2026-09-23
**Fase:** 1 (Pesquisa) do projeto de elevação visual do app
**Escopo:** iOS como referência, uma linguagem só nas três plataformas (iOS, Android, web via react-native-web), com a identidade navy, dourado e creme mantida.

## Método

A pesquisa foi feita por varredura temática do Human Interface Guidelines (HIG) e da documentação de API da Apple, em oito temas: tipografia e Dynamic Type, layout e espaçamento, cor semântica e modo escuro, materiais e Liquid Glass, barras de navegação e tab bars, movimento, microinterações e haptics, e acessibilidade. Cada tema virou uma lista de afirmações ("claims") com valor, URL da fonte e citação literal. Um verificador independente abriu cada fonte e conferiu a citação, corrigindo o que estava inflado, apontando onde a fonte citada não sustentava a afirmação inteira e acrescentando regras que o pesquisador tinha deixado passar.

Números da verificação:

| Tema | Claims verificadas | Acrescentadas pelo verificador | Entraram neste documento |
|---|---|---|---|
| Tipografia e Dynamic Type | 33 | 6 | 38 |
| Layout, espaçamento e hierarquia | 30 | 7 | 35 |
| Cor semântica e modo escuro | 30 | 7 | 35 |
| Materiais, blur e Liquid Glass | 30 | 12 | 42 |
| Barras, large titles e tab bars | 30 | 6 | 34 |
| Movimento | 30 | 5 | 34 |
| Microinterações e haptics | 33 | 8 | 41 |
| Acessibilidade | 30 | 6 | 36 |
| **Total** | **246** | **57** | **295 de 303** |

O verificador não descartou nenhuma claim por estar errada. As 8 que ficaram de fora deste documento foram retiradas pelo redator, por serem de fonte fraca (fórum, blog, espelho de HIG antigo), por não se aplicarem ao app (watchOS, visionOS, SF Pro Rounded) ou por serem irrelevantes para a decisão. A lista com o motivo está na seção 13.

Duas pesquisas complementares alimentaram as seções 10 e 11: uma leitura do código instalado em `node_modules` (react-native-web 0.21.2, react-native-reanimated 4.1.7, react-native-screens 4.16.0, expo-haptics 15.0.8, expo-font 14.0.11, React Navigation 6.x) para a web e para o Android. Elas citam código-fonte e documentação das bibliotecas, não a Apple.

## Como ler

- Cada regra da Apple traz um link numerado no formato `[n](url)`. O número aponta para a lista da seção 14.
- Números que vêm da Apple estão sempre ligados à fonte. Números que são decisão do projeto vêm marcados com **(escolha nossa)**. Quando a Apple não publica um valor, o documento diz isso em vez de inventar.
- "Large" é o tamanho padrão do Dynamic Type no iOS. Todas as tabelas de tipografia usam esse tamanho, salvo indicação.
- "pt" é ponto do iOS. Na web e no React Native, 1 pt equivale a 1 unidade de layout (1 px CSS na web, 1 dp no Android).
- As decisões já tomadas na Fase 0 (tokens primeiro, chrome global depois, microinterações por último, iOS como referência, identidade mantida) não são rediscutidas aqui. O documento serve para embasar essas decisões e dar os números.

---

## 1. Resumo executivo

As regras abaixo são as que mais mudam o app, em ordem de impacto. Cada uma vem com o que ela muda hoje.

| # | Regra | O que muda no app | Fonte |
|---|---|---|---|
| 1 | Tipografia por **estilos de texto**, não por números soltos. Cada estilo é uma combinação fixa de peso, tamanho e leading que escala junta. Large Title 34/41, Title 1 28/34, Title 2 22/28, Title 3 20/25, Headline 17/22 Semibold, Body 17/22, Callout 16/21, Subhead 15/20, Footnote 13/18, Caption 1 12/16, Caption 2 11/13. | Hoje cada `makeStyles` tem tamanhos próprios. Vira uma tabela `TEXT_STYLES` com 11 entradas, composta com `fs()`. | [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json) |
| 2 | Pesos permitidos: Regular, Medium, Semibold, Bold. Nunca Ultralight, Thin ou Light. A ênfase de Body, Callout, Subhead e menores é **Semibold**, não Bold. | `fontWeight: 'bold'` aparece 158 vezes. A maior parte vira `'600'`, e Bold fica só nos títulos grandes. | [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json) |
| 3 | Tamanho padrão 17 pt, mínimo 11 pt, e o app deve permitir ampliar o texto em pelo menos 200 por cento. | O piso de 11 do `fs()` já está certo. A escala máxima (1,35) precisa subir para pelo menos 2,0. | [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json), [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json) |
| 4 | Cor por **papel semântico**: quatro níveis de texto (label, secondary, tertiary, quaternary), separador translúcido, três níveis de fundo em duas famílias (system e grouped). | A paleta de 17 chaves vira papéis. `text`, `textMuted`, `textSubtle` viram `label`, `secondaryLabel`, `tertiaryLabel`. `bg` e `card` viram a família grouped. | [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json), [40](https://developer.apple.com/tutorials/data/documentation/uikit/ui-element-colors.json) |
| 5 | Modo escuro não é inversão. Fundos ficam mais escuros, texto mais claro, e uma superfície em primeiro plano (modal, sheet) recebe fundo **mais claro** (elevated) em vez de sombra. | A paleta "noite na catedral" já segue isso. Falta um par `elevated` para modais e sheets no escuro. | [5](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/dark-mode.json), [84](https://developer.apple.com/videos/play/wwdc2019/808/) |
| 6 | Barras sem fundo sólido: tab bar e header ficam numa camada de material sobre o conteúdo, que passa por baixo. A separação vem do **scroll edge effect**, não de linha ou fundo. | Tab bar vira `position: 'absolute'` com blur (iOS e web) ou rgba (Android). Telas ganham `paddingBottom` da altura da barra. | [3](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/layout.json), [6](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json) |
| 7 | **Large title** de 34 pt Bold no topo do conteúdo, que encolhe para o título padrão ao rolar e volta ao chegar no topo. | Novo componente `LargeTitleHeader` em reanimated, usado em Início, Artigos, Ferramentas e Ajustes. | [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json), [7](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/toolbars.json) |
| 8 | Tab bar: ícones preenchidos no item ativo, rótulos de uma palavra, sempre visível, cinco abas ou menos, cor de destaque só no item selecionado. | Ionicons já tem pares `home`/`home-outline`. Falta usar o preenchido só no ativo e tirar a cor dos inativos. | [8](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/tab-bars.json) |
| 9 | Alvos de toque de **44x44 pt** (mínimo 28x28), com cerca de 12 pt de folga entre controles com borda e 24 pt sem borda. | Ícones de 22 px em headers e linhas precisam de `hitSlop` ou `minHeight: 44`. | [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json) |
| 10 | Movimento por **spring**: o padrão do sistema é um spring de 0,55 s sem bounce. Presets de 0,5 s com bounce 0 (smooth), 0,15 (snappy) e 0,30 (bouncy). A curva de easing do sistema é cubic-bezier(0.25, 0.1, 0.25, 1). | Nasce `src/theme/motion.js` com esses valores. O `withSpring` do reanimated 4 já tem o mesmo default (550 ms, dampingRatio 1). | [63](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/default.json), [64](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/smooth(duration:extrabounce:).json), [57](https://developer.apple.com/tutorials/data/documentation/quartzcore/camediatimingfunctionname/default.json) |
| 11 | Com **Reduce Motion**, trocar deslocamento por fade, apertar as molas, não animar zoom nem blur. | Toda animação passa a ler `useReducedMotion()` e a transição de tela vira fade. | [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json) |
| 12 | Todo botão e card tocável tem **estado pressionado** visível. Feedback animado é breve e preciso. Não se adiciona movimento a interações frequentes. | `TouchableOpacity` em 41 arquivos vira um `Touchable` único com `Pressable`, ripple no Android e opacidade no iOS. | [13](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/buttons.json), [11](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json) |
| 13 | Haptics em três geradores com significado fixo (notification, impact, selection), sempre opcionais e nunca sozinhos. | Helper único `haptics.js` com ajuste "Vibração" em Ajustes. Hoje só o Rosário vibra. | [12](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/playing-haptics.json) |
| 14 | Carregamento: mostrar algo o mais cedo possível (placeholder que mantém tamanho e forma), nunca tela vazia, nunca rótulo vago como "carregando". | Skeleton no lugar dos spinners de liturgia e notícias. | [17](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/loading.json), [77](https://developer.apple.com/tutorials/data/documentation/swiftui/redactionreasons/placeholder.json) |
| 15 | Listas agrupadas em **inset grouped**: seções recuadas da borda com cantos arredondados, separadores que não vão até a borda, cabeçalhos e rodapés. | Ajustes, Ferramentas e listas de referência ganham um `GroupedList` único. | [22](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/lists-and-tables.json), [33](https://developer.apple.com/tutorials/data/documentation/uikit/uitableview/style-swift.enum/insetgrouped.json) |

---

## 2. Tipografia e Dynamic Type

### 2.1 As famílias do sistema e o que a Apple faz com elas

SF Pro é a fonte do sistema no iOS e iPadOS, e apps nessas plataformas também podem usar New York (NY) [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json). New York é a serifa companheira da SF: tem seis pesos, suporta latim, grego e cirílico, e tem tamanhos ópticos variáveis que a fazem funcionar como fonte de leitura tradicional em tamanhos pequenos e como fonte display em tamanhos grandes [25](https://developer.apple.com/fonts/). SF Pro, por sua vez, tem nove pesos, quatro larguras e uma variante Rounded [25](https://developer.apple.com/fonts/).

A Apple usa New York e SF Pro Rounded nos próprios apps (Books e Reminders), e essas famílias funcionam com os text styles do sistema, não só como fontes avulsas [82](https://developer.apple.com/videos/play/wwdc2020/10175/). É o modelo que interessa ao APPologética: uma sans para interface e uma serifa para leitura, as duas obedecendo à mesma escala.

Duas regras de licença e uso mudam o que dá para fazer fora do iOS:

- Não se embute fonte do sistema no app. SF Pro e New York são acessadas pelas constantes do sistema [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json). Na web isso significa que elas não podem ser distribuídas como webfont: usa-se a pilha `-apple-system`/`system-ui`, que no Safari do Mac e do iPhone resolve para SF Pro.
- Minimizar o número de typefaces, mesmo em interface muito customizada. Misturar famílias demais esconde a hierarquia e prejudica a leitura [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json).

**Decisão do projeto (escolha nossa):** três papéis, duas famílias de sistema e uma empacotada.

| Papel | iOS | Android | Web | Observação |
|---|---|---|---|---|
| UI (sans) | SF Pro, via `fontFamily: 'System'` | Roboto (padrão) | pilha `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...` | Zero download. É o que a Apple pede. |
| Títulos e large titles | Cormorant Garamond SemiBold | idem | idem | Empacotada via expo-font, 1 peso (600), subset Latin. Uso restrito a tamanhos de 20 pt para cima. |
| Corpo de leitura (Bíblia, artigos) | Georgia (ou `ui-serif`, que vira New York no Safari) | Noto Serif via alias `serif` | `ui-serif, Georgia, "Times New Roman", serif` | Serifa do sistema, sem download. |

Por que Cormorant só a partir de 20 pt: a fronteira entre os tamanhos ópticos da SF é 20 pt, com SF Text abaixo e SF Display de 20 para cima [82](https://developer.apple.com/videos/play/wwdc2020/10175/). Cormorant é uma fonte de display com contraste alto, e o HIG avisa que fonte customizada com peso fino precisa mirar tamanhos maiores que os recomendados para compensar a legibilidade [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json). Escolher o peso SemiBold (600) em vez do Regular é a aplicação direta desse aviso.

### 2.2 A tabela completa de estilos de texto do iOS (tamanho Large)

Um text style é uma combinação fixa de peso, tamanho em pontos e leading para cada tamanho de texto. Juntos formam a hierarquia tipográfica, e escalam proporcionalmente quando a pessoa muda o tamanho do texto [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json). A variante enfatizada (trait bold) é mais um nível de hierarquia. Os pesos enfatizados possíveis são Medium, Semibold, Bold ou Heavy, e a tabela do iOS usa Bold para Large Title, Title 1 e Title 2, e Semibold para os demais [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json). A coluna "Emphasized weight" foi acrescentada à tabela em 16 de dezembro de 2025. Tamanhos e leading não mudaram.

Todos os valores da tabela abaixo vêm de [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json). O tracking vem da tabela de SF Pro da mesma página. A última coluna é escolha nossa.

| Estilo | Tamanho (pt) | Line height (pt) | Peso | Peso enfatizado | Tracking SF Pro (pt) | Uso proposto no app (escolha nossa) |
|---|---|---|---|---|---|---|
| Large Title | 34 | 41 | Regular | Bold | +0,40 | Título das quatro telas raiz (Início, Artigos, Ferramentas, Ajustes) em Cormorant SemiBold. Encolhe ao rolar. |
| Title 1 | 28 | 34 | Regular | Bold | +0,38 | Título de artigo na tela de leitura, nome do livro na Bíblia. Cormorant SemiBold. |
| Title 2 | 22 | 28 | Regular | Bold | sem valor publicado para 22 (20 = -0,45, 24 = +0,07) | Título de seção na Home ("Versículo do dia", "Últimos lidos"). Cormorant SemiBold. |
| Title 3 | 20 | 25 | Regular | Semibold | -0,45 | Título de card grande, cabeçalho de capítulo. Sans 600. |
| Headline | 17 | 22 | Semibold | Semibold | -0,43 | Título de linha de lista, nome do artigo em card pequeno. Sans 600. |
| Body | 17 | 22 | Regular | Semibold | -0,43 | Corpo de artigo e versículo (em serifa), texto de diálogo, descrição longa. |
| Callout | 16 | 21 | Regular | Semibold | sem valor publicado para 16 na tabela lida | Resumo de artigo em card, pergunta do quiz. Sans 400. |
| Subhead | 15 | 20 | Regular | Semibold | sem valor publicado para 15 na tabela lida | Subtítulo de card, texto de referência bíblica na lista. Sans 400. |
| Footnote | 13 | 18 | Regular | Semibold | sem valor publicado para 13 na tabela lida | Cabeçalho de seção de lista agrupada (caixa alta), metadados, crédito de imagem. |
| Caption 1 | 12 | 16 | Regular | Semibold | 0 | Rótulo de tab bar, legenda de ícone, data. Não escala com fs(). |
| Caption 2 | 11 | 13 | Regular | Semibold | sem valor publicado para 11 na tabela lida | Badge, contador. É o menor estilo do sistema e coincide com o mínimo de 11 pt. |

Nomes de API no UIKit: `largeTitle`, `title1`, `title2`, `title3`, `headline`, `body`, `callout`, `subheadline`, `footnote`, `caption1`, `caption2`, mais `extraLargeTitle` e `extraLargeTitle2`. `preferredFont(forTextStyle:)` devolve a fonte já escalada para o tamanho escolhido pela pessoa [26](https://developer.apple.com/tutorials/data/documentation/uikit/uifont/textstyle.json). O HIG chama o estilo de "Subhead" e a API de "subheadline". É o mesmo estilo, 15/20 no Large. No app vamos usar os nomes da API em camelCase, sem o prefixo, como chaves de `TEXT_STYLES` (escolha nossa).

### 2.3 Tamanho padrão, mínimo e pesos

- No iOS e iPadOS o tamanho de texto padrão é 17 pt e o mínimo legível é 11 pt. Vale para fontes do sistema e customizadas [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json), [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json).
- Com fontes do sistema, preferir Regular, Medium, Semibold ou Bold e evitar Ultralight, Thin e Light, que ficam difíceis de ver em texto pequeno [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json).
- Hierarquia se faz ajustando peso, tamanho e cor, mantendo a distinção relativa em todos os tamanhos [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json).

Consequência prática: no app, `fontWeight: 'bold'` (158 ocorrências) deixa de ser o jeito padrão de dar ênfase. Ênfase em Body, Callout, Subhead, Footnote e Caption vira `'600'`. `'700'` fica reservado a Large Title, Title 1 e Title 2, e mesmo aí só quando o texto usa a sans. Em Cormorant, o único peso empacotado é 600, então `'700'` não existe nessa família (escolha nossa, coerente com a regra de minimizar typefaces).

### 2.4 Tracking (letterSpacing)

O tracking da SF Pro varia por tamanho. Valores da tabela do HIG, em 1/1000 em e em pontos [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json):

| Tamanho (pt) | SF Pro (1/1000 em) | SF Pro (pt) | New York (1/1000 em) | New York (pt) |
|---|---|---|---|---|
| 12 | 0 | 0,00 | +6 | +0,07 |
| 15 | não lido | não lido | 0 | 0,00 |
| 16 | não lido | não lido | -2 | -0,03 |
| 17 | -26 | -0,43 | -4 | -0,07 |
| 20 | -23 | -0,45 | -10 | -0,20 |
| 24 | +3 | +0,07 | não lido | não lido |
| 28 | +14 | +0,38 | -12 | -0,33 |
| 34 | +12 | +0,40 | -14 | -0,45 |

Os valores da New York também vêm de [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json). O tracking da SF Pro Rounded é sempre positivo e diferente (17 pt = +0,37 pt), o que não nos afeta porque não usamos Rounded [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json).

Como isso entra no React Native: `letterSpacing` é um número em unidades de layout e não se ajusta sozinho por tamanho, então os valores acima entram por estilo na tabela `TEXT_STYLES`. Eles só fazem sentido quando a fonte renderizada é de fato a SF Pro (iOS, e Safari ou Chrome no Mac e no iPhone). No Android com Roboto e no Windows com Segoe UI o tracking negativo em 17 px pode apertar demais. Decisão (escolha nossa): aplicar o tracking da SF no iOS e na web, zerar no Android. Na serifa de leitura (Georgia, Noto Serif) usar o tracking da New York, que é mais suave, porque a intenção é imitar o papel da NY. Na Cormorant, tracking 0, porque a fonte já tem espaçamento próprio de display.

### 2.5 Leading (entrelinha)

- Usar loose leading em colunas largas e passagens longas, porque ajuda a não perder a linha, e tight leading em áreas de altura limitada, como linhas de lista. Nunca usar tight leading com três ou mais linhas [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json).
- No iOS e no macOS, tight leading reduz a altura de linha em 2 pt e loose leading aumenta em 2 pt. Body 17 pt passa de 22 para 20 ou 24 pt [82](https://developer.apple.com/videos/play/wwdc2020/10175/).

Aplicação no app (escolha nossa): corpo de artigo e versículos usam Body com loose leading, 17/24 na sans e 17/26 na serifa (a Georgia tem olho menor e pede um pouco mais de ar, valor nosso). Linhas de lista de uma linha só podem usar tight (Headline 17/20). Qualquer texto que possa quebrar em três linhas usa o leading padrão.

### 2.6 Dynamic Type

Dynamic Type tem sete tamanhos padrão (xSmall a xxxLarge, com Large como padrão) e cinco de acessibilidade (AX1 a AX5). Os valores publicados que conferimos [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json):

| Tamanho de conteúdo | Body (pt / leading) | Large Title (pt) | Multiplicador sobre Body 17 (escolha nossa, derivado) |
|---|---|---|---|
| xSmall | 14 / 19 | 31 | 0,82 |
| Large (padrão) | 17 / 22 | 34 | 1,00 |
| xxxLarge | 23 / 29 | 40 | 1,35 |
| AX1 | 28 / 34 | não lido | 1,65 |
| AX5 | 53 / 62 | 60 | 3,12 |

Os tamanhos intermediários (Small, Medium, xLarge, xxLarge, AX2 a AX4) existem na tabela da Apple, mas não foram lidos nesta rodada. Os multiplicadores da última coluna são derivados de Body e servem só para dimensionar a escala do app.

Regras de comportamento:

- Acessibilidade: dar a opção de ampliar o texto em pelo menos 200 por cento (140 no watchOS), por Dynamic Type ou por controle próprio de tamanho [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json). O app tem controle próprio (`fs()`), então a regra se aplica a ele: a escala máxima precisa chegar a 2,0 ou mais.
- Ao aumentar o texto, priorizar o conteúdo principal. Nem tudo cresce: quando a pessoa amplia o conteúdo de uma janela com abas, ela não espera que os títulos das abas cresçam [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json).
- Em tamanhos grandes o layout muda: views lado a lado passam a empilhar, linhas de lista crescem em altura e podem virar multilinha, e reduz-se o número de colunas. Minimizar truncamento e manter a hierarquia com os elementos primários no topo [3](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/layout.json).
- Não truncar texto em regiões roláveis quando a fonte aumenta, a menos que exista uma view separada para ler o resto. A meta é mostrar no maior tamanho de acessibilidade tanto texto útil quanto no maior tamanho padrão [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json).
- Ícones de interface que carregam significado devem crescer junto com o tamanho da fonte [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json). No app: `size={fs(22)}` nos Ionicons que comunicam algo, e tamanho fixo nos decorativos.
- Fontes customizadas precisam escalar com Dynamic Type e responder a Bold Text como as do sistema. No UIKit isso é `UIFontMetrics` [27](https://developer.apple.com/tutorials/data/documentation/uikit/uifontmetrics.json). No app a Cormorant passa pelo mesmo `fs()` de todo mundo.
- Regra fundamental do iOS: adaptar-se sem esforço a mudanças de aparência como orientação, Dark Mode e Dynamic Type, deixando a pessoa escolher a configuração [23](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/designing-for-ios.json).

### 2.7 Largura de leitura

Leitura longa fica em uma coluna dentro do `readableContentGuide`, uma área que pode ser lida sem forçar a pessoa a mover a cabeça. A largura da guia é igual ou menor que a largura legível definida para o tamanho de texto dinâmico atual, nunca ultrapassa as layout margins e fica centralizada nelas [28](https://developer.apple.com/tutorials/data/documentation/uikit/uiview/readablecontentguide.json). A página não publica o número. Convenção do projeto (escolha nossa): coluna de leitura com `maxWidth: 680` em Body 17, o que dá cerca de 70 caracteres na sans, e `maxWidth: 680 * min(scale, 1.4)` para a coluna crescer um pouco com o texto, como o UIKit faz.

### 2.8 Contraste de texto

O Accessibility Inspector usa o WCAG AA como régua: 4,5:1 para texto até 17 pt em qualquer peso, 3:1 a partir de 18 pt e 3:1 em qualquer tamanho quando Bold [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json). Se o app não atinge isso por padrão, precisa ao menos oferecer um esquema de maior contraste quando Increase Contrast está ligado, e o contraste tem de ser conferido no claro e no escuro [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json). A paleta atual já foi escolhida com AA em mente (`accentText` #806418 e `textSubtle` #6a6457 no claro), então o trabalho é manter isso ao criar os novos papéis.

### 2.9 Como a tabela se compõe com fs()

Hoje: `fs(n) = max(11, round(n * scale))`, com `scale` em {0,85, 1, 1,15, 1,35}. A proposta (escolha nossa) mantém a função e muda o que entra nela:

- `TEXT_STYLES[nome] = { fontSize, lineHeight, fontWeight, letterSpacing, fontFamily }` com os valores da tabela 2.2 em Large.
- `useTextStyle(nome)` devolve o objeto com `fontSize: fs(fontSize)` e `lineHeight: round(lineHeight * scale)`, mantendo a razão da tabela (22/17 = 1,29).
- `letterSpacing` não escala (a Apple define tracking por tamanho final, e o erro de manter o valor de 17 pt em 23 pt é pequeno).
- Estilos marcados `fixed: true` (Caption 1 da tab bar) ignoram a escala, seguindo a regra dos títulos de aba.
- A escala ganha os degraus 1,65 e 2,0 (nomes "muito grande" e "máximo") para cumprir os 200 por cento. Os nomes atuais ("pequeno", "normal", "grande", "enorme") continuam válidos para não quebrar o AsyncStorage.

---

## 3. Layout, espaçamento e hierarquia visual

### 3.1 As três guias: safe area, layout margins e readable content guide

A Apple estrutura o layout em três guias aninhadas.

**Safe area.** É a região da janela não coberta por hardware (Dynamic Island) nem por outras views, como toolbar, tab bar ou status bar. Respeitá-la é obrigatório para conteúdo e controles não ficarem obstruídos [3](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/layout.json). Um layout adaptável se garante respeitando safe areas, margins e guides definidos pelo sistema, e afinando a posição com modificadores de layout [3](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/layout.json).

**Layout margins.** Numa view comum, as margens padrão são 8 pt por lado. Na view raiz do view controller, as margens refletem o mínimo do sistema mais os insets da safe area [29](https://developer.apple.com/tutorials/data/documentation/uikit/uiview/layoutmargins.json). Se o app define uma margem menor que o mínimo do sistema, vale o maior dos dois. O exemplo oficial usa 20 pt como margem mínima [30](https://developer.apple.com/tutorials/data/documentation/uikit/uiviewcontroller/systemminimumlayoutmargins.json). No guia de Auto Layout, o exemplo canônico usa 8 pt entre views adjacentes e 20 pt até as bordas da superview [31](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/AutolayoutPG/AnatomyofaConstraint.html). A Apple não formaliza uma "grade de 8 pt", mas o 8 aparece como padrão de margem interna e como espaçamento canônico do Auto Layout.

Os 16 pt de margem lateral em iPhones compactos e 20 pt nos maiores não estão em documento oficial atual. Vêm de relatos de desenvolvedores, e por isso entram aqui como convenção conhecida, não como regra citável (ver seção 13).

**Readable content guide.** Largura confortável de leitura de uma coluna de texto. Nunca excede as layout margins, é centrada nelas, e sua largura é no máximo a largura legível definida para o tamanho de texto dinâmico atual [28](https://developer.apple.com/tutorials/data/documentation/uikit/uiview/readablecontentguide.json). Em tabelas, `cellLayoutMarginsFollowReadableWidth` faz as margens da célula derivarem da largura da readable content guide [32](https://developer.apple.com/tutorials/data/documentation/uikit/uitableview/rowheight.json).

Aplicação no app (escolha nossa): margem de tela 16 pt (grade de 4), gutter interno de card 16 pt, espaçamento entre elementos irmãos 8 pt, coluna de leitura de 680 pt centralizada. Os números estão na seção 12.

### 3.2 Ordem, alinhamento e agrupamento

- As pessoas começam pela ordem de leitura, de cima para baixo e do lado leading para o trailing. Os itens mais importantes ficam perto do topo e do lado leading [3](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/layout.json).
- Alinhar elementos facilita a leitura, e indentação expressa subordinação: itens alinhados são percebidos como relacionados, itens indentados como subordinados ao anterior [3](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/layout.json).
- Agrupar itens relacionados. Espaço negativo, formas de container ou linhas separadoras mostram o que é relacionado e o que não é [3](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/layout.json). A fonte lista os três meios como exemplos equivalentes, sem ordem de preferência.
- Usar revelação progressiva (disclosure, menus, views aninhadas ou seções roláveis) para reduzir o que aparece de início [3](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/layout.json). Para um app de leitura como o nosso, isso significa cards colapsados na Home e a Bíblia mostrando livro, depois capítulo, depois versículos, como já faz.
- Decidir o layout por size class, não por tipo de dispositivo ou orientação. Ao mudar de size class, manter a funcionalidade igual e só ajustar quanto dela fica visível. Em espaços maiores, trocar a tab bar por sidebar ou expor itens que ficariam num menu de overflow [3](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/layout.json).
- Ergonomia: é mais fácil e confortável alcançar controles no meio ou na parte inferior da tela, por isso é importante deixar a pessoa deslizar para voltar ou iniciar ações numa linha de lista [23](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/designing-for-ios.json).

### 3.3 Hierarquia sem decoração (iOS 26)

- No iOS 26, a hierarquia deve vir do layout e do agrupamento, não de decoração. Scroll edge effects substituem divisórias rígidas por um blur sutil [85](https://developer.apple.com/videos/play/wwdc2025/356/).
- Em vez de fundo sólido ou semiopaco sob controles, usar o scroll edge effect para elevar visualmente os controles acima do conteúdo, e estender o conteúdo de fundo por baixo de sidebars, toolbars e tab bars [3](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/layout.json).
- Scroll edge effects não são decorativos: não bloqueiam nem escurecem como overlays, só esclarecem onde a UI encontra o conteúdo, e não devem ser usados onde não há elementos flutuantes [85](https://developer.apple.com/videos/play/wwdc2025/356/).
- Se uma imagem de fundo em tela cheia ficaria coberta por sidebar ou inspector, o background extension effect espelha e desfoca a imagem sob os componentes adjacentes em vez de recortar [3](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/layout.json).
- Hierarquia tipográfica: ajustar peso, tamanho e cor para enfatizar, manter a hierarquia relativa quando o texto muda de tamanho e minimizar o número de typefaces [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json).
- Evitar pesos leves (Regular a Bold) e tight leading com três ou mais linhas, como já dito na seção 2 [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json).

O que isso muda no app: os `cardBorder` de 1 px e os `divider` sólidos deixam de ser o jeito principal de separar. Separação vem de fundo (card sobre grouped background), de espaço (12 e 16 pt) e, nas barras, do scroll edge effect. Bordas ficam para o modo escuro, onde a Apple mesma usa fundo mais claro em vez de sombra (seção 4).

### 3.4 Alvos de toque e espaçamento entre controles

| Regra | Valor | Fonte |
|---|---|---|
| Tamanho de controle no iOS e iPadOS | 44x44 pt padrão, 28x28 pt mínimo | [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json) |
| Tamanho de controle no macOS (relevante para a web em desktop) | 28x28 pt padrão, 20x20 pt mínimo | [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json) |
| Folga ao redor de elementos com bezel (borda ou fundo visível) | cerca de 12 pt | [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json) |
| Folga ao redor de elementos sem bezel (ícone solto) | cerca de 24 pt | [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json) |
| Área de toque de um botão | pelo menos 44x44 pt (60x60 no visionOS), com espaço ao redor para se distinguir do conteúdo | [13](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/buttons.json) |
| Botões proeminentes (com fundo colorido) por tela | um ou dois | [13](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/buttons.json) |

Botão customizado sempre tem estado pressionado [13](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/buttons.json). No app, o glifo de 22 a 25 pt fica, e a área de toque sobe para 44 com `minHeight`, `minWidth` ou `hitSlop`. A regra de um ou dois botões proeminentes por tela é a que mais pesa na Home, onde hoje vários cards competem com fundo navy.

### 3.5 Listas e tabelas

- O estilo grouped no iOS separa grupos de dados com cabeçalhos, rodapés e espaço adicional entre seções [22](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/lists-and-tables.json).
- Inset grouped: as seções são recuadas em relação às bordas e têm cantos arredondados [33](https://developer.apple.com/tutorials/data/documentation/uikit/uitableview/style-swift.enum/insetgrouped.json). É o card de lista dos Ajustes do iOS.
- A altura de linha padrão é `automaticDimension`: a tabela escolhe a altura pelo conteúdo da célula. Preferir a propriedade `rowHeight` ao método delegate, porque o delegate roda para todas as linhas, inclusive fora da tela, e prejudica a performance em tabelas de mais de mil linhas [32](https://developer.apple.com/tutorials/data/documentation/uikit/uitableview/rowheight.json). O paralelo no React Native é `getItemLayout` fixo só quando a altura é conhecida, e altura automática no resto.
- Separadores de linha não vão até a borda: têm inset padrão alinhado ao conteúdo, espelhado em RTL [34](https://developer.apple.com/tutorials/data/documentation/uikit/uitableview/separatorinset.json).
- Espaçamento entre seções é semântico (compact, default ou custom em pt) [35](https://developer.apple.com/tutorials/data/documentation/swiftui/listsectionspacing.json). A altura de linha é limitada por baixo por um mínimo padrão do sistema e, acima disso, determinada pelo conteúdo e pelos insets [36](https://developer.apple.com/tutorials/data/documentation/swiftui/environmentvalues/defaultminlistrowheight.json). Nenhum dos dois publica o número.
- Com Dynamic Type, views lado a lado podem precisar empilhar e linhas de lista crescem em altura para o texto não cortar [3](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/layout.json).

Os 44 pt aparecem hoje na documentação da Apple só como tamanho de controle, não como altura de linha documentada. Usar 44 como `minHeight` de linha de lista é escolha nossa, coerente com o alvo de toque.

### 3.6 Cantos: curva contínua, cápsula e concentricidade

- SwiftUI oferece dois estilos de canto: `circular` (quarto de círculo) e `continuous` (curvatura contínua) [37](https://developer.apple.com/tutorials/data/documentation/swiftui/roundedcornerstyle/continuous.json). No UIKit, o raio de canto de `UIButton.Configuration` é aplicado com curva contínua [39](https://developer.apple.com/tutorials/data/documentation/uikit/uibutton/configuration-swift.struct/cornerstyle-swift.enum.json).
- Raios de botão são semânticos: small, medium, large (definidos pelo sistema), capsule, ou dynamic (ajusta ao Dynamic Type) [39](https://developer.apple.com/tutorials/data/documentation/uikit/uibutton/configuration-swift.struct/cornerstyle-swift.enum.json). A Apple não publica os números.
- O iOS 26 usa três tipos de forma: fixa (raio constante), cápsula (raio igual à metade da altura) e concêntrica (raio do container pai menos o padding). Cápsulas aparecem em barras, botões e nos cantos das listas agrupadas [85](https://developer.apple.com/videos/play/wwdc2025/356/).
- Cantos aninhados devem ser concêntricos: o canto interno compartilha o centro do raio com o canto do container [38](https://developer.apple.com/tutorials/data/documentation/swiftui/concentricrectangle.json). Isso evita cantos internos "apertados" ou "abertos" em cards com imagem.
- Componentes customizados dentro de uma toolbar devem ter raio concêntrico com os cantos da barra [7](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/toolbars.json).

No React Native não existe curva contínua: `borderRadius` é sempre circular nas três plataformas. A regra que dá para seguir é a de concentricidade (raio da imagem dentro do card = raio do card menos o padding) e a de poucos raios semânticos. A seção 12 mapeia os 20 valores literais de `borderRadius` encontrados hoje em `src/` para quatro tokens.

---

## 4. Cor semântica, hierarquia de texto e modo escuro

### 4.1 Cor por papel, não por valor

Cada cor dinâmica do sistema é definida pelo papel semântico, não pela aparência ou pelo valor RGB. Algumas representam fundos em níveis de hierarquia, outras conteúdo de frente [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json). Não se deve redefinir o significado: o exemplo do HIG é não usar a cor de separador como texto nem `secondaryLabel` como fundo. E não se deve hard-codar valores do sistema, porque eles podem mudar de versão para versão [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json).

**Texto em quatro níveis.** `label` (conteúdo primário), `secondaryLabel`, `tertiaryLabel`, `quaternaryLabel`, mais `placeholderText` [40](https://developer.apple.com/tutorials/data/documentation/uikit/ui-element-colors.json). O primário serve a títulos e o secundário a subtítulos [83](https://developer.apple.com/videos/play/wwdc2019/214/). O label tem o maior contraste com o fundo e avança para o primeiro plano. O terciário serve a placeholder e o quaternário a texto desabilitado [84](https://developer.apple.com/videos/play/wwdc2019/808/).

**Separadores.** `separator` é parcialmente transparente para deixar o conteúdo aparecer, e `opaqueSeparator` é sempre opaco. Ambos se adaptam ao ambiente [41](https://developer.apple.com/tutorials/data/documentation/uikit/uicolor/separator.json).

**Fundos em duas famílias e três níveis.** Usar as cores grouped quando a tela é uma tabela agrupada, e a família system nos outros casos [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json). Primário para a view inteira, secundário para agrupar conteúdo dentro dela, terciário para agrupar dentro de elementos secundários [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json). O `systemBackground` é branco puro no claro e preto puro no escuro [83](https://developer.apple.com/videos/play/wwdc2019/214/). `systemGroupedBackground` serve a conteúdo agrupado, incluindo table views e designs com platter [42](https://developer.apple.com/tutorials/data/documentation/uikit/uicolor/systemgroupedbackground.json).

Mapeamento para o app (escolha nossa). O APPologética é quase todo listas e cards sobre um fundo creme, ou seja, a família grouped. Os papéis:

| Papel Apple | Chave atual | Claro (escolha nossa) | Escuro (escolha nossa) | Observação |
|---|---|---|---|---|
| systemGroupedBackground | `bg` | #f5f0e8 (creme) | #0d1722 | Fundo de tela. A Apple usa cinza claro e preto, nós mantemos a identidade. |
| secondarySystemGroupedBackground | `card` | #ffffff | #172538 | Card e linha de lista agrupada. |
| tertiarySystemGroupedBackground | `badgeBg`, `inputBg` | #eef2f7 | #243248 | Agrupamento dentro de card (badge, input). |
| elevated (só no escuro) | não existe | igual ao claro | #1e2f47 | Modal, sheet e menu no escuro. Ver 4.3. |
| label | `text` | #222222 | #ece8d8 | |
| secondaryLabel | `textSubtle` | #6a6457 | #938d7e | Já tem AA sobre creme e navy. |
| tertiaryLabel | `textMuted` | #6a6457 a 60 por cento de alfa (a conferir) | #938d7e a 60 por cento (a conferir) | Placeholder e metadados. Contraste precisa ser medido antes de virar token. |
| separator | `divider`, `cardBorder` | rgba(26,58,92,0.16) | rgba(236,232,216,0.14) | Translúcido, como o `separator` do sistema. |
| tint (acento) | `accent` | #c9a84c | #d4b86a | Ícones e preenchimentos. |
| tint em texto | `accentText` | #806418 | #d4b86a | Dourado escurecido para passar AA sobre creme e branco. |
| navy como acento e base | `primary` | #1a3a5c | #142844 | Hero, header, base do dark. |

`primary` e `primaryText` continuam como aliases enquanto as telas migram, para não quebrar 40 `makeStyles` de uma vez.

### 4.2 Contraste e uso de cor

- Contraste mínimo entre cores é 4,5:1. Para cores customizadas de texto e fundo, buscar 7:1, sobretudo em texto pequeno [5](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/dark-mode.json).
- Tabela do Accessibility Inspector: até 17 pt em qualquer peso 4,5:1, a partir de 18 pt 3:1, qualquer tamanho em negrito 3:1. Checar nos dois modos [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json).
- Toda cor customizada precisa de variante clara, escura e uma opção de contraste aumentado com diferenciação visual significativamente maior [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json). Mesmo que o app tenha um único modo de aparência, deve fornecer cores claras e escuras, porque o Liquid Glass adapta a aparência ao contexto [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json).
- Não usar a mesma cor com significados diferentes: se a cor de marca indica que um botão sem borda é interativo, usá-la em texto não interativo confunde [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json). No app: o dourado hoje aparece em ícones decorativos, em títulos do escuro (`primaryText` #e6c878) e em botões. Precisa escolher: dourado para interativo e ênfase, navy para estrutura.
- Nunca usar cor como único meio de diferenciar objetos, indicar interatividade ou comunicar estado. Acompanhar com rótulo de texto ou forma de glifo [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json).
- Cores de tint do sistema ficam mais claras no escuro e mais escuras no claro, com variantes de alto contraste. Ao escolher um tint próprio, usar duas cores levemente diferentes por modo e mirar 4,5:1 ou mais [84](https://developer.apple.com/videos/play/wwdc2019/808/). O app já faz isso com #c9a84c e #d4b86a.
- Cor com parcimônia (iOS 26): reservar para o que precisa de ênfase, como indicadores de status e ações primárias. Para a ação primária, colorir o fundo do botão, e não colorir o fundo de vários controles ao mesmo tempo [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json).
- Em apps com conteúdo ou fundos coloridos, preferir barras monocromáticas ou uma cor de acento com diferenciação suficiente. Em apps com conteúdo majoritariamente monocromático, a cor de marca como acento pode ser um jeito eficaz de refletir a identidade [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json). O APPologética tem conteúdo neutro (texto sobre creme), então o dourado como acento cabe.
- Em toolbars e tab bars sobre Liquid Glass, símbolos e texto seguem por padrão esquema monocromático, escurecendo sobre conteúdo claro e clareando sobre escuro. Podem ter cor, por exemplo no item selecionado da tab bar [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json).
- Embora conteúdo colorido possa rolar sob os controles, o estado de repouso (topo da tela rolável) deve manter legibilidade clara [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json).
- Por padrão o Liquid Glass não tem cor própria: absorve a cor do conteúdo atrás dele, e fica mais opaco em elementos grandes como sidebars [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json).

### 4.3 Modo escuro

- A paleta do escuro tem fundos mais escuros e foregrounds mais claros, mas não é a inversão da paleta clara [5](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/dark-mode.json). Ajuda pensar nas luzes "apagadas" em vez de tudo invertido. Na paleta do iOS 13 em diante, todos os fills e um dos separadores são semitransparentes [84](https://developer.apple.com/videos/play/wwdc2019/808/).
- No escuro há dois conjuntos de fundo, base e elevated. Base é mais escuro (a superfície recua), elevated é mais claro (a superfície avança). O sistema troca de base para elevated quando a interface vai para o primeiro plano: popover, sheet modal, multitarefa [5](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/dark-mode.json). Só o fundo clareia. As cores de frente não mudam [83](https://developer.apple.com/videos/play/wwdc2019/214/).
- Entre interfaces claras, uma sombra difusa basta para separar camadas. No escuro, sombras funcionam pior, e a separação vem do fundo mais claro [84](https://developer.apple.com/videos/play/wwdc2019/808/). As linhas e cards das tabelas são mais claros que o fundo nos dois modos [84](https://developer.apple.com/videos/play/wwdc2019/808/).
- Suavizar imagens com fundo branco no escuro, escurecendo um pouco a imagem para o fundo não "brilhar" [5](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/dark-mode.json). No app: `opacity: 0.9` nas ilustrações de artigo no escuro (escolha nossa).
- Testar o escuro com Increase Contrast e Reduce Transparency ligados, separados e juntos, porque texto escuro sobre fundo escuro pode perder legibilidade [5](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/dark-mode.json).
- Evitar um seletor de aparência específico do app: as pessoas esperam que o app siga o ajuste do sistema, que pode mudar com o app aberto [5](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/dark-mode.json).

Sobre a última regra, decisão do projeto (escolha nossa): o `darkMode` persistido ganha um terceiro valor, "sistema", que vira o padrão e segue `useColorScheme()`. Claro e Escuro continuam como override, porque o app roda também no Android e na web, onde a opção é esperada, e porque a landing web já grava `appg_theme`.

### 4.4 Valores publicados do sistema (referência, não para copiar)

A Apple publica os valores das cores de sistema no HIG, com o aviso de que são referência de design e podem mudar [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json). Servem para calibrar o nosso par claro e escuro e para o caso de precisarmos de vermelho, verde ou azul de sistema (erro, sucesso, link).

| Cor | Claro | Escuro | Alto contraste claro | Alto contraste escuro |
|---|---|---|---|---|
| systemBlue | 0, 136, 255 (#0088FF) | 0, 145, 255 (#0091FF) | 30, 110, 244 (#1E6EF4) | 92, 184, 255 (#5CB8FF) |
| systemRed | 255, 56, 60 (#FF383C) | 255, 66, 69 (#FF4245) | 233, 21, 45 | 255, 97, 101 |
| systemGreen | 52, 199, 89 (#34C759) | 48, 209, 88 (#30D158) | 0, 137, 50 | 74, 217, 104 |
| systemOrange | 255, 141, 40 (#FF8D28) | 255, 146, 48 (#FF9230) | 197, 83, 0 | 255, 160, 86 |

Escala de cinzas UIKit [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json):

| Cinza | Claro | Escuro | Alto contraste claro | Alto contraste escuro |
|---|---|---|---|---|
| systemGray | 142, 142, 147 (#8E8E93) | 142, 142, 147 | 108, 108, 112 (#6C6C70) | 174, 174, 178 |
| systemGray2 | 174, 174, 178 (#AEAEB2) | 99, 99, 102 (#636366) | 142, 142, 147 | 124, 124, 128 |
| systemGray3 | 199, 199, 204 (#C7C7CC) | 72, 72, 74 (#48484A) | 174, 174, 178 | 84, 84, 86 |
| systemGray4 | 209, 209, 214 (#D1D1D6) | 58, 58, 60 (#3A3A3C) | 188, 188, 192 | 68, 68, 70 |
| systemGray5 | 229, 229, 234 (#E5E5EA) | 44, 44, 46 (#2C2C2E) | 216, 216, 220 | 54, 54, 56 |
| systemGray6 | 242, 242, 247 (#F2F2F7) | 28, 28, 30 (#1C1C1E) | 235, 235, 240 (#EBEBF0) | 36, 36, 38 (#242426) |

A fonte não associa `systemGray6` a fundo agrupado nem a superfície elevada. Os valores de `secondaryLabel` e demais níveis (as opacidades 0,60, 0,30 e 0,18 que circulam) não estão publicados na web da Apple, só nos Apple Design Resources, e ficam como pergunta aberta na seção 13.

### 4.5 Cor sobre materiais

Sobre qualquer material, usar cores vibrantes do sistema em vez de sólidas. Labels vibrantes vêm em quatro níveis, fills em três e separator em um. O nível default tem o maior contraste e o quaternário o menor [6](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json). Evitar o quaternário sobre os materiais thin e ultraThin, porque o contraste fica baixo demais [6](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json). O React Native não tem vibrancy. O que dá para fazer é usar `label` e `secondaryLabel` sobre as barras com blur e nunca o terciário (escolha nossa, derivada da regra).

---

## 5. Materiais, blur e Liquid Glass

### 5.1 Duas camadas, dois tipos de material

As plataformas Apple têm dois tipos de material: Liquid Glass e os materiais padrão [6](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json). O Liquid Glass forma uma camada funcional distinta para controles e navegação (tab bars, sidebars), que flutua acima da camada de conteúdo e deixa o conteúdo rolar e aparecer por baixo mantendo legibilidade [6](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json). Os materiais padrão (ultra-thin, thin, regular e thick) continuam existindo para criar distinção visual dentro da camada de conteúdo [6](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json).

Regras de uso do Liquid Glass:

- Não usar na camada de conteúdo (fundos, cards, listas). Ali entram os materiais padrão. A exceção são sliders e toggles, que viram vidro só enquanto a pessoa os manipula [6](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json).
- Usar com parcimônia em controles customizados, limitando aos elementos funcionais mais importantes [6](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json).
- Nunca empilhar vidro sobre vidro. Elementos sobre uma superfície de vidro usam preenchimentos, transparência e vibrancy [86](https://developer.apple.com/videos/play/wwdc2025/219/).
- Barras, sheets, popovers e controles dos frameworks do sistema adotam Liquid Glass sozinhos. Reduzir fundos e aparências customizadas em controles e navegação, e remover visual effect views customizadas do content view de sheets e popovers, porque interferem no vidro e no scroll edge effect [45](https://developer.apple.com/tutorials/data/documentation/technologyoverviews/adopting-liquid-glass.json).

Variantes:

- **Regular** (padrão): borra e ajusta a luminosidade do fundo para manter a legibilidade de texto e elementos de frente. Usada pela maioria dos componentes e para elementos com muito texto [6](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json).
- **Clear**: altamente translúcida, sem comportamento adaptativo. Só sobre fundos visualmente ricos (fotos, vídeo). Se o conteúdo por baixo for claro, considerar uma camada escura de dimming com 35 por cento de opacidade. Se o conteúdo já for escuro ou usar os controles do AVKit, não é preciso [6](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json). Três condições para usar clear: estar sobre mídia rica, o conteúdo tolerar dimming, e o que fica por cima ser bold e brilhante [86](https://developer.apple.com/videos/play/wwdc2025/219/). Regular e clear nunca se misturam na mesma interface [86](https://developer.apple.com/videos/play/wwdc2025/219/).
- A aparência das variantes muda com ajustes do sistema, como o look preferido de Liquid Glass escolhido pela pessoa e as opções de acessibilidade [6](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json).

Comportamento do vidro (útil para entender o que imitar e o que não):

- Elementos pequenos (navbar, tab bar) e seus símbolos alternam entre claro e escuro conforme o fundo que passa. Elementos grandes (menus, sidebars) adaptam mas não alternam, e as sombras aumentam quando texto rola por baixo [86](https://developer.apple.com/videos/play/wwdc2025/219/).
- A sombra de um elemento de vidro aumenta de opacidade sobre texto e diminui sobre fundo claro e sólido [86](https://developer.apple.com/videos/play/wwdc2025/219/).
- Ao crescer (menu saindo de um botão), o vidro simula material mais espesso: sombras mais profundas, mais lensing e refração, dispersão de luz mais suave [86](https://developer.apple.com/videos/play/wwdc2025/219/).
- Elementos de vidro com footprint pequeno podem usar dimming localizado, só atrás do elemento, preservando a vibrância do fundo [86](https://developer.apple.com/videos/play/wwdc2025/219/).
- Em elementos grandes como sidebars, o vidro fica mais opaco para preservar legibilidade sobre fundos complexos [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json).
- Sheets no iOS 26 têm raio de canto maior. Half sheets ficam recuadas da borda para o conteúdo aparecer por baixo e, ao expandir para altura total, ficam mais opacas [45](https://developer.apple.com/tutorials/data/documentation/technologyoverviews/adopting-liquid-glass.json).

### 5.2 Os materiais padrão

- Quatro materiais, em ordem crescente de opacidade: ultra-thin, thin, regular (padrão) e thick [6](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json). A API acrescenta `systemChromeMaterial`, que reproduz a aparência das barras do sistema, e versões fixas Light e Dark de cada um [43](https://developer.apple.com/tutorials/data/documentation/uikit/uiblureffect/style.json).
- Material mais espesso dá mais contraste para texto e detalhes finos. Mais fino preserva o contexto do que está atrás [6](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json).
- Escolher material pelo significado e uso recomendado, nunca pela cor aparente, porque ajustes do sistema mudam a aparência [6](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json).
- O blur de um material não é opacidade simples: é um blending específico da plataforma que lembra vidro fosco pesado, varia com a espessura e com o modo, e só borra o fundo do próprio app [44](https://developer.apple.com/tutorials/data/documentation/swiftui/material.json). Elementos sobre um material ganham vibrancy automaticamente, e definir uma cor de frente customizada desliga a vibrancy [44](https://developer.apple.com/tutorials/data/documentation/swiftui/material.json).
- Uma `UIVisualEffectView` não pode ter alpha menor que 1, nem ela nem nenhuma superview, senão o efeito fica incorreto ou some. Máscaras vão na própria visual effect view ou no contentView. Máscara numa superview faz o efeito falhar e lança exceção [48](https://developer.apple.com/tutorials/data/documentation/uikit/uivisualeffectview.json).

A Apple não publica raio de blur, saturação nem opacidade de cada material. Só o 35 por cento da camada de dimming do clear tem número. Os valores que usamos em `expo-blur` e em `backdrop-filter` são calibração nossa (seção 12).

### 5.3 Barras sobre o conteúdo e scroll edge effect

- Fundo de tela cheia deve se estender por baixo de sidebars, toolbars e tab bars [3](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/layout.json).
- Para separar controles de conteúdo, não colocar fundo sólido ou semiopaco por baixo dos controles. Usar o scroll edge effect [3](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/layout.json).
- O scroll edge effect tem os estilos automatic (padrão, o sistema escolhe), hard (limite linear quase opaco) e soft (transição sutil e borrada) [46](https://developer.apple.com/tutorials/data/documentation/swiftui/scrolledgeeffectstyle.json). Preferir automatic, que dá separação mais opaca para toolbars com muitos controles, texto fora de controles de vidro e cabeçalhos fixos. Quem usar soft deve testar a legibilidade em vários contextos [10](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/scroll-views.json).
- Scroll edge effects não são decorativos: não bloqueiam nem escurecem como overlays, existem para manter os controles distintos, e é um por view. Em split view, um por painel, com alturas consistentes [10](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/scroll-views.json).
- Conforme o conteúdo entra sob o vidro, o efeito o dissolve gradualmente no fundo. Quando conteúdo escuro passa e o vidro muda para o estilo escuro, o efeito troca para um leve dimming [86](https://developer.apple.com/videos/play/wwdc2025/219/).
- A tab bar do iOS 26 flutua sobre o conteúdo na base da tela, com os itens sobre um fundo que deixa o conteúdo aparecer [8](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/tab-bars.json). Ela pode ser configurada para minimizar quando a pessoa rola, e expande ao rolar na direção oposta [45](https://developer.apple.com/tutorials/data/documentation/technologyoverviews/adopting-liquid-glass.json).
- Background extension effect: para fundos que ficariam cobertos por sidebar ou inspector, o sistema espelha e borra a imagem adjacente sob o componente [45](https://developer.apple.com/tutorials/data/documentation/technologyoverviews/adopting-liquid-glass.json).

### 5.4 Acessibilidade dos materiais

- Com Reduce Transparency ligado, fundos de UI (principalmente de janelas) não devem ser semitransparentes, e sim opacos [47](https://developer.apple.com/tutorials/data/documentation/swiftui/environmentvalues/accessibilityreducetransparency.json). O Liquid Glass fica mais fosco. Increase Contrast torna os elementos predominantemente preto ou branco com borda contrastante. Reduce Motion reduz efeitos e desliga a elasticidade [86](https://developer.apple.com/videos/play/wwdc2025/219/).
- Com Reduce Motion, evitar animar entrando e saindo de blurs [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json).
- Testar no escuro com Increase Contrast e Reduce Transparency ligados, separados e juntos [5](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/dark-mode.json).

### 5.5 O que adotar e o que não faz sentido em React Native

| Elemento Apple | Adotar no app? | Como | Por quê |
|---|---|---|---|
| Tab bar e header sobre material translúcido, conteúdo passando por baixo | Sim | `expo-blur` no iOS (tint claro ou escuro, intensidade calibrada), `backdrop-filter` na web, rgba a 0,94 no Android | É a regra central das seções 5.3 e 6. A tab bar é o único vidro do app. |
| Scroll edge effect | Sim, versão simplificada | Borda inferior hairline com opacidade interpolada de `scrollY` (0 no topo, 1 após 8 pt), sobre a barra com blur | Reproduz o `scrollEdgeAppearance` transparente no topo. Não dá para fazer o fade progressivo do conteúdo. |
| Materiais padrão dentro do conteúdo (cards de vidro) | Não | Cards com fundo sólido `card` | A Apple mesma proíbe vidro na camada de conteúdo. Blur em card custa GPU e não é o padrão. |
| Variante clear com dimming de 35 por cento | Só num lugar | Fundo do `ImageZoomModal` (blur sobre a imagem, com camada escura) | É o único caso de controle sobre mídia rica. |
| Lensing, refração, morph do vidro ao crescer | Não | nada | Não existe em RN nem em CSS. Imitar mal é pior que não imitar. |
| Alternância claro e escuro do vidro conforme o conteúdo que passa | Não | Tint fixo por modo | Exigiria amostrar o conteúdo. O tint segue o modo do tema. |
| Vibrancy nos textos sobre a barra | Parcial | `label` e `secondaryLabel`, nunca terciário, sobre a barra | RN não tem vibrancy. |
| Minimizar tab bar ao rolar | Não | Barra fixa | Não existe no bottom-tabs 6.x, e no Android a convenção é barra fixa. |
| Reduce Transparency com fundo opaco | Sim | Ajuste próprio "Reduzir transparência" no app, mais leitura de `prefers-reduced-transparency` na web e `isReduceTransparencyEnabled` no iOS | A flag do sistema é iOS-only, e o Safari não expõe a media query. |
| Alpha 1 em todas as superviews da BlurView | Sim, como regra de código | Nunca animar `opacity` num pai da barra | A mesma restrição existe no `backdrop-filter` da web. |

---

## 6. Barras de navegação, large titles e tab bars

No HIG atual a página "Navigation bars" foi fundida em "Toolbars" (junho de 2025). A barra de navegação é um toolbar com título, controles de navegação e ações. Tudo abaixo vem dessa página, das páginas de tab bar e de busca, e das sessões da WWDC 2025.

### 6.1 Large title

- O large title usa o estilo Large Title: 34 pt, leading 41 pt, Bold na versão enfatizada [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json).
- Por padrão, o large title vira título padrão assim que a pessoa começa a rolar e volta a ser grande quando ela rola até o topo, lembrando onde está [7](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/toolbars.json).
- No iOS 26, o large title fica no topo da scroll view de conteúdo e rola junto com o conteúdo por baixo da barra [87](https://developer.apple.com/videos/play/wwdc2025/284/).
- `largeTitleDisplayMode`: o padrão é `automatic`, que herda o estilo (grande ou pequeno) do item anterior. `always` força grande, `never` força pequeno [49](https://developer.apple.com/tutorials/data/documentation/uikit/uinavigationitem/largetitledisplaymode-swift.enum/automatic.json). O modo `inline` usa large title quando o item é o topo da pilha, volta a `always` se houver botão voltar e move itens leading e centrais para o menu de overflow. Está disponível desde o iOS 17 [50](https://developer.apple.com/tutorials/data/documentation/uikit/uinavigationitem/largetitledisplaymode-swift.enum.json).
- A altura clássica da navigation bar no iPhone era 44 pt (64 com a status bar de 20 pt da época), num documento arquivado do iOS 7 [51](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/TransitionGuide/Bars.html). O HIG atual não publica mais alturas. Os 96 pt da barra com large title só aparecem em blog de terceiros e ficam fora (seção 13).

Aplicação (escolha nossa): o app usa `headerShown: false` em todo lugar e desenha o próprio cabeçalho, então o comportamento é nosso. `LargeTitleHeader` em reanimated: título grande de 34/41 em Cormorant SemiBold como primeiro item da lista, barra compacta de 44 pt mais o inset do topo, posicionada absoluta, cujo título pequeno (17/600 na sans) e borda inferior aparecem por interpolação de `scrollY` entre 0 e 40 pt. Modo `automatic`: telas raiz com large title, telas secundárias com título compacto e chevron.

### 6.2 Botão voltar e títulos

- Usar o botão voltar padrão com o símbolo (chevron) do sistema, sem rótulo "Back" ou "Close". Uma versão customizada precisa ter a mesma aparência e comportamento [7](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/toolbars.json).
- O botão voltar mostra o título da tela anterior, um título genérico ou nenhum, conforme o espaço (`default`). `generic` nunca usa o título específico e `minimal` mostra só o indicador [55](https://developer.apple.com/tutorials/data/documentation/uikit/uinavigationitem/backbuttondisplaymode-swift.enum.json).
- Títulos de tela devem ser uma palavra ou frase curta, com menos de 15 caracteres, e nunca o nome do app [7](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/toolbars.json).

Auditoria rápida dos títulos atuais contra o limite de 15 caracteres: "Início" (6), "Artigos" (7), "Bíblia" (6), "Ferramentas" (11), "Ajustes" (7), "Glossário" (9), "Rosário" (7) passam. "Plano de leitura" (16), "Exame de consciência" (20) e "Estratégias de debate" (21) não passam e precisam de título curto na barra compacta, mantendo o nome completo no large title, que tem mais espaço (escolha nossa).

### 6.3 Ações e agrupamento na barra

- Itens do toolbar se agrupam em leading, centro e trailing, com no máximo três grupos. Só uma ação primária (Done, Submit) em estilo prominent, tintada e separada, na ponta trailing [7](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/toolbars.json).
- Preferir símbolos do sistema sem borda (sem círculo contornado), porque a seção da barra já é o container visível [7](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/toolbars.json).
- Ações com rótulo de texto ficam separadas (espaço fixo) de ações com símbolo, para não parecerem uma única ação [7](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/toolbars.json).
- Componentes customizados dentro da toolbar têm raio de canto concêntrico com os cantos da barra [7](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/toolbars.json).
- No iOS 26, fundos ou escurecimentos extras atrás dos itens da barra devem ser removidos, porque interferem no scroll edge effect. Ícones podem receber tint, mas para transmitir significado (call to action, próximo passo), não por efeito [88](https://developer.apple.com/videos/play/wwdc2025/323/).
- No UIKit, quando a borda do conteúdo rolável encosta no topo da barra, aplica-se `scrollEdgeAppearance`, que por padrão é a aparência standard com fundo transparente. Desde o iOS 15 isso vale para todas as navigation bars [54](https://developer.apple.com/tutorials/data/documentation/uikit/uinavigationbar/scrolledgeappearance.json).

### 6.4 Tab bar

| Regra | Fonte |
|---|---|
| A tab bar serve para navegar entre seções, não para oferecer ações. Controles que agem sobre a view atual vão numa toolbar. | [8](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/tab-bars.json) |
| Quanto menos abas, mais fácil navegar. Se a tab bar for customizável, a lista padrão deve ter cinco ou menos. | [8](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/tab-bars.json) |
| Evitar overflow: quando não cabem, a última vira uma aba More, que esconde conteúdo. | [8](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/tab-bars.json) |
| Cada aba tem rótulo abaixo ou ao lado do ícone, de preferência uma única palavra. | [8](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/tab-bars.json) |
| Preferir símbolos preenchidos (filled). Em views compactas o ícone fica acima do rótulo, em regulares lado a lado. | [8](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/tab-bars.json) |
| A tab bar permanece visível ao navegar dentro das seções. A única exceção é uma modal que a cobre. Nunca desabilitar ou esconder botões de aba. | [8](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/tab-bars.json) |
| Badges (oval vermelho com número) ficam reservados a informação crítica. | [8](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/tab-bars.json) |
| Flutua sobre o conteúdo na base, sobre Liquid Glass que deixa o conteúdo aparecer. | [8](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/tab-bars.json) |
| Pode ter um acessório inferior (mini player) exibido acima dela com a mesma aparência. Quando a tab bar minimiza, o acessório anima para ficar inline. | [87](https://developer.apple.com/videos/play/wwdc2025/284/) |
| Pode minimizar quando a pessoa rola para baixo (opção para tab bars com acessório). Sai do estado minimizado ao tocar numa aba ou rolar ao topo. | [8](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/tab-bars.json) |
| `tabBarMinimizeBehavior`: automatic (padrão), never, onScrollDown, onScrollUp. Minimizar só existe no iPhone. | [52](https://developer.apple.com/tutorials/data/documentation/swiftui/tabbarminimizebehavior.json) |
| Pode ter uma aba de busca dedicada na ponta trailing. Ao tocar, o botão se expande num campo de busca e os outros colapsam. | [87](https://developer.apple.com/videos/play/wwdc2025/284/) |
| Monocromática por padrão. Cor de destaque só em item selecionado ou ação primária, nunca em vários controles. | [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json) |

O app tem cinco abas (Início, Artigos, Bíblia, Ferramentas, Ajustes), todas de uma palavra, todas com par Ionicons preenchido e outline. Já cumpre a estrutura. O que falta é o comportamento: barra absoluta com material, ícone preenchido só no ativo, dourado só no ativo, `paddingBottom` nas telas. As alturas de tab bar (os 49 pt que todo mundo conhece) não foram confirmadas em nenhuma fonte aberta. O `bottom-tabs` já usa a altura padrão e soma o inset inferior, então não precisamos do número.

### 6.5 Busca

- Há dois estilos de aba de busca: aba padrão (abre uma página de busca com sugestões, boa para descoberta) e aparência de botão (foca o campo e abre o teclado na hora, boa para achar rápido e voltar) [9](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/search-fields.json).
- Colocar a busca no toolbar inferior quando houver espaço, porque é mais fácil de alcançar. No topo quando o conteúdo de baixo é prioritário ou não há toolbar inferior [9](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/search-fields.json).
- Um campo de busca inline (filtro de lista) fica acima da lista que ele filtra e pode ser fixado ao toolbar superior ao rolar [9](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/search-fields.json).
- Com `hidesSearchBarWhenScrolling`, a barra de busca só aparece quando a rolagem está no topo. Ao rolar para baixo ela se recolhe na navigation bar e reaparece ao voltar ao topo [53](https://developer.apple.com/tutorials/data/documentation/uikit/uinavigationitem/hidessearchbarwhenscrolling.json).

No app a busca é uma tela (`Search`) aberta pela Home. A aba de busca do iOS 26 é recurso nativo do `UITabBarController` sem equivalente no bottom-tabs. Decisão (escolha nossa): manter a busca como campo inline no topo de Artigos e Bíblia, fixado ao rolar, que é o padrão "inline" da Apple e funciona nas três plataformas.

---

## 7. Movimento: curvas, durações e springs

### 7.1 Princípios

- Não adicionar movimento por adicionar. Animação gratuita ou excessiva distrai e pode causar desconforto físico [11](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json).
- Movimento precisa ser opcional: nunca usar animação como único meio de comunicar informação importante. Complementar com áudio e haptics [11](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json).
- Feedback animado breve e preciso parece leve e comunica melhor que animação proeminente [11](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json).
- Em apps, evitar adicionar movimento a interações de UI que ocorrem com frequência. O sistema já fornece animações sutis para os elementos padrão [11](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json).
- Deixar a pessoa cancelar: não fazer esperar uma animação terminar antes de agir, sobretudo se ela se repete [11](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json).
- Feedback de gesto segue a expectativa física: uma view revelada deslizando de cima não se fecha deslizando para o lado [11](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json).
- Componentes do sistema ajustam o movimento pelo método de entrada. O Liquid Glass responde ao toque direto com mais ênfase e ao trackpad de forma mais contida [11](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json). Para a web: reações ao toque podem ser mais enfáticas que ao mouse.
- Interfaces fluidas respondem instantaneamente ao toque e permitem redirecionamento e interrupção constantes. Delays e timers devem ser caçados em toda interação [90](https://developer.apple.com/videos/play/wwdc2018/803/).
- Começar simples: um spring não precisa de overshoot. Dispositivos são ferramentas e movimento desnecessário atrapalha [90](https://developer.apple.com/videos/play/wwdc2018/803/).
- Transições de navegação (zoom transition do iOS 18) são continuamente interativas e interruptíveis. Um push interrompido vira pop em vez de ser cancelado, e o código deve estar pronto para uma transição começar a qualquer instante [91](https://developer.apple.com/videos/play/wwdc2024/10145/).
- Consistência de caráter: escolher valores de spring coerentes com a personalidade do app (sério ou lúdico, relaxado ou acelerado). Bounce faz sentido para dar sensação física, sobretudo no fim de um gesto [89](https://developer.apple.com/videos/play/wwdc2023/10158/).

Para o APPologética o caráter é sereno: springs sem bounce, durações curtas, nada saltitante (escolha nossa).

### 7.2 Springs: o modelo duration mais bounce

Desde o iOS 17 a animação default do SwiftUI é um spring com response 0,55 s, dampingFraction 1,0 (sem bounce) e blendDuration 0. Antes era easeInOut [63](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/default.json).

| Preset | Duração | Bounce | Fonte |
|---|---|---|---|
| smooth | 0,5 s | 0 (criticamente amortecido) | [64](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/smooth(duration:extrabounce:).json) |
| snappy | 0,5 s | 0,15 | [65](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/snappy(duration:extrabounce:).json) |
| bouncy | 0,5 s | 0,30 | [66](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/bouncy(duration:extrabounce:).json) |
| spring(duration:bounce:) | 0,5 s padrão | de -1 (superamortecido) a 1 (oscilação sem amortecimento), 0 é crítico | [67](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/spring(duration:bounce:blendduration:).json) |
| spring(response:dampingFraction:) | response 0,5 s | dampingFraction 0,825 | [68](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/spring(response:dampingfraction:blendduration:).json) |
| interactiveSpring (segue o dedo) | response 0,15 s, blendDuration 0,25 s | dampingFraction 0,86 | [69](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/interactivespring(response:dampingfraction:blendduration:).json) |
| UIView.animate(springDuration:bounce:) | 0,5 s | 0 | [71](https://developer.apple.com/tutorials/data/documentation/uikit/uiview/animate(springduration:bounce:initialspringvelocity:delay:options:animations:completion:).json) |

Como escolher, segundo a WWDC 2023: primeiro a duração pelo ritmo, depois o bounce. Bounce 0 é o padrão geral. Cerca de 0,15 quase não salta mas fica mais "brisk". Cerca de 0,30 já salta visivelmente. Evitar acima de 0,4 em UI [89](https://developer.apple.com/videos/play/wwdc2023/10158/). Springs são o único tipo de animação que mantém continuidade tanto em casos estáticos quanto com velocidade inicial, e uma animação retargetada usa a velocidade que tinha, o que torna interrupções suaves [89](https://developer.apple.com/videos/play/wwdc2023/10158/). A Apple compõe animações grandes com vários springs, com inícios e fins diferentes, e não espera o settling duration para mudanças de UI [89](https://developer.apple.com/videos/play/wwdc2023/10158/).

Conversão para física, útil para o `withSpring` do reanimated: Spring(duration 0,5, bounce 0,3) equivale a mass 1, stiffness 157,9, damping 17,6 [70](https://developer.apple.com/tutorials/data/documentation/swiftui/spring.json). O `withSpring` do reanimated 4.1.7 aceita o mesmo modelo perceptual (`duration` e `dampingRatio`) e seu default é duration 550 ms com dampingRatio 1, idêntico ao spring padrão do SwiftUI [119](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/). A conversão de bounce para dampingRatio é aproximada: dampingRatio = 1 menos bounce (escolha nossa, derivada da definição de bounce 0 = crítico).

Exemplo de escolha de damping no Music (WWDC 2018): abrir o Now Playing por toque usa 100 por cento de damping, porque o toque não tem momento na direção da apresentação. Dispensar por swipe usa 80 por cento, porque o gesto tem momento [90](https://developer.apple.com/videos/play/wwdc2018/803/). Para nós: toque sem bounce sempre, gesto com leve bounce só onde houver swipe (fechar sheet).

### 7.3 Curvas de easing

| Curva | Pontos de controle | Equivalente CSS | Fonte |
|---|---|---|---|
| default (Core Animation, maioria das animações do sistema) | (0.25, 0.1), (0.25, 1.0) | `ease` | [57](https://developer.apple.com/tutorials/data/documentation/quartzcore/camediatimingfunctionname/default.json) |
| easeInEaseOut | (0.42, 0.0), (0.58, 1.0) | `ease-in-out` | [58](https://developer.apple.com/tutorials/data/documentation/quartzcore/camediatimingfunctionname/easeineaseout.json) |
| easeIn | (0.42, 0.0), (1.0, 1.0) | `ease-in` | [59](https://developer.apple.com/tutorials/data/documentation/quartzcore/camediatimingfunctionname/easeout.json) |
| easeOut | (0.0, 0.0), (0.58, 1.0) | `ease-out` | [59](https://developer.apple.com/tutorials/data/documentation/quartzcore/camediatimingfunctionname/easeout.json) |
| linear | (0, 0), (1, 1) | `linear` | [59](https://developer.apple.com/tutorials/data/documentation/quartzcore/camediatimingfunctionname/easeout.json) |

- `UIView.animate(withDuration:animations:)` usa easeInOut por padrão e desabilita interação com as views durante a animação. Duração 0 aplica a mudança sem animar [60](https://developer.apple.com/tutorials/data/documentation/uikit/uiview/animate(withduration:animations:).json).
- As curvas de easing do SwiftUI (easeInOut, easeOut, linear) têm duração padrão de 0,35 s [61](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/easeinout.json).
- Linear dá sensação mecânica por manter velocidade constante, ideal para movimento onde mudanças de velocidade pareceriam estranhas, como um indicador de atividade [62](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/linear.json). Para deslocamento de objetos, linear tem comportamento não físico que geralmente parece fora de lugar [89](https://developer.apple.com/videos/play/wwdc2023/10158/).
- `beginFromCurrentState` faz a nova animação partir do valor atual de uma animação em voo, e `allowUserInteraction` permite interagir com as views enquanto animam [72](https://developer.apple.com/tutorials/data/documentation/uikit/uiview/animationoptions/beginfromcurrentstate.json). No reanimated, shared values já têm esse comportamento por padrão.
- Bounce negativo (superamortecido) é raro em UI, mas modela velocidade em decaimento, como a desaceleração de um scroll view [89](https://developer.apple.com/videos/play/wwdc2023/10158/).

### 7.4 Reduce Motion

Com Reduce Motion ativo, reduzir animações automáticas e repetitivas (zoom, escala, movimento periférico), apertar as molas para reduzir bounce, acompanhar animações diretamente ao gesto, evitar animar mudanças de profundidade no eixo z, trocar transições em x, y e z por fades, e evitar animar entrando e saindo de blurs [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json). No SwiftUI, a UI deve evitar animações grandes, sobretudo as que simulam a terceira dimensão [56](https://developer.apple.com/tutorials/data/documentation/swiftui/environmentvalues/accessibilityreducemotion.json).

### 7.5 Tabela de movimento para o app

A Apple não publica duração por tipo de animação (toque, layout, tela). Os únicos números oficiais são os da tabela 7.2 e os 0,35 s do easing do SwiftUI. A duração do push e pop do `UINavigationController` não está em nenhuma página aberta. A tabela abaixo combina o que é da Apple com escolhas nossas, marcadas.

| Situação no app | Duração | Curva ou spring | Origem |
|---|---|---|---|
| Estado pressionado de botão e card (entrada) | 0 ms, instantâneo | nenhuma | Interfaces fluidas respondem instantaneamente [90](https://developer.apple.com/videos/play/wwdc2018/803/) |
| Estado pressionado (saída, ao soltar) | 150 ms | spring dampingRatio 1 (equivalente ao interactiveSpring de response 0,15 s) | response 0,15 s do interactiveSpring [69](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/interactivespring(response:dampingfraction:blendduration:).json). Uso na saída do press é escolha nossa. |
| Escala de card ao pressionar | 150 ms até 0,97 | spring dampingRatio 1 | Fator 0,97 é escolha nossa. A Apple não publica número de scale on press. |
| Fade de troca de aba | 200 ms | cubic-bezier(0.25, 0.1, 0.25, 1) | Curva default do Core Animation [57](https://developer.apple.com/tutorials/data/documentation/quartzcore/camediatimingfunctionname/default.json). Duração é escolha nossa. |
| Mudança de layout (expandir card, mostrar filtro) | 350 ms | cubic-bezier(0.25, 0.1, 0.25, 1) ou spring smooth | 0,35 s do easing do SwiftUI [61](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/easeinout.json) |
| Mudança de estado com "peso" (abrir sheet, expandir seção grande) | 500 ms perceptual | spring smooth: duration 500, dampingRatio 1 | Preset smooth [64](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/smooth(duration:extrabounce:).json) |
| Animação implícita padrão (quando nada foi decidido) | 550 ms perceptual | spring dampingRatio 1 | Default do SwiftUI [63](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/default.json), igual ao default do reanimated |
| Fechar sheet por swipe | 500 ms | spring dampingRatio 0,8 | 80 por cento de damping no gesto com momento [90](https://developer.apple.com/videos/play/wwdc2018/803/) |
| Transição de tela (push e pop) | nativa | `ios_from_right` no iOS e Android, SlideFromRightIOS na web | Duração não publicada pela Apple. Fica com o sistema. |
| Entrada escalonada de itens em lista curta | 40 ms entre itens, FadeIn de 250 ms | cubic-bezier(0.25, 0.1, 0.25, 1) | Padrão de vários springs com inícios diferentes [89](https://developer.apple.com/videos/play/wwdc2023/10158/). Os 40 ms são escolha nossa. Só em listas de até 8 itens. |
| Large title encolhendo ao rolar | segue o dedo | interpolação direta de scrollY, sem timing | Rastrear animações diretamente com o gesto [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json) |
| Spinner e skeleton | contínuo | linear | Linear é ideal para indicador de atividade [62](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/linear.json) |
| Qualquer uma acima com Reduce Motion | mesma duração ou 0 | só opacity, dampingRatio 1, sem escala, sem translate | [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json) |

---

## 8. Microinterações, feedback e haptics

### 8.1 Feedback em camadas

- Quando o feedback usa cor, texto, som e haptics, a pessoa o recebe mesmo com o aparelho silenciado, sem olhar para a tela ou usando VoiceOver [14](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/feedback.json).
- Feedback de status deve ser passivo e integrado, perto do item que descreve. Interrupções (alerts) ficam para o que é crítico e acionável [14](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/feedback.json).
- Confirmar visualmente a conclusão só de ações realmente significativas. As pessoas esperam que a ação dê certo, e o feedback essencial é o de falha [14](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/feedback.json).
- Avisar quando a pessoa inicia uma tarefa que causa perda de dados inesperada e irreversível. Não avisar quando a perda é o resultado esperado da ação [14](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/feedback.json).

### 8.2 Botões e estado pressionado

- Todo botão customizado tem estado pressionado. Sem ele o botão parece não responder [13](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/buttons.json).
- Área de toque de pelo menos 44x44 pt [13](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/buttons.json).
- Para ações que não completam na hora, configurar o botão para mostrar um activity indicator dentro dele, trocando o rótulo ("Checkout" vira "Checking out…"). O sistema esconde a imagem do botão enquanto o indicador aparece [13](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/buttons.json).
- Animação de feedback breve e precisa, sem movimento em interações frequentes, cancelável [11](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json).

O HIG não dá número para o feedback visual de toque (opacidade, escala, duração). A tabela 7.5 traz a escolha nossa: opacidade 0,55 em botões de texto, fundo terciário em linhas de lista, escala 0,97 em cards com imagem, saída em 150 ms.

### 8.3 Haptics

Existem três categorias de haptics pré-definidos, e cada uma tem significado documentado [12](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/playing-haptics.json):

- **Notification**: resultado de uma tarefa. Success (concluiu), warning (aviso), error (erro). Exemplos da Apple: depositar um cheque, destravar um carro [12](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/playing-haptics.json).
- **Impact**: metáfora de colisão entre elementos da UI. Light (pequenos e leves), medium, heavy (grandes e pesados), rigid (pouca elasticidade), soft (muita elasticidade) [73](https://developer.apple.com/tutorials/data/documentation/uikit/uiimpactfeedbackgenerator/feedbackstyle.json). Aceita intensidade contínua de 0,0 a 1,0 além do estilo [76](https://developer.apple.com/tutorials/data/documentation/uikit/uiimpactfeedbackgenerator/impactoccurred(intensity:).json).
- **Selection**: movimento por uma série de valores discretos, por exemplo os valores de um elemento mudando [74](https://developer.apple.com/tutorials/data/documentation/uikit/uiselectionfeedbackgenerator.json).

Regras:

- Usar cada padrão só com o significado documentado. Se o caso documentado não faz sentido no app, não reaproveitar o padrão com outro sentido [12](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/playing-haptics.json).
- Relação clara de causa e efeito, o mesmo padrão sempre para o mesmo evento [12](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/playing-haptics.json).
- Haptic complementa o visual e o sonoro. Intensidade e nitidez do haptic combinam com as da animação que ele acompanha [12](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/playing-haptics.json).
- Não abusar. Em apps, preferir haptics curtos ligados a eventos discretos. O melhor haptic é o que a pessoa não nota mas sente falta quando desligado [12](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/playing-haptics.json).
- Haptics opcionais: ajuste para desligar, e o app funciona bem sem eles [12](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/playing-haptics.json).
- Switches, sliders e pickers já tocam haptics do sistema sozinhos em iPhones compatíveis [12](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/playing-haptics.json). Por isso não se adiciona haptic manual em cima do `Switch` do React Native (inferência nossa a partir da regra de não abusar).
- `prepare()` antes do evento reduz a latência. Preparar e disparar no mesmo instante não ajuda. O Taptic Engine volta a idle depois de disparar ou após alguns segundos, e chamar `prepare()` sem nunca disparar faz o sistema ignorar as chamadas [75](https://developer.apple.com/tutorials/data/documentation/uikit/uifeedbackgenerator/prepare().json). O expo-haptics não expõe `prepare()`, o que explica por que o primeiro haptic pode atrasar.

Mapeamento para o app. As decisões da Fase 0 foram: leve em seleção, média em sucesso e long-press, nenhum ao trocar de aba. A tabela refina isso com os geradores certos (a coluna "Apple" é regra, a coluna "evento" é escolha nossa):

| Evento no app | Gerador Apple | expo-haptics (iOS) | Android (`performAndroidHapticsAsync`) | Web |
|---|---|---|---|---|
| Trocar de aba | nenhum | nada | nada | nada |
| Tocar em card, linha de lista, botão comum | nenhum (interação frequente) | nada | ripple visual só | estado pressed só |
| Marcar versículo (escolher cor) | selection | `selectionAsync()` | `Segment_Tick` (API 34+), fallback `Clock_Tick` | nada |
| Trocar filtro de categoria, segmento, picker de livro | selection | `selectionAsync()` | `Segment_Tick` | nada |
| Long-press em versículo ou nota (abrir menu) | impact medium | `impactAsync(Medium)` | `Long_Press` | nada |
| Concluir dezena do Rosário, marcar capítulo como lido | impact light | `impactAsync(Light)` | `Context_Click` | nada |
| Terminar quiz, concluir exame de consciência, salvar nota | notification success | `notificationAsync(Success)` | `Confirm` (API 30+), fallback `Long_Press` | nada |
| Erro de login, falha ao salvar | notification error | `notificationAsync(Error)` | `Reject` (API 30+), fallback `Long_Press` | nada |
| Aviso antes de descartar rascunho | notification warning | `notificationAsync(Warning)` | `Long_Press` | nada |
| Pull to refresh chegou ao ponto | impact light | `impactAsync(Light)` | `Context_Click` | nada |
| Scroll, arrastar, seleção contínua | nenhum | nada | nada | nada |

Sobre a web, a Vibration API não existe no Safari do iPhone [101](https://caniuse.com/vibration), então no navegador o feedback é visual. Sobre o Android, a doc do Expo diz que a API Vibrator não é recomendada para haptics e que o caminho é `performAndroidHapticsAsync` [116](https://docs.expo.dev/versions/v54.0.0/sdk/haptics/). Detalhes nas seções 10 e 11.

### 8.4 Carregamento e progresso

- Mostrar algo o mais cedo possível: placeholder de texto, gráfico ou animação substituído conforme o conteúdo chega. Tela vazia durante o load é lida como defeito [17](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/loading.json).
- Placeholder no padrão Apple (`.redacted(reason: .placeholder)`): texto e imagens mascarados como blocos genéricos que mantêm tamanho e forma originais [77](https://developer.apple.com/tutorials/data/documentation/swiftui/redactionreasons/placeholder.json). A Apple documenta o placeholder mascarado, mas não descreve shimmer. Se o app usar shimmer, é convenção de mercado (escolha nossa: sem shimmer, só o bloco com leve pulso de opacidade, coerente com Reduce Motion).
- Indicador de progresso só quando o carregamento passa de "um momento ou dois". Determinado quando a duração é conhecida, indeterminado quando não. Trocar de indeterminado para determinado assim que der [17](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/loading.json).
- Indicador sempre em movimento, nunca trocar de circular para barra no meio, lugar consistente, e sem rótulos vagos como "loading" ou "authenticating" [18](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/progress-indicators.json).
- Barra determinada em ritmo honesto: 90 por cento em cinco segundos e os 10 restantes em cinco minutos parece app travado. Oferecer Cancelar quando interromper não tem efeito colateral [18](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/progress-indicators.json).
- Pull to refresh é um activity indicator escondido que aparece ao arrastar. O app deve atualizar sozinho também, e o título opcional só entra se agregar valor (hora da última atualização), nunca para explicar o gesto [18](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/progress-indicators.json).
- Empty state (`ContentUnavailableView`): usado quando o conteúdo não pode ser exibido por erro de rede, lista sem itens ou busca sem resultado. Estrutura: ícone com título, descrição curta e, opcionalmente, uma ação [78](https://developer.apple.com/tutorials/data/documentation/swiftui/contentunavailableview.json).

No app: liturgia e notícias (os dois únicos serviços de rede) trocam o spinner por skeleton do card. Favoritos vazios, busca sem resultado e caderno vazio ganham o padrão ícone, título, descrição e ação.

### 8.5 Sheets, alerts e action sheets

- Sheets no iPhone descansam em detents: large (altura total) e medium (cerca de metade). Suportar medium permite revelação progressiva. Sheets de composição abrem só em large [19](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/sheets.json).
- Sheet redimensionável precisa de grabber (que também alterna detents ao toque e funciona com VoiceOver) e deve fechar com swipe vertical. Se houver mudanças não salvas, confirmar com action sheet. Uma sheet por vez. Cancelar no canto leading, Concluir no trailing [19](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/sheets.json).
- Regra de março de 2026: se houver Done, sempre acompanhado de Cancel (ou Back em fluxo de etapas), e nunca os três juntos. Em fluxo de etapas, Done fica inativo até a etapa final [19](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/sheets.json).
- Não usar alert para ações comuns e desfazíveis, mesmo destrutivas. Não mostrar alert na abertura do app [15](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/alerts.json). Evitar "OK" como botão padrão a menos que o alert seja informativo. Preferir verbos ("Apagar"), e "Cancelar" sempre com esse título. Alerts têm título, texto opcional e até três botões [15](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/alerts.json).
- Para escolhas ligadas a uma ação intencional (descartar ou salvar rascunho), usar action sheet, não alert. Destrutivas no topo com estilo destrutivo, Cancelar na base, sem rolagem [16](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/action-sheets.json). No máximo quatro botões incluindo Cancelar [16](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/action-sheets.json).

O `NoteEditor` é a única modal do app. Pela regra, ao fechar com texto não salvo ele mostra action sheet ("Descartar" destrutivo no topo, "Salvar", "Cancelar" embaixo), não alert.

### 8.6 Toggles e segmented controls

- Toggle estilo switch só dentro de linha de lista, sem rótulo extra. Fora de lista, um botão com estado ligado e desligado. Manter o verde padrão salvo motivo forte, e nunca diferenciar estado só por cor [20](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/toggles.json).
- Segmented control no iPhone: no máximo cerca de cinco segmentos (cinco a sete em interface larga), todos com a mesma largura, rótulos com substantivos, sem misturar texto e ícone no mesmo controle [21](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/segmented-controls.json).

Isso afeta o seletor de tamanho de fonte nos Ajustes (quatro segmentos, todos texto, ok) e os filtros de categoria em Artigos (seis categorias, então vira chips roláveis, não segmented, escolha nossa).

---

## 9. Acessibilidade

A Apple trata acessibilidade como três propriedades da interface: intuitiva, perceptível e adaptável. As regras abaixo são as que têm efeito direto no app. Várias já apareceram nas seções anteriores e estão aqui reunidas com a régua numérica.

### 9.1 Texto

| Regra | Valor | Fonte |
|---|---|---|
| Permitir ampliar o texto em pelo menos 200 por cento, por Dynamic Type ou controle próprio | 200 por cento (140 no watchOS) | [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json) |
| Tamanho padrão e mínimo no iOS e iPadOS | 17 pt e 11 pt | [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json) |
| Escala do Body no Dynamic Type | 17/22 (Large), 23/29 (xxxLarge), 28/34 (AX1), 53/62 (AX5) | [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json) |
| Pesos | Regular a Bold, nunca Ultralight, Thin, Light | [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json) |
| Ênfase de Body é Semibold, não Bold (tabela revisada em dezembro de 2025) | Semibold | [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json) |
| Fontes customizadas reagem a Dynamic Type e a Bold Text como as do sistema | regra | [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json) |
| Em tamanhos grandes: sem truncar em regiões roláveis, ícones significativos crescem, itens inline empilham, menos colunas, hierarquia mantida | regra | [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json) |
| Priorizar o conteúdo que a pessoa quer ler. Títulos de aba não crescem | regra | [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json) |
| WCAG 2.2 1.4.4 (AA): texto redimensionável até 200 por cento sem perda de conteúdo ou função | 200 por cento | [92](https://www.w3.org/TR/WCAG22/) |
| WCAG 2.2 1.4.12 (AA): a página não perde conteúdo quando line-height vai a 1,5x, espaço após parágrafo a 2x, letter-spacing a 0,12 em e word-spacing a 0,16 em | valores ao lado | [92](https://www.w3.org/TR/WCAG22/) |

### 9.2 Contraste e cor

| Regra | Valor | Fonte |
|---|---|---|
| Accessibility Inspector (WCAG AA): até 17 pt, 4,5:1. A partir de 18 pt, 3:1. Bold em qualquer tamanho, 3:1 | 4,5:1 e 3:1 | [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json) |
| Sem o mínimo por padrão, oferecer esquema de maior contraste com Increase Contrast, verificado no claro e no escuro | regra | [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json) |
| WCAG 2.2 1.4.3 (AA): 4,5:1 para texto, 3:1 para texto grande (18 pt, ou 14 pt em bold) | 4,5:1 e 3:1 | [92](https://www.w3.org/TR/WCAG22/) |
| WCAG 2.2 1.4.11 (AA): componentes de interface e partes essenciais de gráficos com 3:1 contra as cores adjacentes | 3:1 | [92](https://www.w3.org/TR/WCAG22/) |
| Toda cor customizada tem variante clara, escura e de contraste aumentado | regra | [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json) |
| Nunca só cor para diferenciar, indicar interatividade ou estado. Acompanhar com texto ou forma | regra | [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json) |
| Fornecer cores claras e escuras mesmo com um único modo, por causa do Liquid Glass | regra | [4](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json) |

O HIG pede contraste "significativamente maior" na variante de Increase Contrast mas não dá número. O WCAG AAA (1.4.6) usaria 7:1 e 4,5:1, e o HIG de Dark Mode sugere 7:1 para cores customizadas em texto pequeno [5](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/dark-mode.json). Meta do projeto (escolha nossa): AA em tudo, 7:1 no `label` sobre `bg` e `card` nos dois modos.

### 9.3 Alvos e gestos

| Regra | Valor | Fonte |
|---|---|---|
| Tamanho de controle no iOS e iPadOS | 44x44 pt padrão, 28x28 pt mínimo | [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json) |
| Folga entre controles | cerca de 12 pt com bezel, 24 pt sem bezel | [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json) |
| WCAG 2.2 2.5.8 (AA) e 2.5.5 (AAA): alvo de ponteiro | 24x24 px CSS (AA), 44x44 px CSS (AAA) | [92](https://www.w3.org/TR/WCAG22/), [93](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) |
| Evitar elementos que somem sozinhos por timer. Oferecer botão como alternativa a todo gesto (swipe para apagar precisa de Editar e Apagar) | regra | [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json) |
| Button Shapes: a Apple expõe a flag `buttonShapesEnabled` (iOS 14+), mas a página não descreve o tratamento visual | flag | [81](https://developer.apple.com/tutorials/data/documentation/uikit/uiaccessibility/buttonshapesenabled.json) |

O comportamento observável do sistema com Button Shapes ligado é sublinhar botões de texto. Dar contorno ou sublinhado a botões só de texto quando a flag está ativa é prática derivada, não texto da Apple. No app (escolha nossa): botões de texto ganham sublinhado com a flag no iOS, e no Android e web permanecem como estão.

### 9.4 Movimento e transparência

| Regra | Fonte |
|---|---|
| Com Reduce Motion: reduzir animações automáticas e repetitivas, apertar molas, atrelar ao gesto, não animar profundidade em z, trocar transições em x, y e z por fades, não animar blur | [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json) |
| Reduce Motion no SwiftUI: evitar animações grandes, sobretudo as que simulam a terceira dimensão | [56](https://developer.apple.com/tutorials/data/documentation/swiftui/environmentvalues/accessibilityreducemotion.json) |
| Movimento opcional: nunca o único meio de comunicar, e cancelável | [11](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json) |
| `prefersCrossFadeTransitions` (iOS 14+) é verdadeiro quando Reduce Motion e Prefer Cross-Fade Transitions estão ligados. A página só define a flag | [79](https://developer.apple.com/tutorials/data/documentation/uikit/uiaccessibility/preferscrossfadetransitions.json) |
| `isReduceTransparencyEnabled` indica a configuração Reduce Transparency. No iOS 26 os materiais mudam de aparência com ela e com Increase Contrast | [80](https://developer.apple.com/tutorials/data/documentation/uikit/uiaccessibility/isreducetransparencyenabled.json) |
| Variante regular do Liquid Glass sempre que houver muito texto ou risco de legibilidade | [6](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json) |
| Clear Liquid Glass só sobre fundos visualmente ricos, com a camada escura de 35 por cento se o conteúdo for claro | [6](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json) |
| Material mais espesso dá mais contraste. Sobre materiais, cores vibrantes do sistema | [6](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json) |

Trocar transição de slide por crossfade quando `prefersCrossFadeTransitions` é verdadeiro é uma prática derivada do nome da configuração. No React Native as duas flags existem (`AccessibilityInfo.prefersCrossFadeTransitions`, `isReduceMotionEnabled`), a primeira só no iOS.

### 9.5 VoiceOver

- Rótulo alternativo descritivo para todos os elementos-chave. Descrever imagens significativas com só o que a imagem transmite e excluir as decorativas [24](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/voiceover.json). No app, cada artigo já tem `imageAlt`. As ilustrações de card e os ícones decorativos precisam de `accessibilityElementsHidden` ou `importantForAccessibility="no"`.
- Cada tela tem título único e descritivo, a primeira coisa lida ao chegar, e headings de seção precisos [24](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/voiceover.json). No React Native: `accessibilityRole="header"` nos títulos de seção e no large title.
- VoiceOver lê na ordem de leitura do idioma. Elementos relacionados só visualmente (imagem e legenda, título e subtítulo de card) são agrupados num único elemento acessível [24](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/voiceover.json). No app: `accessible` no card inteiro com `accessibilityLabel` composto.
- Informar quando conteúdo ou layout visível muda, para o mapa mental continuar válido [24](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/voiceover.json). No app: `AccessibilityInfo.announceForAccessibility` ao trocar de capítulo pelo prev/next e ao carregar a liturgia.

---

## 10. Adaptação para a web (react-native-web)

Plataforma: web via react-native-web 0.21.2, Expo SDK 54.0.34, react-native 0.81.5, exportado com `npx expo export -p web` para o GitHub Pages. Tudo abaixo foi conferido no código instalado em `node_modules` e na documentação das bibliotecas. As regras da Apple citadas remetem às seções anteriores.

### 10.1 Fontes

**Pilha sans.** Basta `fontFamily: 'System'`: o compilador de estilos da react-native-web substitui `System` pela constante `-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif` [102](https://github.com/necolas/react-native-web/blob/0.21.2/packages/react-native-web/src/exports/StyleSheet/compiler/createReactDOMStyle.js). Isso dá SF Pro no Safari e Chrome do Mac e do iPhone, Segoe no Windows e Roboto no Android, sem embutir nada, cumprindo a regra de não distribuir fontes do sistema (seção 2.1). Qualquer outra string de `fontFamily` é repassada literalmente ao CSS. Hoje o único `fontFamily` do app é `'monospace'` no ErrorBoundary, então tudo herda a fonte padrão do navegador, não a pilha do sistema. Adicionar `-webkit-font-smoothing: antialiased` no CSS global aproxima o rendering do macOS (só tem efeito lá).

**Serifa de leitura.** `fontFamily: 'ui-serif, Georgia, "Times New Roman", "Noto Serif", serif'`. A MDN define `ui-serif` como a fonte serifada padrão da interface do sistema [94](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family), e no Safari do Mac e do iOS ela resolve para a New York. O React Native 0.81 documenta que as famílias genéricas `system-ui`, `ui-sans-serif`, `ui-serif`, `ui-monospace` e `ui-rounded` são suportadas no iOS, e a react-native-web repassa a string sem alterar, então o mesmo token serve nas três plataformas. Georgia é a fallback no Windows e no Chrome do Mac. Tracking da New York (seção 2.4): -0,07 em 17 px, -0,20 em 20 px, -0,33 em 28 px.

**Cormorant Garamond via expo-font.** No navegador, `expo-font` gera um bloco `@font-face` numa style sheet compartilhada. O `display` padrão é `FontDisplay.AUTO`, que a própria tipagem descreve como texto invisível até a fonte carregar (FOIT) [114](https://github.com/expo/expo/blob/sdk-54/packages/expo-font/src/Font.types.ts). Para o texto ficar sempre visível: `useFonts({ CormorantGaramond: { uri: require('./assets/fonts/CormorantGaramond-SemiBold-latin.woff2'), display: Font.FontDisplay.SWAP } })`. Subset com `pyftsubset` cobrindo `U+0000-00FF, U+0100-017F, U+2000-206F, U+20AC` (latim-1 mais latim estendido A, suficiente para português e inglês), saída woff2. Um peso da Cormorant subsetado fica bem abaixo dos 300 KB de teto (escolha nossa, estimativa a confirmar no build). `<link rel="preload" as="font" type="font/woff2" crossorigin>` em `public/index.html`. O `display` só vale na web e só no `@font-face` gerado, não por elemento. O config plugin do `expo-font` embute fontes só no nativo. Na web continua sendo carregamento em runtime.

### 10.2 Escala tipográfica e Dynamic Type

Na web 1 pt = 1 px CSS, então a tabela da seção 2.2 entra sem conversão. O escalonamento vem do `fs()` e não de `PixelRatio.getFontScale()`: na react-native-web 0.21.2, `getFontScale()` devolve `Dimensions.get('window').fontScale || PixelRatio.get()`, ou seja, cai no `devicePixelRatio` (2 num Retina), que nada tem a ver com preferência de texto [103](https://github.com/necolas/react-native-web/blob/0.21.2/packages/react-native-web/src/exports/PixelRatio/index.js). `allowFontScaling` não tem efeito na web e `dynamicTypeRamp` é iOS-only. Cumprir WCAG 1.4.4 exige testar o app com zoom de 200 por cento do navegador além do `fs()`: layouts lado a lado devem empilhar.

**Pesos e tracking.** O React Native aceita `fontWeight` de `'100'` a `'900'` e `letterSpacing` como número em unidades de layout [107](https://reactnative.dev/docs/text-style-props). A react-native-web mapeia direto para CSS, então os valores da tabela 2.4 entram em px sem conversão. Nunca `'100'`, `'200'` ou `'300'`.

### 10.3 Materiais e blur

A react-native-web 0.21.2 repassa `backdropFilter` pelo StyleSheet e adiciona `-webkit-backdrop-filter` sozinha. Um View com `{ backdropFilter: 'saturate(180%) blur(20px)', backgroundColor: 'rgba(249,249,249,0.72)' }` funciona no Safari, Chrome e Firefox atuais. O `expo-blur` 15.0.8 (SDK 54, ainda não instalado) faz exatamente isso na web: `saturate(180%) blur(intensity * 0.2 px)` mais uma cor por tint, `light` = rgba(249,249,249, opacity * 0.78), `dark` = rgba(25,25,25, opacity * 0.78) [112](https://github.com/expo/expo/blob/sdk-54/packages/expo-blur/src/BlurView.web.tsx). Mapeamento sugerido para os materiais padrão (escolha nossa, a Apple não publica): ultraThin 30, thin 50, regular 70, thick 90 de `intensity`.

Ressalvas: um ancestral com `opacity < 1`, `filter`, `will-change` ou `mask` vira "backdrop root" e o blur passa a ver só o que está entre ele e o filho. É a mesma regra da `UIVisualEffectView` (seção 5.2). Reanimated animando `opacity` num pai da barra quebra o vidro. Blur em área grande custa GPU em Android barato: só barras, nunca cards.

### 10.4 Reduce Transparency e Increase Contrast

Não há API RN que funcione na web: `AccessibilityInfo.isReduceTransparencyEnabled()` é iOS-only e a react-native-web nem o implementa. A media query `prefers-reduced-transparency` existe só em Chromium (Chrome e Edge 118+), sem Safari nem Firefox [100](https://caniuse.com/mdn-css_at-rules_media_prefers-reduced-transparency). Solução em duas camadas (escolha nossa): ler `matchMedia('(prefers-reduced-transparency: reduce)')` e `('(prefers-contrast: more)')` num hook com try/catch, e expor em Ajustes os toggles "Reduzir transparência" e "Aumentar contraste", persistidos como o `darkMode`. Com o primeiro ligado, `backgroundColor` opaco no lugar do `backdropFilter`. Com o segundo, paleta de contraste. No Safari (o navegador da maior parte dos usuários de iPhone na web) a preferência do sistema nunca chega ao app, por isso o toggle próprio não é opcional.

### 10.5 Reduce Motion

Funciona por dois caminhos. A react-native-web resolve `isReduceMotionEnabled()` com `window.matchMedia('(prefers-reduced-motion: reduce)').matches` e escuta o `change` da MediaQueryList em `reduceMotionChanged` [104](https://github.com/necolas/react-native-web/blob/0.21.2/packages/react-native-web/src/exports/AccessibilityInfo/index.js). O reanimated 4.1.7 faz o mesmo matchMedia para `useReducedMotion()` e para o `reduceMotion: ReduceMotion.System` padrão de `withTiming`, `withSpring` e das animações de entrada e saída. Se `matchMedia` não existir (SSR, teste), a react-native-web resolve `true`, conservador. O `useReducedMotion()` do reanimated é lido no boot e não reage a mudança ao vivo: para isso, o listener da `AccessibilityInfo`. Para CSS puro, `@media (prefers-reduced-motion: reduce)` no CSS global.

### 10.6 Reanimated 4 na web

O reanimated 4.1.7 com react-native-worklets 0.5.1 roda na web em JavaScript puro, com eficiência menor, e a documentação recomenda não abrir mão do plugin Babel dos worklets [118](https://docs.swmansion.com/react-native-reanimated/docs/guides/web-support/). O plugin já está em `babel.config.js` e o `babel-preset-expo` 54.0.10 também o injeta quando o pacote existe. Suportados na web: shared values, `withTiming` e `withSpring`, `useAnimatedScrollHandler`, animações de layout (entering, exiting, layout) e as CSS transitions novas com `cubicBezier`. O app usa reanimated em um único componente (`ImageZoomModal`). Regra prática: na web tudo roda na thread JS, então animar só `transform` e `opacity`, nunca `width`, `height` ou `top` em listas.

**Curvas e springs.** `withSpring(v, { duration: 550, dampingRatio: 1 })` é o default documentado e coincide com o spring padrão do SwiftUI. `duration` e `dampingRatio` não podem ser combinados com `stiffness` e `damping` na mesma chamada [119](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/). `withTiming(v, { duration: 350, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })` reproduz a curva default do Core Animation. Nas CSS transitions do reanimated, `transitionTimingFunction` tem default `ease`, a mesma curva.

### 10.7 Transição de tela

Fato verificado: o `@react-navigation/native-stack` 6.11.0 na web renderiza todas as telas com `absoluteFill` e só alterna `display` entre `flex` e `none`, sem animação. A documentação diz que a opção `animation` só tem suporte no Android e iOS [121](https://reactnavigation.org/docs/6.x/native-stack-navigator/). `ios_from_right` nem existe na v6 do navigator (existe no react-native-screens, ver seção 11). O react-native-screens 4.16.0 na web é um View comum.

Alternativa recomendada, sem dependência nova (escolha nossa): `src/navigation/createAppStack.js` (native-stack) e `createAppStack.web.js` usando `createStackNavigator` do `@react-navigation/stack` 6.4.1 (já instalado) com `animationEnabled: true` e `TransitionPresets.SlideFromRightIOS`. O Metro escolhe a variante pelo sufixo, como já faz com `sentry.web.js`. O preset usa um spring de stiffness 1000, damping 500, mass 3 com overshootClamping, próximo do push do UIKit. Com Reduce Motion, `CardStyleInterpolators.forFadeFromCenter`. Ressalvas: gestos não são suportados na web pelo stack JS (o chevron e o Back do navegador fazem o pop), e a tela anterior fica montada durante a animação, o que custa mais memória que o `display: none`. Modais no stack JS usam `TransitionPresets.ModalPresentationIOS`. Uma segunda alternativa, `document.startViewTransition`, serve só para crossfade global e não foi testada com react-native-web.

### 10.8 Large title, tab bar e sticky

**Large title.** `headerLargeTitle` do native-stack é iOS-only [121](https://reactnavigation.org/docs/6.x/native-stack-navigator/) e o app já usa `headerShown: false`, então o cabeçalho é nosso. `LargeTitleHeader` com `useAnimatedScrollHandler` gravando `scrollY`, título grande com `opacity: interpolate(scrollY, [0, 40], [1, 0])`, título pequeno com o inverso e `translateY` de -8, barra com o `backdropFilter` e uma linha de 1 px cuja opacidade também interpola. Nas telas com FlatList ou SectionList, usar o `Animated.FlatList` do reanimated. Com Reduce Motion, só opacity.

**Tab bar.** O `@react-navigation/bottom-tabs` 6.x suporta `tabBarStyle: { position: 'absolute' }` e `tabBarBackground` devolvendo um elemento (a doc dá `BlurView` como exemplo literal), e lembra que com `position: 'absolute'` o conteúdo precisa de margem inferior via `useBottomTabBarHeight()` [122](https://reactnavigation.org/docs/6.x/bottom-tab-navigator/). Na web desktop, largura maior ou igual a 900 px, avaliar um `tabBar` customizado como sidebar, seguindo a regra de trocar tab bar por sidebar em espaços maiores (seção 3.2). Os nomes das rotas das tabs são API: só os labels mudam.

**Sticky e scroll edge.** A react-native-web implementa `stickyHeaderIndices` com `position: sticky; top: 0` em CSS, e o `StickySectionList.web.jsx` já existe. Funciona porque `body { overflow: hidden }` faz o ScrollView ser o ancestral rolável mais próximo, exigência do sticky [96](https://developer.mozilla.org/en-US/docs/Web/CSS/position). Cuidado com wrappers `overflow: 'hidden'` intermediários em cards: o sticky "gruda" neles. Um scroll edge effect por view, sem repetir em cabeçalhos de seção. `overscroll-behavior-y: contain` nos ScrollViews de modais no Safari.

### 10.9 Hover, foco e toque

A react-native-web expõe no `Pressable` o estado `hovered` e `onHoverIn`/`onHoverOut`, ativados só por mouse [105](https://necolas.github.io/react-native-web/docs/pressable/). Então `style={({ pressed, hovered, focused }) => [...]}` cobre os três estados: hover = fundo `fillQuaternary`, pressed = `opacity: 0.55` ou `scale: 0.97` com transição de saída de 150 ms. Para foco de teclado, a react-native-web não tem pseudo-classes nem media queries no sistema de estilos [106](https://necolas.github.io/react-native-web/docs/styling/), então entra um CSS global web-only (`import './src/styles/web.css'` em `App.js`, ignorado no nativo): `[role=button]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }`, `@media (hover: hover) and (pointer: fine)` para efeitos só de mouse, `@media (pointer: coarse)` mantendo alvos de 44 px. Sem esse CSS o Chrome mostra o outline azul em todo clique de mouse em elemento com tabIndex, que parece bug. Hover nunca é a única pista de interatividade.

`touch-action: manipulation` nos elementos interativos desliga o double-tap-to-zoom e remove a necessidade de o navegador atrasar o click [99](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action). O `-webkit-tap-highlight-color: transparent` já está em `public/index.html`. Não aplicar `touch-action` em containers com pinch (`ImageZoomModal`).

### 10.10 Largura de leitura, safe area e alvos

**Largura.** `ReadableContent` com `{ width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: 20 }` envolvendo artigo, versículos, glossário e ajustes. A unidade `ch` é a largura do glifo zero, assumida como 0,5 em quando não é possível medir [95](https://developer.mozilla.org/en-US/docs/Web/CSS/length), então 65ch em 17 px dá cerca de 550 px, e a Apple usa um pouco mais. Grades de cards com `maxWidth: 1040`. Breakpoints com `useWindowDimensions()`: menos de 600 compacto, 600 a 899 regular, 900 ou mais largo (escolha nossa). Em FlatList, o wrapper vai em `contentContainerStyle`.

**Safe area.** `react-native-safe-area-context` 5.6 lê `env(safe-area-inset-*)` na web, que a MDN define como a distância segura das bordas do viewport e que só deixa de ser 0 com `viewport-fit=cover` [97](https://developer.mozilla.org/en-US/docs/Web/CSS/env). Hoje `public/index.html` não usa `viewport-fit=cover` e usa `apple-mobile-web-app-status-bar-style=black` de propósito, sem iPhone real para testar. Para o visual iOS 26 em modo standalone: `viewport-fit=cover`, `black-translucent`, `SafeAreaProvider` com `initialWindowMetrics`, `paddingTop: insets.top` no header e `paddingBottom: insets.bottom` na tab bar. Exige teste em iPhone real.

**Alvos.** Tokens `TAP.min = 44` e `TAP.compact = 28`. `hitSlop={{ top: 11, bottom: 11, left: 11, right: 11 }}` em ícones de 22 px expande a área sem mudar o layout. Na web desktop o WCAG 2.5.8 exige 24 px [93](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) e a Apple aceita 28 no macOS, então 44 cobre tudo. `gap: 12` entre botões com fundo e `gap: 24` entre ícones soltos, via flexbox gap.

### 10.11 Modo escuro e cores semânticas

Na web a preferência chega por `prefers-color-scheme`, que a react-native-web expõe via `useColorScheme()`. O `darkMode` ganha o valor "sistema" (seção 4.3). Em CSS global, `:root { color-scheme: light dark }` ajusta a cor do canvas, das barras de rolagem e dos controles de formulário ao esquema usado [98](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme). Barra de rolagem clara em app escuro é o detalhe que denuncia app web. `useColorScheme` devolve null sem `matchMedia`: tratar como claro. Testar Login e Signup, porque `color-scheme` muda inputs nativos.

### 10.12 Haptics na web

O `expo-haptics` 15.0.8 na web chama `navigator.vibrate` com padrões fixos (Light [40], Medium [50], Heavy [60], Success [40, 100, 40], selection [50]) e vira no-op silencioso se a API não existir. O Safari do iPhone não suporta a Vibration API em nenhuma versão [101](https://caniuse.com/vibration), então no iPhone web não há haptic nenhum. Política (escolha nossa): na web, vibrar só em Android e só em eventos discretos (concluir dezena, marcar como lido), nunca em seleção contínua, porque a vibração do Android é grosseira comparada ao Taptic Engine. O feedback principal na web é visual, e nunca um toast que some sozinho.

### 10.13 Listas agrupadas e cantos

`GroupedList` com container `{ marginHorizontal: 16, borderRadius: 12, backgroundColor: colors.card, overflow: 'hidden' }`, linhas com `minHeight: 44`, separador de `StyleSheet.hairlineWidth` com `marginLeft` igual a 16 mais a largura do ícone. Cabeçalho de seção em Footnote 13 caixa alta em `secondaryLabel`. A curva contínua do iOS não existe em CSS: `border-radius` é circular. `corner-shape: squircle` está chegando ao Chrome mas não é Baseline em 2026, então pode entrar como progressive enhancement com `@supports`, sem depender dele. `overflow: 'hidden'` no container quebra sticky de filhos e sombras.

---

## 11. Adaptação para Android

Plataforma: Android com Expo SDK 54.0.34 e React Native 0.81.5, em Expo Go e development build. Versões conferidas em `node_modules`: react-native-screens 4.16.0, reanimated 4.1.7, native-stack 6.11.0, bottom-tabs 6.x, expo-haptics 15.0.8, expo-font 14.0.11, expo-navigation-bar 5.0.10, expo-status-bar 3.0.9, safe-area-context 5.6, gesture-handler 2.28.0. `expo-blur` não instalado (a versão casada é 15.0.8).

### 11.1 Edge-to-edge é obrigatório

Com o SDK 54 e o React Native 0.81 mirando Android 16, edge-to-edge fica ligado em todos os apps Android e não pode ser desligado. Quem usava o plugin só para `enforceNavigationBarContrast` pode usar `androidNavigationBar.enforceContrast` no `app.json` [117](https://expo.dev/changelog/sdk-54). Isso casa com a regra da Apple de estender o conteúdo sob as barras (seção 5.3).

Fatos do projeto: `app.json` tem `android.edgeToEdgeEnabled: false` e `androidNavigationBar.backgroundColor`, e `ThemeContext.jsx` (linha 112) chama `NavigationBar.setBackgroundColorAsync(c.card)`. No SDK 54 o primeiro é ignorado (e some no SDK 55) e o segundo só funciona com edge-to-edge desligado, ou seja, é no-op. O que fazer (mudança na Fase 5, não agora): remover `edgeToEdgeEnabled: false` e `androidNavigationBar.backgroundColor/barStyle`, trocar por `androidNavigationBar.enforceContrast: false`, e no ThemeContext chamar `NavigationBar.setStyle(darkMode ? 'dark' : 'light')`. A tab bar do bottom-tabs já soma `insets.bottom` à altura via `SafeAreaProvider`. Telas com `headerShown: false` precisam de `useSafeAreaInsets().top` como padding (hoje só quatro telas usam insets). `setStyle` só tem efeito com `enforceContrast: false` e tem bug conhecido no emulador Android 15: testar em aparelho.

### 11.2 Status bar e SafeAreaView

Com edge-to-edge, a status bar já é translúcida e transparente. Manter só `<StatusBar style="auto" />` de expo-status-bar. Não usar `backgroundColor` nem `translucent`: no React Native 0.81, definir a status bar como translúcida está deprecado na API 35 e não tem efeito [110](https://reactnative.dev/docs/0.81/statusbar). O `SafeAreaView` do `react-native` foi deprecado no 0.81 e será removido. A recomendação é migrar para `react-native-safe-area-context` [111](https://reactnative.dev/blog/2025/08/12/react-native-0.81), que o projeto já usa. Padrão: `contentContainerStyle={{ paddingTop: headerShown ? 0 : insets.top, paddingBottom: tabBarHeight }}` em cada lista de tela principal.

### 11.3 Materiais e blur

O `BlurView` no Android é experimental. Com `experimentalBlurMethod` no padrão `none`, ele cai numa view semitransparente sem blur. Com `dimezisBlurView` usa a biblioteca BlurView nativa, com possível queda de performance e problemas gráficos [113](https://docs.expo.dev/versions/v54.0.0/sdk/blur-view/). Recomendação (escolha nossa): tab bar e headers com fundo semitransparente sem BlurView, `rgba(255,255,255,0.94)` no claro e `rgba(23,37,56,0.94)` no escuro, com `borderTopWidth: StyleSheet.hairlineWidth` e `elevation: 0` (senão a sombra do Material aparece sobre o fundo translúcido). Isso reproduz a leitura de material "thick", que é o que o HIG manda onde há texto. Blur de verdade só em um ou dois overlays estáticos, sem lista rolando por baixo (fundo do `ImageZoomModal`), com `dimezisBlurView` guardado por `Platform.OS === 'android'` e `blurReductionFactor` 4, porque o efeito percebido é mais forte que no iOS. Nunca BlurView sobre FlatList longa. No Android não há sinal de Reduce Transparency, então o fallback opaco é decisão de design.

### 11.4 Gesto de voltar e predictive back

No Android o "deslizar para voltar" é gesto de sistema. O react-native-screens 4.16.0 não implementa predictive back (preview do destino durante o arrasto), e o mantenedor afirma que é altamente provável que isso nunca entre na linha 4.x [123](https://github.com/software-mansion/react-native-screens/discussions/2540). Por isso: manter `android.predictiveBackGestureEnabled` ausente ou `false` (o SDK 54 já deixa `enableOnBackInvokedCallback="false"` no manifest), porque ligar faz o gesto disparar o pop antes da animação e pode quebrar `beforeRemove` e `BackHandler`. `gestureEnabled` e `fullScreenGestureEnabled` do native-stack são iOS-only. O `Tab.Navigator` com `backBehavior="history"` continua válido. Quando o screens lançar a próxima major com suporte, isso vai exigir React Navigation 7.

### 11.5 Push estilo iOS: ios_from_right

`screenOptions={{ animation: Platform.OS === 'android' ? 'ios_from_right' : 'default' }}` nos quatro `createNativeStackNavigator()` de `App.js`. Funciona com o native-stack 6.11.0 porque a prop `animation` é tipada como `ScreenProps['stackAnimation']` e repassada sem filtro ao react-native-screens 4.16.0, cujo tipo `StackAnimationTypes` inclui `ios_from_right` e `ios_from_left`. O `ios_from_left` entrou no screens 3.35.0 [124](https://github.com/software-mansion/react-native-screens/releases), e o `ios_from_right` está na linha 4.0. No Android o screens usa as animações XML `rns_ios_from_right_*`. É Android-only: no iOS resolve para a transição nativa, que é o desejado. A duração não é configurável no Android. Fallback: `slide_from_right`. Modais (`NoteEditor`) mantêm `slide_from_bottom`. A doc do React Navigation 6.x não lista `ios_from_right`, então a garantia vem do tipo e do código do screens, não da doc do navigator. A decisão da Fase 0 de "ios_from_right nas 3 plataformas" vale para iOS (nativo) e Android (esta opção). Na web é o `SlideFromRightIOS` da seção 10.7.

### 11.6 Curvas, springs e Reduce Motion

O reanimated 4.1.7 tem os dois modelos da Apple. `withTiming` com `Easing.bezier(0.25, 0.1, 0.25, 1)` reproduz a curva default. `withSpring` com `duration` e `dampingRatio` é o modelo perceptual, e a doc diz que a duração real é 1,5 vezes a perceptual [119](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/), então o 0,5 s da Apple mapeia direto sem multiplicar. Os defaults físicos do reanimated (mass 4, stiffness 900, damping 120) são mais lentos que o press da Apple: sempre passar config explícita. Reanimated 4 só roda na Nova Arquitetura, que já é o padrão no SDK 54, inclusive no Expo Go.

`AccessibilityInfo.isReduceMotionEnabled()` e o evento `reduceMotionChanged` funcionam no Android: o booleano é verdadeiro quando o ajuste de remover animações está ligado ou a escala de animação de transição das opções de desenvolvedor está em "Animation off". `prefersCrossFadeTransitions`, `isReduceTransparencyEnabled` e `isBoldTextEnabled` são iOS-only [109](https://reactnative.dev/docs/accessibilityinfo). Uso: hook `useReduceMotion()` no ThemeContext que assina o listener e expõe `reduceMotion` para trocar `ios_from_right` por `fade` e zerar animações de card. O reanimated já pula para `toValue` com `ReduceMotion.System`.

### 11.7 Haptics

O `expo-haptics` 15.0.8 no Android simula tudo com `Vibrator.createWaveform`. Tabela real do código nativo: Light e Soft são o mesmo pulso (50 ms, amplitude 30), Medium e Rigid idem (43 ms, amplitude 50), Heavy 60 ms amplitude 70, `selectionAsync` igual a Light, Success 40/100/40, Warning 40/120/60, Error 60/100/40/80/50. As cinco nuances de impact viram três, e selection é indistinguível de light. A doc do Expo diz que a API Vibrator do Android não é recomendada para haptics e que se deve usar `performAndroidHapticsAsync`, similar ao haptic do iOS e sem permissão VIBRATE [116](https://docs.expo.dev/versions/v54.0.0/sdk/haptics/). A doc do Android é direta: entre haptic "buzzy" e nenhum haptic para feedback de toque, escolha nenhum [125](https://developer.android.com/develop/ui/views/haptics/haptic-feedback).

Mapeamento (tabela da seção 8.3): selection para `Segment_Tick` (API 34+, fallback `Clock_Tick`), impact Light para `Context_Click`, Medium para `Virtual_Key`, Heavy para `Long_Press`, Success para `Confirm` (API 30+), Error para `Reject` (API 30+), Warning para `Long_Press`. `performAndroidHapticsAsync` lança exceção quando a constante não existe na API do aparelho (só `Clock_Tick`, `Context_Click`, `Keyboard_Tap`, `Long_Press` e `Virtual_Key` têm fallback garantido), então sempre `.catch(() => {})`. Ele respeita o ajuste "Vibração ao tocar" do sistema, o que o Vibrator ignora. Hoje `RosaryScreen.jsx` chama `impactAsync` direto em duas linhas: passa a usar o helper central. Não há API JS para saber se o aparelho tem vibrador, então o toggle "Vibração" em Ajustes fica sempre visível.

### 11.8 Feedback de toque: ripple

No Android o elemento padrão é o ripple do Material. `Pressable` com `android_ripple={{ color, borderless: false, foreground: true }}` e `style={({ pressed }) => [...]}` [108](https://reactnative.dev/docs/pressable). `foreground: true` desenha o ripple por cima de imagens de card. Para ícones circulares, `borderless: true` com `radius` em torno de 24. Cor: rgba do navy com alfa 0,12 a 0,16 (escolha nossa), ou `PlatformColor('?attr/colorControlHighlight')`. O `Pressable` precisa de `overflow: 'hidden'` e `borderRadius` no próprio elemento para o ripple respeitar os cantos. Ripple e escala juntos soam "duplos": um por componente. Hoje 41 arquivos usam `TouchableOpacity`, 4 usam `Pressable` e nenhum usa ripple. Nasce `src/components/Touchable.jsx` que encapsula isso, com opacidade no iOS, ripple no Android e `hovered` na web.

### 11.9 Fontes

Roboto é a fonte de sistema do Android e SF Pro a do iOS [115](https://docs.expo.dev/develop/user-interface/fonts/). Para o papel da New York, `fontFamily: 'serif'`, que o Android resolve pelo `fonts.xml` para Noto Serif. O `ReactFontManager` do RN 0.81 cai em `Typeface.create(fontFamilyName, style)` quando não há asset com esse nome, ou seja, o alias do sistema. Cormorant via plugin `expo-font` no `app.json`, que no Android registra a família pelo nome do arquivo e só funciona em development build [115](https://docs.expo.dev/develop/user-interface/fonts/). No Expo Go, `useFonts()` em runtime. Noto Serif não tem os tamanhos ópticos da New York, e fabricantes podem substituir (Samsung). Manter uma sans e uma serifa de sistema, mais a Cormorant só em títulos, como pede o HIG.

**Pesos.** No RN 0.81 o peso numérico só é honrado em API 28+. Abaixo disso cai em normal ou bold [126](https://github.com/aMarCruz/react-native-text-size/wiki/About-Android-Fonts). Como o Roboto moderno tem 100 a 900, `'500'` e `'600'` funcionam em Android 9+. Em API 27 ou menor, `fontFamily: 'sans-serif-medium'` como alias explícito. `includeFontPadding: false` no Android em todos os text styles, porque o padding extra desalinha o centro vertical (escolha nossa, prática corrente).

### 11.10 Tab bar e large title

Tab bar: `tabBarStyle: { position: 'absolute', backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0 }` e `tabBarBackground` com o rgba a 0,94. Ícones `focused ? 'book' : 'book-outline'`. `tabBarHideOnKeyboard: true`. Minimizar ao rolar não existe no bottom-tabs 6.x e no Android a convenção Material é barra fixa. Large title: `headerLargeTitle` é iOS-only e exige `contentInsetAdjustmentBehavior="automatic"` [121](https://reactnavigation.org/docs/6.x/native-stack-navigator/). No Android, o mesmo `LargeTitleHeader` da seção 10.8, com a opacidade rodando na UI thread. O Material 3 tem "Large top app bar" com comportamento parecido, então não destoa.

### 11.11 Performance em aparelhos fracos

Worklets são funções curtas de JavaScript que rodam na UI thread, e a maior parte do código do reanimated é workletizada automaticamente [120](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary/). Isso é o que evita a animação travar quando a thread JS está ocupada montando um capítulo da Bíblia. Regras práticas (escolha nossa): animar só `transform` e `opacity`, `entering`/`exiting` só em listas curtas e desligados em FlatList de 100 ou mais itens, `useNativeDriver: true` em qualquer `Animated` do core que sobrar, springs com `dampingRatio: 1`, transições de tela com o react-native-screens (Fragment transitions nativas), sem `shadow` ou `elevation` grandes em cards animados (a sombra é rasterizada de novo a cada frame). Testar em um aparelho de 2 GB com Android 10 antes de aprovar qualquer animação de lista.

---

## 12. Proposta de tokens para o app

Esta seção traduz tudo acima em números para um futuro `src/theme/tokens.js`. Convenção de marcação: **(Apple)** quando o valor vem de regra citada, **(escolha nossa)** quando é derivado ou decisão do projeto. O arquivo não é criado nesta fase. A prioridade definida na Fase 0 é: tokens primeiro (espaço, raio, tipo, sombra), chrome global depois, microinterações por último.

### 12.1 Estado atual (o que os tokens substituem)

| Aspecto | Hoje em `src/` | Problema |
|---|---|---|
| Paleta | `LIGHT` e `DARK` com 17 chaves em `ThemeContext.jsx` | Chaves por aparência (`textMuted`, `badgeBg`), não por papel |
| Escala de fonte | `FONT_SCALES` pequeno 0,85, normal 1, grande 1,15, enorme 1,35, e `fs(n) = max(11, round(n * scale))` | Máximo de 1,35 não chega aos 200 por cento. O piso de 11 já está certo |
| Tamanhos de texto | Números soltos em cada `makeStyles(colors, fs)` | Sem escala, sem lineHeight consistente |
| Peso | `fontWeight: 'bold'` 158 vezes, `'600'` 66, `'700'` 2, `'500'` 1 | Bold como ênfase padrão |
| Fonte | Um único `fontFamily: 'monospace'` | Tudo herda a fonte padrão da plataforma sem controle |
| Raio | 20 valores literais: 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 19, 20, 26, 32, 44 (o levantamento anterior contou 15, a diferença são valores usados uma vez) | Sem sistema. 10 e 12 são os mais usados (51 e 61 ocorrências) |
| Sombra | Um único uso (`shadowOpacity 0.25`, `shadowRadius 16`, `elevation 12`) | Sem padrão |
| Movimento | reanimated 4 instalado, usado em um componente | Sem durações nem curvas definidas |
| Toque | `TouchableOpacity` em 41 arquivos, `Pressable` em 4, `android_ripple` em nenhum | Feedback de toque inconsistente entre plataformas |

### 12.2 Espaço

Grade de 4 pt (escolha nossa). A Apple não formaliza uma grade. O que ela publica é a margem padrão de 8 pt por lado em subviews [29](https://developer.apple.com/tutorials/data/documentation/uikit/uiview/layoutmargins.json), o exemplo de 20 pt como margem mínima do sistema [30](https://developer.apple.com/tutorials/data/documentation/uikit/uiviewcontroller/systemminimumlayoutmargins.json), os 8 pt do exemplo canônico do Auto Layout [31](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/AutolayoutPG/AnatomyofaConstraint.html) e as folgas de 12 e 24 pt entre controles [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json). A grade de 4 contém todos esses valores.

| Token | Valor (pt) | Uso | Origem |
|---|---|---|---|
| `space.xxs` | 4 | Entre ícone e rótulo, entre linhas de metadados | grade (escolha nossa) |
| `space.xs` | 8 | Entre elementos irmãos, margem interna padrão | 8 pt padrão de layout margins e Auto Layout (Apple) |
| `space.sm` | 12 | Folga entre controles com bezel, padding de chip e badge | 12 pt de folga com bezel (Apple) |
| `space.md` | 16 | Margem de tela em iPhone compacto, padding interno de card, inset do separador | convenção de 16 pt (não citável) e concentricidade (escolha nossa) |
| `space.lg` | 20 | Margem mínima do sistema em telas maiores, padding de card grande | 20 pt do exemplo de margem mínima (Apple) |
| `space.xl` | 24 | Folga entre elementos sem bezel, espaço entre seções de lista agrupada | 24 pt de folga sem bezel (Apple). Uso entre seções é escolha nossa |
| `space.xxl` | 32 | Espaço antes de um novo bloco na Home, entre título de seção e conteúdo anterior | escolha nossa |
| `space.xxxl` | 40 | Respiro abaixo do large title, topo de tela sem header | escolha nossa |
| `space.huge` | 48 | Espaço entre grupos de cards na Home | escolha nossa |
| `space.giant` | 64 | Padding inferior de listas (acima do que a tab bar exige) | escolha nossa |

Regras derivadas:

- Margem lateral de tela: `space.md` (16) em largura menor que 600, `space.lg` (20) de 600 para cima (escolha nossa, alinhada ao relato de 16 e 20 do sistema).
- Padding interno de card: `space.md`. Card dentro de card: `space.sm`.
- Entre seções de lista agrupada: `space.xl`. Entre cabeçalho de seção e o primeiro item: 6 pt (escolha nossa, fora da grade de propósito, porque 4 é pouco e 8 solta o cabeçalho do grupo).
- Alvo de toque: `tap.min = 44`, `tap.compact = 28` (Apple).

### 12.3 Raio

Poucos valores (escolha nossa). A Apple não publica raios, só o modelo: curva contínua, cápsula igual à metade da altura, concêntrico igual ao raio do pai menos o padding [85](https://developer.apple.com/videos/play/wwdc2025/356/), [38](https://developer.apple.com/tutorials/data/documentation/swiftui/concentricrectangle.json).

| Token | Valor | Uso | Valores atuais que ele absorve |
|---|---|---|---|
| `radius.xs` | 4 | Barra de progresso, tag pequena, marcador de versículo | 2, 3, 4 |
| `radius.sm` | 8 | Botão, input, chip, badge, imagem dentro de card (12 menos 4 de padding) | 5, 6, 7, 8, 9 |
| `radius.md` | 12 | Card, linha de lista agrupada (inset grouped), sheet pequena | 10, 11, 12, 13, 14 |
| `radius.lg` | 18 | Card grande com imagem, hero, modal, sheet | 16, 18, 19, 20 |
| `radius.full` | 9999 | Cápsula (botão pill, segmented) e círculo (avatar, ícone de fundo) | 26, 32, 44 (os três são metade de 52, 64 e 88, ou seja, círculos) |

Regra de concentricidade: imagem ou botão dentro de um container com `radius.md` (12) e padding `space.xs` (8) usa 4 (`radius.xs`). Dentro de `radius.lg` (18) com padding `space.md` (16), usa 2, que arredondamos para `radius.xs`. Na prática o app só precisa de cinco tokens e da regra "raio do filho = raio do pai menos o padding".

### 12.4 Escala tipográfica

Os tamanhos, line heights e pesos são da tabela do iOS [1](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json). A família, o tracking por plataforma e a coluna `fixed` são escolha nossa.

| Token | Tamanho | Line height | Peso | Família | Tracking iOS e web (pt) | fixed |
|---|---|---|---|---|---|---|
| `text.largeTitle` | 34 | 41 | 600 | display (Cormorant SemiBold) | 0 | não |
| `text.title1` | 28 | 34 | 600 | display | 0 | não |
| `text.title2` | 22 | 28 | 600 | display | 0 | não |
| `text.title3` | 20 | 25 | 600 | sans | -0,45 | não |
| `text.headline` | 17 | 22 | 600 | sans | -0,43 | não |
| `text.body` | 17 | 22 | 400 | sans | -0,43 | não |
| `text.bodySerif` | 17 | 26 | 400 | serif | -0,07 | não |
| `text.callout` | 16 | 21 | 400 | sans | -0,32 (interpolado, escolha nossa) | não |
| `text.subhead` | 15 | 20 | 400 | sans | -0,24 (interpolado, escolha nossa) | não |
| `text.footnote` | 13 | 18 | 400 | sans | -0,08 (interpolado, escolha nossa) | não |
| `text.caption1` | 12 | 16 | 400 | sans | 0 | sim (tab bar) |
| `text.caption2` | 11 | 13 | 400 | sans | 0 | não |

Notas:

- Pesos: nos títulos em Cormorant o peso é sempre 600, o único empacotado. Se um dia a sans for usada em Large Title, Title 1 ou Title 2, o peso enfatizado da Apple é 700 (Bold). Ênfase de `body` até `caption2` é `'600'` (Semibold, Apple).
- `text.bodySerif` é o Body com loose leading para leitura longa, mais 2 pt de ar (Apple) e mais 2 (escolha nossa) pela Georgia ter olho menor. É o estilo de artigos e versículos.
- Tracking no Android: 0 em tudo (Roboto tem métricas diferentes da SF).
- Os valores interpolados de tracking para 16, 15 e 13 pt não foram lidos na tabela da Apple. São interpolação linear entre os pontos publicados (12 = 0, 17 = -0,43) e ficam marcados como escolha nossa até serem conferidos.
- `fixed: true` faz o estilo ignorar `fs()`. Só o rótulo da tab bar usa isso, seguindo a regra de que títulos de aba não crescem.

Composição com `fs()`:

```
useTextStyle('body') devolve
  fontSize:      fs(17)                 -> max(11, round(17 * scale))
  lineHeight:    round(22 * scale)      -> mantém a razão 1,29
  fontWeight:    '400'
  fontFamily:    fonts.sans             -> por plataforma
  letterSpacing: -0.43 (iOS, web) ou 0 (Android), sem escalar
```

Escala de fonte proposta (escolha nossa, multiplicadores derivados do Body do Dynamic Type):

| Nome | Multiplicador | Body resultante | Equivalente Apple |
|---|---|---|---|
| pequeno | 0,85 | 14 | entre xSmall (14) e Small |
| normal | 1,00 | 17 | Large |
| grande | 1,15 | 20 | cerca de xLarge |
| enorme | 1,35 | 23 | xxxLarge |
| muito grande (novo) | 1,65 | 28 | AX1 |
| máximo (novo) | 2,00 | 34 | entre AX1 e AX2, cumpre os 200 por cento |

### 12.5 Sombras

Entre interfaces claras, uma sombra difusa basta. No escuro, sombras funcionam pior e a separação vem do fundo mais claro [84](https://developer.apple.com/videos/play/wwdc2019/808/). A Apple não publica valores de sombra. Todos os números abaixo são escolha nossa.

| Token | Claro | Escuro | Android | Web |
|---|---|---|---|---|
| `shadow.none` | nenhuma | nenhuma | `elevation: 0` | `boxShadow: 'none'` |
| `shadow.card` | cor #1a3a5c, opacidade 0,08, raio 12, offset 0 e 4 | nenhuma. Fundo `card` sobre `bg` mais borda hairline `separator` | `elevation: 2` no claro, 0 no escuro | `0 4px 12px rgba(26,58,92,0.08)` |
| `shadow.floating` (menu, popover, botão flutuante) | cor #1a3a5c, opacidade 0,16, raio 24, offset 0 e 8 | fundo `elevated` (#1e2f47) mais borda hairline. Sem sombra | `elevation: 6` no claro, 0 no escuro | `0 8px 24px rgba(26,58,92,0.16)` |
| `shadow.sheet` | cor #000, opacidade 0,20, raio 32, offset 0 e -4 | fundo `elevated`, sem sombra | `elevation: 12` no claro, 0 no escuro | `0 -4px 32px rgba(0,0,0,0.2)` |

O único uso atual (opacidade 0,25, raio 16, elevation 12) vira `shadow.floating`. A cor navy em vez de preto na sombra clara é para a sombra combinar com o creme (escolha nossa).

### 12.6 Durações e curvas

Nomes por situação, como pedido na Fase 0. Os valores que são da Apple estão ligados. O resto é escolha nossa, coerente com a tabela 7.5.

| Token | Valor | Curva ou spring (reanimated) | Origem |
|---|---|---|---|
| `motion.duration.toque` | 150 ms | `withSpring(v, { duration: 150, dampingRatio: 1 })` | response 0,15 s do interactiveSpring [69](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/interactivespring(response:dampingfraction:blendduration:).json). Uso na saída do press é escolha nossa |
| `motion.duration.aba` | 200 ms | `withTiming(v, { duration: 200, easing: motion.easing.sistema })` | escolha nossa |
| `motion.duration.layout` | 350 ms | `withTiming(v, { duration: 350, easing: motion.easing.sistema })` | 0,35 s do easing do SwiftUI [61](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/easeinout.json) |
| `motion.duration.tela` | nativo | `animation: 'ios_from_right'` (nativo), `SlideFromRightIOS` (web) | não publicado pela Apple. Fica com o sistema |
| `motion.duration.pesado` | 500 ms | `withSpring(v, { duration: 500, dampingRatio: 1 })` | preset smooth [64](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/smooth(duration:extrabounce:).json) |
| `motion.duration.padrao` | 550 ms | `withSpring(v, { duration: 550, dampingRatio: 1 })` | default do SwiftUI [63](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/default.json) |
| `motion.stagger` | 40 ms | `FadeIn.duration(250).delay(i * 40)` | escolha nossa, até 8 itens |
| `motion.easing.sistema` | cubic-bezier(0.25, 0.1, 0.25, 1) | `Easing.bezier(0.25, 0.1, 0.25, 1)` | default do Core Animation [57](https://developer.apple.com/tutorials/data/documentation/quartzcore/camediatimingfunctionname/default.json) |
| `motion.easing.inOut` | cubic-bezier(0.42, 0, 0.58, 1) | `Easing.bezier(0.42, 0, 0.58, 1)` | easeInEaseOut [58](https://developer.apple.com/tutorials/data/documentation/quartzcore/camediatimingfunctionname/easeineaseout.json) |
| `motion.easing.out` | cubic-bezier(0, 0, 0.58, 1) | `Easing.bezier(0, 0, 0.58, 1)` | easeOut [59](https://developer.apple.com/tutorials/data/documentation/quartzcore/camediatimingfunctionname/easeout.json) |
| `motion.spring.smooth` | duration 500, dampingRatio 1 | ou `{ mass: 1, stiffness: 157.9, damping: 17.6 }` para bounce 0,3 | presets [64](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/smooth(duration:extrabounce:).json), conversão [70](https://developer.apple.com/tutorials/data/documentation/swiftui/spring.json) |
| `motion.spring.snappy` | duration 500, dampingRatio 0,85 | | preset snappy, bounce 0,15 [65](https://developer.apple.com/tutorials/data/documentation/swiftui/animation/snappy(duration:extrabounce:).json). Conversão bounce para dampingRatio é escolha nossa |
| `motion.spring.gesto` | duration 500, dampingRatio 0,8 | fechar sheet por swipe | 80 por cento de damping com momento [90](https://developer.apple.com/videos/play/wwdc2018/803/) |
| `motion.scale.press` | 0,97 | | escolha nossa |
| `motion.opacity.press` | 0,55 | | escolha nossa |
| Reduce Motion | tudo em fade, `dampingRatio: 1`, sem scale nem translate | `reduceMotion: ReduceMotion.System` (default do reanimated) | [2](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json) |

### 12.7 Materiais

A Apple não publica raio de blur, saturação nem opacidade dos materiais. Todos os valores são calibração nossa, a validar no protótipo da Fase 4.

| Token | iOS (`expo-blur`) | Web (`backdrop-filter`) | Android | Com "Reduzir transparência" |
|---|---|---|---|---|
| `material.bar` (tab bar, header) | `tint` "light" ou "dark" conforme o tema, `intensity` 80 | `saturate(180%) blur(16px)` mais `rgba(245,240,232,0.72)` no claro e `rgba(23,37,56,0.72)` no escuro | `rgba(255,255,255,0.94)` claro, `rgba(23,37,56,0.94)` escuro, sem blur | `bg` opaco |
| `material.overlay` (fundo de modal sobre imagem) | `tint` "dark", `intensity` 60, mais camada `rgba(0,0,0,0.35)` | `blur(20px)` mais `rgba(0,0,0,0.35)` | `dimezisBlurView`, `intensity` 50, `blurReductionFactor` 4, mais `rgba(0,0,0,0.35)` | `rgba(0,0,0,0.85)` opaco |
| `material.scrim` (atrás de sheet e action sheet) | `rgba(0,0,0,0.4)` sem blur | idem | idem | idem |

Os 35 por cento da camada escura do overlay vêm da regra do clear Liquid Glass sobre conteúdo claro [6](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json). O resto é nosso. Regra de código: nenhuma superview da barra com `opacity < 1`, e o blur nunca é animado (só o conteúdo por baixo).

### 12.8 Haptics

Regras (Apple, seção 8.3) mais o mapeamento (escolha nossa):

- Três geradores, cada um só com o significado documentado. Selection para série de valores, impact para "colisão", notification para resultado de tarefa.
- Nenhum haptic em interação frequente (toque em card, troca de aba) nem em movimento contínuo (scroll, arrastar).
- Sempre acompanhado de feedback visual, nunca sozinho.
- Toggle "Vibração" em Ajustes, persistido, e o helper retorna cedo quando desligado.
- iOS: `expo-haptics` (`selectionAsync`, `impactAsync`, `notificationAsync`). Android: `performAndroidHapticsAsync` com o mapa da seção 11.7 e `.catch`. Web: só Android via `navigator.vibrate` e só em eventos discretos.
- Intensidade: leve em seleção e conclusão pequena, média em long-press, success e error só em fim de tarefa.

### 12.9 Forma do futuro `src/theme/tokens.js`

Bloco ilustrativo, só a forma. Os valores são os das tabelas acima.

```js
// src/theme/tokens.js (proposta, não criar nesta fase)
import { Platform } from 'react-native'
import { Easing } from 'react-native-reanimated'

export const space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40, huge: 48, giant: 64 }

export const radius = { xs: 4, sm: 8, md: 12, lg: 18, full: 9999 }

export const tap = { min: 44, compact: 28 }

export const fonts = {
  sans: Platform.select({ ios: 'System', android: undefined, web: 'System' }),
  serif: Platform.select({ ios: 'Georgia', android: 'serif', web: 'ui-serif, Georgia, "Times New Roman", "Noto Serif", serif' }),
  display: 'CormorantGaramond-SemiBold',
}

// Tamanhos no Large (padrão do iOS). fs() escala fontSize e lineHeight.
export const text = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '600', family: 'display', tracking: 0 },
  title1:     { fontSize: 28, lineHeight: 34, fontWeight: '600', family: 'display', tracking: 0 },
  title2:     { fontSize: 22, lineHeight: 28, fontWeight: '600', family: 'display', tracking: 0 },
  title3:     { fontSize: 20, lineHeight: 25, fontWeight: '600', family: 'sans', tracking: -0.45 },
  headline:   { fontSize: 17, lineHeight: 22, fontWeight: '600', family: 'sans', tracking: -0.43 },
  body:       { fontSize: 17, lineHeight: 22, fontWeight: '400', family: 'sans', tracking: -0.43 },
  bodySerif:  { fontSize: 17, lineHeight: 26, fontWeight: '400', family: 'serif', tracking: -0.07 },
  callout:    { fontSize: 16, lineHeight: 21, fontWeight: '400', family: 'sans', tracking: -0.32 },
  subhead:    { fontSize: 15, lineHeight: 20, fontWeight: '400', family: 'sans', tracking: -0.24 },
  footnote:   { fontSize: 13, lineHeight: 18, fontWeight: '400', family: 'sans', tracking: -0.08 },
  caption1:   { fontSize: 12, lineHeight: 16, fontWeight: '400', family: 'sans', tracking: 0, fixed: true },
  caption2:   { fontSize: 11, lineHeight: 13, fontWeight: '400', family: 'sans', tracking: 0 },
}

export const shadow = {
  none: { light: {}, dark: {} },
  card: {
    light: { shadowColor: '#1a3a5c', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
    dark: { elevation: 0 },
  },
  floating: {
    light: { shadowColor: '#1a3a5c', shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
    dark: { elevation: 0 },
  },
}

export const motion = {
  duration: { toque: 150, aba: 200, layout: 350, pesado: 500, padrao: 550, stagger: 40 },
  easing: {
    sistema: Easing.bezier(0.25, 0.1, 0.25, 1),
    inOut: Easing.bezier(0.42, 0, 0.58, 1),
    out: Easing.bezier(0, 0, 0.58, 1),
  },
  spring: {
    press: { duration: 150, dampingRatio: 1 },
    smooth: { duration: 500, dampingRatio: 1 },
    snappy: { duration: 500, dampingRatio: 0.85 },
    gesto: { duration: 500, dampingRatio: 0.8 },
    padrao: { duration: 550, dampingRatio: 1 },
  },
  press: { scale: 0.97, opacity: 0.55 },
}

export const material = {
  bar: {
    ios: { tint: 'light', intensity: 80 },
    web: { backdropFilter: 'saturate(180%) blur(16px)', alpha: 0.72 },
    android: { alpha: 0.94 },
  },
  overlay: { dim: 'rgba(0,0,0,0.35)' },
  scrim: 'rgba(0,0,0,0.4)',
}
```

### 12.10 Como conversa com `ThemeContext.jsx`

O `ThemeContext` continua dono de tudo que depende de estado: `colors` (agora com papéis semânticos e o par `elevated`), `darkMode` (com o valor "sistema"), `fontSize` e `scale`, `fs(n)`, e os novos `reduceMotion`, `reduceTransparency` e `haptics`. Os tokens são constantes puras importadas de `src/theme/tokens.js` e não dependem de estado, com uma exceção: o material e a sombra têm variante por modo, resolvida no contexto.

Proposta (escolha nossa):

- `useTheme()` passa a devolver `{ colors, fs, scale, darkMode, space, radius, tap, fonts, motion, useTextStyle, material, shadow }`. `space`, `radius`, `tap`, `fonts` e `motion` são os objetos de `tokens.js` sem alteração. `shadow` e `material` já vêm resolvidos para o modo atual.
- `useTextStyle(nome)` vive no contexto porque precisa de `fs()` e da plataforma: devolve `{ fontSize: fs(t.fontSize), lineHeight: round(t.lineHeight * scale), fontWeight, fontFamily: fonts[t.family], letterSpacing: Platform.OS === 'android' ? 0 : t.tracking, includeFontPadding: false }`, e ignora a escala quando `t.fixed`.
- `makeStyles(colors, fs)` nas telas vira `makeStyles(theme)` e passa a usar `theme.space.md` em vez de `16`, `theme.radius.md` em vez de `12`, `theme.text.body` em vez de `{ fontSize: fs(16) }`. A migração é por tela, sem big bang, porque os aliases `primary` e `primaryText` continuam existindo.
- Os tetos da Fase 0 ficam mensuráveis: a Cormorant subsetada entra como asset único (limite 300 KB), e o `expo-blur` mais `expo-linear-gradient` mais `expo-font` são as únicas dependências novas (limite de 150 KB gzip no bundle web, a conferir no `expo export`).

---

## 13. Perguntas abertas e claims descartadas

### 13.1 Perguntas abertas

Consolidadas das oito pesquisas temáticas e das duas de plataforma. Cada uma precisa de decisão ou de medição antes ou durante a Fase 5.

**Tipografia**

1. Comprimento de linha para leitura longa: a Apple não publica número. O `readableContentGuide` define a largura por tamanho de Dynamic Type sem valor na documentação. Adotamos 680 pt como convenção nossa.
2. Apple Books usa New York, mas não há tamanho nem leading publicado para o corpo de leitura. Partimos de Body 17 com loose leading.
3. Licença: SF Pro e New York só são licenciadas para plataformas Apple. No Android e na web usamos Roboto, Segoe, Georgia e Noto Serif via pilha de sistema. A Cormorant (SIL OFL) é a única empacotada.
4. Tracking em React Native: `letterSpacing` não se ajusta por tamanho e só faz sentido com a SF de fato renderizada. Os valores para 13, 15 e 16 pt são interpolação nossa.
5. `fs()` versus `PixelRatio.getFontScale()` do sistema: decidir se a escala do app multiplica o ajuste do sistema (respeitando o tamanho de fonte do Android e do iOS) ou o substitui, e definir `maxFontSizeMultiplier` por token. Não foi verificado com fonte oficial nesta rodada.

**Layout**

6. Margem lateral de 16 e 20 pt: nenhum documento oficial atual publica. Vem de relatos de desenvolvedor e fóruns.
7. Altura de linha de 44 pt: hoje a Apple só publica 44 como tamanho de controle. `rowHeight` é `automaticDimension` e `defaultMinListRowHeight` não tem valor publicado.
8. Largura do readable content guide: terceiros citam cerca de 672 pt para o tamanho padrão, não confirmado em fonte Apple.
9. Raios de canto: a Apple não publica small, medium, large nem o raio do inset grouped. Precisariam ser medidos nos Apple Design Resources.
10. Espaçamento entre seções e altura de cabeçalho: só valores semânticos.

**Cor**

11. Opacidades de `secondaryLabel`, `tertiaryLabel` e `quaternaryLabel` (os 0,60, 0,30 e 0,18 que circulam) não estão na web da Apple, só nos Design Resources. Confirmar antes de virar token.
12. Valores RGB de `systemBackground` e família grouped, e dos fundos base e elevated, não constam do HIG atual. Só branco e preto puros foram confirmados. Os cinzas `systemGray6/5/4` são a referência mais próxima.
13. Cor e opacidade do `separator` translúcido não são publicadas.

**Materiais**

14. Raio de blur, saturação e opacidade de cada material padrão: não publicados. Os valores de `expo-blur` e `backdrop-filter` são calibração nossa, a validar no protótipo.
15. Altura, curva e duração do scroll edge effect: só descrições qualitativas.
16. Raio das sheets e inset das half sheets no iOS 26: mencionados sem valor.
17. A opção de "look preferido" do Liquid Glass nos ajustes do aparelho não é detalhada para componentes customizados.

**Barras**

18. Altura da tab bar (49 pt em retrato) não foi confirmada em nenhuma fonte aberta. O bottom-tabs cuida disso.
19. Altura da barra com large title (96 pt) só em blog de terceiros. No iOS 26 o large title rola com o conteúdo, então a altura fixa deixou de descrever a barra.
20. Dimensões de ícones de tab bar e navigation bar só num espelho do HIG do iOS 10. Com SF Symbols a Apple parou de publicar tamanhos fixos.
21. Duração e curva do encolhimento do large title e da minimização da tab bar: não publicadas.
22. A aba de busca do iOS 26 e o `tabBarMinimizeBehavior` são recursos nativos do `UITabBarController` sem equivalente no bottom-tabs 6.x.

**Movimento e microinterações**

23. Duração do push e pop do `UINavigationController`: não está em nenhuma página aberta.
24. A "duração típica de 0,3 s" do `UIView.animate` não é default da API nem aparece na doc. O único default é 0,35 s do easing do SwiftUI.
25. Stagger: a Apple não publica delay entre itens. Os 40 ms são nossos.
26. Feedback visual de toque (opacidade, escala, duração): sem número na Apple.
27. Distância do pull to refresh, duração das sheets, limiar de "um momento ou dois" antes do indicador: sem número.
28. Shimmer em skeleton: a Apple documenta o placeholder mascarado, não shimmer. Decidimos não usar.
29. Forma de onda dos haptics do sistema: não publicada.

**Plataformas**

30. `babel.config.js` lista `react-native-worklets/plugin` e o `babel-preset-expo` também o injeta. Confirmar no build web se roda duas vezes.
31. Migrar para `@react-navigation/stack` na web exige um `.web.js` para a fábrica dos cinco navigators e conferir `presentation: 'modal'` e `headerShown: false` um a um. O custo de memória de manter a tela anterior montada na Bíblia não foi medido.
32. `document.startViewTransition` com react-native-web não foi testado em fonte oficial.
33. Safe area em modo standalone no iPhone (`viewport-fit=cover`) só pode ser validada em aparelho real.
34. React Navigation 7 tem `ios_from_right` no navigator e melhorias web. O upgrade não foi avaliado.
35. Sheets com detents (`presentation: 'formSheet'`, `sheetAllowedDetents`) só existem no native-stack 7.x. No 6.11 só há `modal`. Decidir entre subir para a v7 ou bottom sheet próprio com gesture-handler e reanimated.
36. Predictive back no Android: reavaliar quando o react-native-screens lançar a próxima major.
37. Blur no Android: se o protótipo usar blur em algum lugar, medir FPS com `dimezisBlurView` num aparelho fraco antes de decidir.
38. `expo-navigation-bar setStyle()` tem bug no emulador Android 15. Testar em aparelho.
39. Reduce Transparency e Increase Contrast na web dependem de ajustes próprios, porque o Safari não expõe as media queries.

### 13.2 Claims descartadas pelo redator

O verificador não descartou nenhuma das 303 claims. As oito abaixo ficaram fora deste documento por decisão do redator.

| Id | O que dizia | Motivo do descarte |
|---|---|---|
| layout-05 | Relato de fórum sobre `layoutMargins.left` de 16 px no iPhone 8 e 20 px no iPhone 12 | Fonte é opinião de usuário no fórum da Apple, usa px em vez de pt, e o pesquisador tinha invertido o sentido (o thread descreve um desalinhamento, não explica o alinhamento). Os 16 e 20 entram só como convenção não citável. |
| layout-07 | `cellLayoutMarginsFollowReadableWidth` centralizaria o conteúdo das linhas em telas largas | A citação existe só como abstract de link "see also" e a parte da centralização é extrapolação. A regra útil (readable width) já está coberta por layout-06. |
| barras-08 | Barra com large title mede 96 pt | Blog de terceiros (iOS 11). Não há número em fonte Apple aberta, e no iOS 26 o large title rola com o conteúdo, então o valor deixou de descrever a barra. |
| barras-30 | Ícones de tab bar de cerca de 25x25 pt e de navigation bar de 22x22 pt | Espelho de terceiros do HIG do iOS 10. O HIG atual recomenda SF Symbols e não publica mais essa tabela. |
| cor-30 | Usar cor de fundo só quando há algo a comunicar, evitando tela cheia colorida em views que ficam muito tempo abertas | É orientação da seção watchOS da página de Color, com exemplos de treino e áudio. Não é regra geral de iOS. |
| cor-x7 | Dark Mode não existe em visionOS nem watchOS, e em casos raros aceita-se app só escuro | Não se aplica: o app roda em iOS, Android e web, e tem os dois modos. |
| tipografia-x06 | Tracking da SF Pro Rounded é sempre positivo (17 pt = +0,37 pt) | O app não usa Rounded. A única utilidade era avisar para não reaproveitar a tabela da SF Pro, o que já está dito na seção 2.4. |
| motion-x4 | Bounce negativo modela velocidade em decaimento, como o scroll view | Mencionado na seção 7.3 como curiosidade, mas não gera decisão: o app não implementa scroll próprio. Fica fora dos tokens. |

### 13.3 Claims usadas com a ressalva do verificador

Estas entraram no documento, mas o verificador apontou que a fonte citada sustentava só parte do texto original. O documento já reflete a versão corrigida. A lista fica aqui para transparência.

| Id | Ressalva |
|---|---|
| tipografia-31 | A fonte não afirma que a largura legível cresce com o Dynamic Type, só que é "igual ou menor que a largura definida para o tamanho atual". |
| layout-11 | A fonte lista espaço negativo, container e separador como exemplos equivalentes, sem ordem de preferência. |
| layout-19 | A frase sobre "fornecer estimativa de altura" não está na página. O conselho de performance é propriedade versus delegate. |
| layout-23 | A fonte só define as duas curvas de canto. Que os cantos da Apple usam a contínua vem da página de `cornerStyle` dos botões. |
| layout-30 | A regra de size class está em `layout.json`, não em `designing-for-ios.json`. |
| cor-03, cor-08 | O mapeamento terciário e quaternário e a frase sobre cards mais claros estão na sessão 808, não na 214 nem na página de `systemGroupedBackground`. |
| cor-15, cor-17, cor-29 | Partes do texto estavam em `accessibility.json` ou `color.json`, não na página citada originalmente. O documento cita a página certa. |
| cor-19, cor-20 | A fonte dá alternativas ("monocromático ou acento com contraste") e usa "pode ser eficaz", não "só é eficaz". Símbolos sobre vidro podem ter cor, com o item selecionado como exemplo, não como único caso. |
| cor-24 | Os cinzas estão certos, mas a fonte não os associa a fundo agrupado ou elevado. |
| materiais-07, acess-19 | A camada de dimming é "dark", não "preto", e é um "consider", não obrigação. |
| materiais-17 | A fonte fala em fundos e aparências customizadas, nunca em "bordas". |
| materiais-18, materiais-19 | A minimização da tab bar é condicionada a tab bars com acessório, e a reexpansão na rolagem contrária vem de `adopting-liquid-glass`, não de `tab-bars.json`. |
| materiais-21 | O padrão do scroll edge effect é `automatic`, não `soft`. |
| materiais-27, materiais-30 | A media query da web e a extrapolação para React Native e `backdrop-filter` são inferência, não texto da Apple. |
| materiais-29 | A recomendação de testar o escuro com contraste e transparência está em `dark-mode.json`. |
| barras-05 | O modo `inline` reverte para `always` (não `automatic`) e está disponível desde o iOS 17, não é novidade do iOS 26. |
| barras-23 | A sessão 323 não proíbe tint: diz para usá-lo para transmitir significado. |
| motion-04 | Os exemplos de interação frequente (tap em lista, troca de aba) são do pesquisador. A fonte não cita exemplos. |
| motion-14 | A advertência de que linear "parece fora de lugar" para deslocamento vem da WWDC 2023, não da página de `Animation.linear`. |
| motion-23 | A fonte confirma só os defaults 0,5 s e bounce 0. A frase sobre damping ratio está em `usingSpringWithDamping`. A fórmula do damping ratio não consta na Apple. |
| motion-30 | As páginas descrevem o que `beginFromCurrentState` e `allowUserInteraction` fazem, mas não dizem que são "necessários" para animações interruptíveis. |
| micro-04, micro-10 | Que selection "não serve para confirmar a escolha final" e que "não se adiciona haptic manual sobre o Switch" são inferências a partir das regras, não texto da Apple. |
| micro-15 | A fonte não contrapõe o indicador no botão a um spinner de tela inteira. O argumento é economizar espaço. |
| acess-14, acess-23 | As páginas só definem as flags `prefersCrossFadeTransitions` e `buttonShapesEnabled`. O que fazer com elas é prática derivada. |

---
