---
tags: [funcionalidade]
atualizado: 2026-07-08
---
# Diálogos e Objeção do Dia

Treino de conversa real: objeções comuns contra a fé ("quem criou Deus?") com um roteiro de resposta passo a passo.

## Telas

- `src/screens/DialogueScreen.jsx` tem dois modos na mesma tela: a lista de objeções por categoria e, ao escolher uma, a conversa guiada que avança passo a passo.
- O card "Objeção do dia" fica na Home, em `src/screens/HomeScreen.jsx`.

## Dados

Ver [[Catálogo de Dados]].

- `src/data/dialogues.js` com aprox. 53 objeções (julho de 2026). Cada uma traz a fala provocadora, 4 passos de resposta na ordem concordar, reformular, apresentar o argumento e fechar, além do `relatedArticle` para aprofundar. Tudo bilíngue PT/EN.

## Serviços e utilitários

- A Home calcula a objeção do dia com uma semente determinística pelo dia do ano e o ano, então todo mundo vê a mesma objeção no mesmo dia e ela roda sozinha.
- `BackHandler` e o evento `beforeRemove` da navegação controlam o comportamento do botão voltar.

## Como funciona

O usuário escolhe uma objeção e a tela vira uma conversa guiada: primeiro a fala da outra pessoa, depois cada passo da resposta aparece um por vez, ensinando o ritmo de um diálogo respeitoso em vez de um sermão decorado. No fim há o link para o artigo completo. O botão voltar é inteligente: quem abriu o diálogo pela lista volta para a lista, quem chegou pelo card da Home sai da tela direto, sem parada intermediária (correção de julho de 2026, controlada por uma ref que registra a origem).

## Conteúdo real (grafo gerado)
Cada objeção tem nota própria conectada ao artigo correspondente, via [[Conteúdo do App (gerado)]].

## Ligações

- [[Artigos]]
- [[Estratégias de Debate]]
- [[Conteúdo do Dia]]
- [[Mapa de Funcionalidades]]
