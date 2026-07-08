---
tags: [manutencao]
atualizado: 2026-07-08
---
# Como Usar Este Cofre

Guia rápido para o dono do projeto usar este segundo cérebro sem precisar entender de código.

## Como abrir

Abra o Obsidian e aponte para a pasta do projeto (ou só para a pasta `brain/`, se preferir ver apenas as notas). Comece sempre pela nota [[Início]], que é a porta de entrada.

## Como navegar

A partir de [[Início]], tudo se ramifica em 4 mapas:

- [[Mapa de Arquitetura]]: como o app é construído por dentro.
- [[Mapa de Funcionalidades]]: cada recurso que o usuário vê.
- [[Mapa de Conteúdo e Dados]]: Bíblia, artigos, referências e o resto do conteúdo.
- [[Mapa do Projeto e Decisões]]: site, deploy, pesquisas, decisões e manutenção.

Os textos em duplo colchete são links: clique para pular de nota em nota.

## Vocabulário de tags

Cada nota tem tags no topo que dizem o tipo dela: `mapa`, `arquitetura`, `funcionalidade`, `dado`, `servico`, `site`, `pesquisa`, `decisao`, `manutencao` e `ideia`. No Obsidian dá para clicar numa tag e ver todas as notas daquele tipo.

## Quando atualizar

Mudou a estrutura do projeto ou tomou uma decisão importante? Atualize a nota correspondente e o campo `atualizado` do topo dela. Para registrar uma decisão nova, crie uma nota em `brain/7-Decisões/` seguindo o modelo fixo das existentes: Contexto, Decisão, Motivo e Consequências.

## Detalhe técnico único

A pasta `brain/.obsidian/` (configuração pessoal do Obsidian, tema, atalhos) fica fora do git de propósito. Pode personalizar à vontade que nada disso vai para o repositório.

## Ligações

- [[Início]]
- [[Convenções do Projeto]]
- [[Decisão - Pastas fotos e documentos na raiz]]
