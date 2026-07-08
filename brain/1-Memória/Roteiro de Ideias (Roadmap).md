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

Cobrir as lacunas do [[Top 100 Tópicos]]: comparar a lista dos temas mais buscados com os artigos existentes e priorizar os buracos.

## Loja de apps

A landing já mostra badges de "em breve" para as lojas, ver [[Site (Landing Page)]]. Publicar nas lojas (builds EAS de produção) transforma os badges em links reais.

## Ligações

- [[Pesquisa de Mercado (resumo)]]
- [[Pesquisa de Público (resumo)]]
- [[Top 100 Tópicos]]
- [[Candidatos à Limpeza]]
