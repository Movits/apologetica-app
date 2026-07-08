---
tags: [memoria, diario]
atualizado: 2026-07-08
---
# 2026-07-08 - Reunião do Conselho de Administração

## O que foi feito

Conselho de IA (12 conselheiros + Presidente) analisou o projeto inteiro, debateu
4 rodadas e sintetizou. Ata em [[Reunião do Conselho (2026-07-08)]] e plano em
[[Plano de Negócio]].

## Veredito

GO condicional e faseado, 12 a 0 no mérito, como MINISTÉRIO autossustentável (os
unit economics de consumidor PT não fecham como venture; sucesso = cobrir o burn
sub-R$3k/ano via doação + talvez B2B institucional).

## Achados de código confirmados na hora (não eram teoria)

- `src/sentry.js` liga `sendDefaultPii: true` + session replay, contra a
  `docs/privacy.html` que promete "não rastreamos comportamento". Declaração falsa
  publicada. URGENTE de corrigir.
- Sem exclusão de conta in-app (bloqueio de loja). Bíblia Ave Maria sob copyright.
  Typo "biblicas" no onboarding. Badges "Em breve" capturam zero.

## Decisões pendentes do fundador

- Declarar o FRAME por escrito: ministério (doação) x negócio (ARR). Muda o que é sucesso.
- Testar mercado EN ou congelar manutenção EN.

## Pendências / próximo passo

- Quick wins de código que a IA pode fazer já: corrigir `sentry.js`, corrigir typo,
  reposicionar copy da landing, virar badges em captura de waitlist.
- Gate 1 maior (exclusão de conta, OTA, analytics, Figueiredo) precisa de decisão e
  esforço faseado. Priorizar com o Roberto.
