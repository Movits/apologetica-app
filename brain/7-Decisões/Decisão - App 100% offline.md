---
tags: [decisao]
atualizado: 2026-07-08
---
# Decisão - App 100% offline

## Contexto

O app é usado no celular em qualquer lugar: ônibus, fila, igreja, viagem. No início do projeto havia duas opções para o conteúdo, principalmente a Bíblia: buscar de uma API na internet ou empacotar tudo dentro do app.

## Decisão

Todo o conteúdo vive empacotado em `src/data/`, sem chamadas de rede em tempo de execução para conteúdo. Isso inclui:

- A Bíblia inteira nos dois idiomas: Ave Maria em português (`src/data/bibleAveMaria.js`) e Douay-Rheims em inglês (`src/data/bibleDouayRheims.js`), somando aprox. 8.5 MB em julho de 2026.
- Artigos, referências, quiz, glossário, diálogos, plano de leitura, mapa bíblico e o restante do catálogo.

A rede fica reservada para quatro coisas: conta (Firebase Auth), sincronização de notas, destaques e favoritos (Firestore), liturgia do dia e notícias.

## Motivo

- O público usa o app no celular em qualquer lugar, com ou sem sinal.
- Confiabilidade: nenhuma API fora do ar derruba a leitura da Bíblia ou dos artigos.
- Velocidade: acesso síncrono e instantâneo via `src/services/bibleApi.js`, sem loading nem cache para manter.

## Consequências

- O app fica maior no download (a Bíblia dupla é a maior parte dos aprox. 8.5 MB de dados).
- Conteúdo novo ou corrigido exige atualização do app nas lojas, não chega sozinho pelo servidor.
- O código de acesso aos dados fica simples: funções síncronas, sem tratamento de erro de rede.
- As funções que dependem de rede (liturgia, notícias, sincronização) precisam degradar com elegância quando offline.

## Ligações

- [[Bíblia (dados)]]
- [[Catálogo de Dados]]
- [[Serviços]]
- [[Contas e Sincronização]]
