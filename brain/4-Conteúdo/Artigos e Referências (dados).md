---
tags: [dado]
atualizado: 2026-07-08
---
# Artigos e Referências (dados)

O coração do conteúdo apologético: os artigos e as fontes que eles citam. Contagens de julho de 2026.

## As 6 categorias de artigos

Cada categoria vive num arquivo próprio em `src/data/articles/` e `src/data/articles/index.js` junta tudo num array só:

| Arquivo | Categoria | Aprox. |
|---|---|---|
| `existencia-deus.js` | Existência de Deus | 15 artigos |
| `igreja-catolica.js` | Igreja Católica | 23 artigos |
| `sagrada-escritura.js` | Sagrada Escritura | 14 artigos |
| `moral.js` | Moral | 7 artigos |
| `outras-religioes.js` | Outras Religiões | 14 artigos |
| `historia-igreja.js` | História da Igreja | 10 artigos |

Total aprox. 83 artigos.

## Estrutura de um artigo

- `id` numérico único, `title`, `summary` e `body` em markdown.
- No `body`, termos entre colchetes duplos como `[[termo]]` viram destaque tocável que abre a definição do [[Glossário]] (renderizado por `src/components/MarkdownText.jsx`).
- `image` aponta para uma pintura de domínio público em `assets/articles/`. Créditos das obras em [creditos](../../documentos/creditos-das-imagens.md).
- `references` lista ids de `references.js`. Convenção do projeto: toda citação central do corpo tem entrada correspondente, e nenhuma referência fica órfã.

## Traduções e relações

- `src/data/articles-en.js` guarda `{ [id]: { titleEn, summaryEn, bodyEn } }`, mesclado no `index.js`.
- `src/data/articleRelations.js` (`RELATED_ARTICLES`) alimenta o bloco "Ver também" no fim de cada artigo.

## Referências

- `src/data/references.js` tem aprox. 205 referências: Bíblia, Catecismo, documentos da Igreja e teólogos.
- Refs bíblicas trazem `bibleNav: { bookId, chapter, verse }` para abrir o capítulo dentro do app, e `bibleNavEn` quando a versificação EN diverge, ver [[Bíblia (dados)]].
- Refs não bíblicas trazem `url` para a fonte oficial, caso do Catecismo, ver [[Decisão - Catecismo vira link para o Vaticano]].
- Algumas refs têm `originalLanguage` com a palavra no grego ou hebraico, transliteração e número de Strong.
- `src/data/references-en.js` guarda as traduções EN (`textEn`, `topicEn`), mescladas na tela.

## Ligações

- [[Artigos]] e [[Referências]] (funcionalidades que consomem esses dados)
- [[Catálogo de Dados]]
- [[Top 100 Tópicos]] (priorização de artigos novos)
