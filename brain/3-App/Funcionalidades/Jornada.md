---
tags: [funcionalidade, gamificacao]
atualizado: 2026-10-07
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
- `src/components/JourneyCard.jsx`: o cartão da Início (logo após a busca).
- Ferramentas > Treino ganhou a linha "Minha Jornada". A lista de artigos e a
  de categoria mostram "Concluído" (fita dourada) além de "Lido", e a categoria
  mostra a barra de progresso do tema.
- Peças em `src/components/lesson/`: `OptionButton` (também usado pelo quiz),
  `XpRing` (anel SVG animado por `animatedProps`), `XpChip` ("+N XP"),
  `BadgeEmblem` (emblema ilustrado ou ícone num disco dourado, com cadeado
  quando bloqueada).

## Dados

- `src/data/lessons/<categoria>.js`, um objeto por artigo: `hook` (pergunta,
  3 opções, correta, nota), `keyPoints` (3), `oneLiner`, `check` (3 perguntas
  de 4 opções com `why`), tudo PT/EN pelo padrão campo/campoEn. `index.js`
  junta e `tests/lessons.test.mjs` cobra: todo artigo tem lição, toda lição tem
  artigo, tamanhos, 3 e 4 opções, correta válida e variada, sem travessão.
- `src/data/journeyArt.js`: mapa estático de emblemas ilustrados por id de
  conquista e de nível (vazio até os PNGs entrarem em `assets/journey/`; o
  `BadgeEmblem` cai no ícone). Os 12 emblemas foram gerados no Higgsfield e
  `scripts/fetch-journey-emblems.mjs` os baixa e reduz.

## Motor (`src/utils/journey.js`, puro, `tests/journey.test.mjs`)

- XP: artigo lido 20, previsão 5, acerto no teste 10, teste perfeito 15 de
  bônus, quiz diário 15. Um artigo completo vale 70. Tudo idempotente: repetir
  nunca paga de novo, refazer o teste só paga os acertos novos.
- Níveis: Catecúmeno 0, Neófito 120, Discípulo 400, Apologista 900, Defensor
  da Fé 1800, Mestre 3200 (2, 6, 13, 26 e 46 artigos completos).
- Conquistas (16): primeiro passo, uma por categoria completa (6), sequência
  de leitura 3/7/30, dez testes sem erro, trinta lições, todas as lições,
  trilhos Fundamentos e Aprofundamento, sete dias de quiz.
- `applyEvent(state, event, ctx)` devolve `{ state, gained, unlocked }`; o
  contexto (artigos por categoria, streak, streak do quiz, trilhos concluídos)
  vem de fora, por `journeyStore.buildContext`.
- Estado: `{ v, xp, lessons: { [id]: { read, hook, check: { best, perfect,
  attempts }, done } }, badges: { [id]: ts }, days: { [AAAA-MM-DD]: true } }`.

## Persistência (`src/utils/journeyStore.js`)

Chave `journey:state`. `getJourney`, `dispatchJourney` (fila serializada, grava
e avisa), `subscribeJourney`, `resetJourney`. O hook `src/hooks/useJourney.js`
entrega o estado às telas e as atualiza a cada evento.

## Ligações

- [[Artigos]]
- [[Quiz da Fé]] (a pergunta do dia rende XP)
- [[Plano de Leitura]] (trilhos viram conquistas)
- [[Mapa de Funcionalidades]]
