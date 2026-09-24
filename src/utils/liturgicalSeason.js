// Estacao liturgica calculada LOCALMENTE (sem rede), para um banner sazonal na
// Home no espirito da home dinamica do Capela, mas offline-first. Aproximado o
// suficiente para decoracao: Advento, Natal, Quaresma, Pascoa e Tempo Comum.

import { easterDate, addDays } from './daily';

// `colorKey` é a chave da paleta do tema (ler com colors[season.colorKey]), sem hex solto aqui.
const SEASONS = {
  advento: { pt: 'Advento', en: 'Advent', colorKey: 'seasonPurple', icon: 'star-outline', notePt: 'Tempo de espera e esperança.', noteEn: 'A time of waiting and hope.' },
  natal: { pt: 'Natal', en: 'Christmas', colorKey: 'accentText', icon: 'star', notePt: 'O Verbo se fez carne.', noteEn: 'The Word became flesh.' },
  quaresma: { pt: 'Quaresma', en: 'Lent', colorKey: 'seasonPurple', icon: 'flower-outline', notePt: 'Conversão, oração e penitência.', noteEn: 'Conversion, prayer and penance.' },
  pascoa: { pt: 'Tempo Pascal', en: 'Easter', colorKey: 'accentText', icon: 'sunny', notePt: 'Cristo ressuscitou, aleluia.', noteEn: 'Christ is risen, alleluia.' },
  comum: { pt: 'Tempo Comum', en: 'Ordinary Time', colorKey: 'seasonGreen', icon: 'leaf', notePt: 'Caminhar na fé, dia após dia.', noteEn: 'Walking in faith, day by day.' },
};

export function getLiturgicalSeason(now = new Date()) {
  const y = now.getFullYear();
  const easter = easterDate(y);
  const ashWed = addDays(easter, -46);
  const pentecost = addDays(easter, 49);
  const christmas = new Date(y, 11, 25);

  // 1o Domingo do Advento = 4o domingo antes do Natal.
  const dow = christmas.getDay();
  const sundayOnOrBeforeXmas = addDays(christmas, -dow);
  const adventStart = addDays(sundayOnOrBeforeXmas, -21);

  const month = now.getMonth();
  const day = now.getDate();

  let key = 'comum';
  if (now >= adventStart && now < christmas) key = 'advento';
  else if (now >= christmas) key = 'natal';
  else if (month === 0 && day <= 6) key = 'natal';           // cauda do Natal (Jan 1-6)
  else if (now >= ashWed && now < easter) key = 'quaresma';
  else if (now >= easter && now <= pentecost) key = 'pascoa';

  return { key, ...SEASONS[key] };
}
