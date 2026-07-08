---
tags: [funcionalidade]
atualizado: 2026-07-08
---
# Plano de Leitura

Trilhas de estudo que organizam os artigos do app em uma sequência com começo, meio e fim, um artigo por dia.

## Telas

- `src/screens/ReadingPlanScreen.jsx` mostra os trilhos disponíveis, a barra de progresso e a lista de dias de cada trilho.

## Dados

Ver [[Catálogo de Dados]].

- `src/data/readingPlan.js` define `READING_TRACKS` com 2 trilhos (julho de 2026): "Fundamentos em 30 dias", pensado para quem começa do zero (Deus, Cristo, Bíblia, Igreja, vida cristã), e "Aprofundamento", com apologética avançada (história, ciência, mariologia, milagres, outras religiões, moral aplicada). Cada dia aponta para um `articleId` com um tema curto bilíngue.

## Serviços e utilitários

- `src/utils/readingProgress.js` guarda o progresso em AsyncStorage com uma chave por trilho, com funções para ler, marcar e reiniciar o progresso. Ver [[Utilitários e Componentes]].
- `src/screens/ArticleDetailScreen.jsx` chama `markPlanDay` ao abrir um artigo, então o dia é marcado sozinho.

## Como funciona

O usuário escolhe um trilho e vê os dias em ordem, cada um com o tema e o artigo correspondente. Tocar em um dia abre o artigo em [[Artigos]] e, ao ler, o dia é marcado como concluído automaticamente, sem precisar voltar para dar check. A barra de progresso mostra quantos dias foram feitos no trilho. Dá para reiniciar o progresso de um trilho sem perder nada, já que os artigos continuam disponíveis. O progresso fica só no aparelho, em AsyncStorage, e funciona offline.

## Conteúdo real (grafo gerado)
Os trilhos têm notas com o dia a dia linkado aos artigos: [[Trilho - Fundamentos em 30 dias]] e [[Trilho - Aprofundamento]].

## Ligações

- [[Artigos]]
- [[Utilitários e Componentes]]
- [[Mapa de Funcionalidades]]
