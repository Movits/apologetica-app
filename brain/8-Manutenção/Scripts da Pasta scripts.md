---
tags: [manutencao]
atualizado: 2026-07-08
---
# Scripts da Pasta scripts

Ferramentas internas em `scripts/`, rodadas de vez em quando com `node`. Nenhuma roda dentro do app. Em julho de 2026 são 5 scripts.

## Os 5 scripts

| Script | O que faz | Fonte ou requisito |
|---|---|---|
| `scripts/convert-avemaria.mjs` | Regenera `src/data/bibleAveMaria.js` (Bíblia PT) | Fonte `src/data/_avemaria_raw.json`, gitignored de propósito. É preciso obter o JSON antes de rodar. |
| `scripts/convert-douay-rheims.mjs` | Regenera `src/data/bibleDouayRheims.js` (Bíblia EN) | Fonte `scripts/source/douay-rheims.json`, versionada no git. |
| `scripts/sync-bible-refs.mjs` | Sincroniza o texto das referências bíblicas de `src/data/references.js` com a Ave Maria | Roda direto, sem fonte externa. |
| `scripts/generate-icons.mjs` | Gera os ícones do app (cruz dourada sobre azul marinho) em `assets/` | Desenha os PNGs por código. |
| `scripts/merge-accounts.mjs` | Admin: lista contas do Firestore e junta os dados de um UID em outro (caso de conta duplicada email + Google) | Chave de service account em `.secrets/serviceAccount.json`, nunca commitada. Tem `--list` e `--dry-run`. |

## Observações

- A fonte da Ave Maria fica fora do git de propósito (tamanho e origem externa). Quem for regenerar a Bíblia PT precisa baixar o JSON de novo.
- `merge-accounts.mjs` é ferramenta administrativa de uso pontual, fora do app. Rodar primeiro com `--dry-run`.
- Removidos em julho de 2026, por estarem mortos: `convert-catechism.mjs` (ver [[Decisão - Catecismo vira link para o Vaticano]]) e `split-articles.mjs` (a divisão dos artigos em categorias já foi feita e é definitiva).
- Os comandos de cada script estão listados no `CLAUDE.md` da raiz, que é a lista oficial.

## Ligações

- [[Bíblia (dados)]]
- [[Contas e Sincronização]]
- [[Decisão - Limpeza conservadora de código]]
