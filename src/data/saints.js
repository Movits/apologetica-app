// Calendario simplificado de santos por dia do ano (apenas santos mais conhecidos
// no calendario geral romano e devocao brasileira). Para datas sem santo destacado,
// o app pode mostrar a feria do tempo liturgico ou apenas omitir.

// Formato: { 'MM-DD': { name, summary, kind } }
// kind: 'memoria', 'festa', 'solenidade', 'opcional'

export const saints = {
  // Janeiro
  '01-01': { name: 'Santa Maria, Mãe de Deus', kind: 'solenidade', summary: 'Oitava do Natal. Festa litúrgica da maternidade divina de Maria, definida em Éfeso (431).' },
  '01-02': { name: 'Santos Basílio Magno e Gregório Nazianzeno', kind: 'memoria', summary: 'Doutores da Igreja, capadócios, defensores da divindade do Espírito Santo no séc. IV.' },
  '01-06': { name: 'Epifania do Senhor', kind: 'solenidade', summary: 'Manifestação de Jesus aos magos do oriente, sinal de que a salvação chega a todas as nações.' },
  '01-25': { name: 'Conversão de São Paulo', kind: 'festa', summary: 'O perseguidor de cristãos torna-se apóstolo dos gentios na estrada de Damasco.' },
  '01-28': { name: 'Santo Tomás de Aquino', kind: 'memoria', summary: 'Doutor Angélico, autor da Suma Teológica. Síntese máxima entre fé e razão.' },
  '01-31': { name: 'São João Bosco', kind: 'memoria', summary: 'Fundador dos salesianos, dedicou a vida à educação cristã da juventude.' },

  // Fevereiro
  '02-02': { name: 'Apresentação do Senhor', kind: 'festa', summary: 'Festa das Candeias. Jesus apresentado no Templo conforme a Lei.' },
  '02-11': { name: 'Nossa Senhora de Lourdes', kind: 'opcional', summary: 'Aparições de Maria a Santa Bernadette em 1858. Dia Mundial do Doente.' },
  '02-22': { name: 'Cátedra de São Pedro', kind: 'festa', summary: 'Festa do primado petrino e da autoridade da Igreja.' },

  // Marco
  '03-19': { name: 'São José, Esposo de Maria', kind: 'solenidade', summary: 'Pai virginal de Jesus, padroeiro da Igreja universal e dos trabalhadores.' },
  '03-25': { name: 'Anunciação do Senhor', kind: 'solenidade', summary: 'Encarnação do Verbo no ventre de Maria. Início da redenção. Nove meses antes do Natal.' },

  // Abril
  '04-25': { name: 'São Marcos, Evangelista', kind: 'festa', summary: 'Companheiro de Pedro, escreveu o segundo Evangelho a partir da pregação petrina.' },
  '04-29': { name: 'Santa Catarina de Sena', kind: 'memoria', summary: 'Doutora da Igreja, mística, conseguiu o retorno do Papa de Avignon para Roma.' },

  // Maio
  '05-01': { name: 'São José Operário', kind: 'opcional', summary: 'Dignidade do trabalho humano santificado pelo exemplo de São José.' },
  '05-03': { name: 'Santos Filipe e Tiago', kind: 'festa', summary: 'Apóstolos. Filipe levou o evangelho à Ásia Menor; Tiago Menor foi bispo de Jerusalém.' },
  '05-13': { name: 'Nossa Senhora de Fátima', kind: 'opcional', summary: 'Primeira aparição em Fátima, Portugal, em 1917, com chamado à oração e penitência.' },
  '05-14': { name: 'São Matias, Apóstolo', kind: 'festa', summary: 'Substituiu Judas Iscariotes no colégio apostólico (At 1,15-26).' },
  '05-31': { name: 'Visitação de Maria', kind: 'festa', summary: 'Maria visita Isabel; ocasião do Magnificat (Lc 1,46-55).' },

  // Junho
  '06-13': { name: 'Santo Antônio de Pádua', kind: 'memoria', summary: 'Doutor da Igreja, franciscano, padroeiro dos pobres e dos objetos perdidos.' },
  '06-24': { name: 'Nascimento de São João Batista', kind: 'solenidade', summary: 'Precursor de Cristo. Único santo (além de Maria) cujo nascimento é celebrado.' },
  '06-29': { name: 'Santos Pedro e Paulo', kind: 'solenidade', summary: 'Pilares da Igreja em Roma. Ambos martirizados na Cidade Eterna sob Nero.' },

  // Julho
  '07-03': { name: 'São Tomé, Apóstolo', kind: 'festa', summary: 'O que duvidou e depois confessou "Senhor meu e Deus meu". Levou o evangelho à Índia.' },
  '07-11': { name: 'São Bento', kind: 'memoria', summary: 'Patriarca do monaquismo ocidental. Padroeiro da Europa.' },
  '07-22': { name: 'Santa Maria Madalena', kind: 'festa', summary: 'Primeira testemunha da Ressurreição. Apóstola dos apóstolos.' },
  '07-25': { name: 'São Tiago Maior', kind: 'festa', summary: 'Apóstolo, irmão de João Evangelista. Primeiro mártir entre os Doze.' },
  '07-26': { name: 'Santos Joaquim e Ana', kind: 'memoria', summary: 'Pais da Virgem Maria, avós de Jesus.' },
  '07-29': { name: 'Santa Marta', kind: 'memoria', summary: 'Irmã de Lázaro e Maria, que recebeu Jesus em Betânia.' },

  // Agosto
  '08-01': { name: 'Santo Afonso Maria de Ligório', kind: 'memoria', summary: 'Fundador dos redentoristas, doutor da Igreja, escreveu sobre moral e devoção mariana.' },
  '08-06': { name: 'Transfiguração do Senhor', kind: 'festa', summary: 'Jesus se manifesta em glória no monte Tabor diante de Pedro, Tiago e João.' },
  '08-10': { name: 'São Lourenço', kind: 'festa', summary: 'Diácono mártir do séc. III. Distribuiu os bens da Igreja aos pobres antes de seu martírio.' },
  '08-15': { name: 'Assunção de Nossa Senhora', kind: 'solenidade', summary: 'Maria assumida em corpo e alma à glória celeste. Dogma definido em 1950.' },
  '08-22': { name: 'Nossa Senhora Rainha', kind: 'memoria', summary: 'Maria coroada Rainha do Céu, oitavo dia após a Assunção.' },
  '08-28': { name: 'Santo Agostinho', kind: 'memoria', summary: 'Bispo de Hipona, doutor da Igreja, autor das Confissões. Maior teólogo do Ocidente patrístico.' },

  // Setembro
  '09-08': { name: 'Natividade de Maria', kind: 'festa', summary: 'Nascimento da Mãe de Deus, celebrado nove meses após a Imaculada Conceição.' },
  '09-14': { name: 'Exaltação da Santa Cruz', kind: 'festa', summary: 'Encontro das relíquias da Cruz por Santa Helena no séc. IV.' },
  '09-21': { name: 'São Mateus, Apóstolo e Evangelista', kind: 'festa', summary: 'Publicano chamado por Jesus. Escreveu o primeiro Evangelho.' },
  '09-29': { name: 'Santos Arcanjos Miguel, Gabriel e Rafael', kind: 'festa', summary: 'Os três arcanjos nomeados na Sagrada Escritura.' },

  // Outubro
  '10-01': { name: 'Santa Teresinha do Menino Jesus', kind: 'memoria', summary: 'Carmelita francesa, doutora da Igreja. Pequena via de confiança e infância espiritual.' },
  '10-04': { name: 'São Francisco de Assis', kind: 'memoria', summary: 'Fundador dos franciscanos, padroeiro da Itália e da ecologia.' },
  '10-07': { name: 'Nossa Senhora do Rosário', kind: 'memoria', summary: 'Festa instituída por São Pio V após a vitória em Lepanto, em 1571.' },
  '10-12': { name: 'Nossa Senhora Aparecida', kind: 'solenidade', summary: 'Padroeira do Brasil. Imagem encontrada nas águas do rio Paraíba em 1717.' },
  '10-15': { name: 'Santa Teresa de Ávila', kind: 'memoria', summary: 'Carmelita reformadora, mística, doutora da Igreja.' },
  '10-22': { name: 'São João Paulo II', kind: 'opcional', summary: 'Papa de 1978 a 2005. Beato em 2011, canonizado em 2014.' },
  '10-28': { name: 'Santos Simão e Judas', kind: 'festa', summary: 'Apóstolos. Judas Tadeu, padroeiro das causas difíceis.' },

  // Novembro
  '11-01': { name: 'Todos os Santos', kind: 'solenidade', summary: 'Festa de todos os santos canonizados e dos santos anônimos, conhecidos só de Deus.' },
  '11-02': { name: 'Comemoração dos Fiéis Defuntos', kind: 'solenidade', summary: 'Oração pelos que partiram, em especial os que ainda se purificam no Purgatório.' },
  '11-09': { name: 'Dedicação da Basílica de Latrão', kind: 'festa', summary: 'Catedral do Papa, "mãe e cabeça de todas as igrejas".' },
  '11-21': { name: 'Apresentação de Maria', kind: 'memoria', summary: 'Tradição da entrada de Maria no Templo de Jerusalém ainda criança.' },
  '11-30': { name: 'Santo André, Apóstolo', kind: 'festa', summary: 'Irmão de Pedro, primeiro chamado por Jesus.' },

  // Dezembro
  '12-08': { name: 'Imaculada Conceição', kind: 'solenidade', summary: 'Maria concebida sem pecado original. Dogma definido por Pio IX em 1854.' },
  '12-12': { name: 'Nossa Senhora de Guadalupe', kind: 'memoria', summary: 'Aparição a São Juan Diego no México em 1531. Padroeira das Américas.' },
  '12-25': { name: 'Natal do Senhor', kind: 'solenidade', summary: 'Nascimento de Cristo segundo a carne. O Verbo se fez carne.' },
  '12-26': { name: 'Santo Estêvão, Protomártir', kind: 'festa', summary: 'Primeiro mártir cristão, apedrejado em Jerusalém (At 7).' },
  '12-27': { name: 'São João, Apóstolo e Evangelista', kind: 'festa', summary: 'O discípulo amado, autor do quarto Evangelho, das cartas e do Apocalipse.' },
  '12-28': { name: 'Santos Inocentes', kind: 'festa', summary: 'Crianças de Belém mortas por Herodes, primeiros mártires da causa de Cristo (Mt 2,16-18).' },
};

// Algoritmo da Páscoa (Meeus/Jones/Butcher, calendário gregoriano).
// Retorna um Date com a Páscoa do ano dado.
function easterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(d.getDate() + n);
  return r;
}

function md(d) {
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Calcula festas móveis baseadas na Páscoa do ano.
// Em 2026: Páscoa = 5/abril, Pentecostes = 24/maio, Trindade = 31/maio,
// Corpus Christi = 4/junho, Sagrado Coração = 12/junho, Imaculado Coração = 13/junho.
function movableFeastsFor(year) {
  const easter = easterDate(year);
  return {
    [md(addDays(easter, -46))]: {
      name: 'Quarta-feira de Cinzas',
      kind: 'feria',
      summary: 'Início da Quaresma. Imposição das cinzas e chamado à conversão. Dia de jejum e abstinência.',
    },
    [md(easter)]: {
      name: 'Páscoa da Ressurreição',
      kind: 'solenidade',
      summary: 'Solenidade das solenidades. Cristo ressuscitou. Centro do ano litúrgico.',
    },
    [md(addDays(easter, 49))]: {
      name: 'Pentecostes',
      kind: 'solenidade',
      summary: 'Descida do Espírito Santo sobre os Apóstolos e Maria. Nascimento público da Igreja.',
    },
    [md(addDays(easter, 56))]: {
      name: 'Santíssima Trindade',
      kind: 'solenidade',
      summary: 'Solenidade do mistério central da fé: um só Deus em três Pessoas (Pai, Filho e Espírito Santo).',
    },
    [md(addDays(easter, 60))]: {
      name: 'Santíssimo Corpo e Sangue de Cristo',
      kind: 'solenidade',
      summary: 'Corpus Christi. No Brasil é celebrado na quinta-feira após a Santíssima Trindade. Procissão eucarística e adoração.',
    },
    [md(addDays(easter, 68))]: {
      name: 'Sagrado Coração de Jesus',
      kind: 'solenidade',
      summary: 'Solenidade movível, sexta-feira após o segundo domingo depois de Pentecostes. Devoção promovida por Santa Margarida Maria Alacoque, séc. XVII. Reparação pelos pecados e amor misericordioso de Cristo.',
    },
    [md(addDays(easter, 69))]: {
      name: 'Imaculado Coração de Maria',
      kind: 'memoria',
      summary: 'Memória movível, sábado seguinte ao Sagrado Coração de Jesus. Coração de Maria como modelo de docilidade ao Espírito e refúgio dos pecadores.',
    },
  };
}

// Cache do cálculo por ano (evita recomputar a cada tap).
let _cachedYear = null;
let _cachedMovable = {};

export function getSaintToday(date = new Date()) {
  const year = date.getFullYear();
  if (year !== _cachedYear) {
    _cachedYear = year;
    _cachedMovable = movableFeastsFor(year);
  }
  const key = md(date);
  // Festas móveis têm prioridade (solenidades > memórias do calendário fixo).
  return _cachedMovable[key] || saints[key] || null;
}
