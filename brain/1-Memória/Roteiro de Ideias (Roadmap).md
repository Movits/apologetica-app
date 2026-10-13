---
tags: [ideia, manutencao]
atualizado: 2026-07-08
---
# Roteiro de Ideias (Roadmap)

Ideias de evolução do app, quase todas nascidas da [[Pesquisa de Mercado (resumo)]] de junho de 2026. Nada aqui é compromisso, é fila de candidatas.

## Áudio e narração

A pesquisa apontou áudio como formato subexplorado pelos concorrentes brasileiros. O app já tem leitura em voz alta por voz sintética, ver [[Leitura em Voz Alta (TTS)]]. O passo seguinte a avaliar é áudio gravado (narração humana) para artigos ou orações, com o cuidado de que áudio empacotado pesa muito mais que texto.

## Rotina diária e streak

Retenção vem de hábito diário, e o app já entrega versículo, santo e objeção do dia em [[Conteúdo do Dia]]. Falta a mecânica de sequência (streak). O trio morto de `src/utils/readingProgress.js` (marcar artigo como lido, listado em [[Candidatos à Limpeza]]) pode virar a base desse rastreio em vez de ser removido.

## Monetização

Premium opcional na faixa de R$ 5 a R$ 15 por mês, mantendo o essencial gratuito. O valor e o apetite precisam ser validados com a [[Pesquisa de Público (resumo)]] antes de qualquer construção.

## Da pesquisa de concorrência (jul/2026)

Ver [[Pesquisa de Concorrência - Capela e Hallow (UI-UX)]] para o detalhe e as fontes.

- **Planos com metas e trilhas adotáveis**: evoluir o [[Plano de Leitura]] com progresso visível e trilhas temáticas (ex.: "30 dias respondendo objeções protestantes"). Retenção sem gamificação, padrão do Capela.
- **Busca full-text offline na Bíblia**: hoje a [[Busca]] só cobre versículos curados. Os dados completos já estão no app.
- **Deeplinks de compartilhamento** de artigos e referências (aquisição orgânica).
- **Home com bloco dinâmico por tempo litúrgico** (JSON versionado + cálculo local, sem servidor).
- **Página "por que é grátis"** no site e, se o premium vier, "por que cobramos" transparente. Nunca: trial com conversão automática opaca (a maior fonte de reviews negativos do Hallow).

## Conteúdo

- ~~**Bíblia Ave Maria com versículos faltando**~~ (achado e resolvido em
  2026-10-13): 39 capítulos com a numeração consertada por
  `scripts/source/avemaria-correcoes.json`, travados por
  `tests/bibleAveMaria.test.mjs`. Gálatas 1, 2 Tessalonicenses 2, Hebreus 12,
  1 Pedro 1, Apocalipse 7, Romanos 7, 1 Coríntios 16 e Atos 15 ficaram como
  estão: é a numeração da própria edição (quatro fontes concordam).

- **Capítulos que só existem numa das Bíblias** (achado na revisão de código de
  2026-10-13): Joel tem 4 capítulos na Ave Maria e 3 na Douay-Rheims, e
  Malaquias tem 3 e 4. Em inglês, Joel 4 cai no português e Malaquias 4 não
  aparece na grade. Consertar pede contar capítulos por idioma na grade, na
  navegação, no seletor de referência e no progresso de leitura (que hoje
  conta pela Ave Maria): decidir como o progresso trata esses dois livros
  antes de mexer.
- **Marcações antigas nos capítulos consertados** (2026-10-13): os 39
  capítulos da Ave Maria que ganharam a numeração certa podem ter marcações e
  notas feitas no número antigo. Se aparecer reclamação, uma migração pode
  mover cada uma pelo texto marcado.

Cobrir as lacunas do [[Top 100 Tópicos]]: comparar a lista dos temas mais buscados com os artigos existentes e priorizar os buracos.

## Loja de apps

A landing já mostra badges de "em breve" para as lojas, ver [[Site (Landing Page)]]. Publicar nas lojas (builds EAS de produção) transforma os badges em links reais.

## Ligações

- [[Pesquisa de Mercado (resumo)]]
- [[Pesquisa de Público (resumo)]]
- [[Top 100 Tópicos]]
- [[Candidatos à Limpeza]]
