// Datas compartilhadas (Onda 8, S5): "item do dia", chave de hoje e Páscoa.
// Módulo puro (sem react-native nem expo) para rodar nos testes do Node.

// Dia do ano (1 de janeiro = 1). É a fórmula original de dailyVerses.js,
// quiz.js, notifications.js e HomeScreen.jsx, mantida ao pé da letra para não
// mudar o item do dia de ninguém: diferença em milissegundos desde 31/12 do ano
// anterior (new Date(ano, 0, 0)) dividida por um dia. Como é diferença de
// timestamps, uma troca de horário de verão entre 31/12 e a data tira uma hora
// da conta e o item só vira à 01:00 nesse dia. O Brasil não tem horário de
// verão desde 2019, e mudar a fórmula mudaria o item do dia dos usuários.
export function dayOfYear(date = new Date()) {
  return Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
}

// Índice determinístico "do dia": (diaDoAno + ano × semente) mod tamanho.
// O ano entra na semente para a sequência não se repetir de um ano para o
// outro. Semente 7 é a dos versículos e das objeções; o quiz usa 13 para não
// cair no mesmo índice do versículo.
export function dailyIndex(length, date = new Date(), salt = 7) {
  if (!length) return 0;
  return (dayOfYear(date) + date.getFullYear() * salt) % length;
}

// Chave AAAA-MM-DD em hora LOCAL, com zero à esquerda.
// Não usar toISOString(), que converte para UTC: à noite no Brasil (UTC-3) ela
// já devolve o dia seguinte, e o streak "de ontem" quebra. QuizScreen.jsx:100-112
// ainda usa toISOString (migração na onda das telas; ao migrar, tolerar as
// chaves antigas já gravadas no histórico, que têm o mesmo formato mas em UTC).
export function todayKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Domingo de Páscoa pelo algoritmo de Meeus/Jones/Butcher (calendário
// gregoriano). Devolve um Date à meia-noite local. Antes vivia duplicada em
// saints.js e liturgicalSeason.js.
export function easterDate(year) {
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

// Soma n dias (negativo para subtrair) e devolve uma data nova, sem alterar a
// de entrada.
export function addDays(base, n) {
  const x = new Date(base);
  x.setDate(x.getDate() + n);
  return x;
}
