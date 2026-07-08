---
tags: [arquitetura]
atualizado: 2026-07-08
---

# Serviços

A pasta `src/services/` concentra o acesso a dados que não são simples import estático: Bíblia embarcada, Firebase, APIs com cache e notificações. São 7 arquivos em julho de 2026.

## Tabela de serviços

| Arquivo | O que faz | Quem usa |
| --- | --- | --- |
| `src/services/bibleApi.js` | `getChapter(bookId, chapter, language)` síncrono, sem rede. Lê a Ave Maria (PT) ou a Douay-Rheims (EN) embarcadas, com fallback automático para PT | `BibleScreen`, `HighlightsScreen`, `NoteEditorScreen`, `ReferencePickerModal` |
| `src/services/firebase.js` | Inicializa o app Firebase, o auth (persistência por plataforma) e o Firestore. Exporta `auth` e `db` | `AuthContext`, `userData.js`, hooks de login Google, `NoteEditorScreen` |
| `src/services/userData.js` | CRUD e escuta em tempo real dos dados do usuário no Firestore (`users/{uid}`): destaques, notas e caderno | `BibleScreen`, `HighlightsScreen`, `NotesScreen`, `NoteEditorScreen`, telas do caderno |
| `src/services/liturgyApi.js` | Liturgia do dia de uma API comunitária que raspa a CNBB. Cache diário em AsyncStorage, timeout de 8s e fallback para cache antigo se a rede falhar | `LiturgyScreen`, `LiturgyCard` (tela Dia de hoje) |
| `src/services/newsApi.js` | Notícias católicas (Vatican News, ACI Digital, CNA) via rss2json, com feeds por idioma, cache de 3 horas e resolução de imagem por proxies | `NewsCard` (tela Dia de hoje) |
| `src/services/notifications.js` | Notificações locais agendadas (versículo diário, liturgia de domingo, quiz diário) com expo-notifications e preferências em AsyncStorage | `SettingsScreen` |
| `src/services/notifications.web.js` | Stubs no-op com a mesma interface, resolvidos pelo Metro na web. Mantêm expo-notifications fora do bundle web | `SettingsScreen` (na web a seção fica oculta) |

## Padrões que se repetem

- **Offline primeiro**: `bibleApi` nunca toca a rede. `liturgyApi` e `newsApi` tentam cache antes da rede e devolvem cache velho se a rede falhar, marcando a origem (`cache`, `network`, `stale`). Ver [[Decisão - App 100% offline]].
- **Variante `.web.js`**: quando um módulo depende de recurso nativo, existe um irmão web com a mesma interface. O Metro escolhe sozinho na build.
- **Timeout com AbortController**: as chamadas de rede abortam em 8 segundos para não travar o app offline.
- **Erros engolidos com fallback**: falha de cache ou de rede nunca derruba a tela, sempre há um caminho degradado.

## Relacionadas

- [[Contas e Sincronização]] detalha `firebase.js`, `userData.js` e as regras de segurança.
- [[Leitor da Bíblia]] e [[Bíblia (dados)]] detalham o consumo do `bibleApi.js`.
- [[Conteúdo do Dia]] cobre a tela que junta liturgia, notícias, santo e versículo.
- [[Utilitários e Componentes]] lista os helpers menores de `src/utils/`.
