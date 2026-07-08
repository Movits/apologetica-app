---
tags: [mapa]
atualizado: 2026-07-08
---
# Mapa de Arquitetura

Como o APPologetica é construído por dentro. Este mapa reúne as 7 notas da pasta `brain/2-Arquitetura/`, na ordem sugerida de leitura.

## Comece por aqui

- [[Visão Geral]]: o retrato do app em uma página, stack (Expo SDK 54, React Native, Firebase), princípio offline-first e fluxo geral.
- [[Navegação e Telas]]: as 5 abas, os stacks internos montados em `App.js` e por que algumas rotas existem duplicadas de propósito.

## Estado e idioma

- [[Estado Global e Tema]]: os três contexts de `src/context/` (tema claro/escuro, autenticação e idioma) e a paleta navy, dourado e creme.
- [[Idiomas (i18n)]]: as duas camadas de tradução PT/EN, textos de interface em `src/i18n/strings.js` e conteúdo traduzido nos próprios dados.

## Nuvem e apoio

- [[Contas e Sincronização]]: Firebase como única dependência de nuvem, formas de login, modo visitante e o que sincroniza via Firestore.
- [[Serviços]]: tabela dos arquivos de `src/services/`, da Bíblia embarcada síncrona às notificações locais e APIs com cache.
- [[Utilitários e Componentes]]: inventário de `src/utils/` e `src/components/`, incluindo as variantes `.web.js` que substituem módulos nativos na web.

## Ligações

- [[Início]]
- [[Mapa de Funcionalidades]] (o que cada tela faz para o usuário)
- [[Mapa de Conteúdo e Dados]] (de onde vem o conteúdo que essas peças exibem)
