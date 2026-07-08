---
tags: [funcionalidade]
atualizado: 2026-07-08
---
# Compartilhamento

Botões de compartilhar espalhados pelo app: versículo, destaque, nota e artigo saem como texto, e o versículo do dia também sai como imagem pronta para redes sociais.

## Telas

- Transversal: usado em `src/screens/BibleScreen.jsx`, `src/screens/HighlightsScreen.jsx`, `src/screens/NoteEditorScreen.jsx`, `src/screens/ArticleDetailScreen.jsx` e no card do versículo do dia

## Dados

- [[Catálogo de Dados]]
- Nenhum dado próprio, compartilha o conteúdo que já está na tela

## Serviços e utilitários

- `src/utils/share.js` monta as mensagens (`shareVerse`, `shareHighlight`, `shareNote`, `shareArticle`) e acrescenta um rodapé de divulgação do app, com espaço para o link da loja quando o app for publicado, ver [[Utilitários e Componentes]]
- `src/components/ShareVerseCard.jsx` é o card visual do versículo (variantes quadrada de 1080x1080 e story de 1080x1920), renderizado fora da tela
- `src/utils/shareAsImage.js` captura esse card como PNG com `react-native-view-shot` e abre a folha de compartilhamento com `expo-sharing`

## Como funciona

No celular tudo passa pela folha de compartilhamento nativa. Na web o utilitário tenta a Web Share API do navegador e, se não existir (desktop), copia o texto para a área de transferência e avisa o usuário, para o botão nunca falhar em silêncio. O compartilhar como imagem renderiza o `ShareVerseCard` invisível na tela, captura como PNG e envia. Se os pacotes de captura não estiverem instalados, o fluxo degrada para compartilhar o texto simples. As mensagens seguem um formato fixo: citação entre aspas, referência da passagem e o rodapé do APPologética.

## Ligações

- [[Leitor da Bíblia]]
- [[Caderno, Notas e Favoritos]]
- [[Conteúdo do Dia]]
- [[Artigos]]
