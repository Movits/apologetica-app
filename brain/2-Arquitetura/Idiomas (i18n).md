---
tags: [arquitetura]
atualizado: 2026-07-08
aliases: [i18n, Traducao]
---

# Idiomas (i18n)

O app fala português e inglês. A tradução tem duas camadas: os textos de interface (botões, títulos, avisos) e o conteúdo em si (artigos, referências, Bíblia).

## Textos de interface

Arquivo: `src/i18n/strings.js`. Exporta `STRINGS` com dois blocos, `pt` e `en`, com aprox. 171 chaves por idioma (julho de 2026, depois da limpeza de chaves órfãs).

- As telas usam `t('chave')` do LanguageContext, ver [[Estado Global e Tema]].
- `translate()` resolve na ordem: idioma atual, depois português, depois devolve a própria chave. Ou seja, uma chave sem tradução EN cai no PT em vez de quebrar.
- Suporta interpolação com `{{variavel}}`, ex.: `t('quiz.score', { n: 7 })`.

## Conteúdo bilíngue

O conteúdo segue o padrão de campos `*En` nos próprios arquivos de dados: o objeto tem `title` e `titleEn`, `summary` e `summaryEn`, e assim por diante. A tela escolhe o campo conforme `isEn`.

Para os volumes grandes, a tradução vive em arquivos separados que são mesclados na carga:

- `src/data/articles-en.js` traz `{ [id]: { titleEn, summaryEn, bodyEn } }` e é aplicado por `src/data/articles/index.js` sobre os artigos PT.
- `src/data/references-en.js` faz o mesmo para as referências.
- A Bíblia tem duas traduções completas embarcadas: Ave Maria (PT) e Douay-Rheims (EN), ver [[Bíblia (dados)]] e [[Leitor da Bíblia]].

## Regra de fallback

O português é sempre a fonte da verdade. Em todos os níveis, se o inglês faltar, o app mostra o PT:

- Chave de interface sem EN cai no bloco `pt` de `strings.js`.
- Artigo sem `bodyEn` mostra o corpo em português.
- Capítulo indisponível em EN volta marcado como fallback PT em `src/services/bibleApi.js`.

## Escolha e persistência do idioma

- O usuário troca o idioma em Ajustes (e nas telas de entrada via pílulas do topo).
- Persistência em AsyncStorage na chave `settings:language`.
- Na web, a chave `appg_lang` do localStorage é compartilhada com a landing e tem prioridade na primeira carga. Ver [[Site (Landing Page)]].
- Os nomes de rota das abas ficam fixos em PT, só o rótulo visível muda. Ver [[Navegação e Telas]].

## Ao adicionar conteúdo novo

Seguir as [[Convenções do Projeto]]: criar a chave nos dois blocos de `strings.js` ou preencher os campos `*En` correspondentes. Conteúdo sem tradução não quebra nada, mas aparece em português para quem usa o app em inglês.
