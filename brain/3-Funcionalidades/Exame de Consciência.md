---
tags: [funcionalidade]
atualizado: 2026-07-08
---
# Exame de Consciência

Roteiro de perguntas para o católico se preparar para a Confissão, organizado pelos 10 Mandamentos.

## Telas

- `src/screens/ExamConscienceScreen.jsx` mostra os mandamentos como seções expansíveis, uma por vez.

## Dados

Ver [[Catálogo de Dados]].

- `src/data/examConscience.js` traz uma seção por mandamento, cada uma com título, o texto do mandamento e a lista de perguntas de exame. Tudo bilíngue PT/EN (`questoes` e `questoesEn`).

## Serviços e utilitários

- Nenhum serviço externo. A tela usa só o estado local de expandir e recolher seções, mais [[Estado Global e Tema]] para cores e fonte e [[Idiomas (i18n)]] para o idioma.

## Como funciona

O usuário abre a tela antes de se confessar e percorre os mandamentos um a um. Tocar em um mandamento expande a lista de perguntas daquela seção (rezei diariamente, usei o nome de Deus em vão, e assim por diante) e ele reflete em silêncio sobre cada uma. Por decisão deliberada de privacidade, nada é armazenado: não há checkbox, não há histórico e nenhuma resposta é gravada em lugar nenhum, nem no aparelho nem na nuvem. É uma ferramenta de reflexão, não um formulário. Funciona offline como o resto do app.

## Ligações

- [[Santo Terço]]
- [[Idiomas (i18n)]]
- [[Mapa de Funcionalidades]]
