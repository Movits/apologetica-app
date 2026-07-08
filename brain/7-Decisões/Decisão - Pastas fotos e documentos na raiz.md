---
tags: [decisao]
atualizado: 2026-07-08
---
# Decisão - Pastas fotos e documentos na raiz

## Contexto

O dono do projeto é leigo em programação e precisa de lugares seguros para guardar as próprias coisas: fotos para o site e documentos de pesquisa. A raiz do projeto é cheia de pastas e arquivos com nomes técnicos que não podem ser renomeados porque as ferramentas (Expo, Google, GitHub) exigem exatamente aqueles nomes.

## Decisão

Duas pastas com nome em português vivem na raiz e pertencem ao dono:

- `fotos/`: imagens que o dono adiciona para a landing page. O deploy copia a pasta inteira para o site publicado.
- `documentos/`: pesquisas e anotações (mercado, público, lista de tópicos, créditos de imagens, rascunhos). Nada aqui é referenciado pelo código.

Os nomes técnicos exigidos pelas ferramentas ficam intactos, e o arquivo `GUIA-DO-PROJETO.md` na raiz funciona como mapa em linguagem leiga: o que é de mexer à vontade e o que é de não tocar.

## Motivo

Separar com clareza a "área do dono" da "área do código". O dono mexe em `fotos/` e `documentos/` sem medo de quebrar o app ou o site.

## Consequências

- O workflow de deploy precisa copiar `fotos/` inteira para o site (já faz isso).
- `documentos/` virou a fonte das notas de pesquisa deste cofre, por exemplo [pesquisa de tópicos](../../documentos/top100-br.md).
- `GUIA-DO-PROJETO.md` precisa ser mantido atualizado quando pastas são criadas ou movidas.

## Ligações

- [[Deploy e Publicação]]
- [[Pesquisa de Mercado (resumo)]]
- [[Como Usar Este Cofre]]
