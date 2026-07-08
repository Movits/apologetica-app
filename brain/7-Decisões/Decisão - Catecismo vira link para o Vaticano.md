---
tags: [decisao]
atualizado: 2026-07-08
---
# Decisão - Catecismo vira link para o Vaticano

## Contexto

O app chegou a ter um navegador interno do Catecismo da Igreja Católica, com tela própria e script de conversão do texto integral. Essa tela foi removida antes do lançamento, mas as referências ao Catecismo continuaram existindo no catálogo (ids que começam com `cic-`).

## Decisão

Em vez de exibir o texto do Catecismo dentro do app, as referências `cic-*` abrem o site oficial do Vaticano no idioma do usuário. As URLs base (versão em português e versão em inglês) ficam em `src/screens/RefDetailScreen.jsx`, e a tela de referências também aponta para o índice oficial quando necessário.

## Motivo

- O texto integral do Catecismo é pesado (megabytes de dados) e delicado de manter fiel e atualizado.
- O link oficial do Vaticano é sempre correto, sem risco de erro de transcrição ou de direitos sobre o texto.

## Consequências

- Ler o Catecismo exige internet, uma exceção consciente à regra do app offline (a citação curta da referência continua disponível offline).
- As chaves de i18n da tela antiga e o script `convert-catechism.mjs` ficaram mortos no código e foram removidos na limpeza de julho de 2026.
- Se um dia o Catecismo integral voltar para dentro do app, esta decisão precisa ser revista junto com o peso dos dados.

## Ligações

- [[Referências]]
- [[Decisão - App 100% offline]]
- [[Decisão - Limpeza conservadora de código]]
