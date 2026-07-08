---
tags: [pesquisa]
atualizado: 2026-07-08
---
# Top 100 Tópicos

Levantamento dos 100 tópicos e perguntas sobre fé católica mais buscados no Brasil, cruzado com a cobertura atual dos aprox. 83 artigos do app (julho de 2026). Arquivo completo: [top100-br.md](../../documentos/top100-br.md).

## O que é

Pesquisa de apoio feita em junho de 2026 a partir de fontes como Theolocast (101 perguntas mais frequentes), GotQuestions em português, Opus Dei (54 perguntas sobre Jesus) e buscas temáticas (moral, Maria e santos, vida após a morte, católico versus evangélico). Os 100 itens estão agrupados em blocos: fundamentos, Igreja Católica, moral, existência e ciência, Escritura, outras religiões, história da Igreja e mariologia.

## A legenda de disposição

Cada tópico recebe uma marcação que diz o que fazer com ele:

- `OK n`: já coberto pelo artigo de id `n`.
- `FOLD→n`: dobrar como seção de perguntas frequentes dentro do artigo `n`.
- `NOVO`: pede artigo novo substancial.
- `NOVO-curto`: pede artigo novo curto e prático.
- `DIÁLOGO`: pede entrada no modo diálogo, ver [[Diálogos e Objeção do Dia]].

## Como usar para priorizar

O resumo executivo no fim do arquivo já consolida o trabalho pendente: aprox. 17 artigos novos substanciais (Trindade, Novíssimos, missa, castidade, divindade de Cristo etc.), aprox. 10 artigos curtos, uma lista de fold-ins em artigos existentes e diálogos novos a adicionar. Ao criar conteúdo novo, começar pelos itens `NOVO` dos blocos de fundamentos, que são o que o brasileiro mais googla.

## O que já foi implementado

A ordenação por relevância do Lote 1 saiu deste levantamento: `RANKED_IDS` e `POPULAR_IDS` em `src/data/articleCategories.js` alimentam a seção "Mais buscados" no topo da aba Artigos e o sort por relevância dentro de cada categoria.

## Ligações

- [[Artigos e Referências (dados)]]
- [[Roteiro de Ideias (Roadmap)]]
- [[Pesquisa de Público (resumo)]]
