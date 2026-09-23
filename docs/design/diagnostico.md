# Diagnóstico do design atual (Fase 2)

Data: 2026-09-23. Base: commit `efbdbde` (nenhum arquivo de código alterado). Duas
auditorias independentes, cada uma com evidência citada por `arquivo:linha` ou
medida no build web:

- **design-is** (dez princípios de Dieter Rams): `DESIGN-IS-2026-09-23/`
  (escopo, evidência em 5 seções, scorecard, veredito, handoff).
- **pathfinder** (mapa do código e duplicações): `PATHFINDER-2026-09-23/`
  (14 features, 12 fluxogramas com 1.100 nós rotulados, 37 concerns duplicados
  entre features, proposta unificada em 6 sistemas, 5 prompts de handoff).

## 1. Resumo em cinco linhas

1. **Veredito de Rams: 10 de 30, REDESIGN** da camada visual e de interação. O conteúdo e o padrão "objeção do dia → resposta com fonte" são a parte forte; a pele não tem sistema, o chrome compete com a leitura, a copy promete o que o app não faz, e nenhuma tela define estados de foco, carregando, erro ou desabilitado (nota 0 em "minucioso").
2. **Não há sistema de design**: 48 `makeStyles` com números próprios (24 valores de espaço, 20 raios, 17 tamanhos de fonte, 44 cores literais fora da paleta), 43 rótulos em caixa alta, 23 filetes laterais, 8 tratamentos de cabeçalho de seção.
3. **O chrome pesa**: headers navy sólidos com título duplicado, tab bar opaca, seta de scroll com loop infinito em 24 telas (60 a 240 quadros por segundo em tela parada), leitura da Bíblia em 73% da altura.
4. **A primeira experiência desvia**: onboarding em toda abertura para visitante, "Ver a resposta" caindo no Login, favoritos (locais) exigindo conta com a promessa falsa de sincronização.
5. **O código repete o que a tela repete**: 57 registros de rota para 27 rotas, 6 cópias do header, 10 chamadas montando `navigate('Bíblia')` à mão, 18 implementações do mesmo card, 7 campos de busca.

## 2. Priorização por impacto x esforço

Impacto (1 a 5): quanto muda a experiência nas 5 telas prioritárias e no chrome. Esforço (1 a 5): 1 = um utilitário e trocas mecânicas, 5 = dezenas de arquivos com decisão caso a caso. Evidência aponta para `DESIGN-IS-2026-09-23/01-evidence.md` (§) e para os concerns C-n de `PATHFINDER-2026-09-23/02b-duplicacao-entre-features.md`. "Sistema" é o bloco da proposta unificada (`03-unified-proposal.md`).

### Fazer primeiro (impacto alto, esforço baixo)

| # | Item | Impacto | Esforço | Evidência | Sistema |
|---|---|---|---|---|---|
| 1 | Copy honesta: tirar a promessa de sincronizar favoritos, o banner "Baixe o app", a pergunta descartada do onboarding; uma redação correta de 1 Pedro 3,15; "Buscar" em vez de "Buscar em todo o app" | 4 | 1 | §3 B12, B10, B3, B14, B6 | copy |
| 2 | Onboarding uma vez só (`hasSeenOnboarding` já existe e ninguém lê), "Ver a resposta" abrindo a resposta como visitante, favoritar sem conta | 4 | 2 | §2 E.2, §3 B1, E4, E6, E11; `App.js:384-388`, `onboarding.js:6` | S4 + fluxo |
| 3 | Apagar `ScrollHint` e `useScrollHints` das 24 telas | 3 | 1 | §2 D, C14 | S3 |
| 4 | Aba ativa em `tint` (navy no claro), cor da estação litúrgica passando pelo tema, dourado nunca como texto sobre claro | 3 | 1 | §4 E (2,29:1), §5 A (3,10:1 no escuro) | S1 |
| 5 | Respeitar reduce motion e `prefers-color-scheme` (sem escolha explícita), `userInterfaceStyle: automatic` | 3 | 1 | §2 F, `app.json:9` | S1 |
| 6 | Cormorant Garamond SemiBold via expo-font (1 peso, subset Latin), serifa do sistema na leitura | 3 | 1 | §4 B (fonte do sistema em tudo) | S1 |
| 7 | Tirar `MaterialCommunityIcons` (1,3 MB) do caminho da Início: trocar o único ícone `church` por um Ionicons | 2 | 1 | §2 A | S1 |
| 8 | Alvos de 44 pt e rótulos em PT no header; anel de foco no lugar de `outlineStyle: 'none'` (11 ocorrências) | 4 | 2 | §5 E, F; §4 F | S2 |

### Planejar (impacto alto, esforço alto): é o redesign em si

| # | Item | Impacto | Esforço | Evidência | Sistema |
|---|---|---|---|---|---|
| 9 | Tokens e tema: `src/theme/tokens.js` + 4 chaves de cor, todo `makeStyles` sem número solto | 5 | 3 | §1 E, §4 A-D, C5, C15, C10, C16, C8, C13 | S1 |
| 10 | Chrome: header com large title próprio (reanimated) e tab bar translúcida (expo-blur), um título por tela, `ios_from_right` nas 3 plataformas | 5 | 4 | §4 F, G; §1 C.14; C1 | S3 |
| 11 | Componentes base (Group/Row, SectionTitle, Button, SearchField, Chip, ProgressBar, EmptyState, GateNotice) com os seis estados | 5 | 4 | C6, C7, C9, C11, C12, C17-C20; §4 F | S2 |
| 12 | Migrar as 5 telas prioritárias (Início, Artigo, Bíblia capítulo, Onboarding, Login) para o protótipo | 5 | 4 | `design/preview/index.html` | telas |
| 13 | Bíblia: leitura em mais de 85% da altura, pílula de capítulos flutuante, menu do versículo por toque e teclado (sheet) | 4 | 3 | §4 A, §5 C | telas |
| 14 | Registro compartilhado das telas secundárias e helpers `openBible`/`openArticle` | 2 | 2 | C2, C3, C4 | S3 |

### Encaixar (impacto médio ou baixo, esforço baixo)

| # | Item | Impacto | Esforço | Evidência | Sistema |
|---|---|---|---|---|---|
| 15 | Helpers bilíngues e `formatVerseRef` (corrige o share em EN e "Salmo 23 1,1") | 2 | 2 | C32, C25 | S4 |
| 16 | `dailyIndex`/`todayKey`/`easterDate` num só lugar (corrige o streak do quiz em UTC) | 2 | 1 | C21, C28, C30 | S5 |
| 17 | `speakLong` para narração (artigo longo sem fila hoje) | 2 | 2 | C26 | S6 |
| 18 | `NoteEditor` via `userData.js`; `APP_PROMO` e `doShare` únicos; um `ShareCard` | 1 | 2 | C35, C22, C36 | S6 |
| 19 | Jargão: "Referências" → "Fontes", "Ferramentas" → "Praticar", "Objeção do dia" mantido com subtítulo explicando | 3 | 1 | §3 D | copy |

### Deixar para depois (impacto baixo ou fora do escopo)

| # | Item | Motivo |
|---|---|---|
| 20 | Migrar os 46 arquivos com ternário bilíngue inline para `t()` (C33) | Esforço 5, impacto visual nulo; fazer só nas telas tocadas. |
| 21 | Cache-first comum para liturgia e notícias (C29) | Especialização legítima. |
| 22 | Busca acessível de todas as abas (`Search` só no HomeStack) | Muda a arquitetura de informação; decisão da Fase 0 foi não mexer. Registrar como backlog. |
| 23 | Landing (`docs/index.html`) com os mesmos tokens | Fase opcional no fim, por decisão da Fase 0. |

## 3. O que a Fase 5 executa e em que ordem

1. Onda 0 (barata, corrige bugs e mentiras): itens 1, 2, 3, 4, 5, 6, 7 e 16.
2. Onda 1: item 9 (tokens). Sem ela nada do resto fecha.
3. Onda 2: itens 10 e 11 (chrome e componentes), em paralelo.
4. Ondas 3 a 7: item 12, uma tela por onda na ordem Início, Artigo, Bíblia, Onboarding, Login, levando 8, 13, 15 e 19 junto.
5. Onda 8: item 14 e o restante de 17 e 18.
6. Depois: as outras telas, uma feature por onda.

Os prompts prontos para `/make-plan` estão em `DESIGN-IS-2026-09-23/04-handoff-prompt.md` (o redesign como um todo) e em `PATHFINDER-2026-09-23/04-handoff-prompts.md` (um por sistema S1 a S6). Cada onda termina com `npm run lint` (0 erros), `npm run check:refs` (0 erros), `npx expo export -p web` verde e commit próprio.

## 4. Riscos e decisões que ficam com o dono do projeto

- **Redesign, não refine**: o veredito mecânico da auditoria foi REDESIGN da pele. As abas, rotas e o conteúdo ficam (decisão da Fase 0), então o risco de quebrar deep links é zero se a lista "Preservar" do handoff for respeitada.
- **Cormorant e pesos**: Cormorant só em títulos e large titles. Se a leitura no aparelho parecer fraca demais em 600, o plano prevê testar 700 antes de trocar de fonte.
- **Blur no Android**: `expo-blur` no Android é caro; a proposta usa fundo semitransparente lá. Se o resultado parecer inferior ao iOS, é aceitável pela decisão "uma linguagem, adaptações mínimas".
- **Copy que muda comportamento**: tirar o gate de favoritos e persistir o onboarding são mudanças de produto, não só de texto. Estão no plano porque a auditoria as apontou como desvios da tarefa primária, mas a palavra final é sua.
- **Fora do escopo desta rodada**: busca em todas as abas, landing, telas fora das 5 prioritárias (entram depois, uma feature por onda).
