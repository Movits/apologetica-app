---
tags: [funcionalidade]
atualizado: 2026-07-08
---
# Quiz da Fé

Jogo de perguntas e respostas para aprender apologética brincando, com pergunta nova todo dia e sequência de acertos.

## Telas

- `src/screens/QuizScreen.jsx` concentra tudo. O parâmetro `mode` define o que aparece: `menu` (escolha do modo), `daily` (pergunta do dia), `practice` (múltipla escolha livre) e `truefalse` (verdadeiro ou falso).

## Dados

Ver [[Catálogo de Dados]].

- `src/data/quiz.js` com três bancos de perguntas (julho de 2026): `QUIZ` com aprox. 100 questões de múltipla escolha por categoria, `TRUE_FALSE` com aprox. 100 afirmações de verdadeiro ou falso e `DAILY_QUESTIONS` com aprox. 100 perguntas do modo diário. No total aprox. 300 questões, todas bilíngues PT/EN e com explicação após a resposta.

## Serviços e utilitários

- Progresso e sequência de dias guardados em AsyncStorage (chave `quiz:streak`), sem depender de conta.
- Cada questão pode apontar um `relatedArticle` que leva ao artigo de [[Artigos]] sobre o tema.

## Como funciona

No menu o usuário escolhe um dos modos. No modo diário aparece uma pergunta nova por dia e acertar em dias seguidos constrói uma sequência (streak) mostrada com contador de dias. No modo prática o usuário responde uma rodada de múltipla escolha com contagem de acertos no fim. No verdadeiro ou falso o jogo desmonta mitos comuns sobre a fé católica (Galileu, Inquisição, "adoração" a Maria). Toda resposta vem com uma explicação curta do porquê, que é onde o aprendizado de verdade acontece.

## Ligações

- [[Artigos]]
- [[Conteúdo do Dia]]
- [[Mapa de Funcionalidades]]
