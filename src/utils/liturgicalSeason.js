// Estacao liturgica calculada LOCALMENTE (sem rede), para um banner sazonal na
// Home no espirito da home dinamica do Capela, mas offline-first. Aproximado o
// suficiente para decoracao: Advento, Natal, Quaresma, Pascoa e Tempo Comum.

// Domingo de Pascoa pelo algoritmo de Meeus/Jones/Butcher (calendario gregoriano).
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

function addDays(base, n) {
  const x = new Date(base);
  x.setDate(x.getDate() + n);
  return x;
}

const SEASONS = {
  advento: { pt: 'Advento', en: 'Advent', color: '#6b4c9a', icon: 'star-outline', notePt: 'Tempo de espera e esperança.', noteEn: 'A time of waiting and hope.' },
  natal: { pt: 'Natal', en: 'Christmas', color: '#c9a84c', icon: 'star', notePt: 'O Verbo se fez carne.', noteEn: 'The Word became flesh.' },
  quaresma: { pt: 'Quaresma', en: 'Lent', color: '#6b4c9a', icon: 'flower-outline', notePt: 'Conversão, oração e penitência.', noteEn: 'Conversion, prayer and penance.' },
  pascoa: { pt: 'Tempo Pascal', en: 'Easter', color: '#c9a84c', icon: 'sunny', notePt: 'Cristo ressuscitou, aleluia.', noteEn: 'Christ is risen, alleluia.' },
  comum: { pt: 'Tempo Comum', en: 'Ordinary Time', color: '#3a7d4b', icon: 'leaf', notePt: 'Caminhar na fé, dia após dia.', noteEn: 'Walking in faith, day by day.' },
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
