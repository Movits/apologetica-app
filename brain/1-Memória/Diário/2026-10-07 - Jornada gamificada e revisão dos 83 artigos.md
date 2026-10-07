---
tags: [memoria, diario]
atualizado: 2026-10-07
---
# 2026-10-07 - Jornada gamificada e revisão dos 83 artigos

Continuação de [[2026-10-05 - Correções do dono, aulas de arte e identidades]].
O dono pediu: revisar todos os artigos, gamificar e deixar os artigos
interativos, com visual premium e na estética do app, conteúdo didático e
preciso, usando Higgsfield e o que mais houvesse. Plano gravado em
[[Plano - Jornada gamificada dos artigos]], funcionalidade descrita em
[[Jornada]].

## O que entrou (branch `claude/optimistic-albattani-lwqxt8`)

1. **Lições para os 83 artigos** (`src/data/lessons/`): previsão antes de
   ler, três pontos de resumo, resposta de bolso e teste rápido de três
   perguntas, PT e EN. Escritas por seis agentes em paralelo (um por
   categoria, Igreja Católica em dois), cada um com validador próprio.
2. **Revisão de conteúdo**: os mesmos agentes leram cada artigo e devolveram
   propostas com trecho exato e justificativa. 231 correções aplicadas por
   script (cada trecho precisava ocorrer uma vez só), todas conferidas antes.
   Entre as altas: Carlo Acutis e Paulo VI já são santos, Francisco já faleceu,
   C. S. Lewis era anglicano (não "também católico"), Tertuliano negou a
   virgindade perpétua (o artigo o citava como testemunha), o "massacre de Tiro
   em 1124" não existiu (Tiro foi tomada pelos cruzados), houve milhares de
   execuções por bruxaria em principados católicos alemães (o ponto certo é
   "onde a Inquisição atuava"), "Águia das Águias" em Isaías 31 não existe, e
   "Deus meu, por que me abandonaste" é a quarta palavra na cruz, não a
   primeira. Dúvidas ficaram só nos relatórios (fora do JSON).
3. **Motor da Jornada** (`src/utils/journey.js`, puro, 13 testes): XP, seis
   níveis, 16 conquistas, idempotente. Store em AsyncStorage com fila.
4. **Telas**: blocos da lição no artigo, Minha Jornada, cartão na Início,
   linha em Ferramentas, "Concluído" nas listas, progresso por categoria. A
   pergunta do dia do quiz rende XP. `OptionButton` virou peça compartilhada.
5. **Emblemas**: a primeira tentativa foram 12 medalhões gerados no
   Higgsfield (gpt_image_2_5, meio crédito cada). O dono rejeitou: "cara de
   IA", e nada no app pode ter isso. Substituídos por marcas vetoriais em
   `src/data/journeyMarks.js`, no sistema do `BrandMark` (caixa 64, traço 4,5,
   uma cor do tema), desenhadas por um painel de agentes (três designers com
   ângulos diferentes, três juízes por candidato, síntese) a partir de uma
   folha de contato renderizada com Playwright em 28/40/56/96 px nos dois
   temas. O script de download e o mapa de PNGs foram removidos.

## Decisões

- Nomes de nível e conquista no vocabulário da Igreja (catecúmeno, neófito,
  discípulo, apologista, defensor da fé, mestre). Nada de moeda, loja ou trial.
- Terminar o teste conta o artigo como lido (quem respondeu leu). O scroll a
  90% continua valendo para quem não faz o teste.
- Progresso local e sem conta, como favoritos: muda a cada toque e precisa
  valer no modo visitante.
- `CategoryArticles` saiu do HomeStack para `sharedScreens`: Minha Jornada vive
  em todas as abas e abre a lista de um tema.

## Verificado

- Lint 0 erros e 0 warnings, 141 testes (20 novos), `check:refs` 0 erros.
- `npx expo export -p web` e `-p ios -p android --no-bytecode` verdes.
- Playwright (`scripts/verify-journey.mjs`, Chromium pré-instalado do
  container): 56 passos nos dois temas e nas duas larguras, zero erro de
  página. A primeira rodada pegou o bug de o resultado do teste sumir (o
  bloco remontava quando o estado mudava) e a previsão em minúscula.
- `/code-review` em nível médio: 9 achados, todos tratados (corrida na
  primeira leitura do store, sequências vencidas valendo conquista, gravação
  a cada evento repetido, teste sem `total` virando perfeito, `markAsRead`
  divergente, números soltos fora dos tokens, cascata da Início, passo
  morto no script).

## Pendências

- Referências novas sugeridas pelos relatórios (ids que não existem:
  `1jo-4-8`, `humani-generis`, `jo-19-34`, `mc-2-5`, `jo-5-18`, `hb-9-28`,
  `cic-1367`, `cic-2283`, `jo-8-44`, `mt-6-7`, `cic-2043`, `cic-153`, `mt-4-4`,
  `cdc-1251`, `1jo-5-16`, `lc-15-11`, `jo-8-11`, `1cor-6-18`, `1cor-11-2`,
  entre outras) e as dúvidas marcadas nos relatórios (OMS 1973 em Lanciano,
  DIU e pílula no artigo 26, Daniel Wallace no 32, quiz "Homero ~650" vs
  artigo 48). Os relatórios ficaram no scratchpad da sessão.
- `tertuliano-de-carne` em references.js traz uma citação que Tertuliano não
  escreveu (ele negou a virgindade pós-parto): trocar ou remover.
- Regenerar o grafo do vault (`scripts/generate-brain.mjs`) depois do merge.
