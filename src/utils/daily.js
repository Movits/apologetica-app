// Datas compartilhadas (Onda 8, S5): "item do dia", chave de hoje e Páscoa.
// Módulo puro (sem react-native nem expo) para rodar nos testes do Node.

// Dia do ano (1 de janeiro = 1), pela data do calendário local. A fórmula
// antiga dividia a diferença de timestamps desde 31/12 por um dia, e no
// horário de verão (EUA, Europa) a primeira hora depois da meia-noite ainda
// contava como o dia anterior: a pergunta do dia de ontem voltava, destravada,
// sob a data de hoje (tests/daily-dst.test.mjs). Contando em UTC sobre os
// campos da data, o resultado é o mesmo da fórmula antiga em todos os outros
// horários, então ninguém perde o item do dia.
export function dayOfYear(date = new Date()) {
  const y = date.getFullYear();
  return Math.round((Date.UTC(y, date.getMonth(), date.getDate()) - Date.UTC(y, 0, 0)) / 86400000);
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

// Data por extenso na língua da interface ("Quinta-feira, 24 de setembro"),
// com a inicial maiúscula (o pt-BR devolve o dia da semana em minúsculas).
// Era duplicada em HomeScreen.jsx e TodayScreen.jsx.
export function todayLabel(isEn, date = new Date()) {
  const s = date.toLocaleDateString(isEn ? 'en-US' : 'pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
