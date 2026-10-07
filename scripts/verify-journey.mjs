// Verificação da Jornada no app web exportado: abre um artigo, responde a
// previsão, lê o resumo, faz o teste rápido, vê a conquista e abre Minha
// Jornada, fotografando cada passo nos dois temas e em duas larguras.
// Uso: BASE_URL=http://localhost:8099 OUT_DIR=/tmp/jornada node scripts/verify-journey.mjs
// (app web servido em BASE_URL, por exemplo `npx expo export -p web` + servidor estático).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:8099';
const OUT = process.env.OUT_DIR || path.resolve('shots');
fs.mkdirSync(OUT, { recursive: true });
const report = { console: [], steps: [], failures: [] };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickVisible(loc, timeout = 8000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const n = await loc.count();
    for (let i = n - 1; i >= 0; i--) {
      const el = loc.nth(i);
      if (await el.isVisible().catch(() => false)) {
        await el.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
        await el.click({ timeout: 4000 });
        return true;
      }
    }
    await sleep(200);
  }
  throw new Error('elemento visível não encontrado');
}

async function scrollTo(page, text) {
  const loc = page.getByText(text, { exact: true });
  const n = await loc.count();
  for (let i = n - 1; i >= 0; i--) {
    const el = loc.nth(i);
    if (await el.isVisible().catch(() => false)) {
      await el.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
      await page.evaluate(() => window.scrollBy(0, -120)).catch(() => {});
      await sleep(500);
      return;
    }
  }
}

async function run(browser, theme, width) {
  const tag = `${theme}-${width}`;
  const mobile = width < 768;
  const ctx = await browser.newContext({
    viewport: { width, height: mobile ? 844 : 900 },
    deviceScaleFactor: 2,
    isMobile: mobile,
    hasTouch: mobile,
    colorScheme: theme === 'escuro' ? 'dark' : 'light',
    locale: 'pt-BR',
  });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') report.console.push({ tag, type: m.type(), text: m.text().slice(0, 300) });
  });
  page.on('pageerror', (e) => report.console.push({ tag, type: 'pageerror', text: String(e).slice(0, 300) }));
  page.setDefaultTimeout(15000);
  const shot = async (name) => {
    await sleep(500);
    await page.screenshot({ path: path.join(OUT, `${tag}-${name}.png`) });
    report.steps.push(`${tag}-${name}`);
  };
  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 120000 });
    const pular = page.getByText('Pular', { exact: true });
    const inicio = page.getByRole('tab', { name: 'Início' });
    await Promise.race([pular.first().waitFor({ timeout: 90000 }).catch(() => {}), inicio.waitFor({ timeout: 90000 }).catch(() => {})]);
    await sleep(1000);
    if (await pular.first().isVisible().catch(() => false)) {
      await clickVisible(pular);
      await inicio.waitFor({ timeout: 30000 });
    }
    await sleep(1200);
    await shot('01-inicio');

    // Minha Jornada vazia (cartão da Início).
    await clickVisible(page.getByRole('button', { name: /^Minha Jornada/ }));
    await sleep(1200);
    await shot('02-jornada-vazia');

    // Artigo: aba Artigos, primeiro item.
    await clickVisible(page.getByRole('tab', { name: 'Artigos' }));
    await sleep(1000);
    await clickVisible(page.locator('[data-testid="article-item"]'));
    await sleep(1500);
    await shot('03-artigo-topo');

    // Previsão: escolhe a segunda opção.
    const hookRadios = page.getByRole('radio');
    await clickVisible(hookRadios.nth(1));
    await sleep(900);
    await scrollTo(page, 'Antes de ler');
    await shot('04-previsao-respondida');

    // Resumo e resposta de bolso.
    await scrollTo(page, 'Em resumo');
    await shot('05-resumo');
    await scrollTo(page, 'Resposta de bolso');
    await shot('06-bolso');

    // Teste rápido: 3 perguntas, sempre a primeira opção visível do grupo.
    await scrollTo(page, 'Teste rápido');
    await shot('07-teste');
    for (let q = 0; q < 3; q++) {
      const group = page.getByRole('radiogroup').last();
      await clickVisible(group.getByRole('radio').first());
      await sleep(700);
      if (q === 0) await shot('08-teste-resposta');
      const btn = q < 2 ? page.getByRole('button', { name: 'Próxima' }) : page.getByRole('button', { name: 'Ver resultado' });
      await clickVisible(btn);
      await sleep(900);
    }
    await sleep(1500);
    await shot('09-resultado');
    // Folha de conquista (primeiro passo).
    const continuar = page.getByRole('button', { name: 'Continuar' });
    if (await continuar.last().isVisible().catch(() => false)) {
      await clickVisible(continuar);
      await sleep(900);
    }
    await scrollTo(page, 'Teste rápido');
    await shot('10-resultado-sem-folha');

    // Minha Jornada depois da lição.
    await clickVisible(page.getByRole('button', { name: 'Ver minha jornada' }));
    await sleep(1500);
    await shot('11-jornada');
    await scrollTo(page, 'Conquistas');
    await shot('12-jornada-conquistas');
    // Abre a folha de uma conquista.
    await clickVisible(page.getByRole('button', { name: /^Primeiro passo/ }));
    await sleep(900);
    await shot('13-conquista-folha');
    await clickVisible(page.getByRole('button', { name: 'Fechar' }));

    // Volta à Início: cartão com progresso.
    await clickVisible(page.getByRole('tab', { name: 'Início' }));
    await sleep(1200);
    await shot('14-inicio-progresso');
  } catch (e) {
    report.failures.push({ tag, error: String(e).slice(0, 400) });
    await page.screenshot({ path: path.join(OUT, `${tag}-ERRO.png`) }).catch(() => {});
  }
  await ctx.close();
}

// CHROMIUM_PATH aponta um Chromium já instalado quando a versão do Playwright
// do projeto não bate com a do navegador baixado (ambiente de nuvem).
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const sizes = (process.env.SIZES || '390,1280').split(',').map(Number);
const themes = (process.env.THEMES || 'claro,escuro').split(',');
for (const theme of themes) for (const width of sizes) await run(browser, theme, width);
await browser.close();
fs.writeFileSync(path.join(OUT, '_relatorio.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ steps: report.steps.length, failures: report.failures, console: report.console.slice(0, 20) }, null, 2));
