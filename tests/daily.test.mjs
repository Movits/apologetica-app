import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayOfYear, dailyIndex, todayKey, easterDate, addDays, todayLabel } from '../src/utils/daily.js';
import { getVerseOfDay, DAILY_VERSES } from '../src/data/dailyVerses.js';
import { getQuizOfDay, DAILY_QUESTIONS } from '../src/data/quiz.js';
import { DIALOGUES } from '../src/data/dialogues.js';
import { getLiturgicalSeason } from '../src/utils/liturgicalSeason.js';
import { getSaintToday } from '../src/data/saints.js';

// ---------------------------------------------------------------------------
// Unidade: src/utils/daily.js (módulo puro, sem react-native).
// ---------------------------------------------------------------------------

test('dayOfYear segue a fórmula original (1 de janeiro = 1, 31 de dezembro = 365)', () => {
  assert.equal(dayOfYear(new Date(2026, 0, 1)), 1);
  assert.equal(dayOfYear(new Date(2026, 11, 31)), 365);
  assert.equal(dayOfYear(new Date(2027, 5, 15)), 166);
  // Ano bissexto: 31 de dezembro é o dia 366.
  assert.equal(dayOfYear(new Date(2028, 11, 31)), 366);
  // A hora do dia não muda o dia do ano.
  assert.equal(dayOfYear(new Date(2026, 8, 24, 23, 59)), dayOfYear(new Date(2026, 8, 24)));
});

test('dailyIndex é estável para datas fixas e bate com a caracterização', () => {
  // Valor do plano: dailyIndex(53, 1 de janeiro de 2026) = (1 + 2026 * 7) % 53.
  assert.equal(dailyIndex(53, new Date(2026, 0, 1)), 32);
  assert.equal(dailyIndex(89, new Date(2026, 0, 1)), 32);
  assert.equal(dailyIndex(89, new Date(2026, 11, 31)), 40);
  assert.equal(dailyIndex(89, new Date(2027, 5, 15)), 26);
  // Semente 13 é a do quiz.
  assert.equal(dailyIndex(100, new Date(2026, 0, 1), 13), 39);
  assert.equal(dailyIndex(100, new Date(2026, 11, 31), 13), 3);
  // Sempre dentro da lista.
  for (let d = 0; d < 400; d++) {
    const idx = dailyIndex(7, new Date(2026, 0, 1 + d));
    assert.ok(idx >= 0 && idx < 7 && Number.isInteger(idx));
  }
});

test('dailyIndex usa a data de hoje e a semente 7 por padrão', () => {
  const now = new Date();
  assert.equal(dailyIndex(89), dailyIndex(89, now, 7));
});

test('todayKey devolve AAAA-MM-DD em hora local, com zero à esquerda', () => {
  assert.equal(todayKey(new Date(2026, 0, 5, 23, 30)), '2026-01-05');
  assert.equal(todayKey(new Date(2026, 11, 31, 0, 0)), '2026-12-31');
  assert.equal(todayKey(new Date(2027, 8, 9)), '2027-09-09');
  assert.match(todayKey(), /^\d{4}-\d{2}-\d{2}$/);
});

test('easterDate segue Meeus/Jones/Butcher', () => {
  const ymd = (d) => [d.getFullYear(), d.getMonth() + 1, d.getDate()];
  assert.deepEqual(ymd(easterDate(2024)), [2024, 3, 31]);
  assert.deepEqual(ymd(easterDate(2025)), [2025, 4, 20]);
  assert.deepEqual(ymd(easterDate(2026)), [2026, 4, 5]);
  assert.deepEqual(ymd(easterDate(2027)), [2027, 3, 28]);
  assert.deepEqual(ymd(easterDate(2038)), [2038, 4, 25]); // Páscoa mais tardia possível
  // Sempre um domingo, à meia-noite local.
  for (let y = 2020; y <= 2040; y++) {
    const e = easterDate(y);
    assert.equal(e.getDay(), 0, String(y));
    assert.equal(e.getHours(), 0);
  }
});

test('addDays soma dias sem alterar a data de entrada', () => {
  const base = new Date(2026, 3, 5);
  const ash = addDays(base, -46);
  assert.deepEqual([ash.getMonth() + 1, ash.getDate()], [2, 18]);
  const pentecost = addDays(base, 49);
  assert.deepEqual([pentecost.getMonth() + 1, pentecost.getDate()], [5, 24]);
  assert.equal(base.getDate(), 5);
});

// ---------------------------------------------------------------------------
// Caracterização (Onda 8, S5): fixa os valores que o app devolve HOJE para datas
// fixas, calculados com o código anterior ao refactor (fórmula inline em
// dailyVerses.js, quiz.js, notifications.js e HomeScreen.jsx; easterDate
// duplicada em saints.js e liturgicalSeason.js). Se algum destes quebrar, o
// refactor mudou o item do dia de alguém.
// ---------------------------------------------------------------------------

const CASES = [
  // [ano, mês (0-11), dia, índice do versículo, índice do quiz, índice da objeção]
  [2026, 0, 1, 32, 39, 32],
  [2026, 11, 31, 40, 3, 25],
  [2027, 5, 15, 26, 17, 45],
  [2026, 8, 24, 31, 5, 33],
];

test('caracterização: tamanhos das listas do dia', () => {
  assert.equal(DAILY_VERSES.length, 89);
  assert.equal(DAILY_QUESTIONS.length, 100);
  assert.equal(DIALOGUES.length, 53);
});

test('caracterização: versículo do dia em datas fixas', () => {
  for (const [y, m, d, verseIdx] of CASES) {
    assert.equal(DAILY_VERSES.indexOf(getVerseOfDay(new Date(y, m, d))), verseIdx, `${y}-${m + 1}-${d}`);
  }
});

test('caracterização: quiz do dia em datas fixas (semente 13)', () => {
  for (const [y, m, d, , quizIdx] of CASES) {
    assert.equal(DAILY_QUESTIONS.indexOf(getQuizOfDay(new Date(y, m, d))), quizIdx, `${y}-${m + 1}-${d}`);
  }
});

test('caracterização: objeção do dia (fórmula da Home e da notificação)', () => {
  // Cópia literal da fórmula de HomeScreen.jsx:65-67 e notifications.js:8-12,
  // que não são importáveis aqui (react-native / expo-notifications).
  for (const [y, m, d, , , objIdx] of CASES) {
    const now = new Date(y, m, d);
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    assert.equal((dayOfYear + now.getFullYear() * 7) % DIALOGUES.length, objIdx, `${y}-${m + 1}-${d}`);
  }
});

test('caracterização: estação litúrgica em datas fixas', () => {
  const SEASONS = [
    [2026, 0, 1, 'natal'],
    [2026, 0, 7, 'comum'],
    [2026, 1, 17, 'comum'],
    [2026, 1, 18, 'quaresma'],
    [2026, 3, 4, 'quaresma'],
    [2026, 3, 5, 'pascoa'],
    [2026, 4, 24, 'pascoa'],
    [2026, 4, 25, 'comum'],
    [2026, 10, 28, 'comum'],
    [2026, 10, 29, 'advento'],
    [2026, 11, 25, 'natal'],
    [2027, 2, 28, 'pascoa'],
  ];
  for (const [y, m, d, key] of SEASONS) {
    assert.equal(getLiturgicalSeason(new Date(y, m, d)).key, key, `${y}-${m + 1}-${d}`);
  }
});

test('caracterização: festas móveis do santoral em datas fixas', () => {
  const FEASTS = [
    [2026, 1, 18, 'Quarta-feira de Cinzas'],
    [2026, 3, 5, 'Páscoa da Ressurreição'],
    [2026, 4, 24, 'Pentecostes'],
    [2026, 5, 4, 'Santíssimo Corpo e Sangue de Cristo'],
    [2027, 1, 10, 'Quarta-feira de Cinzas'],
    [2027, 2, 28, 'Páscoa da Ressurreição'],
  ];
  for (const [y, m, d, name] of FEASTS) {
    assert.equal(getSaintToday(new Date(y, m, d))?.name, name, `${y}-${m + 1}-${d}`);
  }
});

// ---------------------------------------------------------------------------
// todayLabel (Fase 5): a data por extenso que HomeScreen e TodayScreen
// montavam cada uma por conta própria. Precisa do ICU completo do Node
// (`node -e "new Intl.DateTimeFormat('pt-BR')"` devolve os nomes em português).
// ---------------------------------------------------------------------------

test('todayLabel escreve a data por extenso no idioma, com inicial maiúscula', () => {
  const d = new Date(2026, 8, 24);
  assert.equal(todayLabel(false, d), 'Quinta-feira, 24 de setembro');
  assert.equal(todayLabel(true, d), 'Thursday, September 24');
  assert.equal(todayLabel(false, new Date(2026, 0, 1)), 'Quinta-feira, 1 de janeiro');
  assert.equal(todayLabel(true, new Date(2026, 11, 25)), 'Friday, December 25');
});

test('todayLabel usa a data de hoje por padrão', () => {
  assert.equal(todayLabel(false), todayLabel(false, new Date()));
  assert.equal(todayLabel(true), todayLabel(true, new Date()));
});
