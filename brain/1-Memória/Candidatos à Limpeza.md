---
tags: [manutencao]
atualizado: 2026-07-08
---
# Candidatos à Limpeza

Lista viva do que parece morto ou duplicado mas ainda não tem prova suficiente para remover. Estado de julho de 2026.

## A regra de saída

Um item só sai desta lista de dois jeitos: com prova de morte (grep sem ocorrências, `npm run lint` limpo e build completo passando depois da remoção) ou com um teste que aprove a remoção. Enquanto houver dúvida, o item fica aqui. Ver [[Decisão - Limpeza conservadora de código]].

## Os candidatos

| # | Candidato | Onde | Por que ainda não saiu |
|---|---|---|---|
| 1 | Dependências `@react-navigation/stack`, `promise` e `expo-crypto` | `package.json` | Zero imports diretos no código, mas `expo-crypto` pode ser dependência implícita do PKCE do `expo-auth-session`. Exige teste de login (email e Google) antes de remover. |
| 2 | Trio morto `markAsRead`, `getReadSet` e `KEY_READ` | `src/utils/readingProgress.js` | Rastreio de artigo lido que nunca foi usado por nenhuma tela. Pode virar base de streak, ver [[Roteiro de Ideias (Roadmap)]]. |
| 3 | Aprox. 13 avisos `react-hooks/exhaustive-deps` no lint | Vários arquivos de `src/` | Mudar dependências de hooks muda comportamento em tempo de execução. Revisar um a um, nunca em lote. |
| 4 | Formatação de referência bíblica duplicada | Aprox. 5 arquivos: `NotesScreen`, `NoteEditorScreen`, `HighlightsScreen`, `ReferencePickerModal` e `BibleScreen` | Cada um monta "Livro capítulo,versículo" do seu jeito. Oportunidade de helper único `formatBibleRef`. |
| 5 | Efeito de scroll até `highlightId` | `src/screens/ReferencesScreen.jsx` | Aparentemente órfão: hoje as navegações abrem a tela RefDetail em vez de rolar a lista. Confirmar que nada mais passa `highlightId` e remover depois. |

## Como revisar

Ao mexer perto de um desses itens, aproveitar para produzir a prova (ou o teste) e riscar o item. Atualizar esta nota e o campo `atualizado` sempre que um item entrar ou sair.

## Ligações

- [[Decisão - Limpeza conservadora de código]]
- [[Como Verificar e Publicar]]
- [[Roteiro de Ideias (Roadmap)]]
