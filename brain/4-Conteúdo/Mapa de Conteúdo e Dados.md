---
tags: [mapa]
atualizado: 2026-07-08
---
# Mapa de Conteúdo e Dados

De onde vem tudo que o app mostra: os arquivos estáticos de `src/data/` e as pesquisas que orientam o que entra neles. Reúne as notas de `brain/4-Dados/` e `brain/6-Pesquisas/`.

## Dados do app

- [[Catálogo de Dados]]: a tabela mestre de todos os arquivos de `src/data/`, com contagens de julho de 2026 e quem consome cada um.
- [[Bíblia (dados)]]: os dois maiores arquivos do projeto, Ave Maria (PT) e Douay-Rheims (EN), gerados por script e nunca editados na mão.
- [[Artigos e Referências (dados)]]: estrutura interna dos aprox. 83 artigos em 6 categorias e das aprox. 205 referências que eles citam.

## Grafo do conteúdo (gerado automaticamente)

- [[Conteúdo do App (gerado)]]: uma nota por artigo, referência, diálogo e trilho do plano, com as conexões reais entre eles. Regenerado por `node scripts/generate-brain.mjs` sempre que o conteúdo do app mudar.

## Pesquisas de apoio

Resumos autossuficientes, com link para os documentos originais em `documentos/`.

- [[Pesquisa de Mercado (resumo)]]: o mercado brasileiro de apps de fé, concorrentes como Hallow e o espaço para um app de apologética gratuito.
- [[Pesquisa de Público (resumo)]]: o questionário de 20 perguntas montado para conhecer o público-alvo e priorizar conteúdo.
- [[Top 100 Tópicos]]: os 100 tópicos católicos mais buscados no Brasil cruzados com a cobertura atual dos artigos, a fila natural de conteúdo novo.

## Como os dois lados se conectam

As pesquisas apontam lacunas de conteúdo, os artigos novos entram em `src/data/articles/` seguindo as [[Convenções do Projeto]], e ideias maiores vão para o [[Roteiro de Ideias (Roadmap)]].

## Ligações

- [[Início]]
- [[Mapa de Funcionalidades]] (as telas que exibem esses dados)
- [[Decisão - App 100% offline]] (por que tudo é arquivo estático)
