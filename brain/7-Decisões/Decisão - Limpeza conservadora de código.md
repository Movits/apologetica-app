---
tags: [decisao, manutencao]
atualizado: 2026-07-08
---
# Decisão - Limpeza conservadora de código

## Contexto

Na limpeza de julho de 2026 o projeto acumulava código de origens variadas: telas removidas antes do lançamento, scripts que perderam a função, dependências que talvez ninguém use mais. A tentação era apagar tudo que parecesse morto de uma vez.

## Decisão

Só remover código com prova de zero uso. A prova exige três verificações juntas:

1. Grep no projeto inteiro sem nenhuma ocorrência do símbolo, arquivo ou chave.
2. `npm run lint` passando depois da remoção.
3. Build completo (`npx expo export -p web`) compilando sem erro.

Tudo que ficou em dúvida, mesmo que pareça morto, vai para a lista [[Candidatos à Limpeza]] em vez de ser apagado.

## Motivo

Segurança acima de purismo. Um app funcionando com um pouco de código morto vale mais que uma base "limpa" com uma regressão escondida, principalmente porque nem todo uso aparece no grep (dependências implícitas de bibliotecas, comportamento de hooks).

## Consequências

- Existe uma lista viva de candidatos que precisa de revisão periódica, com a regra de saída documentada nela.
- As remoções ficam menores e mais frequentes, cada uma com sua prova.
- Exemplo aplicado: `convert-catechism.mjs` e `split-articles.mjs` saíram com prova de morte, já `expo-crypto` ficou na lista por poder ser dependência implícita do login.

## Ligações

- [[Candidatos à Limpeza]]
- [[Como Verificar e Publicar]]
- [[Decisão - Catecismo vira link para o Vaticano]]
