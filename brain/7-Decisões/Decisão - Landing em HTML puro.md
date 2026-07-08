---
tags: [decisao, site]
atualizado: 2026-07-08
---
# Decisão - Landing em HTML puro

## Contexto

Em junho de 2026 o projeto precisava de um site de apresentação (landing page) com páginas de privacidade, termos e doação. A dúvida era usar um framework ou gerador de site estático, com etapa de build, ou escrever HTML direto.

## Decisão

A landing é `docs/index.html`, um arquivo único de aprox. 690 linhas, sem framework e sem build. As páginas de apoio (`docs/privacy.html`, `docs/terms.html`, `docs/donate.html`) seguem o mesmo padrão: HTML, CSS e JavaScript escritos à mão no próprio arquivo.

## Motivo

- Deploy simples: o workflow do GitHub Actions só copia os arquivos de `docs/` para o site publicado, sem pipeline de build para o HTML.
- Zero manutenção de ferramenta: nada de dependências de frontend para atualizar.
- Carregamento rápido: uma página estática leve, sem JavaScript de framework.

## Consequências

- Animações (IntersectionObserver, respeito a reduced motion) e o i18n PT/EN (atributos `data-i18n` trocados por script) são feitos à mão dentro do próprio arquivo.
- Não há componentes reutilizáveis: um ajuste de cabeçalho ou rodapé precisa ser repetido em cada página de `docs/`.
- Para um site de poucas páginas isso é um bom negócio. Se o site crescer muito, a decisão merece revisão.

## Ligações

- [[Site (Landing Page)]]
- [[Deploy e Publicação]]
