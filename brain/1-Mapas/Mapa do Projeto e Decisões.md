---
tags: [mapa]
atualizado: 2026-07-08
---
# Mapa do Projeto e Decisões

Tudo que cerca o código: o site, o caminho até as lojas, as decisões que moldaram o projeto e as rotinas de manutenção. Reúne as notas de `brain/5-Site e Deploy/`, `brain/7-Decisões/` e `brain/8-Manutenção/`.

## Site e deploy

- [[Site (Landing Page)]]: a página de apresentação em `docs/index.html`, HTML puro num arquivo só, hospedada no GitHub Pages.
- [[Deploy e Publicação]]: como o site vai ao ar e como o app chega às lojas via EAS.

## Decisões registradas

Cada uma segue o modelo Contexto, Decisão, Motivo e Consequências.

- [[Decisão - App 100% offline]]: todo o conteúdo embarcado em arquivos estáticos, rede só para conta e cards do dia.
- [[Decisão - Landing em HTML puro]]: sem framework nem build para o site, um arquivo editável direto.
- [[Decisão - Pastas fotos e documentos na raiz]]: dois lugares seguros e com nome em português para os arquivos do dono do projeto.
- [[Decisão - Catecismo vira link para o Vaticano]]: o navegador interno do Catecismo saiu, as referências `cic-` abrem o site oficial.
- [[Decisão - Limpeza conservadora de código]]: só remover código morto com prova, o resto vai para a lista de observação.

## Manutenção

- [[Convenções do Projeto]]: resumo das regras de texto e código do `CLAUDE.md` da raiz.
- [[Como Verificar e Publicar]]: o checklist entre "mudei o código" e "está no ar".
- [[Scripts da Pasta scripts]]: as ferramentas internas rodadas de vez em quando com `node`.
- [[Candidatos à Limpeza]]: lista viva do que parece morto mas ainda não tem prova para remover.
- [[Roteiro de Ideias (Roadmap)]]: fila de ideias de evolução do app, quase todas vindas da pesquisa de mercado.
- [[Como Usar Este Cofre]]: guia para navegar e manter este segundo cérebro.

## Ligações

- [[Início]]
- [[Mapa de Conteúdo e Dados]] (as pesquisas que alimentam o roadmap)
