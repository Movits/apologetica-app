---
tags: [memoria, diario]
atualizado: 2026-07-08
---
# 2026-07-08 - Revisão profunda, limpeza e nascimento do brain

## O que foi feito

- Revisão profunda do app com múltiplos agentes: 6 correções aplicadas
  (TTS que continuava tocando ao trocar de aba, referência sem tradução EN
  no detalhe, scroll na web ignorando o alvo, listener morto, voltar duplo
  na Objeção do dia, crash latente no modal do Mapa Bíblico).
- Limpeza conservadora: arquivo de dados órfão, 2 scripts quebrados, 5
  exports mortos, 116 linhas de i18n sem uso, 12 imports órfãos. Warnings
  do lint de 26 pra 14. O que ficou de fora está em [[Candidatos à Limpeza]].
- Lint que nunca funcionou de verdade agora funciona (config criada).
- CLAUDE.md corrigido (documentava abas que não existem mais).
- Este cofre nasceu: camada estrutural escrita à mão + grafo de conteúdo
  gerado dos dados do app pelo `scripts/generate-brain.mjs`.
- Reorganização v3 do cofre: 4 áreas (Memória, Projeto, App, Conteúdo),
  pastas geradas com nomes sem ambiguidade, esta camada de memória criada.

## Decisões tomadas

- Limpeza sempre conservadora ([[Decisão - Limpeza conservadora de código]]).
- Vault versionado no git, gerado se regenera, curado se escreve à mão.

## Pendências deixadas

- Ver [[Candidatos à Limpeza]] e [[Roteiro de Ideias (Roadmap)]].
- Smoke tests manuais do usuário: TTS parar ao trocar de aba, referência em
  inglês pela Busca, Objeção do dia voltar com um toque.
