---
tags: [decisao]
atualizado: 2026-10-05
---
# Decisão - Identidades visuais em avaliação

## Contexto

O redesign de setembro de 2026 manteve a identidade de sempre (navy e ouro,
Cormorant, cruz latina). O dono achou que "não é feio, mas não sei se é tão
bom" e pediu para guardar essa opção e ter outras, com logo e imagens, não só
cores.

## O que foi feito

- Quatro identidades em `src/theme/identities.js`: Clássica (padrão, a de
  sempre), Âncora (cruz-âncora das catacumbas, Hebreus 6,19, tinta marinha,
  terracota e marfim, EB Garamond), Basílica (Chi-Rho em mosaico, lápis,
  ouro e pórfiro, Cinzel, família do Museu Virtual) e Lumen (balão de fala
  com a cruz recortada, "a resposta", marfim, tinta e âmbar, Instrument Serif).
- Painéis de marca gerados no Higgsfield (GPT Image 2) em
  `design/identidade/boards/`, símbolos em SVG em `assets/brand/`.
- O dono compara no próprio app: Ajustes > Identidade visual, ou na web com
  `?identidade=ancora|basilica|lumen`. A landing aceita o mesmo parâmetro.
- Toda paleta passa no teste de contraste AA (12 pares, claro e escuro).

## Pendente

- Escolha do dono. Depois dela: ícone do app, splash, cor do `index.html` da
  web e do manifesto, e (se não for a Clássica) remover as outras ou mantê-las
  como opção de tema.
