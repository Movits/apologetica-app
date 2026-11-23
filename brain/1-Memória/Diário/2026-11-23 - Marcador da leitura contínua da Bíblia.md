# 2026-11-23 · Marcador da leitura contínua da Bíblia

**Pedido do dono:** ler a Bíblia do início ao fim pelo app sem perder o ponto quando abre uma passagem por referência, pelo terço, numa conversa ou pela grade.

**O que foi feito**
- Marcador próprio (`bible:bookmark`), separado do "continue lendo" (`bible:position`). Regras puras em `src/utils/bibleBookmarkCore.js` (com teste), armazenamento em `src/utils/bibleBookmark.js`.
- O marcador só anda na **leitura contínua**: entrar pelo cartão "Minha leitura" (ou "Ler a Bíblia do início ao fim", que começa em Gênesis 1) liga o modo, e rolar e passar de capítulo leva o marcador junto. No fim de um livro, o próximo capítulo emenda no livro seguinte.
- Só anda para a frente sozinho: voltar um capítulo para relembrar não puxa o ponto. Para mover para trás ou para outro lugar, "Marcar minha leitura aqui" na folha do versículo.
- Qualquer outra ida (grade, busca, referência, terço, liturgia, último aberto) desliga o modo. Nessas telas, o ícone de marcador no topo leva de volta à leitura.
- Lista de livros: cartão "Minha leitura: X" com o progresso no cânon (capítulo N de 1334) e, quando é outro capítulo, "Último aberto: Y".

**Verificado:** lint, `npm test` (201 testes) e um roteiro Playwright no build web (Gn 1 → Gn 2, consulta de Ap 22 sem mexer no marcador, recarregar a página, marcar Gn 50,1 e avançar para Êx 1).

**Pendente:** o marcador é local (AsyncStorage), como o resto do progresso: não sincroniza entre aparelhos.

**Ajuste do mesmo dia (pedido do dono, com print):** a porcentagem do capítulo e os capítulos lidos foram para o cartão "Minha leitura". O "Último aberto" virou só um atalho, sem números, e só muda fora da leitura contínua (busca, referência, terço, grade), já ao abrir. Ler pela "Minha leitura" não mexe mais nele.

**Troca de capítulo (mesmo dia, pedido do dono: "não consigo ir facilmente de um capítulo pro outro").** Dois agentes (uso real no navegador e revisão do código) acharam a causa: no fim do capítulo não havia nada para seguir, e a pílula estava escondida justamente ali. Feito: botões "Próximo: X" e "Anterior: X" no fim de cada capítulo, pílula que volta sozinha perto do fim, "3 de 21" abre a folha de capítulos (atual destacado, lidos marcados, "Outro livro"), anterior/próximo atravessam livros em qualquer modo (`prevChapterRef`), setas ← → no computador e rótulo da pílula com largura fixa.
Ficou para depois: deslizar para o lado no celular (conflita com o gesto de voltar e a seleção de texto), tocar no texto para mostrar os controles (o toque já abre a folha do versículo), capítulo na URL da web e o acento do "Gênesis" na fonte Cormorant.

**Redesenho (mesmo dia, depois de uma rodada de perguntas com o dono, que aceitou todas as recomendações).** Achou repetido e confuso (dois cartões, duas grades, setas que somem, voltar caindo na grade do Gênesis). Ficou assim:
- Página da Bíblia: um cartão só, "Continuar: X" (porcentagem do capítulo e capítulos lidos), e a lista de livros. "Último aberto" saiu.
- Um seletor só: tocar num livro abre a folha com os capítulos dele; na leitura, o "3 de 21" abre a mesma folha no livro atual, com "Trocar livro". A tela-grade de capítulos deixou de existir.
- Voltar: de leitura pela aba vai à página da Bíblia; de referência, terço ou artigo volta para lá.
- Pílula de setas fixa, sempre visível; os botões do fim do capítulo saíram.
- Sem "modo": tudo aberto dentro da aba conta como leitura e move o "Continuar" (o último ponto, não só para a frente); o que vem de fora é consulta. Saíram o ícone de marcador no topo e o "Marcar minha leitura aqui". `bible:position` não é mais gravado.
- Ajustes: "Recomeçar a leitura da Bíblia" (zera lidos e Continuar, também nos outros aparelhos). A página da Bíblia relê os dados a cada volta à aba.
