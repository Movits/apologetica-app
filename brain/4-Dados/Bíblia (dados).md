---
tags: [dado]
atualizado: 2026-07-08
---
# Bíblia (dados)

As duas Bíblias completas embutidas no app, 100% offline. São os maiores arquivos do projeto.

## Arquivos e formato

- `src/data/bibleAveMaria.js`, tradução Ave Maria em português, aprox. 4,5 MB (julho de 2026). Fonte: repositório `fidalgobr/bibliaAveMariaJSON` (texto da Editora Paulinas).
- `src/data/bibleDouayRheims.js`, tradução Douay-Rheims-Challoner em inglês, aprox. 4,7 MB.
- Formato compacto idêntico nos dois: `{ bookId: [[v1, v2, ...], ...] }`, um array de capítulos por livro, cada capítulo é um array de strings de versículos, capítulos 0-indexed.

## Metadados dos livros

`src/data/bible.js` exporta `BIBLE_BOOKS` com os 73 livros do cânon católico (julho de 2026), incluindo os 7 deuterocanônicos (`deutero: true`). Cada livro tem `id`, `apiId` (legado), `name`/`nameEn`, `short`/`shortEn`, `testament`, `group`/`groupEn` e `totalChapters`.

## Proveniência (nunca editar na mão)

Os dois arquivos grandes são gerados a partir de fontes JSON pelos scripts de conversão, ver [[Scripts da Pasta scripts]]:

- `scripts/convert-avemaria.mjs` regenera `bibleAveMaria.js`.
- `scripts/convert-douay-rheims.mjs` regenera `bibleDouayRheims.js`.
- `scripts/sync-bible-refs.mjs` confere se as referências bíblicas de `references.js` batem com o texto.

## Divergências de versificação PT/EN

As duas traduções nem sempre numeram capítulos e versículos do mesmo jeito. Quando uma referência precisa apontar para lugares diferentes em cada idioma, `references.js` usa o campo opcional `bibleNavEn` além do `bibleNav`. Exemplo real: Joel, o trecho "o sol se converterá em trevas" fica em Joel 3,4 na Ave Maria e em Joel 2,31 na Douay-Rheims.

## Quem consome

`src/services/bibleApi.js` expõe `getChapter(bookId, chapter, language)` de forma síncrona. Com `language='en'` usa a Douay-Rheims e cai para o português se o texto EN não existir. É o único ponto de acesso, as telas nunca importam os arquivos grandes diretamente.

## Ligações

- [[Leitor da Bíblia]]
- [[Catálogo de Dados]]
- [[Decisão - App 100% offline]]
