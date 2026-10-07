---
tags: [projeto, plano, gamificacao]
atualizado: 2026-10-07
---
# Plano - Jornada gamificada dos artigos

Pedido do dono (7 de outubro de 2026): revisar todos os artigos, gamificar a
leitura e deixar os artigos interativos, com visual premium e na estética do
app, para quem usa pensar "isso é grátis?". Conteúdo bom, didático, preciso.

## Diagnóstico de partida

- 83 artigos em 6 categorias, cerca de 50 mil palavras, todos com tradução EN.
  Nenhum travessão nem ponto e vírgula no corpo (convenção já cumprida).
- O quiz tem 100 perguntas de múltipla escolha, mas só 27 artigos têm pergunta
  ligada (`relatedArticle`). Nada pergunta sobre o que a pessoa acabou de ler.
- Já existem: artigo "lido" aos 90% do scroll (`readingProgress.js`), streak
  do plano de leitura, "Continuar lendo" na Início, favoritos. Falta a camada
  que transforma isso em jornada: pontos, níveis, conquistas, teste por artigo.
- A pesquisa de concorrência (Capela, Hallow) pede retenção por hábito e
  progresso visível, sem paywall. Nada de moeda, loja ou trial.

## Princípios

1. **Dignidade antes de pirotecnia.** Nomes de nível e conquista vêm do
   vocabulário da Igreja (catecúmeno, neófito, discípulo, apologista), nunca de
   jogo de celular. Animações com mola e dourado, não confete de festa.
2. **O conteúdo manda.** Cada mecânica existe para ensinar: a pergunta antes
   de ler ativa o que a pessoa já pensa, o resumo fixa, o teste confirma, a
   "resposta de bolso" é o que ela leva para a conversa.
3. **Tudo offline e sem conta**, em AsyncStorage, como favoritos e progresso.
4. **Design system do app**: tokens, `Group`/`Row`/`Button`/`Sheet`, papéis de
   texto, reanimated 4, AA nas quatro identidades.

## Camadas

### 1. Conteúdo das lições (`src/data/lessons/`)
Um objeto por artigo, bilíngue, puro e testado:
- `hook`: pergunta de previsão antes de ler (3 opções, a correta e uma nota).
- `keyPoints`: 3 pontos para "Em resumo".
- `oneLiner`: a "resposta de bolso", uma frase para usar numa conversa.
- `check`: 3 perguntas de múltipla escolha (4 opções, por quê) sobre o artigo.
Escrito por seis agentes em paralelo (um por categoria, a Igreja Católica em
dois), que também revisam cada artigo (fatos, estilo, referências) e devolvem
propostas de correção para aplicação central.

### 2. Motor (`src/utils/journey.js`, puro, TDD)
- Eventos de XP: artigo concluído, previsão respondida, pergunta certa, teste
  perfeito, quiz diário. Níveis por limiar com nome PT/EN.
- Conquistas: primeira leitura, por categoria completa (6), sequências (3, 7,
  30 dias), 10 testes perfeitos, os 83 artigos, trilhos do plano.
- Estado em AsyncStorage (`journey:state`) por `src/utils/journeyStore.js`.

### 3. Telas e componentes
- Artigo: `LessonHook` depois do título, `LessonSummary` + `LessonCheck` +
  `PocketAnswer` depois do corpo, e `LessonComplete` com anel de XP animado e
  folha de conquista desbloqueada.
- `JourneyScreen` ("Minha Jornada"): selo do nível, XP até o próximo, streak,
  anéis por categoria, grade de conquistas.
- Início: cartão compacto da jornada. Lista de artigos e categoria: estado de
  concluído e progresso da categoria.

### 4. Visuais
Emblemas das 6 categorias e dos níveis gerados no Higgsfield num só estilo
(medalhão gravado em dourado, fundo transparente), reduzidos para o bundle.
Anel de progresso e brilho em SVG + reanimated.

### 5. Verificação contínua
Lint 0/0, `node --test` com os testes novos (motor e integridade das lições),
`check:refs`, `expo export` web e nativo, capturas Playwright nas duas
larguras e nos dois temas, revisão de código por agente antes do push.
