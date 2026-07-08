---
tags: [funcionalidade]
atualizado: 2026-07-08
---
# Leitor da Bíblia

Leitor completo da Bíblia católica dentro do app, com os 73 livros em português e inglês, funcionando 100% offline.

## Telas

- `src/screens/BibleScreen.jsx` na tab própria "Bíblia". A mesma tela cobre três estágios: lista de livros, grade de capítulos e leitura dos versículos, com botões de capítulo anterior e próximo.

## Dados

Ver [[Catálogo de Dados]] e [[Bíblia (dados)]] para detalhes.

- `src/data/bible.js` com os metadados dos 73 livros (id, nome PT/EN, testamento, grupo, total de capítulos, deuterocanônico).
- `src/data/bibleAveMaria.js` com o texto Ave Maria em português (aprox. 4 MB).
- `src/data/bibleDouayRheims.js` com o texto Douay-Rheims-Challoner em inglês (aprox. 4,5 MB).

## Serviços e utilitários

- `src/services/bibleApi.js` expõe `getChapter(bookId, chapter, language)`, uma função síncrona que lê direto dos dados empacotados. Se o inglês não estiver disponível, cai automaticamente para o português. Ver [[Serviços]].
- `src/services/userData.js` observa destaques e notas do capítulo (Firestore), ver [[Contas e Sincronização]].
- `src/utils/share.js` e `src/utils/ttsVoice.js` para compartilhar e narrar, ver [[Utilitários e Componentes]].

## Como funciona

O usuário escolhe livro e capítulo e o texto aparece na hora, sem rede. Tocar em um versículo abre um menu com quatro ações: marcar com cor (destaque salvo na conta), anotar (abre o editor de notas), compartilhar e copiar. O botão de narração lê o capítulo inteiro em voz alta com `expo-speech`, dividindo o texto em blocos porque o Android tem limite de caracteres por chamada. A narração para quando o capítulo muda, quando a tela é desmontada ou quando perde o foco ao trocar de aba (correção de julho de 2026). Outras telas chegam aqui por deep link via `route.params` (livro, capítulo e versículo a destacar), usado por Referências, Santo Terço e Busca.

## Ligações

- [[Leitura em Voz Alta (TTS)]]
- [[Caderno, Notas e Favoritos]]
- [[Referências]]
- [[Bíblia (dados)]]
- [[Mapa de Funcionalidades]]
