// Captura de telas para auditoria visual do app web (react-native-web).
//
// Uso:
//   node scripts/capture-screens.mjs
//
// Variáveis de ambiente (todas opcionais):
//   BASE_URL   endereço do app servido pelo Expo (padrão http://localhost:8081)
//   OUT_DIR    pasta de saída (padrão design/preview/auditoria)
//   ONLY       nomes de telas separados por vírgula (ex.: ONLY=ajustes,praticar;
//              ONLY=landing captura só docs/index.html)
//   THEMES     claro,escuro (padrão os dois)
//   SIZES      390,1280 (padrão os dois; 1280 só roda as telas marcadas `desktop`)
//   LANDING    1 para capturar também docs/index.html (padrão 1; 0 desliga)
//   HEADED     1 para ver o navegador
//
// Não há rota por URL na web: tudo é navegado por clique, como um usuário.
// Cada tela começa de um estado conhecido (aba tocada duas vezes, o que volta
// o stack da aba para a raiz) e falhas são isoladas por tela. No fim grava
// `_relatorio.json` com, por captura: erros, medidas de alinhamento (x do
// large title, dos títulos de seção e dos cards), imagens em baixa resolução,
// elementos fora da tela, alvos de toque pequenos e a folga até a tab bar.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE_URL || 'http://localhost:8081';
const OUT = path.resolve(ROOT, process.env.OUT_DIR || 'design/preview/auditoria');
const ONLY = process.env.ONLY ? process.env.ONLY.split(',').map((s) => s.trim()) : null;
const THEMES = (process.env.THEMES || 'claro,escuro').split(',');
const SIZES = (process.env.SIZES || '390,1280').split(',').map(Number);
const LANDING = process.env.LANDING !== '0';

fs.mkdirSync(OUT, { recursive: true });

const report = { base: BASE, startedAt: new Date().toISOString(), captures: [], failures: [], console: [] };

// ---------------------------------------------------------------- helpers

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function settle(page, ms = 700) {
  await page.waitForTimeout(ms);
}

async function tab(page, name) {
  await page.getByRole('tab', { name }).click({ timeout: 8000 });
  await settle(page, 500);
}

// Toca a aba e toca de novo: o segundo toque na aba focada volta o stack
// dela para a raiz (comportamento padrão do react-navigation).
async function tabRoot(page, name) {
  await tab(page, name);
  await page.getByRole('tab', { name }).click({ timeout: 8000 });
  await settle(page, 700);
}

// Clica no primeiro elemento VISÍVEL com o texto. Telas anteriores do stack
// continuam no DOM, então `.first()` sozinho pode pegar um elemento escondido.
async function clickText(page, text, { exact = true, timeout = 8000 } = {}) {
  const loc = page.getByText(text, { exact });
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const n = await loc.count();
    for (let i = 0; i < n; i++) {
      const el = loc.nth(i);
      if (await el.isVisible().catch(() => false)) {
        await el.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
        await el.click({ timeout: 4000 });
        await settle(page);
        return;
      }
    }
    await sleep(250);
  }
  throw new Error(`texto visível não encontrado: "${text}"`);
}

async function clickLabel(page, label, { timeout = 8000 } = {}) {
  const loc = page.getByLabel(label, { exact: true });
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const n = await loc.count();
    for (let i = n - 1; i >= 0; i--) {
      const el = loc.nth(i);
      if (await el.isVisible().catch(() => false)) {
        await el.click({ timeout: 4000 });
        await settle(page);
        return;
      }
    }
    await sleep(250);
  }
  throw new Error(`rótulo visível não encontrado: "${label}"`);
}

// Rola o contêiner rolável que está no centro da tela (o da tela focada).
// `to` = número de px, 'end' ou 'mid'.
async function scrollMain(page, to, { x, y } = {}) {
  await page.evaluate(({ to, x, y }) => {
    const px = x ?? window.innerWidth / 2;
    const py = y ?? window.innerHeight / 2;
    let el = document.elementFromPoint(px, py);
    while (el && el !== document.body) {
      const cs = getComputedStyle(el);
      if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 4) break;
      el = el.parentElement;
    }
    if (!el || el === document.body) el = document.scrollingElement;
    const max = el.scrollHeight - el.clientHeight;
    const top = to === 'end' ? max : to === 'mid' ? max / 2 : Math.min(to, max);
    // scrollTop direto: o RN-web troca o scrollTo do nó pela API do ScrollView.
    el.scrollTop = top;
    el.dispatchEvent(new Event('scroll'));
  }, { to, x, y });
  await settle(page, 600);
}

// Medidas genéricas da tela atual, para achar desalinhamentos e estouros sem
// depender só do olho.
async function audit(page) {
  return page.evaluate(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const DPR = window.devicePixelRatio;
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return false;
      if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) return false;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) return false;
      // Coberto por outra tela? Testa o ponto central.
      const cx = Math.min(W - 1, Math.max(0, r.left + r.width / 2));
      const cy = Math.min(H - 1, Math.max(0, r.top + Math.min(r.height / 2, 10)));
      const top = document.elementFromPoint(cx, cy);
      return !!top && (el === top || el.contains(top) || top.contains(el));
    };
    const round = (n) => Math.round(n * 10) / 10;
    const txt = (el) => (el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 50);

    const all = Array.from(document.querySelectorAll('body *'));
    const tabbar = document.querySelector('[role="tablist"]');
    const tabTop = tabbar && visible(tabbar) ? tabbar.getBoundingClientRect().top : null;

    // Textos em display (Cormorant) e headings.
    const display = [];
    const headings = [];
    for (const el of all) {
      if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const cs = getComputedStyle(el);
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      const fsz = parseFloat(cs.fontSize);
      if (/Cormorant/i.test(cs.fontFamily)) display.push({ text: txt(el), x: round(r.left), y: round(r.top), fs: fsz });
      if (el.getAttribute('role') === 'heading') headings.push({ text: txt(el), level: el.getAttribute('aria-level'), x: round(r.left), fs: fsz });
    }

    // Cards: fundo opaco diferente do body, raio >= 8, largura grande.
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    const cards = [];
    for (const el of all) {
      const cs = getComputedStyle(el);
      if (parseFloat(cs.borderTopLeftRadius) < 8) continue;
      if (cs.backgroundColor === 'rgba(0, 0, 0, 0)' || cs.backgroundColor === bodyBg) continue;
      const r = el.getBoundingClientRect();
      if (r.width < W * 0.5 || r.height < 30) continue;
      if (!visible(el)) continue;
      cards.push({ x: round(r.left), right: round(W - r.right), w: round(r.width), y: round(r.top), text: txt(el).slice(0, 30) });
    }

    // Imagens: o RN-web desenha a imagem como background e guarda um <img>
    // invisível com o natural size.
    const images = [];
    for (const img of document.querySelectorAll('img')) {
      const box = img.parentElement;
      if (!box) continue;
      const r = box.getBoundingClientRect();
      if (r.width < 24 || r.bottom < 0 || r.top > H) continue;
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const need = r.width * DPR;
      images.push({
        src: (img.currentSrc || img.src).split('/').pop().split('?')[0].slice(0, 60),
        rendered: `${round(r.width)}x${round(r.height)}`,
        natural: `${nw}x${nh}`,
        x: round(r.left), right: round(W - r.right),
        lowRes: nw > 0 && nw < need * 0.6,
        overflow: r.right > W + 1 || r.left < -1,
      });
    }

    // Elementos de texto ou imagem fora da largura da tela (fora de
    // carrosséis horizontais).
    const offscreen = [];
    for (const el of all) {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (r.bottom < 0 || r.top > H) continue;
      if (!(r.right > W + 1 || r.left < -1)) continue;
      let p = el.parentElement;
      let inScroller = false;
      while (p && p !== document.body) {
        const ps = getComputedStyle(p);
        if (/(auto|scroll|hidden)/.test(ps.overflowX)) {
          const pr = p.getBoundingClientRect();
          if (pr.right <= W + 1 && pr.left >= -1) { inScroller = true; break; }
        }
        p = p.parentElement;
      }
      if (inScroller) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && el.tagName !== 'IMG') continue;
      offscreen.push({ text: txt(el), left: round(r.left), right: round(r.right) });
      if (offscreen.length > 8) break;
    }

    // Alvos de toque menores que 44.
    const small = [];
    for (const el of document.querySelectorAll('[role="button"],[role="link"],[role="tab"],[role="switch"],[role="checkbox"],a,button')) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 43 || r.height < 43) small.push({ label: txt(el) || el.getAttribute('aria-label') || '?', w: round(r.width), h: round(r.height) });
    }

    // Último conteúdo visível acima/abaixo da tab bar.
    let lastBottom = 0;
    for (const el of all) {
      if (tabbar && tabbar.contains(el)) continue;
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.top > H || r.bottom < 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      lastBottom = Math.max(lastBottom, r.bottom);
    }

    return {
      viewport: `${W}x${H}`,
      docOverflowX: document.documentElement.scrollWidth > W + 1,
      tabBarTop: tabTop,
      display: display.slice(0, 12),
      headings: headings.slice(0, 12),
      cards: cards.slice(0, 10),
      images: images.slice(0, 12),
      offscreen,
      smallTargets: small.slice(0, 15),
      lastTextBottom: round(lastBottom),
    };
  });
}

async function shot(page, ctxInfo, name, { audit: doAudit = true } = {}) {
  const file = `${name}-${ctxInfo.theme}-${ctxInfo.width}.png`;
  await settle(page, 400);
  await page.screenshot({ path: path.join(OUT, file) });
  let measures = null;
  if (doAudit) {
    try { measures = await audit(page); } catch (e) { measures = { error: String(e) }; }
  }
  report.captures.push({ file, ...measures });
  console.log(`  ok  ${file}`);
  return file;
}

// ---------------------------------------------------------------- boot

async function boot(browser, { theme, width, height }) {
  const mobile = width < 768;
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    isMobile: mobile,
    hasTouch: mobile,
    colorScheme: theme === 'escuro' ? 'dark' : 'light',
    locale: 'pt-BR',
  });
  const page = await ctx.newPage();
  const tag = `${theme}-${width}`;
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') {
      const t = m.text();
      if (report.console.length < 300 && !report.console.some((c) => c.text === t.slice(0, 300))) {
        report.console.push({ ctx: tag, type: m.type(), text: t.slice(0, 300) });
      }
    }
  });
  page.on('pageerror', (e) => report.console.push({ ctx: tag, type: 'pageerror', text: String(e).slice(0, 300) }));
  page.setDefaultTimeout(10000);
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 180000 });
  // Onboarding na primeira abertura: "Pular" entra como visitante.
  const pular = page.getByText('Pular', { exact: true });
  const inicio = page.getByRole('tab', { name: 'Início' });
  await Promise.race([
    pular.first().waitFor({ timeout: 120000 }).catch(() => {}),
    inicio.waitFor({ timeout: 120000 }).catch(() => {}),
  ]);
  await settle(page, 1200);
  return { ctx, page };
}

async function reload(page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 180000 });
  await page.getByRole('tab', { name: 'Início' }).waitFor({ timeout: 120000 });
  await settle(page, 1200);
}

// ---------------------------------------------------------------- screens
//
// Cada tela: { name, desktop?, run(page, c) }. `c` é { theme, width } e o
// helper `s(name)` tira a foto com o sufixo certo.

const SCREENS = [
  {
    name: 'onboarding',
    desktop: true,
    first: true,
    async run(page, s) {
      if (await page.getByText('Pular', { exact: true }).first().isVisible().catch(() => false)) {
        await s('onboarding');
        await clickText(page, 'Começar');
        await s('onboarding-passo2');
        await clickText(page, 'Pular');
      }
      await page.getByRole('tab', { name: 'Início' }).waitFor({ timeout: 30000 });
      await settle(page, 1000);
    },
  },
  {
    name: 'inicio',
    desktop: true,
    async run(page, s) {
      await tabRoot(page, 'Início');
      await s('inicio');
      await scrollMain(page, 'mid');
      await s('inicio-meio');
      await scrollMain(page, 'end');
      await s('inicio-fim');
    },
  },
  {
    name: 'busca',
    desktop: true,
    async run(page, s) {
      await tabRoot(page, 'Início');
      await clickText(page, 'Buscar');
      await s('busca-vazia');
      await page.keyboard.type('eucaristia', { delay: 20 });
      await settle(page, 1200);
      await s('busca-eucaristia');
    },
  },
  {
    name: 'categoria',
    async run(page, s) {
      await tabRoot(page, 'Início');
      await clickText(page, 'Igreja Católica');
      await s('categoria-igreja');
      await scrollMain(page, 'end');
      await s('categoria-igreja-fim');
    },
  },
  {
    name: 'referencias',
    desktop: true,
    async run(page, s) {
      await tabRoot(page, 'Início');
      await clickText(page, 'Referências');
      await s('referencias');
      await scrollMain(page, 900);
      await s('referencias-rolada');
    },
  },
  {
    name: 'refdetail',
    async run(page, s) {
      await tabRoot(page, 'Início');
      await clickText(page, 'Referências');
      // Primeira referência da lista: o primeiro item depois dos filtros.
      await settle(page, 600);
      const opened = await page.evaluate(() => {
        const H = window.innerHeight;
        const cands = Array.from(document.querySelectorAll('[role="button"]')).filter((el) => {
          const r = el.getBoundingClientRect();
          return r.top > 250 && r.bottom < H - 100 && r.height > 60 && r.width > 250 && getComputedStyle(el).visibility !== 'hidden';
        });
        if (!cands.length) return null;
        cands[0].click();
        return cands[0].innerText.slice(0, 40);
      });
      if (!opened) throw new Error('nenhuma referência clicável');
      await settle(page, 900);
      await s('refdetail');
      await scrollMain(page, 'end');
      await s('refdetail-fim');
    },
  },
  {
    name: 'artigos',
    desktop: true,
    async run(page, s) {
      await tabRoot(page, 'Artigos');
      await s('artigos');
      await scrollMain(page, 1200);
      await s('artigos-rolada');
    },
  },
  {
    name: 'artigo',
    desktop: true,
    async run(page, s) {
      await tabRoot(page, 'Início');
      await clickText(page, 'Igreja Católica');
      await clickText(page, 'A Eucaristia: Presença Real de Cristo');
      await settle(page, 1200);
      await s('artigo-eucaristia');
      await scrollMain(page, 500);
      await s('artigo-eucaristia-500');
      await scrollMain(page, 'mid');
      await s('artigo-eucaristia-meio');
      await scrollMain(page, 'end');
      await s('artigo-eucaristia-fim');
      await scrollMain(page, 0);
      await clickLabel(page, 'Ampliar imagem');
      await settle(page, 1000);
      await s('artigo-zoom');
      await page.keyboard.press('Escape').catch(() => {});
      await clickLabel(page, 'Fechar', { timeout: 3000 }).catch(() => {});
    },
  },
  {
    name: 'artigo-ref',
    async run(page, s) {
      await tabRoot(page, 'Início');
      await clickText(page, 'Igreja Católica');
      await clickText(page, 'A Eucaristia: Presença Real de Cristo');
      await settle(page, 1000);
      await scrollMain(page, 'end');
      await s('artigo-eucaristia-refs');
    },
  },
  {
    name: 'biblia',
    desktop: true,
    async run(page, s) {
      await tabRoot(page, 'Bíblia');
      await settle(page, 1500);
      await s('biblia');
      await scrollMain(page, 'end');
      await s('biblia-fim');
      await scrollMain(page, 0);
      await clickText(page, 'João');
      await settle(page, 1000);
      await s('biblia-joao');
      // Capítulo 3 (se o livro abre uma grade de capítulos).
      await clickText(page, '3', { timeout: 4000 }).catch(() => {});
      await settle(page, 1500);
      await s('biblia-joao-3');
      await scrollMain(page, 'end');
      await s('biblia-joao-3-fim');
    },
  },
  {
    name: 'praticar',
    desktop: true,
    async run(page, s) {
      await tabRoot(page, 'Praticar');
      await s('praticar');
      await scrollMain(page, 'end');
      await s('praticar-fim');
    },
  },
  {
    name: 'hoje',
    desktop: true,
    async run(page, s) {
      await tabRoot(page, 'Praticar');
      await clickText(page, 'Dia de Hoje');
      await settle(page, 2500);
      await s('hoje');
      await scrollMain(page, 'mid');
      await s('hoje-meio');
      await scrollMain(page, 'end');
      await s('hoje-fim');
    },
  },
  {
    name: 'liturgia',
    async run(page, s) {
      await tabRoot(page, 'Praticar');
      await clickText(page, 'Dia de Hoje');
      await settle(page, 2000);
      // A linha da liturgia tem aria-label "Liturgia de hoje, <título>, <meta>".
      const row = page.getByRole('button', { name: /^Liturgia de hoje,/ });
      await row.first().waitFor({ timeout: 15000 });
      const n = await row.count();
      for (let i = 0; i < n; i++) {
        if (await row.nth(i).isVisible()) { await row.nth(i).click(); break; }
      }
      await settle(page, 3000);
      await s('liturgia');
      await scrollMain(page, 'mid');
      await s('liturgia-meio');
    },
  },
  {
    name: 'quiz',
    desktop: true,
    async run(page, s) {
      await tabRoot(page, 'Praticar');
      await clickText(page, 'Quiz Apologético');
      await settle(page, 1000);
      await s('quiz');
      await clickText(page, 'Pergunta diária');
      await settle(page, 1000);
      await s('quiz-diaria');
      await scrollMain(page, 'end');
      await s('quiz-diaria-fim');
    },
  },
  {
    name: 'dialogo',
    async run(page, s) {
      await tabRoot(page, 'Praticar');
      await clickText(page, 'Modo Diálogo');
      await settle(page, 1000);
      await s('dialogo');
      await clickText(page, '"Não existe nenhuma prova de que Deus existe, é tudo fé cega."');
      await settle(page, 1000);
      await s('dialogo-aberto');
      await scrollMain(page, 'end');
      await s('dialogo-aberto-fim');
    },
  },
  {
    name: 'debate',
    async run(page, s) {
      await tabRoot(page, 'Praticar');
      await clickText(page, 'Estratégias de Debate');
      await s('debate');
      await scrollMain(page, 'end');
      await s('debate-fim');
    },
  },
  {
    name: 'mapa',
    desktop: true,
    async run(page, s) {
      await tabRoot(page, 'Praticar');
      await clickText(page, 'Nos Passos de Jesus');
      await settle(page, 4000);
      await s('mapa');
      await scrollMain(page, 520);
      await s('mapa-parada');
      await clickText(page, 'Próxima');
      await settle(page, 1500);
      await s('mapa-parada2');
      await scrollMain(page, 'end');
      await s('mapa-fim');
    },
  },
  {
    name: 'glossario',
    async run(page, s) {
      await tabRoot(page, 'Praticar');
      await clickText(page, 'Glossário Teológico');
      await s('glossario');
      await scrollMain(page, 1500);
      await s('glossario-rolada');
    },
  },
  {
    name: 'plano',
    async run(page, s) {
      await tabRoot(page, 'Praticar');
      await clickText(page, 'Plano de Leitura');
      await s('plano-leitura');
      await scrollMain(page, 'end');
      await s('plano-leitura-fim');
    },
  },
  {
    name: 'rosario',
    async run(page, s) {
      await tabRoot(page, 'Praticar');
      await clickText(page, 'Santo Rosário');
      await s('rosario');
      await scrollMain(page, 'end');
      await s('rosario-fim');
    },
  },
  {
    name: 'exame',
    async run(page, s) {
      await tabRoot(page, 'Praticar');
      await clickText(page, 'Exame de Consciência');
      await s('exame');
      await scrollMain(page, 'end');
      await s('exame-fim');
    },
  },
  {
    name: 'favoritos',
    async run(page, s) {
      await tabRoot(page, 'Praticar');
      await clickText(page, 'Meus Favoritos');
      await s('favoritos');
    },
  },
  {
    name: 'gate',
    async run(page, s) {
      for (const [label, file] of [['Minhas Marcações', 'marcacoes'], ['Minhas Notas', 'notas'], ['Caderno', 'caderno']]) {
        await tabRoot(page, 'Praticar');
        await clickText(page, label);
        await settle(page, 900);
        await s(`${file}-visitante`);
        await page.keyboard.press('Escape').catch(() => {});
        await settle(page, 400);
      }
    },
  },
  {
    name: 'ajustes',
    desktop: true,
    async run(page, s) {
      await tabRoot(page, 'Ajustes');
      await s('ajustes');
      await scrollMain(page, 'mid');
      await s('ajustes-meio');
      await scrollMain(page, 'end');
      await s('ajustes-fim');
    },
  },
  {
    name: 'legal',
    async run(page, s) {
      await tabRoot(page, 'Ajustes');
      await clickText(page, 'Política de Privacidade');
      await s('legal-privacidade');
      await scrollMain(page, 'end');
      await s('legal-privacidade-fim');
    },
  },
  {
    // Sai do modo visitante: fica por último.
    name: 'auth',
    desktop: true,
    last: true,
    async run(page, s) {
      await tabRoot(page, 'Ajustes');
      await clickText(page, 'Entrar');
      await settle(page, 1200);
      await s('login');
      await clickText(page, 'Criar conta');
      await s('cadastro');
      await scrollMain(page, 'end');
      await s('cadastro-fim');
      await clickText(page, 'Já tenho uma conta. Entrar.', { exact: false });
      await settle(page, 800);
      await clickText(page, 'Esqueci a senha');
      await settle(page, 800);
      await s('esqueci-senha');
    },
  },
];

// ---------------------------------------------------------------- landing

async function captureLanding(browser) {
  const file = pathToFileURL(path.join(ROOT, 'docs', 'index.html')).href;
  for (const [w, h] of [[390, 844], [1280, 800]]) {
    for (const theme of ['claro', 'escuro']) {
      const ctx = await browser.newContext({
        viewport: { width: w, height: h },
        deviceScaleFactor: w < 768 ? 2 : 1,
        isMobile: w < 768,
        hasTouch: w < 768,
        colorScheme: theme === 'escuro' ? 'dark' : 'light',
      });
      const page = await ctx.newPage();
      try {
        await page.goto(file, { waitUntil: 'load', timeout: 60000 });
        await settle(page, 1500);
        const name = `landing-${theme}-${w}`;
        await page.screenshot({ path: path.join(OUT, `${name}.png`) });
        // Os blocos `.reveal` só aparecem quando entram na tela
        // (IntersectionObserver): rola a página toda antes da foto inteira.
        const total = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < total; y += Math.round(h * 0.6)) {
          await page.evaluate((top) => window.scrollTo(0, top), y);
          await settle(page, 250);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await settle(page, 1200);
        await page.screenshot({ path: path.join(OUT, `${name}-inteira.png`), fullPage: true });
        const m = await page.evaluate(() => ({
          overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
          scrollWidth: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight,
        }));
        report.captures.push({ file: `${name}.png`, landing: m });
        console.log(`  ok  ${name}.png`);
      } catch (e) {
        report.failures.push({ screen: 'landing', ctx: `${theme}-${w}`, error: String(e).slice(0, 300) });
        console.log(`  FALHOU landing ${theme}-${w}: ${e.message}`);
      }
      await ctx.close();
    }
  }
}

// ---------------------------------------------------------------- main

async function runContext(browser, theme, width) {
  const height = width < 768 ? 844 : 800;
  console.log(`\n== ${theme} ${width}x${height}`);
  const { ctx, page } = await boot(browser, { theme, width, height });
  const c = { theme, width };
  const s = (name) => shot(page, c, name);
  const list = SCREENS.filter((sc) => (width < 768 || sc.desktop) && (!ONLY || ONLY.includes(sc.name) || sc.first));
  for (const sc of list) {
    const t0 = Date.now();
    try {
      await sc.run(page, s);
    } catch (e) {
      report.failures.push({ screen: sc.name, ctx: `${theme}-${width}`, error: String(e.message || e).slice(0, 300) });
      console.log(`  FALHOU ${sc.name} (${theme}-${width}): ${e.message}`);
      try { await page.screenshot({ path: path.join(OUT, `_falha-${sc.name}-${theme}-${width}.png`) }); } catch { /* ignora */ }
      // Volta a um estado conhecido: recarrega o app (o visitante fica salvo).
      try { await reload(page); } catch { /* segue */ }
    }
    if (Date.now() - t0 > 60000) console.log(`  (lento: ${sc.name} ${Math.round((Date.now() - t0) / 1000)}s)`);
  }
  await ctx.close();
}

const browser = await chromium.launch({ headless: process.env.HEADED !== '1' });
try {
  // ONLY=landing captura só a landing (docs/index.html), sem abrir o app.
  const appScreens = !ONLY || ONLY.some((n) => n !== 'landing');
  if (appScreens) {
    for (const width of SIZES) {
      for (const theme of THEMES) {
        // No desktop roda só a lista marcada `desktop`, nos dois temas.
        await runContext(browser, theme, width);
      }
    }
  }
  if (LANDING && (!ONLY || ONLY.includes('landing'))) await captureLanding(browser);
} finally {
  await browser.close();
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(OUT, '_relatorio.json'), JSON.stringify(report, null, 2));
  console.log(`\n${report.captures.length} capturas, ${report.failures.length} falhas, ${report.console.length} mensagens de console`);
  for (const f of report.failures) console.log(`  falha: ${f.screen} [${f.ctx}] ${f.error}`);
}
