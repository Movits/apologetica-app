// Confere na tela as correções da Bíblia (outubro de 2026): Atos 3,1 no lugar,
// o bloco de Josué 19,17-23 numa linha só, o versículo do dia abrindo o Salmo
// na numeração do app e Jó em inglês. Cada foto exige o texto que precisa
// estar na tela.
// Uso: BASE_URL=http://localhost:8099 OUT_DIR=/tmp/biblia node scripts/verify-bible.mjs
// (app web servido em BASE_URL: `npx expo export -p web` + um servidor estático
// na pasta dist/. Confira que o servidor serve o build NOVO.)
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8099';
const OUT = process.env.OUT_DIR || path.resolve('shots-biblia');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const report = { steps: [], failures: [], console: [] };
async function firstVisible(loc, timeout = 10000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) { const n = await loc.count(); for (let i = n - 1; i >= 0; i--) { const el = loc.nth(i); if (await el.isVisible().catch(() => false)) return el; } await sleep(200); }
  throw new Error(`não achei: ${loc}`);
}
const click = async (loc) => { const el = await firstVisible(loc); await el.scrollIntoViewIfNeeded().catch(() => {}); await el.click(); };
async function inView(page, text) {
  const loc = page.getByText(text, { exact: false }); const n = await loc.count(); const { width: vw, height: vh } = page.viewportSize();
  for (let i = 0; i < n; i++) { const el = loc.nth(i); if (!(await el.isVisible().catch(() => false))) continue; const b = await el.boundingBox(); if (b && b.y >= 0 && b.y < vh && b.x >= 0 && b.x < vw) return true; }
  return false;
}
async function run(browser, { lang, width, tag, date }) {
  const ctx = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 2, locale: lang === 'en' ? 'en-US' : 'pt-BR' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => report.console.push({ tag, text: String(e).slice(0, 200) }));
  if (lang === 'en') await page.addInitScript(() => { try { localStorage.setItem('appg_lang', 'en'); } catch {} });
  if (date) { await page.clock.install({ time: new Date(date) }); }
  const shot = async (name, mustSee) => {
    await sleep(900);
    await page.screenshot({ path: path.join(OUT, `${tag}-${name}.png`) });
    const missing = []; for (const s of mustSee) if (!(await inView(page, s))) missing.push(s);
    report.steps.push({ shot: `${tag}-${name}`, missing });
    if (missing.length) report.failures.push({ tag, name, missing });
  };
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 120000 });
  if (date) await page.clock.resume();
  const skip = page.getByText(lang === 'en' ? 'Skip' : 'Pular', { exact: true });
  await Promise.race([skip.first().waitFor({ timeout: 90000 }).catch(() => {}), page.getByRole('tab').first().waitFor({ timeout: 90000 }).catch(() => {})]);
  await sleep(1200);
  if (await skip.first().isVisible().catch(() => false)) await click(skip);
  await sleep(1500);
  const T = lang === 'en' ? { bible: 'Bible', tools: 'Practice', today: 'Today', read: 'Read in the Bible' } : { bible: 'Bíblia', tools: 'Praticar', today: 'Dia de Hoje', read: 'Ler na Bíblia' };
  const openChapter = async (book, ch) => {
    await click(page.getByRole('tab', { name: T.bible }));
    await sleep(1500);
    await click(page.getByText(book, { exact: true }));
    await sleep(1200);
    await click(page.getByText(String(ch), { exact: true }));
    await sleep(2000);
  };
  try {
    if (lang === 'pt') {
      await openChapter('Atos dos Apóstolos', 3);
      await shot('atos-3', ['Pedro e João iam subindo ao templo', 'Nisto levavam um homem']);
      await openChapter('Josué', 19);
      const bloco = await firstVisible(page.getByText('A quarta sorte coube a Issacar', { exact: false }));
      await bloco.scrollIntoViewIfNeeded();
      await shot('josue-19-bloco', ['17-23', 'A quarta sorte coube a Issacar', 'A quinta sorte coube']);
    } else {
      await openChapter('Job', 1);
      await shot('job-1-en', ['There was a man in the land of Hus']);
      // Busca em inglês: o versículo do dia de Mateus 5,4 é o 5,5 na Douay-Rheims.
      await click(page.getByRole('tab', { name: 'Home' }));
      await sleep(1000);
      await click(page.getByText('Search', { exact: true }));
      await sleep(1000);
      await page.keyboard.type('they that mourn');
      await sleep(1500);
      await shot('busca-en', ['Matthew 5:5', 'Blessed are they that mourn']);
      await click(page.getByText('Matthew 5:5', { exact: true }));
      await sleep(2500);
      await shot('busca-en-abre', ['Blessed are they that mourn: for they shall be comforted']);
    }
    if (date) {
      await click(page.getByRole('tab', { name: T.tools }));
      await sleep(1200);
      await click(page.getByText(T.today, { exact: true }));
      await sleep(1800);
      await shot('versiculo-do-dia', [lang === 'en' ? 'Psalm 23 (22):1' : 'Salmo 23 (22),1', lang === 'en' ? 'The Lord ruleth me' : 'O Senhor é meu pastor']);
      await click(page.getByText(T.read, { exact: true }));
      await sleep(2500);
      await shot('versiculo-do-dia-na-biblia', [lang === 'en' ? 'Psalms 22' : 'Salmos 22', lang === 'en' ? 'The Lord ruleth me' : 'O Senhor é meu pastor, nada me faltará']);
    }
  } catch (e) {
    report.failures.push({ tag, error: String(e).slice(0, 300) });
    await page.screenshot({ path: path.join(OUT, `${tag}-ERRO.png`) }).catch(() => {});
  }
  await ctx.close();
}
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
await run(browser, { lang: 'pt', width: 390, tag: 'pt-390', date: '2026-11-21T10:00:00' });
await run(browser, { lang: 'en', width: 390, tag: 'en-390', date: '2026-11-21T10:00:00' });
await browser.close();
fs.writeFileSync(path.join(OUT, '_relatorio.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ steps: report.steps.length, failures: report.failures, console: report.console }, null, 2));
process.exit(report.failures.length ? 1 : 0);
