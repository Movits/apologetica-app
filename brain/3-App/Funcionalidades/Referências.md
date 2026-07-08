---
tags: [funcionalidade]
atualizado: 2026-07-08
---
# Referências

Acervo de citações que sustentam os artigos: versículos bíblicos, parágrafos do Catecismo, documentos da Igreja e teólogos.

## Telas

- `src/screens/ReferencesScreen.jsx` lista as referências agrupadas por fonte (tab Referências).
- `src/screens/RefDetailScreen.jsx` mostra uma referência sozinha. É usada quando o usuário chega por um artigo ou pela busca.

## Dados

Ver [[Catálogo de Dados]] e [[Artigos e Referências (dados)]].

- `src/data/references.js` com aprox. 205 referências (julho de 2026). As bíblicas trazem `bibleNav` (livro, capítulo, versículo) para navegar até o texto, aprox. 103 delas.
- `src/data/references-en.js` com as versões em inglês.
- `src/data/referenceSources.js` com as 5 fontes: Bíblia, Catecismo, Documentos, Teólogos e Outros.

## Serviços e utilitários

- Navegação por deep link para a tab Bíblia usando o `bibleNav` da referência.
- `Linking.openURL` abre o Catecismo no site do Vaticano (endereço PT ou EN conforme o idioma do app).

## Como funciona

Na lista, o usuário filtra por fonte e toca em uma referência para expandir. Referências bíblicas mostram o botão "Ler no app", que navega para a tab Bíblia já com o versículo destacado. Referências do Catecismo abrem o texto oficial no site do Vaticano no navegador, decisão registrada em [[Decisão - Catecismo vira link para o Vaticano]]. Quando um artigo cita uma referência, o toque leva para `src/screens/RefDetailScreen.jsx` sem perder o lugar da leitura. A convenção do projeto exige que toda citação central de um artigo tenha entrada correspondente aqui, ver [[Convenções do Projeto]].

## Conteúdo real (grafo gerado)
As aprox. 205 referências têm notas individuais em [[Conteúdo do App (gerado)]], cada uma listando os artigos que a usam.

## Ligações

- [[Leitor da Bíblia]]
- [[Artigos]]
- [[Busca]]
- [[Decisão - Catecismo vira link para o Vaticano]]
- [[Mapa de Funcionalidades]]
