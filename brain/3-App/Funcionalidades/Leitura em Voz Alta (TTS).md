---
tags: [funcionalidade]
atualizado: 2026-07-08
aliases: [TTS, Narração]
---
# Leitura em Voz Alta (TTS)

Narração por voz sintética do capítulo da Bíblia ou do artigo aberto, com voz e velocidade escolhidas pelo usuário.

## Telas

- Transversal: botão de narração em `src/screens/BibleScreen.jsx` e `src/screens/ArticleDetailScreen.jsx`
- Configuração de voz e velocidade em `src/screens/SettingsScreen.jsx`

## Dados

- [[Catálogo de Dados]]
- Nenhum dado próprio, narra o texto já carregado na tela. Preferências (voz por idioma e velocidade) ficam em AsyncStorage

## Serviços e utilitários

- Biblioteca `expo-speech` (TTS do sistema operacional, funciona offline com vozes locais)
- `src/utils/ttsVoice.js` classifica as vozes disponíveis e resolve qual usar, ver [[Utilitários e Componentes]]

## Como funciona

O utilitário `ttsVoice.js` filtra as dezenas de vozes do sistema para no máximo 4 opções por idioma (masculina e feminina de Brasil e Portugal para PT, de EUA e Reino Unido para EN), dando nomes amigáveis como Bruno e Camila. Na web a lista vem do `speechSynthesis` do navegador. A velocidade padrão é 0.95 e a escolha é salva por idioma. Na Bíblia, capítulos com mais de aprox. 4000 caracteres são narrados versículo a versículo em cadeia, porque o TTS do Android tem limite de tamanho por chamada. A narração para automaticamente quando a tela perde o foco ou o capítulo muda, correção feita em julho de 2026 porque a aba Bíblia nunca desmonta ao trocar de aba e o áudio continuava tocando.

## Ligações

- [[Leitor da Bíblia]]
- [[Artigos]]
- [[Idiomas (i18n)]] (a voz acompanha o idioma do texto)
- [[Estado Global e Tema]]
