// Tradução adaptada da Bíblia Ave Maria / Vulgata.
// Esta versão inclui os capítulos referenciados nos artigos do app
// mais alguns clássicos. A estrutura permite expandir para a Bíblia completa.

export const BIBLE_BOOKS = [
  // ============ ANTIGO TESTAMENTO ============
  {
    id: 'gn',
    name: 'Gênesis',
    short: 'Gn',
    testament: 'AT',
    group: 'Pentateuco',
    totalChapters: 50,
    chapters: {
      1: [
        'No princípio, Deus criou o céu e a terra.',
        'A terra estava informe e vazia; as trevas cobriam o abismo, e o Espírito de Deus pairava sobre as águas.',
        'Deus disse: Faça-se a luz. E a luz foi feita.',
        'Deus viu que a luz era boa, e separou a luz das trevas.',
        'À luz Deus chamou dia, e às trevas, noite. Houve uma tarde e uma manhã: foi o primeiro dia.',
        'Deus disse: Faça-se um firmamento entre as águas, separando umas das outras.',
        'E Deus fez o firmamento e separou as águas que estavam debaixo do firmamento das que estavam por cima. E assim se fez.',
        'Ao firmamento Deus chamou céu. Houve uma tarde e uma manhã: foi o segundo dia.',
        'Deus disse: As águas que estão debaixo do céu se reúnam num só lugar e apareça o continente. E assim se fez.',
        'Ao continente Deus chamou terra, e ao agrupamento das águas, mar. E Deus viu que isto era bom.',
        'Deus disse: Produza a terra plantas, ervas que dão sementes, árvores frutíferas que dão segundo a sua espécie frutos contendo em si mesmos sua semente, sobre a terra. E assim se fez.',
        'A terra produziu plantas, ervas que dão sementes segundo a sua espécie, e árvores que dão segundo a sua espécie frutos contendo em si mesmos sua semente. E Deus viu que isto era bom.',
        'Houve uma tarde e uma manhã: foi o terceiro dia.',
        'Deus disse: Faça-se luzeiros no firmamento dos céus, para separar o dia da noite e marcar as estações, os dias e os anos.',
        'Eles servirão de luzeiros no firmamento dos céus para alumiar a terra. E assim se fez.',
        'Deus fez os dois grandes luzeiros: o maior para presidir ao dia, e o menor para presidir à noite; fez também as estrelas.',
        'Deus colocou-os no firmamento dos céus para luzirem sobre a terra,',
        'para presidirem ao dia e à noite, e para separarem a luz das trevas. E Deus viu que isto era bom.',
        'Houve uma tarde e uma manhã: foi o quarto dia.',
        'Deus disse: Pululem nas águas seres viventes, e voem aves sobre a terra debaixo do firmamento dos céus.',
        'Deus criou os grandes monstros marinhos, e todos os seres viventes que se movem nas águas, segundo a sua espécie, e todas as aves segundo as suas espécies. E Deus viu que isto era bom.',
        'Deus os abençoou, dizendo: Crescei e multiplicai-vos, e enchei as águas do mar, e multipliquem-se as aves sobre a terra.',
        'Houve uma tarde e uma manhã: foi o quinto dia.',
        'Deus disse: Produza a terra seres viventes segundo a sua espécie, animais domésticos, répteis e animais selvagens segundo a sua espécie. E assim se fez.',
        'Deus fez os animais selvagens segundo a sua espécie, os animais domésticos e todos os répteis da terra segundo a sua espécie. E Deus viu que isto era bom.',
        'Deus disse: Façamos o homem à nossa imagem e semelhança. Que ele domine sobre os peixes do mar, sobre as aves do céu, sobre os animais domésticos e sobre toda a terra, e sobre todos os répteis que se arrastam sobre a terra.',
        'Deus criou o homem à sua imagem; criou-o à imagem de Deus, criou o homem e a mulher.',
        'Deus os abençoou: Sede fecundos, disse ele, multiplicai-vos, enchei a terra e submetei-a. Dominai sobre os peixes do mar, sobre as aves do céu e sobre todos os animais que se movem na terra.',
        'Deus disse: Eis que vos dou todas as ervas que dão semente sobre a terra, e todas as árvores frutíferas que contêm em si mesmas a sua semente, para que vos sirvam de alimento.',
        'E a todos os animais da terra, a todas as aves do céu, a tudo o que se move sobre a terra e que é animado de vida, eu dou como alimento toda a verdura das plantas. E assim se fez.',
        'Deus viu tudo o que tinha feito: e era muito bom. Houve uma tarde e uma manhã: foi o sexto dia.',
      ],
    },
  },

  // ============ SALMOS (livro popular) ============
  {
    id: 'sl',
    name: 'Salmos',
    short: 'Sl',
    testament: 'AT',
    group: 'Livros sapienciais',
    totalChapters: 150,
    chapters: {
      23: [
        'O Senhor é meu pastor: nada me faltará.',
        'Em verdes prados ele me faz repousar; conduz-me junto às águas refrescantes.',
        'Reconforta a minha alma. Pelos caminhos retos ele me leva, por amor do seu nome.',
        'Ainda que eu atravesse o vale escuro, nada temerei, pois estais comigo. Vossa vara e vosso báculo são o meu amparo.',
        'Diante de mim preparais uma mesa, à vista de meus inimigos. Ungis com óleo a minha cabeça, e transborda minha taça.',
        'A bondade e a graça hão de seguir-me por todos os dias da minha vida. E habitarei na casa do Senhor por longos dias.',
      ],
    },
  },

  // ============ NOVO TESTAMENTO ============
  {
    id: 'mt',
    name: 'Mateus',
    short: 'Mt',
    testament: 'NT',
    group: 'Evangelhos',
    totalChapters: 28,
    chapters: {
      16: [
        // 16,1
        'Os fariseus e os saduceus aproximaram-se de Jesus para pô-lo à prova e pediram-lhe que lhes mostrasse algum sinal do céu.',
        'Respondeu-lhes ele: À tarde, dizeis: Haverá bom tempo, porque o céu está avermelhado.',
        'E, pela manhã: Hoje haverá tempestade, porque o céu está de um vermelho sombrio.',
        'Sabeis distinguir o aspecto do céu, e não sabeis distinguir os sinais dos tempos? Geração má e adúltera! Pede um sinal e não lhe será dado, senão o sinal de Jonas.',
        'E, deixando-os, partiu. Tendo seus discípulos atravessado o lago, esqueceram-se de levar pão.',
        'Jesus disse-lhes: Cuidado! Guardai-vos do fermento dos fariseus e dos saduceus.',
        'Eles pensavam consigo mesmos: É porque não trouxemos pão.',
        'Jesus, percebendo isto, disse-lhes: Homens de pouca fé! Por que pensais que não tendes pão?',
        'Não compreendeis ainda, nem vos lembrais dos cinco pães partidos entre os cinco mil homens, e de quantos cestos levantastes?',
        'E dos sete pães entre os quatro mil, e de quantos cestos levastes?',
        'Como não compreendeis que não era do pão que eu falava? Acautelai-vos do fermento dos fariseus e dos saduceus.',
        'Compreenderam então que ele dissera que se acautelassem, não do fermento que se mistura ao pão, mas da doutrina dos fariseus e dos saduceus.',
        'Tendo chegado às regiões de Cesareia de Filipe, Jesus perguntou a seus discípulos: No dizer dos homens, quem é o Filho do Homem?',
        'Responderam-lhe: Uns dizem que é João Batista; outros, Elias; outros, Jeremias ou algum dos profetas.',
        'Disse-lhes Jesus: E vós, quem dizeis que eu sou?',
        'Simão Pedro respondeu: Tu és o Cristo, o Filho de Deus vivo.',
        'Jesus, então, lhe disse: Bem-aventurado és, Simão, filho de Jonas, porque não foi a carne nem o sangue que te revelou isto, mas meu Pai que está nos céus.',
        'E eu te digo que tu és Pedro, e sobre esta pedra edificarei a minha Igreja, e as portas do inferno não prevalecerão contra ela.',
        'Eu te darei as chaves do Reino dos Céus: tudo o que ligares na terra será ligado nos céus, e tudo o que desligares na terra será desligado nos céus.',
        'Em seguida, ordenou aos seus discípulos que não dissessem a ninguém que ele era o Cristo.',
        'Desde então começou Jesus a manifestar a seus discípulos que devia ir a Jerusalém, e sofrer muito da parte dos anciãos, dos príncipes dos sacerdotes e dos escribas; seria morto e ressuscitaria ao terceiro dia.',
        'Pedro, tomando-o à parte, começou a repreendê-lo: Deus tal não permita, Senhor; isto não te acontecerá.',
        'Mas Jesus, voltando-se para Pedro, disse-lhe: Afasta-te de mim, Satanás, tu me serves de escândalo. Teus sentimentos não são os de Deus, mas os dos homens.',
        'Disse, então, Jesus a seus discípulos: Se alguém quer vir comigo, renuncie-se a si mesmo, tome sua cruz e siga-me.',
        'Porque quem quiser salvar a sua vida, perdê-la-á; e quem perder a sua vida por amor de mim, achá-la-á.',
        'Que aproveita ao homem ganhar o mundo inteiro, se vier a perder a sua alma? Que dará o homem em troca de sua alma?',
        'Porque o Filho do Homem há de vir na glória de seu Pai com os seus anjos, e então retribuirá a cada um conforme as suas obras.',
        'Em verdade vos digo: alguns dos que aqui se encontram não morrerão sem que vejam o Filho do Homem voltando em seu Reino.',
      ],
      26: [
        // Vou colocar apenas os versículos relevantes da Última Ceia (Mt 26,17-29)
        ...Array(16).fill('[versículo disponível em breve]'),
        // 17
        'No primeiro dia dos Ázimos, os discípulos foram a Jesus e lhe perguntaram: Onde queres que te preparemos a ceia pascal?',
        'Jesus respondeu: Ide à cidade, à casa de tal homem, e dizei-lhe: O Mestre manda dizer-te: Meu tempo está próximo, é em tua casa que celebro a Páscoa com meus discípulos.',
        'Os discípulos fizeram como Jesus tinha ordenado e prepararam a Páscoa.',
        'Chegada a tarde, pôs-se à mesa com os Doze.',
        'Durante a refeição, disse-lhes: Em verdade vos digo: um de vós me trairá.',
        'Profundamente triste, cada um começou a perguntar-lhe: Sou eu, Senhor?',
        'Ele respondeu: Aquele que pôs comigo a mão no prato, esse me trairá.',
        'O Filho do Homem vai, segundo o que está escrito dele; mas ai daquele por quem o Filho do Homem for traído. Melhor lhe fora não ter nascido.',
        'Judas, o traidor, tomou também a palavra e perguntou: Mestre, sou eu? Respondeu Jesus: Tu o disseste.',
        'Durante a ceia, Jesus tomou o pão, abençoou-o, partiu-o e o deu a seus discípulos, dizendo: Tomai e comei, isto é o meu corpo.',
        'Tomando, em seguida, o cálice, deu graças e o entregou a seus discípulos, dizendo: Bebei dele todos.',
        'Porque isto é o meu sangue, o sangue da Aliança, que vai ser derramado por uma multidão em remissão dos pecados.',
        'Eu vos declaro: não tornarei a beber deste fruto da videira, desde agora até o dia em que beberei convosco do novo vinho no Reino de meu Pai.',
      ],
      28: [
        'Depois do sábado, ao alvorecer do primeiro dia da semana, Maria Madalena e a outra Maria foram ver o sepulcro.',
        'E eis que houve um grande terremoto: um anjo do Senhor desceu do céu e, aproximando-se, removeu a pedra e sentou-se sobre ela.',
        'Resplandecia como relâmpago e suas vestes eram brancas como neve.',
        'Os guardas, de medo, ficaram aterrados e como mortos.',
        'Falando o anjo, disse às mulheres: Não temais! Sei que buscais Jesus, que foi crucificado.',
        'Não está aqui: ressuscitou como disse. Vinde e vede o lugar onde ele repousou.',
        'Ide depressa e dizei aos discípulos que ele ressuscitou dos mortos. Ele vos precede na Galileia, onde o vereis. Eis que vos preveni.',
        'Elas se afastaram prontamente do sepulcro com certo temor, mas ao mesmo tempo com alegria, e foram correndo dar a boa nova aos discípulos.',
        'Nesse momento, Jesus apresentou-se diante delas e disse-lhes: Salve! Aproximaram-se elas e, prostradas diante dele, beijaram-lhe os pés.',
        'Disse-lhes Jesus: Não temais! Ide dizer a meus irmãos que se dirijam à Galileia, onde eles me verão.',
        // ... versículos 11-18
        ...Array(8).fill('[versículo disponível em breve]'),
        'Ide, pois, fazei discípulos de todas as nações, batizando-os em nome do Pai e do Filho e do Espírito Santo;',
        'ensinando-os a observar tudo o que vos tenho mandado. E eis que estou convosco todos os dias até a consumação dos séculos.',
      ],
    },
  },
  {
    id: 'jo',
    name: 'João',
    short: 'Jo',
    testament: 'NT',
    group: 'Evangelhos',
    totalChapters: 21,
    chapters: {
      1: [
        'No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.',
        'Ele estava no princípio com Deus.',
        'Tudo foi feito por ele, e sem ele nada foi feito.',
        'Nele estava a vida, e a vida era a luz dos homens.',
        'A luz brilha nas trevas, e as trevas não a compreenderam.',
        'Houve um homem enviado por Deus, cujo nome era João.',
        'Este veio como testemunha, para dar testemunho da luz, a fim de que todos cressem por meio dele.',
        'Não era ele a luz, mas veio para dar testemunho da luz.',
        'A luz verdadeira, que ilumina todo homem, vinha ao mundo.',
        'Estava no mundo, e o mundo foi feito por ele, e o mundo não o conheceu.',
        'Veio para o que era seu, e os seus não o receberam.',
        'Mas a todos quantos o receberam deu o poder de se tornarem filhos de Deus, aos que crêem no seu nome,',
        'os quais não nasceram do sangue, nem da vontade da carne, nem da vontade do homem, mas sim de Deus.',
        'E o Verbo se fez carne e habitou entre nós, e vimos a sua glória, glória própria do Filho único do Pai, cheio de graça e de verdade.',
      ],
      2: [
        'Três dias depois, celebravam-se bodas em Caná da Galileia, e achava-se ali a mãe de Jesus.',
        'Também foram convidados Jesus e os seus discípulos.',
        'Como viesse a faltar vinho, a mãe de Jesus disse-lhe: Eles já não têm vinho.',
        'Respondeu-lhe Jesus: Mulher, isso compete a nós? Minha hora ainda não chegou.',
        'Disse, então, sua mãe aos serventes: Fazei o que ele vos disser.',
        'Ora, achavam-se ali seis talhas de pedra para as purificações dos judeus, que continham cada qual duas ou três medidas.',
        'Jesus ordena-lhes: Enchei as talhas de água. Eles encheram-nas até em cima.',
        'Tirai agora, disse-lhes Jesus, e levai ao chefe dos serventes. E levaram.',
        'Logo que o chefe dos serventes provou da água tornada vinho, sem saber de onde ele viesse (se bem que o soubessem os serventes, pois tinham tirado a água), chamou o noivo',
        'e disse-lhe: É costume servir primeiro o vinho bom e, depois, quando os convidados já estão quase embriagados, servir o menos bom. Mas tu guardaste o vinho melhor até agora.',
        'Este foi o primeiro milagre de Jesus; realizou-o em Caná da Galileia. Manifestou a sua glória, e os seus discípulos creram nele.',
      ],
      6: [
        ...Array(52).fill('[versículo disponível em breve]'),
        // 53
        'Em verdade, em verdade vos digo: se não comerdes a carne do Filho do Homem e não beberdes o seu sangue, não tereis a vida em vós.',
        'Quem come a minha carne e bebe o meu sangue tem a vida eterna, e eu o ressuscitarei no último dia.',
        'Pois a minha carne é verdadeira comida, e o meu sangue é verdadeira bebida.',
        'Quem come a minha carne e bebe o meu sangue permanece em mim, e eu nele.',
        'Como o Pai que me enviou vive, e eu vivo pelo Pai, assim quem de mim se alimenta também viverá por mim.',
        'Este é o pão que desceu do céu. Não como o que vossos pais comeram e morreram. Aquele que comer deste pão viverá eternamente.',
        // 59-66
        ...Array(8).fill('[versículo disponível em breve]'),
        // 67
        'Disse Jesus aos doze: Quereis vós também retirar-vos?',
        'Respondeu-lhe Simão Pedro: Senhor, a quem iríamos nós? Tu tens as palavras da vida eterna;',
        'nós cremos e sabemos que tu és o Santo de Deus.',
        'Jesus respondeu-lhes: Acaso não fui eu que vos escolhi, em número de doze? Contudo, um de vós é diabo.',
        'Falava ele de Judas, filho de Simão Iscariotes, porque era ele quem o havia de trair, sendo um dos Doze.',
      ],
      17: [
        ...Array(19).fill('[versículo disponível em breve]'),
        // 20
        'Não rogo, porém, somente por eles, mas também por aqueles que, por meio de sua palavra, hão de crer em mim.',
        'Para que todos sejam um, assim como tu, Pai, estás em mim e eu em ti; para que também eles estejam em nós e o mundo creia que tu me enviaste.',
        'Eu lhes dei a glória que me deste, para que sejam um, como nós somos um.',
        'Eu neles e tu em mim, para que sejam perfeitos na unidade, e o mundo reconheça que tu me enviaste e que os amaste, como amaste a mim.',
      ],
    },
  },
  {
    id: 'rm',
    name: 'Romanos',
    short: 'Rm',
    testament: 'NT',
    group: 'Cartas Paulinas',
    totalChapters: 16,
    chapters: {
      1: [
        ...Array(19).fill('[versículo disponível em breve]'),
        // 20
        'As perfeições invisíveis de Deus, desde a criação do mundo, são entendidas e vistas por meio das coisas criadas, assim como o seu eterno poder e divindade, de modo que os homens são indesculpáveis.',
        'Porque, tendo conhecido a Deus, não o glorificaram como a Deus, nem lhe deram graças; mas extraviaram-se em seus pensamentos, e o seu coração insensato ficou obscurecido.',
        'Pretendendo passar por sábios, tornaram-se loucos.',
        'E trocaram a glória de Deus incorruptível por imagens do homem corruptível, e de aves, e quadrúpedes, e répteis.',
        'Por isso, Deus os entregou aos desejos dos seus corações, à imundícia, de maneira que desonraram seus próprios corpos.',
        'Eles, que trocaram a verdade de Deus pela mentira, e adoraram e serviram à criatura em vez do Criador, que é bendito eternamente. Amém.',
        'Por isso, Deus os entregou a paixões vergonhosas: as suas mulheres mudaram as relações naturais por outras contrárias à natureza;',
        'do mesmo modo também os homens, deixando o uso natural da mulher, se inflamaram de desejos uns para com os outros, cometendo torpezas homens com homens, e recebendo em si mesmos o castigo merecido pela sua aberração.',
      ],
      8: [
        ...Array(27).fill('[versículo disponível em breve]'),
        // 28
        'Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.',
      ],
    },
  },
  {
    id: '1cor',
    name: '1 Coríntios',
    short: '1Cor',
    testament: 'NT',
    group: 'Cartas Paulinas',
    totalChapters: 16,
    chapters: {
      11: [
        ...Array(26).fill('[versículo disponível em breve]'),
        // 27
        'Portanto, todo aquele que comer do pão ou beber do cálice do Senhor indignamente, será réu do corpo e do sangue do Senhor.',
        'Examine-se, pois, cada um a si mesmo, e assim coma deste pão e beba deste cálice.',
        'Aquele que come e bebe sem distinguir o corpo do Senhor, come e bebe a sua própria condenação.',
      ],
      13: [
        'Ainda que eu fale as línguas dos homens e dos anjos, se não tiver caridade, sou como o bronze que soa, ou como o címbalo que retine.',
        'Mesmo que eu tenha o dom da profecia, e conheça todos os mistérios e toda a ciência; mesmo que eu tenha tão grande fé, que transporte montanhas, se não tiver caridade, nada sou.',
        'Ainda que eu distribua todos os meus bens em sustento dos pobres, e ainda que entregue o meu corpo para ser queimado, se não tiver caridade, de nada me aproveita.',
        'A caridade é paciente, é benigna; a caridade não é invejosa, não é temerária nem orgulhosa.',
        'Nada faz de inconveniente, não busca o próprio interesse, não se encoleriza, não suspeita mal;',
        'não se alegra com a injustiça, mas se rejubila com a verdade;',
        'tudo desculpa, tudo crê, tudo espera, tudo suporta.',
        'A caridade jamais acabará.',
      ],
      15: [
        'Lembro-vos, irmãos, o Evangelho que vos preguei, que recebestes, no qual perseverais.',
        'Por ele sois salvos, se o conservardes como vo-lo preguei, a menos que tenhais abraçado a fé em vão.',
        'Pois eu vos transmiti, em primeiro lugar, o que também recebi: que Cristo morreu por nossos pecados, segundo as Escrituras;',
        'que foi sepultado e que ressuscitou ao terceiro dia, segundo as Escrituras;',
        'que apareceu a Cefas e depois aos Doze.',
        'Em seguida, apareceu a mais de quinhentos irmãos de uma só vez, dos quais a maior parte é ainda viva e outros morreram.',
        'Depois apareceu a Tiago, em seguida a todos os apóstolos.',
        'E, por último de todos, apareceu também a mim, como a um aborto.',
      ],
    },
  },
  {
    id: '1pd',
    name: '1 Pedro',
    short: '1Pd',
    testament: 'NT',
    group: 'Cartas Católicas',
    totalChapters: 5,
    chapters: {
      3: [
        ...Array(14).fill('[versículo disponível em breve]'),
        'Santificai a Cristo, como Senhor, em vossos corações, estando sempre prontos para responder a qualquer pessoa que vos pedir razão da esperança que há em vós, mas com mansidão e reverência.',
      ],
    },
  },
  {
    id: 'ap',
    name: 'Apocalipse',
    short: 'Ap',
    testament: 'NT',
    group: 'Apocalíptico',
    totalChapters: 22,
    chapters: {
      5: [
        ...Array(7).fill('[versículo disponível em breve]'),
        // 8
        'E quando tomou o livro, os quatro animais e os vinte e quatro anciãos prostraram-se diante do Cordeiro, tendo cada um deles harpas e taças de ouro cheias de incenso, que são as orações dos santos.',
      ],
    },
  },
];

// Helper: dado um id de livro e capítulo, retorna lista de versículos.
export function getChapter(bookId, chapter) {
  const book = BIBLE_BOOKS.find((b) => b.id === bookId);
  if (!book) return null;
  return book.chapters[chapter] ?? null;
}

// Parser para "Mt 16,18-19" -> { bookShort, chapter, verseStart, verseEnd }
// Aceita formato "Livro Cap,Vers" ou "Livro Cap,V1-V2"
export function parseRef(refString) {
  const match = refString.match(/^([\wÀ-ÿ\s]+?)\s*(\d+),(\d+)(?:-(\d+))?/);
  if (!match) return null;
  return {
    bookName: match[1].trim(),
    chapter: parseInt(match[2], 10),
    verseStart: parseInt(match[3], 10),
    verseEnd: match[4] ? parseInt(match[4], 10) : parseInt(match[3], 10),
  };
}
