// Planos de leitura em DOIS TRILHOS:
//  - "Fundamentos" (30 dias): para quem começa do zero. Deus -> Cristo ->
//    Bíblia/Igreja -> Vida cristã. Polêmicas ficam para o outro trilho.
//  - "Aprofundamento": apologética avançada (história, ciência, mariologia,
//    milagres, outras religiões, moral aplicada), usando artigos que já existem.
// Cada dia aponta para um articleId; o tema é um resumo curto (PT/EN).

export const READING_TRACKS = [
  {
    id: 'fundamentos',
    titlePt: 'Fundamentos em 30 dias',
    titleEn: 'Foundations in 30 days',
    descPt: 'Um artigo por dia, de "Existe Deus?" até as verdades centrais da fé católica. Pensado pra quem começa do zero, ou pra qualquer cristão que queira saber defender o básico.',
    descEn: 'One article a day, from "Is there a God?" to the central truths of the Catholic faith. Built for someone starting from zero, or for any Christian who wants to defend the basics well.',
    days: [
      // === Semana 1: Existe Deus? (a razão antes da fé revelada) ===
      { day: 1, articleId: 56, theme: 'Deus existe? Os melhores argumentos da razão', themeEn: 'Does God exist? The best arguments of reason' },
      { day: 2, articleId: 1, theme: 'Por que existe algo em vez de nada?', themeEn: 'Why is there something rather than nothing?' },
      { day: 3, articleId: 9, theme: 'O ajuste fino do universo aponta pra um Criador', themeEn: 'The fine-tuning of the universe points to a Creator' },
      { day: 4, articleId: 11, theme: 'Mas quem criou Deus?', themeEn: 'But who created God?' },
      { day: 5, articleId: 10, theme: 'Sem Deus, sem moral objetiva', themeEn: 'Without God, no objective morality' },
      { day: 6, articleId: 6, theme: 'Se Deus existe, por que há mal?', themeEn: 'If God exists, why is there evil?' },

      // === Semana 2: Quem é Jesus? (o centro do cristianismo) ===
      { day: 7, articleId: 62, theme: 'Afinal, qual é o sentido da vida?', themeEn: 'After all, what is the meaning of life?' },
      { day: 8, articleId: 35, theme: 'Jesus existiu de verdade (evidência fora da Bíblia)', themeEn: 'Jesus really existed (evidence outside the Bible)' },
      { day: 9, articleId: 57, theme: 'Quem é Jesus? Deus e homem verdadeiro', themeEn: 'Who is Jesus? True God and true man' },
      { day: 10, articleId: 17, theme: 'Mentiroso, louco ou Senhor (o trilema)', themeEn: 'Liar, lunatic, or Lord (the trilemma)' },
      { day: 11, articleId: 5, theme: 'Jesus ressuscitou (o fato histórico)', themeEn: 'Jesus rose (the historical fact)' },
      { day: 12, articleId: 67, theme: 'Por que Jesus morreu na cruz: a Redenção', themeEn: 'Why Jesus died on the cross: the Redemption' },

      // === Semana 3: Trindade, Bíblia e por que a Igreja ===
      { day: 13, articleId: 58, theme: 'Um só Deus em três Pessoas: a Trindade', themeEn: 'One God in three Persons: the Trinity' },
      { day: 14, articleId: 71, theme: 'Como começar a ler a Bíblia', themeEn: 'How to start reading the Bible' },
      { day: 15, articleId: 18, theme: 'De onde vieram os 73 livros do cânon', themeEn: 'Where the 73 books of the canon came from' },
      { day: 16, articleId: 3, theme: 'Sola Scriptura não funciona (a Tradição)', themeEn: 'Sola Scriptura does not work (Tradition)' },
      { day: 17, articleId: 2, theme: 'Por que ser católico, não só "cristão genérico"', themeEn: 'Why be Catholic, not just "generic Christian"' },
      { day: 18, articleId: 63, theme: 'Católico ou evangélico? As principais diferenças', themeEn: 'Catholic or Evangelical? The main differences' },

      // === Semana 4: A Igreja e os sacramentos ===
      { day: 19, articleId: 19, theme: 'O Papado: Pedro como cabeça visível', themeEn: 'The Papacy: Peter as visible head' },
      { day: 20, articleId: 20, theme: 'Os 7 sacramentos: sinais que produzem graça', themeEn: 'The 7 sacraments: signs that produce grace' },
      { day: 21, articleId: 7, theme: 'A Eucaristia é Jesus mesmo (não símbolo)', themeEn: 'The Eucharist is Jesus himself (not a symbol)' },
      { day: 22, articleId: 60, theme: 'A Santa Missa: o que é e por que participar', themeEn: 'Holy Mass: what it is and why to take part' },
      { day: 23, articleId: 21, theme: 'Por que confessar a um padre', themeEn: 'Why confess to a priest' },
      { day: 24, articleId: 24, theme: 'Fé E obras (não fé sozinha)', themeEn: 'Faith AND works (not faith alone)' },

      // === Semana 5: Maria, últimas coisas e vida cristã ===
      { day: 25, articleId: 4, theme: 'Intercessão dos santos: não é idolatria', themeEn: 'Intercession of the saints: not idolatry' },
      { day: 26, articleId: 14, theme: 'Maria, Mãe de Deus (Theotokos)', themeEn: 'Mary, Mother of God (Theotokos)' },
      { day: 27, articleId: 61, theme: 'O que acontece depois da morte? Os Novíssimos', themeEn: 'What happens after death? The Last Things' },
      { day: 28, articleId: 59, theme: 'O que é o pecado? Mortal e venial', themeEn: 'What is sin? Mortal and venial' },
      { day: 29, articleId: 83, theme: 'Os Dez Mandamentos ainda valem', themeEn: 'The Ten Commandments still hold' },
      { day: 30, articleId: 78, theme: 'Como ter e fortalecer a fé', themeEn: 'How to have and strengthen faith' },
    ],
  },
  {
    id: 'aprofundamento',
    titlePt: 'Aprofundamento',
    titleEn: 'Going Deeper',
    descPt: 'Apologética avançada: história da Igreja, ciência e Bíblia, mariologia, milagres, outras religiões e moral aplicada. Pra quem já tem o básico e quer ir fundo.',
    descEn: 'Advanced apologetics: Church history, science and the Bible, Mariology, miracles, other religions, and applied morality. For those who have the basics and want to go deep.',
    days: [
      // === História da Igreja ===
      { day: 1, articleId: 28, theme: 'A Inquisição: o que de fato aconteceu', themeEn: 'The Inquisition: what actually happened' },
      { day: 2, articleId: 29, theme: 'As Cruzadas no contexto histórico real', themeEn: 'The Crusades in their real historical context' },
      { day: 3, articleId: 30, theme: 'Galileu e o mito do conflito ciência-fé', themeEn: 'Galileo and the science-vs-faith myth' },
      { day: 4, articleId: 80, theme: 'A Igreja é rica demais? Vender tudo resolveria?', themeEn: 'Is the Church too rich? Would selling everything fix it?' },
      { day: 5, articleId: 82, theme: 'Pio XII foi cúmplice do nazismo?', themeEn: 'Was Pius XII a Nazi accomplice?' },

      // === Bíblia e ciência ===
      { day: 6, articleId: 68, theme: 'Afinal, quem escreveu a Bíblia?', themeEn: 'Who actually wrote the Bible?' },
      { day: 7, articleId: 69, theme: 'A Bíblia, a escravidão e a violência no AT', themeEn: 'The Bible, slavery, and violence in the OT' },
      { day: 8, articleId: 70, theme: 'O fim do mundo: o que a Igreja diz do Apocalipse', themeEn: 'The end of the world: what the Church says about Revelation' },
      { day: 9, articleId: 72, theme: 'Evolução, Gênesis e Adão e Eva', themeEn: 'Evolution, Genesis, and Adam and Eve' },

      // === "Contradições" da Bíblia ===
      { day: 10, articleId: 31, theme: 'Como lidar com supostas contradições na Bíblia', themeEn: 'How to handle alleged contradictions in the Bible' },
      { day: 11, articleId: 32, theme: 'Herodes e o censo de Quirino', themeEn: "Herod and Quirinius's census" },
      { day: 12, articleId: 33, theme: 'As duas genealogias de Jesus', themeEn: 'The two genealogies of Jesus' },
      { day: 13, articleId: 34, theme: 'As "contradições" da Ressurreição', themeEn: 'The "contradictions" of the Resurrection' },
      { day: 14, articleId: 45, theme: 'A escuridão na cruz e a datação', themeEn: 'The darkness at the cross and its dating' },

      // === Evidência: profecia, arqueologia, manuscritos ===
      { day: 15, articleId: 46, theme: 'Profecias messiânicas cumpridas em Jesus', themeEn: 'Messianic prophecies fulfilled in Jesus' },
      { day: 16, articleId: 47, theme: 'A arqueologia confirma a Bíblia', themeEn: 'Archaeology confirms the Bible' },
      { day: 17, articleId: 48, theme: 'Os manuscritos do Novo Testamento', themeEn: 'The New Testament manuscripts' },

      // === Mariologia ===
      { day: 18, articleId: 12, theme: 'A Imaculada Conceição', themeEn: 'The Immaculate Conception' },
      { day: 19, articleId: 13, theme: 'A virgindade perpétua de Maria', themeEn: "Mary's perpetual virginity" },
      { day: 20, articleId: 22, theme: 'A Assunção de Maria', themeEn: 'The Assumption of Mary' },

      // === Milagres ===
      { day: 21, articleId: 50, theme: 'O Sudário de Turim', themeEn: 'The Shroud of Turin' },
      { day: 22, articleId: 51, theme: 'O Milagre do Sol em Fátima', themeEn: 'The Miracle of the Sun at Fatima' },
      { day: 23, articleId: 52, theme: 'Nossa Senhora de Guadalupe e a tilma', themeEn: 'Our Lady of Guadalupe and the tilma' },
      { day: 24, articleId: 49, theme: 'Milagres eucarísticos', themeEn: 'Eucharistic miracles' },

      // === Outras religiões e erros ===
      { day: 25, articleId: 37, theme: 'Protestantismo: o que nos separa', themeEn: 'Protestantism: what separates us' },
      { day: 26, articleId: 15, theme: 'Islamismo: contato e diferença', themeEn: 'Islam: contact and difference' },
      { day: 27, articleId: 16, theme: 'Espiritismo e reencarnação', themeEn: 'Spiritism and reincarnation' },
      { day: 28, articleId: 27, theme: 'Testemunhas de Jeová', themeEn: "Jehovah's Witnesses" },
      { day: 29, articleId: 65, theme: 'Horóscopo, ocultismo e superstição', themeEn: 'Horoscope, occult, and superstition' },
      { day: 30, articleId: 66, theme: 'Anjos e demônios: o que a Igreja ensina', themeEn: 'Angels and demons: what the Church teaches' },

      // === Moral aplicada ===
      { day: 31, articleId: 25, theme: 'Aborto e a dignidade da vida humana', themeEn: 'Abortion and the dignity of human life' },
      { day: 32, articleId: 8, theme: 'Homossexualidade e a doutrina católica', themeEn: 'Homosexuality and Catholic doctrine' },
      { day: 33, articleId: 64, theme: 'Sexo antes do casamento e a castidade', themeEn: 'Sex before marriage and chastity' },
      { day: 34, articleId: 26, theme: 'Contracepção e Humanae Vitae', themeEn: 'Contraception and Humanae Vitae' },
    ],
  },
];

// Retrocompat: telas/utilitários antigos que esperam um array de dias.
export const readingPlan = READING_TRACKS[0].days;

export const getTrack = (trackId) =>
  READING_TRACKS.find((t) => t.id === trackId) || READING_TRACKS[0];

// Primeiro { trackId, day } que contém o artigo (ou null).
export const planDayByArticle = (articleId) => {
  for (const track of READING_TRACKS) {
    const d = track.days.find((x) => x.articleId === articleId);
    if (d) return { trackId: track.id, day: d.day };
  }
  return null;
};

// Todos os { trackId, day } que contêm o artigo (para auto-marcar fora do plano).
export const planEntriesByArticle = (articleId) =>
  READING_TRACKS.flatMap((track) =>
    track.days
      .filter((x) => x.articleId === articleId)
      .map((d) => ({ trackId: track.id, day: d.day }))
  );
