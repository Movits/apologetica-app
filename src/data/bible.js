// Cada capítulo tem `total` (qtd real de versículos) e `verses` (array com {n, t}).
// Capítulos com texto completo: Gn 1, Sl 23, Jo 1, Jo 2, 1Cor 13, 1Cor 15 (parcial).
// Os demais têm apenas versículos-chave referenciados nos artigos.
// Tradução adaptada da Bíblia Ave Maria / Vulgata.

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
      1: {
        total: 31,
        verses: [
          { n: 1, t: 'No princípio, Deus criou o céu e a terra.' },
          { n: 2, t: 'A terra estava informe e vazia; as trevas cobriam o abismo, e o Espírito de Deus pairava sobre as águas.' },
          { n: 3, t: 'Deus disse: Faça-se a luz. E a luz foi feita.' },
          { n: 4, t: 'Deus viu que a luz era boa, e separou a luz das trevas.' },
          { n: 5, t: 'À luz Deus chamou dia, e às trevas, noite. Houve uma tarde e uma manhã: foi o primeiro dia.' },
          { n: 6, t: 'Deus disse: Faça-se um firmamento entre as águas, separando umas das outras.' },
          { n: 7, t: 'E Deus fez o firmamento e separou as águas que estavam debaixo do firmamento das que estavam por cima. E assim se fez.' },
          { n: 8, t: 'Ao firmamento Deus chamou céu. Houve uma tarde e uma manhã: foi o segundo dia.' },
          { n: 9, t: 'Deus disse: As águas que estão debaixo do céu se reúnam num só lugar e apareça o continente. E assim se fez.' },
          { n: 10, t: 'Ao continente Deus chamou terra, e ao agrupamento das águas, mar. E Deus viu que isto era bom.' },
          { n: 11, t: 'Deus disse: Produza a terra plantas, ervas que dão sementes, árvores frutíferas que dão segundo a sua espécie frutos contendo em si mesmos sua semente, sobre a terra. E assim se fez.' },
          { n: 12, t: 'A terra produziu plantas, ervas que dão sementes segundo a sua espécie, e árvores que dão segundo a sua espécie frutos contendo em si mesmos sua semente. E Deus viu que isto era bom.' },
          { n: 13, t: 'Houve uma tarde e uma manhã: foi o terceiro dia.' },
          { n: 14, t: 'Deus disse: Faça-se luzeiros no firmamento dos céus, para separar o dia da noite e marcar as estações, os dias e os anos.' },
          { n: 15, t: 'Eles servirão de luzeiros no firmamento dos céus para alumiar a terra. E assim se fez.' },
          { n: 16, t: 'Deus fez os dois grandes luzeiros: o maior para presidir ao dia, e o menor para presidir à noite; fez também as estrelas.' },
          { n: 17, t: 'Deus colocou-os no firmamento dos céus para luzirem sobre a terra,' },
          { n: 18, t: 'para presidirem ao dia e à noite, e para separarem a luz das trevas. E Deus viu que isto era bom.' },
          { n: 19, t: 'Houve uma tarde e uma manhã: foi o quarto dia.' },
          { n: 20, t: 'Deus disse: Pululem nas águas seres viventes, e voem aves sobre a terra debaixo do firmamento dos céus.' },
          { n: 21, t: 'Deus criou os grandes monstros marinhos, e todos os seres viventes que se movem nas águas, segundo a sua espécie, e todas as aves segundo as suas espécies. E Deus viu que isto era bom.' },
          { n: 22, t: 'Deus os abençoou, dizendo: Crescei e multiplicai-vos, e enchei as águas do mar, e multipliquem-se as aves sobre a terra.' },
          { n: 23, t: 'Houve uma tarde e uma manhã: foi o quinto dia.' },
          { n: 24, t: 'Deus disse: Produza a terra seres viventes segundo a sua espécie, animais domésticos, répteis e animais selvagens segundo a sua espécie. E assim se fez.' },
          { n: 25, t: 'Deus fez os animais selvagens segundo a sua espécie, os animais domésticos e todos os répteis da terra segundo a sua espécie. E Deus viu que isto era bom.' },
          { n: 26, t: 'Deus disse: Façamos o homem à nossa imagem e semelhança. Que ele domine sobre os peixes do mar, sobre as aves do céu, sobre os animais domésticos e sobre toda a terra, e sobre todos os répteis que se arrastam sobre a terra.' },
          { n: 27, t: 'Deus criou o homem à sua imagem; criou-o à imagem de Deus, criou o homem e a mulher.' },
          { n: 28, t: 'Deus os abençoou: Sede fecundos, disse ele, multiplicai-vos, enchei a terra e submetei-a. Dominai sobre os peixes do mar, sobre as aves do céu e sobre todos os animais que se movem na terra.' },
          { n: 29, t: 'Deus disse: Eis que vos dou todas as ervas que dão semente sobre a terra, e todas as árvores frutíferas que contêm em si mesmas a sua semente, para que vos sirvam de alimento.' },
          { n: 30, t: 'E a todos os animais da terra, a todas as aves do céu, a tudo o que se move sobre a terra e que é animado de vida, eu dou como alimento toda a verdura das plantas. E assim se fez.' },
          { n: 31, t: 'Deus viu tudo o que tinha feito: e era muito bom. Houve uma tarde e uma manhã: foi o sexto dia.' },
        ],
      },
    },
  },
  {
    id: 'sl',
    name: 'Salmos',
    short: 'Sl',
    testament: 'AT',
    group: 'Livros sapienciais',
    totalChapters: 150,
    chapters: {
      23: {
        total: 6,
        verses: [
          { n: 1, t: 'O Senhor é meu pastor: nada me faltará.' },
          { n: 2, t: 'Em verdes prados ele me faz repousar; conduz-me junto às águas refrescantes.' },
          { n: 3, t: 'Reconforta a minha alma. Pelos caminhos retos ele me leva, por amor do seu nome.' },
          { n: 4, t: 'Ainda que eu atravesse o vale escuro, nada temerei, pois estais comigo. Vossa vara e vosso báculo são o meu amparo.' },
          { n: 5, t: 'Diante de mim preparais uma mesa, à vista de meus inimigos. Ungis com óleo a minha cabeça, e transborda minha taça.' },
          { n: 6, t: 'A bondade e a graça hão de seguir-me por todos os dias da minha vida. E habitarei na casa do Senhor por longos dias.' },
        ],
      },
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
      16: {
        total: 28,
        verses: [
          { n: 13, t: 'Tendo chegado às regiões de Cesareia de Filipe, Jesus perguntou a seus discípulos: No dizer dos homens, quem é o Filho do Homem?' },
          { n: 14, t: 'Responderam-lhe: Uns dizem que é João Batista; outros, Elias; outros, Jeremias ou algum dos profetas.' },
          { n: 15, t: 'Disse-lhes Jesus: E vós, quem dizeis que eu sou?' },
          { n: 16, t: 'Simão Pedro respondeu: Tu és o Cristo, o Filho de Deus vivo.' },
          { n: 17, t: 'Jesus, então, lhe disse: Bem-aventurado és, Simão, filho de Jonas, porque não foi a carne nem o sangue que te revelou isto, mas meu Pai que está nos céus.' },
          { n: 18, t: 'E eu te digo que tu és Pedro, e sobre esta pedra edificarei a minha Igreja, e as portas do inferno não prevalecerão contra ela.' },
          { n: 19, t: 'Eu te darei as chaves do Reino dos Céus: tudo o que ligares na terra será ligado nos céus, e tudo o que desligares na terra será desligado nos céus.' },
        ],
      },
      22: {
        total: 46,
        verses: [
          { n: 31, t: 'E quanto à ressurreição dos mortos, não tendes lido o que Deus vos disse:' },
          { n: 32, t: 'Eu sou o Deus de Abraão, o Deus de Isaque e o Deus de Jacó? Deus não é Deus dos mortos, mas dos vivos.' },
          { n: 33, t: 'Ouvindo isto, as multidões admiravam-se da sua doutrina.' },
        ],
      },
      26: {
        total: 75,
        verses: [
          { n: 26, t: 'Durante a ceia, Jesus tomou o pão, abençoou-o, partiu-o e o deu a seus discípulos, dizendo: Tomai e comei, isto é o meu corpo.' },
          { n: 27, t: 'Tomando, em seguida, o cálice, deu graças e o entregou a seus discípulos, dizendo: Bebei dele todos.' },
          { n: 28, t: 'Porque isto é o meu sangue, o sangue da Aliança, que vai ser derramado por uma multidão em remissão dos pecados.' },
          { n: 29, t: 'Eu vos declaro: não tornarei a beber deste fruto da videira, desde agora até o dia em que beberei convosco do novo vinho no Reino de meu Pai.' },
        ],
      },
      28: {
        total: 20,
        verses: [
          { n: 1, t: 'Depois do sábado, ao alvorecer do primeiro dia da semana, Maria Madalena e a outra Maria foram ver o sepulcro.' },
          { n: 2, t: 'E eis que houve um grande terremoto: um anjo do Senhor desceu do céu e, aproximando-se, removeu a pedra e sentou-se sobre ela.' },
          { n: 3, t: 'Resplandecia como relâmpago e suas vestes eram brancas como neve.' },
          { n: 4, t: 'Os guardas, de medo, ficaram aterrados e como mortos.' },
          { n: 5, t: 'Falando o anjo, disse às mulheres: Não temais! Sei que buscais Jesus, que foi crucificado.' },
          { n: 6, t: 'Não está aqui: ressuscitou como disse. Vinde e vede o lugar onde ele repousou.' },
          { n: 7, t: 'Ide depressa e dizei aos discípulos que ele ressuscitou dos mortos. Ele vos precede na Galileia, onde o vereis. Eis que vos preveni.' },
          { n: 8, t: 'Elas se afastaram prontamente do sepulcro com certo temor, mas ao mesmo tempo com alegria, e foram correndo dar a boa nova aos discípulos.' },
          { n: 9, t: 'Nesse momento, Jesus apresentou-se diante delas e disse-lhes: Salve! Aproximaram-se elas e, prostradas diante dele, beijaram-lhe os pés.' },
          { n: 10, t: 'Disse-lhes Jesus: Não temais! Ide dizer a meus irmãos que se dirijam à Galileia, onde eles me verão.' },
          { n: 18, t: 'Aproximando-se, Jesus disse-lhes: Toda autoridade me foi dada no céu e na terra.' },
          { n: 19, t: 'Ide, pois, fazei discípulos de todas as nações, batizando-os em nome do Pai e do Filho e do Espírito Santo;' },
          { n: 20, t: 'ensinando-os a observar tudo o que vos tenho mandado. E eis que estou convosco todos os dias até a consumação dos séculos.' },
        ],
      },
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
      1: {
        total: 51,
        verses: [
          { n: 1, t: 'No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.' },
          { n: 2, t: 'Ele estava no princípio com Deus.' },
          { n: 3, t: 'Tudo foi feito por ele, e sem ele nada foi feito.' },
          { n: 4, t: 'Nele estava a vida, e a vida era a luz dos homens.' },
          { n: 5, t: 'A luz brilha nas trevas, e as trevas não a compreenderam.' },
          { n: 6, t: 'Houve um homem enviado por Deus, cujo nome era João.' },
          { n: 7, t: 'Este veio como testemunha, para dar testemunho da luz, a fim de que todos cressem por meio dele.' },
          { n: 8, t: 'Não era ele a luz, mas veio para dar testemunho da luz.' },
          { n: 9, t: 'A luz verdadeira, que ilumina todo homem, vinha ao mundo.' },
          { n: 10, t: 'Estava no mundo, e o mundo foi feito por ele, e o mundo não o conheceu.' },
          { n: 11, t: 'Veio para o que era seu, e os seus não o receberam.' },
          { n: 12, t: 'Mas a todos quantos o receberam deu o poder de se tornarem filhos de Deus, aos que crêem no seu nome,' },
          { n: 13, t: 'os quais não nasceram do sangue, nem da vontade da carne, nem da vontade do homem, mas sim de Deus.' },
          { n: 14, t: 'E o Verbo se fez carne e habitou entre nós, e vimos a sua glória, glória própria do Filho único do Pai, cheio de graça e de verdade.' },
        ],
      },
      2: {
        total: 25,
        verses: [
          { n: 1, t: 'Três dias depois, celebravam-se bodas em Caná da Galileia, e achava-se ali a mãe de Jesus.' },
          { n: 2, t: 'Também foram convidados Jesus e os seus discípulos.' },
          { n: 3, t: 'Como viesse a faltar vinho, a mãe de Jesus disse-lhe: Eles já não têm vinho.' },
          { n: 4, t: 'Respondeu-lhe Jesus: Mulher, isso compete a nós? Minha hora ainda não chegou.' },
          { n: 5, t: 'Disse, então, sua mãe aos serventes: Fazei o que ele vos disser.' },
          { n: 6, t: 'Ora, achavam-se ali seis talhas de pedra para as purificações dos judeus, que continham cada qual duas ou três medidas.' },
          { n: 7, t: 'Jesus ordena-lhes: Enchei as talhas de água. Eles encheram-nas até em cima.' },
          { n: 8, t: 'Tirai agora, disse-lhes Jesus, e levai ao chefe dos serventes. E levaram.' },
          { n: 9, t: 'Logo que o chefe dos serventes provou da água tornada vinho, sem saber de onde ele viesse, chamou o noivo' },
          { n: 10, t: 'e disse-lhe: É costume servir primeiro o vinho bom e, depois, quando os convidados já estão quase embriagados, servir o menos bom. Mas tu guardaste o vinho melhor até agora.' },
          { n: 11, t: 'Este foi o primeiro milagre de Jesus; realizou-o em Caná da Galileia. Manifestou a sua glória, e os seus discípulos creram nele.' },
        ],
      },
      6: {
        total: 71,
        verses: [
          { n: 53, t: 'Em verdade, em verdade vos digo: se não comerdes a carne do Filho do Homem e não beberdes o seu sangue, não tereis a vida em vós.' },
          { n: 54, t: 'Quem come a minha carne e bebe o meu sangue tem a vida eterna, e eu o ressuscitarei no último dia.' },
          { n: 55, t: 'Pois a minha carne é verdadeira comida, e o meu sangue é verdadeira bebida.' },
          { n: 56, t: 'Quem come a minha carne e bebe o meu sangue permanece em mim, e eu nele.' },
          { n: 57, t: 'Como o Pai que me enviou vive, e eu vivo pelo Pai, assim quem de mim se alimenta também viverá por mim.' },
          { n: 58, t: 'Este é o pão que desceu do céu. Não como o que vossos pais comeram e morreram. Aquele que comer deste pão viverá eternamente.' },
          { n: 67, t: 'Disse Jesus aos doze: Quereis vós também retirar-vos?' },
          { n: 68, t: 'Respondeu-lhe Simão Pedro: Senhor, a quem iríamos nós? Tu tens as palavras da vida eterna;' },
          { n: 69, t: 'nós cremos e sabemos que tu és o Santo de Deus.' },
        ],
      },
      17: {
        total: 26,
        verses: [
          { n: 20, t: 'Não rogo, porém, somente por eles, mas também por aqueles que, por meio de sua palavra, hão de crer em mim.' },
          { n: 21, t: 'Para que todos sejam um, assim como tu, Pai, estás em mim e eu em ti; para que também eles estejam em nós e o mundo creia que tu me enviaste.' },
          { n: 22, t: 'Eu lhes dei a glória que me deste, para que sejam um, como nós somos um.' },
          { n: 23, t: 'Eu neles e tu em mim, para que sejam perfeitos na unidade, e o mundo reconheça que tu me enviaste e que os amaste, como amaste a mim.' },
        ],
      },
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
      1: {
        total: 32,
        verses: [
          { n: 20, t: 'As perfeições invisíveis de Deus, desde a criação do mundo, são entendidas e vistas por meio das coisas criadas, assim como o seu eterno poder e divindade, de modo que os homens são indesculpáveis.' },
          { n: 21, t: 'Porque, tendo conhecido a Deus, não o glorificaram como a Deus, nem lhe deram graças; mas extraviaram-se em seus pensamentos, e o seu coração insensato ficou obscurecido.' },
          { n: 22, t: 'Pretendendo passar por sábios, tornaram-se loucos.' },
          { n: 23, t: 'E trocaram a glória de Deus incorruptível por imagens do homem corruptível, e de aves, e quadrúpedes, e répteis.' },
          { n: 24, t: 'Por isso, Deus os entregou aos desejos dos seus corações, à imundícia, de maneira que desonraram seus próprios corpos.' },
          { n: 25, t: 'Eles, que trocaram a verdade de Deus pela mentira, e adoraram e serviram à criatura em vez do Criador, que é bendito eternamente. Amém.' },
          { n: 26, t: 'Por isso, Deus os entregou a paixões vergonhosas: as suas mulheres mudaram as relações naturais por outras contrárias à natureza;' },
          { n: 27, t: 'do mesmo modo também os homens, deixando o uso natural da mulher, se inflamaram de desejos uns para com os outros, cometendo torpezas homens com homens, e recebendo em si mesmos o castigo merecido pela sua aberração.' },
        ],
      },
      8: {
        total: 39,
        verses: [
          { n: 28, t: 'Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.' },
          { n: 29, t: 'Pois, aos que de antemão conheceu, também os predestinou a serem conformes à imagem de seu Filho, a fim de que ele seja o primogênito entre muitos irmãos.' },
          { n: 30, t: 'E aos que predestinou, também chamou; e aos que chamou, também justificou; e aos que justificou, também glorificou.' },
        ],
      },
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
      11: {
        total: 34,
        verses: [
          { n: 27, t: 'Portanto, todo aquele que comer do pão ou beber do cálice do Senhor indignamente, será réu do corpo e do sangue do Senhor.' },
          { n: 28, t: 'Examine-se, pois, cada um a si mesmo, e assim coma deste pão e beba deste cálice.' },
          { n: 29, t: 'Aquele que come e bebe sem distinguir o corpo do Senhor, come e bebe a sua própria condenação.' },
        ],
      },
      13: {
        total: 13,
        verses: [
          { n: 1, t: 'Ainda que eu fale as línguas dos homens e dos anjos, se não tiver caridade, sou como o bronze que soa, ou como o címbalo que retine.' },
          { n: 2, t: 'Mesmo que eu tenha o dom da profecia, e conheça todos os mistérios e toda a ciência; mesmo que eu tenha tão grande fé, que transporte montanhas, se não tiver caridade, nada sou.' },
          { n: 3, t: 'Ainda que eu distribua todos os meus bens em sustento dos pobres, e ainda que entregue o meu corpo para ser queimado, se não tiver caridade, de nada me aproveita.' },
          { n: 4, t: 'A caridade é paciente, é benigna; a caridade não é invejosa, não é temerária nem orgulhosa.' },
          { n: 5, t: 'Nada faz de inconveniente, não busca o próprio interesse, não se encoleriza, não suspeita mal;' },
          { n: 6, t: 'não se alegra com a injustiça, mas se rejubila com a verdade;' },
          { n: 7, t: 'tudo desculpa, tudo crê, tudo espera, tudo suporta.' },
          { n: 8, t: 'A caridade jamais acabará.' },
        ],
      },
      15: {
        total: 58,
        verses: [
          { n: 1, t: 'Lembro-vos, irmãos, o Evangelho que vos preguei, que recebestes, no qual perseverais.' },
          { n: 2, t: 'Por ele sois salvos, se o conservardes como vo-lo preguei, a menos que tenhais abraçado a fé em vão.' },
          { n: 3, t: 'Pois eu vos transmiti, em primeiro lugar, o que também recebi: que Cristo morreu por nossos pecados, segundo as Escrituras;' },
          { n: 4, t: 'que foi sepultado e que ressuscitou ao terceiro dia, segundo as Escrituras;' },
          { n: 5, t: 'que apareceu a Cefas e depois aos Doze.' },
          { n: 6, t: 'Em seguida, apareceu a mais de quinhentos irmãos de uma só vez, dos quais a maior parte é ainda viva e outros morreram.' },
          { n: 7, t: 'Depois apareceu a Tiago, em seguida a todos os apóstolos.' },
          { n: 8, t: 'E, por último de todos, apareceu também a mim, como a um aborto.' },
        ],
      },
    },
  },
  {
    id: '2ts',
    name: '2 Tessalonicenses',
    short: '2Ts',
    testament: 'NT',
    group: 'Cartas Paulinas',
    totalChapters: 3,
    chapters: {
      2: {
        total: 17,
        verses: [
          { n: 13, t: 'Devemos, sempre, dar graças a Deus por vós, irmãos amados de Deus, porque Deus vos escolheu para serdes as primícias da salvação, pela santificação do Espírito e a fé na verdade.' },
          { n: 14, t: 'É para esse fim que ele vos chamou pela nossa pregação do Evangelho, a fim de alcançardes a glória de nosso Senhor Jesus Cristo.' },
          { n: 15, t: 'Portanto, irmãos, permanecei firmes e conservai as tradições que aprendestes, seja por palavra, seja por carta nossa.' },
        ],
      },
    },
  },
  {
    id: '1tm',
    name: '1 Timóteo',
    short: '1Tm',
    testament: 'NT',
    group: 'Cartas Paulinas',
    totalChapters: 6,
    chapters: {
      2: {
        total: 15,
        verses: [
          { n: 3, t: 'Esta é uma coisa boa e agradável diante de Deus, nosso Salvador,' },
          { n: 4, t: 'que quer que todos os homens se salvem e cheguem ao conhecimento da verdade.' },
          { n: 5, t: 'Pois há um só Deus, e um só Mediador entre Deus e os homens: o homem Cristo Jesus.' },
          { n: 6, t: 'Ele se entregou em resgate por todos. Eis o testemunho dado nos tempos preestabelecidos.' },
        ],
      },
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
      3: {
        total: 22,
        verses: [
          { n: 15, t: 'Santificai a Cristo, como Senhor, em vossos corações, estando sempre prontos para responder a qualquer pessoa que vos pedir razão da esperança que há em vós, mas com mansidão e reverência.' },
          { n: 16, t: 'Tende uma boa consciência, para que, naquilo mesmo em que sois caluniados, fiquem confundidos os que difamam o vosso bom procedimento em Cristo.' },
        ],
      },
    },
  },
  {
    id: '2pd',
    name: '2 Pedro',
    short: '2Pd',
    testament: 'NT',
    group: 'Cartas Católicas',
    totalChapters: 3,
    chapters: {
      1: {
        total: 21,
        verses: [
          { n: 20, t: 'Antes de tudo, sabei isto: nenhuma profecia da Escritura é de interpretação particular.' },
          { n: 21, t: 'Pois a profecia jamais foi dada por vontade humana, mas homens, movidos pelo Espírito Santo, falaram da parte de Deus.' },
        ],
      },
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
      5: {
        total: 14,
        verses: [
          { n: 8, t: 'E quando tomou o livro, os quatro animais e os vinte e quatro anciãos prostraram-se diante do Cordeiro, tendo cada um deles harpas e taças de ouro cheias de incenso, que são as orações dos santos.' },
        ],
      },
    },
  },
];

// Helper: dado um id de livro e capítulo, retorna o objeto do capítulo.
export function getChapter(bookId, chapter) {
  const book = BIBLE_BOOKS.find((b) => b.id === bookId);
  if (!book) return null;
  return book.chapters[chapter] ?? null;
}

export function getBook(bookId) {
  return BIBLE_BOOKS.find((b) => b.id === bookId) ?? null;
}
