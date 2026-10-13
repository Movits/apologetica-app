// Verificação da Jornada no app web exportado, do primeiro artigo à revisão do
// dia seguinte, fotografando cada passo nos dois temas e em duas larguras.
//
// Uso: BASE_URL=http://localhost:8099 OUT_DIR=/tmp/jornada node scripts/verify-journey.mjs
// (app web servido em BASE_URL, por exemplo `npx expo export -p web` + servidor
// estático). CHROMIUM_PATH aponta um Chromium já instalado quando a versão do
// Playwright do projeto não bate com a do navegador baixado (ambiente de nuvem).
//
// O roteiro erra de propósito algumas respostas (a previsão, a primeira
// pergunta do teste, a pergunta do dia e uma da revisão) para fotografar o que
// acontece com quem erra. Como as opções aparecem embaralhadas, ele calcula a
// posição de cada resposta com os mesmos dados e a mesma semente do app.
//
// Cada foto declara o texto que PRECISA estar visível nela; se não estiver
// (rolagem que não aconteceu, folha que não abriu), a etapa vai para
// `failures` no relatório e o processo termina com código 1. Foi assim que a
// versão anterior deixou passar duas fotos iguais.
import './../tests/resolve-hook.mjs';
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { LESSONS } = await import('../src/data/lessons/index.js');
const { getQuizOfDay } = await import('../src/data/quiz.js');
const { shuffledOrder } = await import('../src/utils/review.js');

const BASE = process.env.BASE_URL || 'http://localhost:8099';
const OUT = process.env.OUT_DIR || path.resolve('shots');
fs.mkdirSync(OUT, { recursive: true });
const report = { console: [], steps: [], failures: [] };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Título do artigo -> id, lido das fontes (o índice de artigos importa imagens
// e não roda no Node).
const TITLE_TO_ID = new Map();
for (const f of fs.readdirSync(path.join(ROOT, 'src/data/articles'))) {
  if (f === 'index.js') continue;
  const src = fs.readFileSync(path.join(ROOT, 'src/data/articles', f), 'utf8');
  for (const m of src.matchAll(/\n {4}id: (\d+),\n {4}title: (['"`])((?:\\.|(?!\2).)*)\2,/g)) {
    TITLE_TO_ID.set(m[3].replace(/\\'/g, "'"), Number(m[1]));
  }
}

// Posição na tela da opção de índice original `original` (ordem embaralhada).
const shownAt = (count, seed, original) => shuffledOrder(count, seed).indexOf(original);
const wrongOf = (count, correct) => (correct + 1) % count;

async function firstVisible(loc, timeout = 8000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const n = await loc.count();
    for (let i = n - 1; i >= 0; i--) {
      const el = loc.nth(i);
      if (await el.isVisible().catch(() => false)) return el;
    }
    await sleep(200);
  }
  throw new Error(`elemento visível não encontrado: ${loc}`);
}

async function clickVisible(loc, timeout) {
  const el = await firstVisible(loc, timeout);
  await el.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
  await el.click({ timeout: 4000 });
}

// Põe o elemento perto do topo da área rolável (abaixo do cabeçalho). O
// scrollIntoViewIfNeeded não serve: se o alvo já aparece no pé da tela, ele
// não rola, e a foto sai igual à anterior.
async function scrollToText(page, text, offset = 120) {
  const el = await firstVisible(page.getByText(text, { exact: true }));
  await el.evaluate((node, off) => {
    let p = node.parentElement;
    while (p && !(p.scrollHeight > p.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(p).overflowY))) p = p.parentElement;
    const target = p || document.scrollingElement;
    const base = p ? p.getBoundingClientRect().top : 0;
    target.scrollTop += node.getBoundingClientRect().top - base - off;
  }, offset);
  await sleep(600);
}

// O texto está dentro da janela, na vertical E na horizontal? Só a vertical
// não basta: uma tela empilhada que não terminou de entrar fica à direita,
// fora da janela, e o Playwright ainda a considera visível.
async function inView(page, text) {
  const loc = page.getByText(text, { exact: false });
  const n = await loc.count();
  const { width: vw, height: vh } = page.viewportSize();
  for (let i = 0; i < n; i++) {
    const el = loc.nth(i);
    if (!(await el.isVisible().catch(() => false))) continue;
    const box = await el.boundingBox();
    if (!box) continue;
    const inY = box.y >= 0 && box.y + Math.min(box.height, 40) <= vh;
    const inX = box.x >= 0 && box.x + Math.min(box.width, 40) <= vw;
    if (inY && inX) return true;
  }
  return false;
}

async function browserToday(page) {
  return page.evaluate(() => {
    const d = new Date();
    const pad = (x) => String(x).padStart(2, '0');
    return { key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
  });
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

  // Foto com a lista do que precisa aparecer nela.
  const shot = async (name, mustSee = []) => {
    await sleep(500);
    await page.screenshot({ path: path.join(OUT, `${tag}-${name}.png`) });
    const missing = [];
    for (const s of mustSee) if (!(await inView(page, s))) missing.push(s);
    report.steps.push({ shot: `${tag}-${name}`, mustSee, missing });
    if (missing.length) report.failures.push({ tag, step: name, error: `não aparece na foto: ${missing.join(' | ')}` });
  };

  const openHome = async () => {
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
  };

  try {
    await openHome();
    await shot('01-inicio', ['Catecúmeno']);

    // Minha Jornada vazia, com a Revisão ainda sem nada e a escada de níveis.
    await clickVisible(page.getByRole('button', { name: /^Minha Jornada/ }));
    await sleep(1200);
    await shot('02-jornada-vazia', ['Catecúmeno', 'Quem é instruído na fé antes do Batismo']);
    await clickVisible(page.getByRole('button', { name: 'O que os níveis querem dizer' }));
    await sleep(1000);
    await shot('03-niveis', ['Neófito', 'plantado há pouco']);
    await clickVisible(page.getByRole('button', { name: 'Fechar' }));
    await sleep(700);

    // Primeiro artigo da aba Artigos.
    await clickVisible(page.getByRole('tab', { name: 'Artigos' }));
    await sleep(1000);
    const item = await firstVisible(page.locator('[data-testid="article-item"]'));
    const itemText = await item.innerText();
    const match = [...TITLE_TO_ID.entries()].filter(([title]) => itemText.includes(title)).sort((a, b) => b[0].length - a[0].length)[0];
    const [articleTitle, articleId] = match || [];
    if (articleId == null) throw new Error(`não reconheci o artigo: ${itemText.slice(0, 80)}`);
    const lesson = LESSONS[articleId];
    await item.click();
    await sleep(1500);
    await shot('04-artigo-topo', ['Antes de ler']);

    // Previsão errada de propósito: aparece a nota e o aviso da revisão.
    const hookCount = lesson.hook.options.length;
    await clickVisible(page.getByRole('radiogroup').first().getByRole('radio').nth(shownAt(hookCount, `hook:${articleId}`, wrongOf(hookCount, lesson.hook.correct))));
    await sleep(900);
    await scrollToText(page, 'Antes de ler');
    await shot('05-previsao-errada', ['Não é bem assim', 'Essa pergunta volta na sua Revisão amanhã.']);

    await scrollToText(page, 'Em resumo');
    await shot('06-resumo', ['Em resumo']);
    await scrollToText(page, 'Resposta de bolso');
    await shot('07-bolso', ['Resposta de bolso']);

    // Teste rápido: primeira pergunta ainda sem resposta.
    await scrollToText(page, 'Teste rápido');
    await shot('08-teste', ['Teste rápido', 'Pergunta 1 de 3', lesson.check[0].question]);
    // Erra a primeira, acerta as outras duas (2 de 3).
    for (let q = 0; q < lesson.check.length; q++) {
      const cq = lesson.check[q];
      const target = q === 0 ? wrongOf(cq.options.length, cq.correct) : cq.correct;
      const group = page.getByRole('radiogroup').last();
      await clickVisible(group.getByRole('radio').nth(shownAt(cq.options.length, `check:${articleId}:${q}:0`, target)));
      await sleep(800);
      if (q === 0) {
        await scrollToText(page, 'Pergunta 1 de 3');
        await shot('09-teste-erro', ['Resposta correta:']);
      }
      await clickVisible(page.getByRole('button', { name: q < lesson.check.length - 1 ? 'Próxima' : 'Ver resultado' }));
      await sleep(900);
    }
    await sleep(1500);
    await shot('10-conquista', ['Conquista desbloqueada', 'Primeiro passo']);
    await clickVisible(page.getByRole('button', { name: 'Continuar' }));
    await sleep(900);
    await scrollToText(page, 'Teste rápido');
    await shot('11-resultado', ['2/3', 'Elas voltam na sua Revisão']);

    // Treinar de novo: não vale XP e diz isso.
    await clickVisible(page.getByRole('button', { name: 'Treinar de novo' }));
    await sleep(900);
    await scrollToText(page, 'Teste rápido');
    await shot('12-treino', ['Treino: não vale XP']);
    for (let q = 0; q < lesson.check.length; q++) {
      const cq = lesson.check[q];
      const group = page.getByRole('radiogroup').last();
      await clickVisible(group.getByRole('radio').nth(shownAt(cq.options.length, `check:${articleId}:${q}:1`, cq.correct)));
      await sleep(700);
      await clickVisible(page.getByRole('button', { name: q < lesson.check.length - 1 ? 'Próxima' : 'Ver resultado' }));
      await sleep(900);
    }
    await sleep(1200);
    await scrollToText(page, 'Teste rápido');
    await shot('13-treino-resultado', ['3/3', 'Treino não vale XP']);

    // Minha Jornada depois da lição: a revisão marcada para amanhã.
    await clickVisible(page.getByRole('button', { name: 'Ver minha jornada' }));
    await sleep(1500);
    await scrollToText(page, 'Revisão', 100);
    await shot('14-jornada', ['Tudo revisado por hoje', 'Próxima revisão amanhã']);
    await scrollToText(page, 'Conquistas', 100);
    await shot('15-jornada-conquistas', ['Primeiro passo']);
    await clickVisible(page.getByRole('button', { name: /^Primeiro passo/ }));
    await sleep(900);
    await shot('16-conquista-folha', ['Concluiu a primeira lição']);
    await clickVisible(page.getByRole('button', { name: 'Fechar' }));
    await sleep(700);

    // Pergunta do dia: errada de propósito, depois reaberta (travada).
    const today = await browserToday(page);
    const dq = getQuizOfDay(new Date(today.y, today.m, today.d));
    await clickVisible(page.getByRole('tab', { name: 'Praticar' }));
    await sleep(1000);
    await clickVisible(page.getByText('Quiz Apologético', { exact: true }));
    await sleep(1000);
    await clickVisible(page.getByText('Pergunta diária', { exact: true }));
    await sleep(1200);
    await clickVisible(page.getByRole('radio').nth(shownAt(dq.options.length, `daily:${dq.id}:${today.key}`, wrongOf(dq.options.length, dq.correct))));
    await sleep(1000);
    await shot('17-pergunta-do-dia-erro', ['Resposta correta:', 'Ela volta na sua Revisão amanhã.']);
    // Volta pelo botão do app: o voltar do navegador sai do app na web.
    await clickVisible(page.getByRole('button', { name: 'Outros modos de jogo' }));
    await sleep(900);
    await clickVisible(page.getByText('Pergunta diária', { exact: true }));
    await sleep(1500);
    await shot('18-pergunta-do-dia-travada', ['Você já respondeu a pergunta de hoje']);

    await clickVisible(page.getByRole('tab', { name: 'Início' }));
    await sleep(1200);
    await shot('19-inicio-progresso', ['Catecúmeno']);

    // Dia seguinte: o relógio do navegador passa a correr a partir de amanhã
    // e o app recarrega com o mesmo armazenamento. As três erradas (teste,
    // previsão, pergunta do dia) estão vencidas. Relógio parado (setFixedTime)
    // não serve: congela as animações, e a tela empilhada fica fora da janela.
    await page.clock.install({ time: new Date(Date.now() + 24 * 3600 * 1000) });
    await page.clock.resume();
    await openHome();
    await shot('20-inicio-revisao', ['3 para revisar']);
    await clickVisible(page.getByRole('button', { name: /^Minha Jornada/ }));
    await sleep(1200);
    await scrollToText(page, 'Revisão', 100);
    await shot('21-jornada-revisao', ['3 perguntas para revisar hoje']);
    await clickVisible(page.getByText('3 perguntas para revisar hoje', { exact: true }));
    await sleep(1200);
    await shot('22-revisao-pergunta', ['Pergunta 1 de 3', 'Teste rápido']);

    const tomorrow = await browserToday(page);
    // Ordem da sessão: mesma data e caixa, então pela chave (a:ID:0, a:ID:h, q:...).
    const session = [
      { key: `a:${articleId}:0`, options: lesson.check[0].options.length, correct: lesson.check[0].correct, right: true },
      { key: `a:${articleId}:h`, options: hookCount, correct: lesson.hook.correct, right: false },
      { key: `q:${dq.id}`, options: dq.options.length, correct: dq.correct, right: true },
    ];
    for (let i = 0; i < session.length; i++) {
      const s = session[i];
      const target = s.right ? s.correct : wrongOf(s.options, s.correct);
      await clickVisible(page.getByRole('radiogroup').last().getByRole('radio').nth(shownAt(s.options, `review:${s.key}:${tomorrow.key}`, target)));
      await sleep(1000);
      if (i === 0) await shot('23-revisao-acerto', ['Acertou', 'Volta em 3 dias']);
      if (i === 1) await shot('24-revisao-erro', ['Resposta correta:', 'Volta amanhã', 'Reler o artigo']);
      await clickVisible(page.getByRole('button', { name: i < session.length - 1 ? 'Próxima' : 'Ver resultado' }));
      await sleep(900);
    }
    await sleep(900);
    await shot('25-revisao-fim', ['Revisão feita', '2/3']);

    // De volta ao artigo: o teste já feito mostra a primeira tentativa (a que
    // valeu) e a opção de treinar, sem obrigar a responder de novo.
    await clickVisible(page.getByRole('tab', { name: 'Artigos' }));
    await sleep(1000);
    // Pelo título: concluído, o artigo muda de lugar na lista.
    await clickVisible(page.locator('[data-testid="article-item"]').filter({ hasText: articleTitle }));
    await sleep(1500);
    await scrollToText(page, 'Teste rápido');
    await shot('26-teste-feito', ['Teste feito', 'Primeira tentativa: 2 de 3', 'Treinar de novo']);
  } catch (e) {
    report.failures.push({ tag, error: String(e).slice(0, 400) });
    await page.screenshot({ path: path.join(OUT, `${tag}-ERRO.png`) }).catch(() => {});
  }
  await ctx.close();
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const sizes = (process.env.SIZES || '390,1280').split(',').map(Number);
const themes = (process.env.THEMES || 'claro,escuro').split(',');
for (const theme of themes) for (const width of sizes) await run(browser, theme, width);
await browser.close();
fs.writeFileSync(path.join(OUT, '_relatorio.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ steps: report.steps.length, failures: report.failures, console: report.console.slice(0, 20) }, null, 2));
process.exit(report.failures.length ? 1 : 0);
