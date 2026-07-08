---
tags: [manutencao]
atualizado: 2026-07-08
---
# Convenções do Projeto

Resumo das convenções do `CLAUDE.md` da raiz, que é a fonte oficial. Vale para qualquer texto e código novos no projeto.

## Estilo de texto (artigos e conteúdo)

- Nunca usar travessão. Vale para artigos, notas deste cofre e textos do app.
- Evitar ponto e vírgula no corpo dos artigos: usar vírgula ou ponto final, que soa mais natural e menos "de máquina".
- Linguagem natural em português, sem jeito de texto gerado.

## Citações e referências

- Citações completas: expandir siglas (escrever Catecismo em vez de CIC) e incluir autor e ano.
- Referências batem com o texto: todo versículo ou documento citado de forma central no corpo de um artigo precisa de entrada correspondente em `src/data/references.js`.
- Não deixar referências órfãs, ou seja, entradas que nenhum artigo cita.

## Fluxo antes de dar como pronto

1. `npm run lint` precisa passar (verificação determinística).
2. Mudança não trivial em tela, navegação, contexto ou serviço: revisão de código por agente (code-review) e, se houver impacto visual, verificação com o app rodando (verify).
3. Mudança só de conteúdo (texto de artigo, referência, tradução): basta o lint.
4. Nunca dizer "pronto e testado" para algo que só compilou. Dizer o que foi de fato verificado e o que ficou de fora.

## Ligações

- [[Como Verificar e Publicar]]
- [[Artigos e Referências (dados)]]
- [[Como Usar Este Cofre]]
