---
tags: [manutencao]
atualizado: 2026-07-08
---
# Como Verificar e Publicar

Checklist do caminho entre "mudei o código" e "está no ar", e o que é automático ou manual.

## Verificar antes de dar como pronto

1. `npm run lint` com zero erros, obrigatório. Avisos existem (aprox. 13 de `react-hooks/exhaustive-deps` em julho de 2026, ver [[Candidatos à Limpeza]]), mas erro nenhum.
2. `npx expo export -p web` para uma compilação completa do app. Pega import quebrado, sintaxe e arquivo faltando, coisas que o lint sozinho não pega.
3. Se a mudança é visível ao usuário, testar de verdade no celular (`npx expo start --lan`) ou emulador. Compilar não é testar.

## O que o CI faz sozinho

Push no `master` que toque arquivos relevantes dispara `.github/workflows/deploy-web.yml` no GitHub Actions:

- Instala dependências (`npm ci`) e roda `npx expo export -p web`.
- Monta o site: páginas de `docs/` na raiz, pasta `fotos/` copiada inteira e o app web em `/app`.
- Publica tudo no GitHub Pages.

Mudanças só em `brain/` ou em documentos da raiz não disparam deploy.

## O que continua manual

- Testes de comportamento no celular. O CI só compila, não usa o app.
- Builds de loja com EAS: perfis `development`, `preview` e `production` definidos em `eas.json`.
- Envio para as lojas (upload de build, fichas, revisão), quando chegar a hora.

## Ligações

- [[Deploy e Publicação]]
- [[Convenções do Projeto]]
- [[Decisão - Limpeza conservadora de código]]
