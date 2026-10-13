// Hemisfério sul com horário de verão (Sydney): sem a correção, das 23h à
// meia-noite de abril a outubro o dia do ano já era o seguinte.
process.env.TZ = 'Australia/Sydney';
const { test } = await import('node:test');
const assert = (await import('node:assert/strict')).default;
const { dayOfYear } = await import('../src/utils/daily.js');

test('dayOfYear não adianta um dia às 23h no inverno de Sydney', () => {
  const noon = new Date(2026, 5, 15, 12, 0);
  const late = new Date(2026, 5, 15, 23, 30);
  assert.equal(dayOfYear(late), dayOfYear(noon));
  assert.equal(dayOfYear(new Date(2026, 5, 16, 0, 30)), dayOfYear(noon) + 1);
});
