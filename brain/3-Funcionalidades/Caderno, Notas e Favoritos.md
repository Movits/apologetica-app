---
tags: [funcionalidade]
atualizado: 2026-07-08
---
# Caderno, Notas e Favoritos

O conjunto de conteúdo pessoal do usuário: páginas livres de caderno, notas por versículo, destaques coloridos na Bíblia e artigos favoritos.

## Telas

- `src/screens/NotebookScreen.jsx` e `src/screens/NotebookPageScreen.jsx` (caderno de páginas livres)
- `src/screens/NotesScreen.jsx` e `src/screens/NoteEditorScreen.jsx` (notas ligadas a versículos, o editor é modal full-screen)
- `src/screens/HighlightsScreen.jsx` (destaques de versículos)
- `src/screens/FavoritesScreen.jsx` (artigos favoritos)

## Dados

- [[Catálogo de Dados]]
- Conteúdo criado pelo usuário, nada estático. Notas, destaques e caderno vivem no Firestore em `users/{uid}/...`, favoritos vivem só no aparelho

## Serviços e utilitários

- `src/services/userData.js` faz o CRUD no Firestore com watchers em tempo real (`watchNotes`, `watchHighlights`, `watchNotebook`), ver [[Serviços]]
- `src/utils/favorites.js` guarda os favoritos em AsyncStorage local, sem conta
- `src/components/GuestGate.jsx` (hook `useRequireAccount`) e `src/components/AccountPrompt.jsx` barram o visitante com um convite para criar conta, ver [[Utilitários e Componentes]]
- `src/components/NotebookText.jsx` renderiza os tokens de referência do caderno como links clicáveis

## Como funciona

No caderno o usuário escreve à vontade e digita `@` para abrir um seletor que insere um token de referência no texto, no formato `@[rótulo](v:...)` para versículo, `a:` para artigo e `r:` para referência do app. Na leitura esses tokens viram links que navegam direto para o alvo. As notas são presas a um intervalo de versículos e os destaques a um versículo com cor. Tudo isso exige login porque sincroniza via Firestore entre dispositivos, o visitante que tenta usar recebe o modal de criar conta. Favoritos são a exceção: ficam em AsyncStorage local e funcionam até sem conta, mas por isso não sincronizam.

## Ligações

- [[Contas e Sincronização]]
- [[Leitor da Bíblia]] (onde se cria destaque e nota)
- [[Artigos]] (origem dos favoritos)
- [[Compartilhamento]]
