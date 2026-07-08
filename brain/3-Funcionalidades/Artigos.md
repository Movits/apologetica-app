---
tags: [funcionalidade]
atualizado: 2026-07-08
---
# Artigos

O coração do app: artigos de apologética organizados por categoria, que explicam e defendem a fé católica em linguagem acessível.

## Telas

- `src/screens/ArticlesScreen.jsx` lista as categorias e a seção "Mais buscados" (tab Artigos).
- `src/screens/CategoryArticlesScreen.jsx` lista os artigos de uma categoria, ordenados por relevância.
- `src/screens/ArticleDetailScreen.jsx` exibe o artigo completo.

## Dados

Ver [[Catálogo de Dados]] e [[Artigos e Referências (dados)]].

- `src/data/articles/` com aprox. 83 artigos em 6 categorias (julho de 2026): existência de Deus, Igreja Católica, Sagrada Escritura, moral, outras religiões e história da Igreja. O `src/data/articles/index.js` junta tudo em um array só.
- `src/data/articles-en.js` com as traduções em inglês (título, resumo e corpo).
- `src/data/articleCategories.js` com a ordem das categorias e o ranking `RANKED_IDS` que define os "Mais buscados".
- `src/data/articleRelations.js` com o mapa de "Ver também" entre artigos.
- Imagens de obras sacras em `assets/articles/`, uma por artigo.

## Serviços e utilitários

- `src/components/ImageZoomModal.jsx` amplia a imagem do artigo com zoom, ver [[Utilitários e Componentes]].
- `expo-speech` narra o artigo em voz alta, ver [[Leitura em Voz Alta (TTS)]].
- `src/utils/readingProgress.js` marca o dia do plano de leitura via `markPlanDay`.
- `src/utils/lastRead.js` guarda o último artigo lido para o card "Continuar lendo" da Home.

## Como funciona

O usuário navega por categoria ou pelos mais buscados e abre o artigo. O detalhe mostra imagem com crédito (tocar amplia com zoom), corpo com referências clicáveis que abrem a tela de referência, termos do glossário clicáveis e a lista de artigos relacionados no fim. Se o artigo faz parte de um trilho do plano de leitura, o dia correspondente é marcado automaticamente ao ler. Tudo tem versão em inglês quando o idioma do app é EN.

## Conteúdo real (grafo gerado)
Cada artigo do app tem uma nota conectada em [[Conteúdo do App (gerado)]], organizada pelas categorias [[Existência de Deus]], [[Igreja Católica]], [[Sagrada Escritura]], [[Moral]], [[Outras Religiões]] e [[História da Igreja]].

## Ligações

- [[Plano de Leitura]]
- [[Glossário]]
- [[Referências]]
- [[Artigos e Referências (dados)]]
- [[Mapa de Funcionalidades]]
