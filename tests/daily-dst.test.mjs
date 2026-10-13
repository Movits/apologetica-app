// Fuso com horário de verão: process.env.TZ muda o fuso deste processo (o
// node --test roda cada arquivo num processo próprio, os outros não sentem).
process.env.TZ = 'America/New_York';
const { test } = await import('node:test');
const assert = (await import('node:assert/strict')).default;
const { dayOfYear, todayKey } = await import('../src/utils/daily.js');

test('dayOfYear não volta um dia na primeira hora depois da meia-noite no horário de verão', () => {
  const late = new Date(2026, 6, 9, 20, 0);
  const justAfter = new Date(2026, 6, 10, 0, 30);
  const later = new Date(2026, 6, 10, 1, 30);
  assert.equal(todayKey(justAfter), '2026-07-10');
  assert.equal(dayOfYear(justAfter), dayOfYear(late) + 1, 'meia-noite e meia já é o dia seguinte');
  assert.equal(dayOfYear(justAfter), dayOfYear(later));
});

test('fora da hora da troca, o número do dia é o de sempre (ninguém perde o item do dia)', () => {
  assert.equal(dayOfYear(new Date(2026, 0, 1, 12)), 1);
  assert.equal(dayOfYear(new Date(2026, 11, 31, 23, 59)), 365);
  assert.equal(dayOfYear(new Date(2028, 11, 31, 8)), 366);
  assert.equal(dayOfYear(new Date(2026, 2, 8, 12)), 67, 'dia da troca de horário nos EUA');
});
