---
tags: [funcionalidade]
atualizado: 2026-07-08
---
# Glossário

Dicionário de termos teológicos e apologéticos que o usuário consulta na tela própria ou tocando em palavras destacadas dentro dos artigos.

## Telas

- `src/screens/GlossaryScreen.jsx` (lista com busca e cards expansíveis)

## Dados

- [[Catálogo de Dados]]
- `src/data/glossary.js` com aprox. 26 termos em julho de 2026, todos bilíngues (campos `term`, `termEn`, `definition`, `definitionEn`)

## Serviços e utilitários

- `src/components/MarkdownText.jsx` faz o destaque automático dos termos nos artigos (ver [[Utilitários e Componentes]])
- Nenhum serviço de rede, tudo local

## Como funciona

A tela mostra a lista de termos com campo de busca que filtra por termo e definição nos dois idiomas. Cada card expande para mostrar a definição completa. Nos artigos, o componente `MarkdownText` destaca automaticamente a primeira ocorrência de cada termo do glossário no corpo do texto, transformando a palavra em link clicável. O autor também pode forçar um link manual com a sintaxe `[[termo]]` no corpo do artigo. Tocar no link navega para a tela do glossário com o parâmetro `highlightTerm`, que expande o card certo e rola a lista até ele.

## Ligações

- [[Artigos]] (onde os termos aparecem destacados)
- [[Mapa de Funcionalidades]]
- [[Idiomas (i18n)]]
