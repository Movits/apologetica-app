---
tags: [funcionalidade]
atualizado: 2026-07-08
---
# Estratégias de Debate

Ferramenta de treino para conversas sobre a fé: táticas que ajudam a argumentar bem e falácias comuns que o usuário aprende a identificar e rebater.

## Telas

- `src/screens/DebateStrategiesScreen.jsx`

## Dados

- [[Catálogo de Dados]]
- `src/data/debateStrategies.js` com aprox. 20 entradas em julho de 2026, divididas em `section: 'tatica'` e `section: 'falacia'`, todas bilíngues

## Serviços e utilitários

- Só componentes visuais compartilhados (`ScrollHint`, hooks de tema e idioma), ver [[Utilitários e Componentes]]
- Nenhum serviço de rede, tudo local

## Como funciona

Cada entrada tem três campos: `definition` (o que é), `example` (exemplo concreto de frase) e `howToRespond` (como responder à falácia ou como aplicar a tática). A tela oferece busca por texto e chips de filtro com três opções: todas, táticas e falácias. Os cards são expansíveis, tocar em um mostra o conteúdo completo. Todo o conteúdo tem versão em inglês nos campos com sufixo `En`, escolhida pelo idioma ativo do app.

## Ligações

- [[Diálogos e Objeção do Dia]] (a outra ferramenta de preparo para conversas)
- [[Quiz da Fé]]
- [[Mapa de Funcionalidades]]
