# 04. Handoff para `/make-plan`

Um único prompt, autocontido, para a Fase 5 (só depois da aprovação do protótipo da Fase 4). Copiar e colar como está.

````
/make-plan Redesenhar a camada visual e de interação do APPologética (React Native + Expo SDK 54, mesmo código em Android, iOS e web via react-native-web): sistema de tokens, chrome global (tab bar e headers), templates das telas Início, Artigo, Bíblia (capítulo), Onboarding e Login, estados e copy. A auditoria de Dieter Rams (design-is, 2026-09-23) reprovou o design atual com 10/30, com lacunas críticas nos princípios 8 (minucioso, nota 0), 2 (útil), 4 (compreensível), 6 (honesto), 3 (estético) e 5 (discreto).

Parágrafo do veredito (citado de 03-verdict.md):
> REDESIGN. O APPologética somou 10 de 30 na auditoria de Rams, com nota 0 em "minucioso" (estados de foco, carregamento, erro e desabilitado ausentes ou em padrão do navegador) e 1 em oito dos outros nove princípios: o conteúdo e o padrão "objeção → resposta com fonte" são a parte forte, mas a camada visual e de interação não tem sistema (espaço, raio, tipo, cor e movimento decididos tela a tela), o chrome compete com a leitura, e a copy promete o que o produto não faz.

Por que redesign e não refine: o total (10) está abaixo do limiar de 20 e o princípio 8 pontuou 0, porque nenhuma tela define estados de foco, carregando, erro ou desabilitado de forma própria e o anel de foco é removido nos inputs (src/screens/auth/LoginScreen.jsx:194, src/screens/BibleScreen.jsx:1007).

Preservar do design atual (obrigatório):
- Tokens de marca: navy #1a3a5c, dourado #c9a84c, creme #f5f0e8 no claro; escuro "noite na catedral" bg #0d1722, card #172538, navy #142844, dourado #d4b86a, texto #ece8d8 (src/context/ThemeContext.jsx:6-47). O token accentText (dourado AA, #806418 claro) e a escala fs() com piso 11 (ThemeContext.jsx:49-54, :149).
- As 5 abas com nomes de rota em português ('Início', 'Artigos', 'Bíblia', 'Ferramentas', 'Ajustes') e todos os nomes de rota dos stacks (App.js:94-246, 294-348): são a API dos deep links (App.js:71-89). Só o rótulo visível muda.
- A estrutura de conteúdo: artigos com referências citadas (src/data/articles/*, src/data/references.js), diálogos objeção → resposta (src/data/dialogues.js), Bíblia 100% offline com carga sob demanda (src/services/bibleApi.js:35-90), "Objeção do dia" na Início (src/screens/HomeScreen.jsx:105-120), menu de ações do versículo (BibleScreen.jsx:930-987), caderno com tokens @ (src/screens/NotebookPageScreen.jsx).
- Rótulos de acessibilidade já existentes (BibleScreen.jsx:184-189, :770-776, :806-813, :899-917; ArticleDetailScreen.jsx:134-158, :268-281; OnboardingScreen.jsx:103-108, :126-131) e a decisão de manter Ionicons.
- Arquivos por plataforma (sentry.web.js, notifications.web.js, StickySectionList.web.jsx etc.) e o modo visitante em todo o app.

Descartar (obrigatório):
- Estilos soltos por tela: 48 makeStyles(colors, fs) com números próprios (24 valores de espaço, 13 raios, 14 tamanhos fs(), 21 paddings na superfície; docs/design/DESIGN-IS-2026-09-23/01-evidence.md §1 E, §4 A-B). Causou a nota 1 no princípio 3 e o 0 no 8.
- Headers navy sólidos com título duplicado no conteúdo e prefixo "Artigo - " (App.js:99-103 e 4 cópias; BibleScreen.jsx:180 vs :805; ArticleDetailScreen.jsx:171 vs :296) e tab bar opaca (App.js:318-325). Causou o 1 no princípio 5.
- A seta de scroll com loop infinito (src/components/ScrollHint.jsx:26-41, src/hooks/useScrollHints.js) em 23 telas. Causou o 1 nos princípios 5 e 9.
- O padrão "kicker em caixa alta + filete lateral + caixa de ícone" como contêiner universal (43 uppercase, 13 filetes, 8 tamanhos de caixa; 01-evidence.md §1 C.5, C.7, C.8). Causou o 1 nos princípios 7 e 10.
- O gate de onboarding por sessão (App.js:384-388, hasSeenOnboarding nunca lido em src/utils/onboarding.js:6) e o nag de conta para favoritos locais (ArticleDetailScreen.jsx:199-214, src/utils/favorites.js). Causou o 1 no princípio 2.
- A copy inflada: promessa de sincronização de favoritos (ArticleDetailScreen.jsx:210; src/components/AccountPrompt.jsx:20, :104, :106), "Baixe o app" (src/components/WebDownloadBanner.jsx:31), pergunta descartada do onboarding (OnboardingScreen.jsx:122-129), três redações de 1 Pedro 3,15 (App.js:255, src/i18n/strings.js:89-90, OnboardingScreen.jsx:88-90). Causou o 1 no princípio 6.
- outlineStyle: 'none' (11 ocorrências em src/) sem estilo de foco substituto. Causou o 0 no princípio 8.

Os cinco movimentos da auditoria (citados de 03-verdict.md):
1. Princípio 3 e 8: um sistema de tokens que toda tela usa. Grade de 4 pt para espaço, três raios, escala tipográfica com line-height em todos os papéis, cores semânticas com versão escura (inclusive acento sobre superfície, que hoje dá 2,29:1 no claro), e estados de foco, desabilitado, carregando e erro definidos uma vez. Substituir os 48 makeStyles com números soltos. Evidência: 01-evidence.md §4 A, §4 B, §1 E, §4 C, §4 F, §5 F.
2. Princípio 5: chrome que recua. Tab bar translúcida com conteúdo passando por baixo, header com large title próprio que encolhe no scroll, um título só, sem seta de scroll animada, leitura da Bíblia com mais de 85% da altura. Evidência: §4 A (615 de 844 px úteis), §4 F, §3 E16, §2 D.
3. Princípios 2 e 4: primeiro uso sem desvio e controles que se explicam. Persistir o onboarding, "Ver a resposta" abrindo a resposta como visitante, favoritos sem conta, menu do versículo por toque simples e por teclado, ícones das abas corrigidos (App.js:288-289), botão de ouvir com rótulo, jargão trocado. Evidência: §2 E.2, §3 B1, E4, E6, E10, E11, E15, E18, §5 C, §3 D.
4. Princípio 6: copy que só promete o que existe. Evidência: §3 B12, B10, B3, B14, B6.
5. Princípios 9 e 8: movimento com regra e respeito ao sistema. Vocabulário de durações e curvas (toque, layout, tela) condicionado a reduce motion, prefers-color-scheme honrado sem escolha explícita, fonte MaterialCommunityIcons (1,3 MB) fora do caminho da Início. Evidência: §2 D, F, A; §4 G.

Princípios do redesign, em ordem de prioridade:
1. Princípio 8 (minucioso): sucesso é cada componente base com os seis estados (vazio, carregando, erro, sucesso, foco, desabilitado) definidos uma vez nos tokens e visíveis nas três plataformas; nenhum outlineStyle: 'none' sem substituto; alvos de 44 pt; rótulos em PT no header.
2. Princípio 5 (discreto): sucesso é a leitura (Artigo e Bíblia) com mais de 85% da altura útil, um título por tela, chrome translúcido, zero animação ociosa.
3. Princípio 3 (estético): sucesso é uma tabela de tokens (espaço, raio, tipo, cor, sombra, duração, curva) e zero número solto nas 5 telas; contraste AA em todo texto e acento.
4. Princípio 2 (útil): sucesso é abrir o app e chegar à resposta em 1 toque depois da primeira vez, sem gate por sessão nem nag para recurso local.
5. Princípio 6 (honesto): sucesso é cada string da superfície mapeando 1:1 ao comportamento, verificada na revisão de copy.

Restrições (decididas na Fase 0, não negociáveis neste plano): iOS como referência com uma linguagem só nas 3 plataformas, respeitando gesto de voltar e toque do Android; direção híbrida (estrutura Apple + identidade navy/dourado/creme); UI em sans do sistema, Cormorant Garamond SemiBold só em títulos, serifa do sistema no corpo de leitura; tab bar com blur (expo-blur no iOS e web, semitransparente no Android); large title próprio em reanimated; ios_from_right nas 3 plataformas; haptics leves em seleção, médios em sucesso, nenhum ao trocar de aba; dependências permitidas só expo-blur, expo-linear-gradient, expo-font (fontes até ~300 KB, bundle web até +150 KB gzip); compatível com Expo Go; lint em 0 erros e check:refs em 0 erros; sem travessões em strings.

Entregáveis do plano:
- Sistema de tokens (src/theme/tokens.js proposto em docs/design/pesquisa-apple.md §12) e componentes base (superfície/card, lista agrupada, botão, campo, header com large title, tab bar) com os seis estados, e a migração dos 48 makeStyles para os tokens.
- Novo fluxo primário de primeira abertura, comparado lado a lado com o atual (baixa fidelidade, rotulado).
- Checklist de estados por tela (vazio, carregando, erro, sucesso, foco, desabilitado).
- Passo a passo de migração tela a tela (as 5 prioritárias primeiro, o resto depois), cada onda com lint, export web e commit próprio.
- Critério de corte: uma tela migrada só entra quando não tem número solto fora dos tokens, passa AA e mostra os seis estados.
- Auditoria de honestidade de cada string da superfície antes de mesclar.

Antipadrões a evitar (específicos de REDESIGN):
- Portar a estrutura velha (makeStyles por tela, kicker + filete, seta animada) sob estilo novo.
- Manter os dois designs atrás de flag indefinidamente.
- Redesenhar seguindo tendência em vez dos princípios acima: o teste é "recua e explica", não "parece o app X".
- Tratar a lista "Preservar" como opcional: rotas, marca e conteúdo não mudam.
- Trocar nomes de rota ou o número de abas (quebra deep links).
````
