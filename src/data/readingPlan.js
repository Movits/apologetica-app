// Plano "Fundamentos da Fé": 30 dias pra alguém começando do zero (não-cristão,
// cristão raso, ou católico que precisa de chão pra defender o básico).
// Ordem: Deus → Cristo → Igreja → Vida cristã. Tópicos polêmicos vêm DEPOIS,
// como aplicação, não como porta de entrada.

export const readingPlan = [
  // === Semana 1: Existe Deus? (fundamento racional, antes da fé revelada) ===
  { day: 1, articleId: 1, theme: 'Por que existe algo em vez de nada?', themeEn: 'Why is there something rather than nothing?' },
  { day: 2, articleId: 9, theme: 'O ajuste fino do universo aponta pra um Criador', themeEn: 'The fine-tuning of the universe points to a Creator' },
  { day: 3, articleId: 11, theme: 'Mas quem criou Deus?', themeEn: 'But who created God?' },
  { day: 4, articleId: 10, theme: 'Sem Deus, sem moral objetiva', themeEn: 'Without God, no objective morality' },
  { day: 5, articleId: 6, theme: 'Se Deus existe, por que há mal?', themeEn: 'If God exists, why is there evil?' },

  // === Semana 2: Quem é Jesus? (centro do cristianismo) ===
  { day: 6, articleId: 35, theme: 'Jesus realmente existiu (evidência fora da Bíblia)', themeEn: 'Jesus really existed (evidence outside the Bible)' },
  { day: 7, articleId: 17, theme: 'O Trilema de C. S. Lewis: mentiroso, louco ou Senhor', themeEn: 'C. S. Lewis\'s Trilemma: liar, lunatic, or Lord' },
  { day: 8, articleId: 5, theme: 'Jesus ressuscitou (o fato histórico)', themeEn: 'Jesus rose (the historical fact)' },
  { day: 9, articleId: 34, theme: 'Aparentes contradições na Ressurreição', themeEn: 'Apparent contradictions in the Resurrection accounts' },
  { day: 10, articleId: 36, theme: 'Cristianismo NÃO copiou religiões pagãs', themeEn: 'Christianity did NOT copy pagan religions' },

  // === Semana 3: A Bíblia ===
  { day: 11, articleId: 31, theme: 'Como ler a Bíblia sem cair em contradições aparentes', themeEn: 'How to read the Bible without falling for apparent contradictions' },
  { day: 12, articleId: 18, theme: 'De onde vieram os 73 livros do cânon', themeEn: 'Where the 73 books of the canon came from' },
  { day: 13, articleId: 3, theme: 'Sola Scriptura não funciona (a Bíblia mesma diz)', themeEn: 'Sola Scriptura does not work (the Bible itself says so)' },
  { day: 14, articleId: 32, theme: 'Herodes e o censo de Quirino: a "contradição" do Natal', themeEn: 'Herod and Quirinius\'s census: the "Christmas contradiction"' },
  { day: 15, articleId: 33, theme: 'As duas genealogias de Jesus', themeEn: 'The two genealogies of Jesus' },

  // === Semana 4: A Igreja ===
  { day: 16, articleId: 2, theme: 'Por que ser católico, não só "cristão genérico"', themeEn: 'Why be Catholic, not just "generic Christian"' },
  { day: 17, articleId: 19, theme: 'O Papado: Pedro como cabeça visível', themeEn: 'The Papacy: Peter as visible head' },
  { day: 18, articleId: 20, theme: 'Os 7 sacramentos: sinais que produzem graça', themeEn: 'The 7 sacraments: signs that produce grace' },
  { day: 19, articleId: 7, theme: 'A Eucaristia é Jesus mesmo (não símbolo)', themeEn: 'The Eucharist is Jesus himself (not a symbol)' },
  { day: 20, articleId: 21, theme: 'Por que confessar a um padre', themeEn: 'Why confess to a priest' },
  { day: 21, articleId: 24, theme: 'Fé E obras (não fé sozinha)', themeEn: 'Faith AND works (not faith alone)' },

  // === Semana 5: Vida em Cristo (Maria, santos, últimas coisas) ===
  { day: 22, articleId: 4, theme: 'Intercessão dos santos: não é idolatria', themeEn: 'Intercession of the saints: not idolatry' },
  { day: 23, articleId: 14, theme: 'Maria, Mãe de Deus (Theotokos)', themeEn: 'Mary, Mother of God (Theotokos)' },
  { day: 24, articleId: 12, theme: 'Imaculada Conceição', themeEn: 'Immaculate Conception' },
  { day: 25, articleId: 13, theme: 'Virgindade Perpétua de Maria', themeEn: 'Mary\'s Perpetual Virginity' },
  { day: 26, articleId: 22, theme: 'Assunção de Maria', themeEn: 'Assumption of Mary' },
  { day: 27, articleId: 23, theme: 'Purgatório: purificação dos que se salvam', themeEn: 'Purgatory: purification of those being saved' },

  // === Semana 6 (mini): Vida moral aplicada ===
  { day: 28, articleId: 25, theme: 'Aborto e dignidade da vida humana', themeEn: 'Abortion and the dignity of human life' },
  { day: 29, articleId: 8, theme: 'Sexualidade humana segundo a Igreja', themeEn: 'Human sexuality according to the Church' },
  { day: 30, articleId: 26, theme: 'Contracepção e Humanae Vitae', themeEn: 'Contraception and Humanae Vitae' },
];

export const planDayByArticle = (articleId) =>
  readingPlan.find((d) => d.articleId === articleId);
