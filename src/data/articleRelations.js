// Mapa de artigos relacionados. Cada chave é o id do artigo,
// e o valor é a lista de ids de artigos que se conectam tematicamente
// (não pela mesma categoria, mas por afinidade de assunto).
// É mostrado no fim do artigo como "Ver também".

export const RELATED_ARTICLES = {
  // Existência de Deus
  1: [9, 11, 5],         // Cosmológico → Ajuste Fino, Quem Criou Deus, Ressurreição
  9: [1, 11],            // Ajuste Fino → Cosmológico, Quem Criou Deus
  10: [6, 1],            // Moral → Problema do Mal, Cosmológico
  11: [1, 9],            // Quem Criou Deus → Cosmológico, Ajuste Fino
  5: [17, 1],            // Ressurreição → Trilema, Cosmológico
  17: [5, 15, 16, 27],   // Trilema → Ressurreição, Islã, Espiritismo, TJ

  // Igreja Católica
  2: [19, 3, 18],        // Por que católico → Papado, Sola Scriptura, Cânon
  19: [2, 3],            // Papado → Por que católico, Sola Scriptura
  7: [20, 21],           // Eucaristia → Sacramentos, Confissão
  20: [7, 21],           // Sacramentos → Eucaristia, Confissão
  21: [7, 20],           // Confissão → Eucaristia, Sacramentos
  4: [12, 13, 14, 22],   // Maria intercessora → Imaculada, Virgindade, Theotokos, Assunção
  12: [4, 13, 14, 22],   // Imaculada → Maria intercessora, Virgindade, Theotokos, Assunção
  13: [4, 12, 14],       // Virgindade Perpétua → Maria intercessora, Imaculada, Theotokos
  14: [4, 12, 13, 27],   // Theotokos → Maria intercessora, Imaculada, Virgindade, TJ
  22: [4, 12],           // Assunção → Maria intercessora, Imaculada
  23: [18, 24],          // Purgatório → Cânon (2 Mc), Fé e Obras
  24: [23, 3],           // Fé e Obras → Purgatório, Sola Scriptura

  // Sagrada Escritura
  3: [2, 18, 19],        // Sola Scriptura → Por que católico, Cânon, Papado
  18: [2, 3, 23],        // Cânon → Por que católico, Sola Scriptura, Purgatório

  // Moral
  6: [10],               // Problema do Mal → Moral
  8: [25, 26],           // Homossexualidade → Aborto, Contracepção
  25: [8, 26],           // Aborto → Homossexualidade, Contracepção
  26: [8, 25],           // Contracepção → Homossexualidade, Aborto

  // Outras Religiões
  15: [17, 16, 27],      // Islã → Trilema, Espiritismo, TJ
  16: [17, 15, 27],      // Espiritismo → Trilema, Islã, TJ
  27: [17, 15, 16, 14],  // TJ → Trilema, Islã, Espiritismo, Theotokos

  // História da Igreja
  28: [29, 30],          // Inquisição → Cruzadas, Galileu
  29: [28, 30, 15],      // Cruzadas → Inquisição, Galileu, Islã
  30: [28, 29],          // Galileu → Inquisição, Cruzadas

  // Novos artigos (contradições, historicidade, comparativo)
  31: [32, 33, 34, 18],  // Contradições gerais → Herodes/Quirino, Genealogias, Ressurreição, Cânon
  32: [31, 33, 5],       // Herodes/Quirino → Contradições, Genealogias, Ressurreição
  33: [31, 32, 13],      // Genealogias → Contradições, Herodes/Quirino, Virgindade Perpétua
  34: [31, 5, 17],       // Ressurreição contradições → Contradições, Ressurreição (fato), Trilema
  35: [5, 17, 34],       // Jesus existiu → Ressurreição, Trilema, Ressurreição contradições
  36: [15, 16, 27, 35],  // Cristianismo copiou pagãs → Islã, Espiritismo, TJ, Jesus existiu
};

export function getRelatedArticles(articleId, allArticles) {
  const relatedIds = RELATED_ARTICLES[articleId] || [];
  return relatedIds
    .map((id) => allArticles.find((a) => a.id === id))
    .filter(Boolean);
}
