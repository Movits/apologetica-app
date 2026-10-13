---
tags: [funcionalidade, gamificacao]
atualizado: 2026-10-13
---
# Jornada (lições, XP, níveis e conquistas)

Camada de jogo por cima dos artigos: cada artigo virou uma lição com previsão
antes de ler, resumo em três pontos, resposta de bolso e teste rápido. Ler e
responder rende pontos (XP), os pontos sobem o nível e certas marcas
desbloqueiam conquistas. Tudo local (AsyncStorage), sem conta, offline.
Plano de origem: [[Plano - Jornada gamificada dos artigos]].

## Telas e blocos

- `src/screens/ArticleDetailScreen.jsx` monta a lição: `LessonHook` logo
  abaixo do título, e depois do corpo `LessonSummary` ("Em resumo"),
  `PocketAnswer` ("Resposta de bolso", com compartilhar) e `LessonCheck`
  ("Teste rápido", uma pergunta por vez, anel de placar, XP ganho, progresso do
  nível e a folha `BadgeUnlockSheet` quando uma conquista ou um nível cai).
- `src/screens/JourneyScreen.jsx` ("Minha Jornada", rota `Journey` em todos os
  stacks): selo do nível com anel até o próximo, números (lições, testes sem
  erro, sequência, conquistas), próxima lição, progresso por tema (abre
  `CategoryArticles`, que por isso passou para `sharedScreens`) e a grade das
  16 conquistas, cada uma com folha própria. Botão de reiniciar no fim.
- `src/components/JourneyCard.jsx`: o cartão da Início (logo após a busca),
  com "N para revisar" quando há perguntas vencidas.
- `src/screens/ReviewScreen.jsx` ("Revisão", rota `Review` em todos os
  stacks): as perguntas que voltaram hoje, até 5 por sessão, uma por vez, com
  o porquê, quando ela volta ("Volta em 3 dias", "Volta amanhã", "Dominada") e
  "Reler o artigo" quando a pessoa erra. Fim com placar, XP e "Revisar mais".
  Minha Jornada tem a seção "Revisão" (contagem do dia, próxima data,
  dominadas) e a folha "O que os níveis querem dizer".
- Ferramentas > Treino ganhou a linha "Minha Jornada". A lista de artigos e a
  de categoria mostram "Concluído" (fita dourada) além de "Lido", e a categoria
  mostra a barra de progresso do tema.
- Peças em `src/components/lesson/`: `OptionButton` (também usado pelo quiz),
  `XpRing` (anel SVG animado por `animatedProps`), `XpChip` ("+N XP"),
  `BadgeEmblem` (a marca vetorial, via `EmblemMark`, num disco dourado, com
  cadeado quando bloqueada).

## Dados

- `src/data/lessons/<categoria>.js`, um objeto por artigo: `hook` (pergunta,
  3 opções, correta, nota), `keyPoints` (3), `oneLiner`, `check` (3 perguntas
  de 4 opções com `why`), tudo PT/EN pelo padrão campo/campoEn. `index.js`
  junta e `tests/lessons.test.mjs` cobra: todo artigo tem lição, toda lição tem
  artigo, tamanhos, 3 e 4 opções, correta válida e variada, sem travessão.
- `src/data/journeyMarks.js`: a marca vetorial de cada conquista e nível
  (elementos SVG numa caixa 64 x 64, traço 4,5, uma cor do tema), no mesmo
  sistema do `BrandMark`. Desenhadas por três agentes com ângulos diferentes
  (linha, catacumbas, geométrico), julgadas por três juízes cada (legibilidade
  a 28 px, coerência com o app sem cara de IA, iconografia católica) e fechadas
  por uma síntese: broto, sol em esplendor, chaves de Pedro, livro, balança,
  globo, ampulheta, uma/duas/três velas, estrela de Belém, pilha de livros,
  quadrifólio, igreja sobre a rocha, Calvário, interrogação; níveis em escada:
  portal ogival, vieira, ichthys, escudo com cruz, torre, coroa com cruz. O
  dono rejeitou os medalhões gerados no Higgsfield ("cara de IA"): nenhuma
  imagem gerada entra como emblema. `tests/journeyMarks.test.mjs` cobra uma
  marca por id e o formato. A folha de contato se gera com o script
  `render-sheet.mjs` guardado no diário da sessão (scratchpad).

## O que acontece quando a pessoa erra (decisão de 2026-10-13)

Antes, refazer o teste pagava os acertos novos: dava para errar, ver as
respostas certas e refazer para ganhar os pontos. A pergunta do dia também
podia ser respondida de novo (e o acerto repetido somava XP e sequência). E
nada do que a pessoa errava voltava depois. Agora, no modelo do Duolingo e das
caixas de Leitner:

- **Previsão ("Antes de ler")**: uma resposta, travada. Vale 5 XP certa ou
  errada (o que conta é se comprometer antes de ler). Errou, ela volta na
  Revisão amanhã, sem o prefixo "Antes de ler".
- **Teste rápido**: só a primeira tentativa vale XP, e cada resposta dela é
  gravada na hora (evento `checkAnswer`, rascunho `lessons[id].draft`): quem
  sai do artigo no meio e volta continua de onde parou, e o fim do teste usa o
  rascunho, não o placar que a tela manda. Refazer virou "Treinar de novo",
  com o aviso "Treino: não vale XP". As erradas na primeira tentativa voltam
  amanhã, as certas em uma semana.
- **Pergunta do dia**: a primeira resposta do dia fica gravada (com a opção
  escolhida). Reabrir mostra a resposta dada e "Você já respondeu a pergunta
  de hoje". Errou, volta na Revisão amanhã.
- **Revisão**: cada acerto empurra a próxima vez (1, 3, 7, 16 e 35 dias); errar
  devolve para amanhã. Só etapa nova vale 5 XP (`maxBox` no cartão, e a pergunta
  dominada conta como a etapa 5). Errar nunca rende mais do que acertar: a
  pergunta do teste vale 25 de primeira ou na revisão, a pergunta do dia errada
  nasce com `maxBox` 2 (recupera no máximo os 15 que valia) e a previsão errada
  nasce com `maxBox` 5 (volta só para fixar, já valeu XP na hora). O web
  sincroniza as abas pelo evento `storage`. Acertou na última caixa, a pergunta está
  dominada. É o único jeito de recuperar os pontos de quem errou: aprendendo.
- **Opções embaralhadas** em toda pergunta (previsão, teste, treino, revisão,
  quiz). Nos dados a resposta certa estava na mesma posição em 75 das 83
  previsões e em 73 das 100 perguntas da prática: o padrão entregava a
  resposta. A ordem é determinística pela semente (`shuffledOrder`), muda a
  cada tentativa e a cada dia.
- **A certa não se entrega pelo tamanho.** Em 92% das perguntas das lições a
  certa era a opção mais longa (a mais "completa"), e embaralhar não resolve
  isso. Regra em `tests/optionBalance.mjs`, cobrada nas lições e no quiz: a
  certa tem no máximo 25% ou 8 caracteres a mais que a maior errada, e no
  conjunto é a mais longa (ou a mais curta) em no máximo 40% das perguntas.
  Errada boa é um equívoco real ou uma meia-verdade que o artigo corrige,
  nunca uma opção absurda que ninguém escolheria.

Lógica pura em `src/utils/review.js` (`tests/review.test.mjs`) e
`src/utils/reviewItems.js` (`tests/reviewItems.test.mjs`, toda pergunta de
lição e do quiz precisa resolver). As perguntas de lição são guardadas pelo
índice (`a:<artigo>:<n>`, `a:<artigo>:h`, `q:<id do quiz>`): **uma lição
publicada nunca reordena nem remove perguntas**; para mudar, reescreva no
lugar.

## Motor (`src/utils/journey.js`, puro, `tests/journey.test.mjs`)

- XP: artigo lido 20, previsão 5, acerto no teste 10 (só na primeira
  tentativa), teste perfeito de primeira 15 de bônus, quiz diário 15 (só a
  primeira resposta do dia), acerto na revisão 5. Um artigo completo vale 70.
  Tudo idempotente: repetir nunca paga de novo.
- Níveis: Catecúmeno 0, Neófito 120, Discípulo 400, Apologista 900, Defensor
  da Fé 1800, Mestre 3200 (2, 6, 13, 26 e 46 artigos completos). Cada nível
  traz `desc`/`descEn` com o que o nome quer dizer, com a citação conferida
  nas Bíblias do app: catecúmeno vem de katēchein (Lucas 1,4), neófito é
  "plantado há pouco" (1 Timóteo 3,6), discípulo é aprendiz (mathētēs),
  apologista vem de apologia, defesa (1 Pedro 3,15), defensor responde "com
  suavidade e respeito", mestre ensina outros (2 Timóteo 2,2).
- Conquistas (16): primeiro passo, uma por categoria completa (6), sequência
  de leitura 3/7/30, dez testes sem erro, trinta lições, todas as lições,
  trilhos Fundamentos e Aprofundamento, sete dias de quiz.
- `applyEvent(state, event, ctx)` devolve `{ state, gained, unlocked }`; o
  contexto (artigos por categoria, streak, streak do quiz, trilhos concluídos)
  vem de fora, por `journeyStore.buildContext`.
- Estado: `{ v, xp, lessons: { [id]: { read, hook, check: { best, first,
  perfect, attempts }, done } }, badges: { [id]: ts }, days: { [AAAA-MM-DD]:
  acertou? }, review: { [chave]: { box, due, reps, lapses, mastered? } } }`.
  O `journeyStore` carimba `today` (data local) em todo evento; sem data o
  motor não cria cartão.

## Persistência (`src/utils/journeyStore.js`)

Chave `journey:state`. `getJourney`, `dispatchJourney` (fila serializada, grava
e avisa), `subscribeJourney`, `resetJourney`. O hook `src/hooks/useJourney.js`
entrega o estado às telas e as atualiza a cada evento.

## Ligações

- [[Artigos]]
- [[Quiz da Fé]] (a pergunta do dia rende XP e, errada, volta na Revisão)
- [[Plano de Leitura]] (trilhos viram conquistas)
- [[Mapa de Funcionalidades]]
