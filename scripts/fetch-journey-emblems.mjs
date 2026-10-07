// Baixa os emblemas da Jornada gerados no Higgsfield (7 de outubro de 2026,
// gpt_image_2_5 com fundo transparente), reduz cada um para 256 px com o
// Chromium do Playwright (o repositório não tem sharp nem PIL) e grava em
// assets/journey/<id>.png, mais o mapa src/data/journeyArt.js.
//
// Uso (precisa de rede até o CDN do Higgsfield):
//   node scripts/fetch-journey-emblems.mjs
//
// Ids: as seis conquistas de categoria (categoria-<slug>, src/utils/journey.js)
// e os seis níveis (LEVELS). Rodar de novo só refaz o que faltar.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets', 'journey');
const SIZE = 256;
const BASE = 'https://d8j0ntlcm91z4.cloudfront.net/user_3F8kX9pa0lU3v443qUCapiwpC9W';

const EMBLEMS = {
  'categoria-existencia-deus': 'hf_20261007_204331_28123ec5-2a41-4f25-8e30-33e136c9ecbd',
  'categoria-igreja-catolica': 'hf_20261007_204331_8b895221-3293-4a15-b1d2-6faa692fb745',
  'categoria-sagrada-escritura': 'hf_20261007_204333_dd0225a8-4754-4978-ad0d-99d674de8814',
  'categoria-moral': 'hf_20261007_204332_97e2eb13-e84b-480c-a8d0-5987bd38c5ef',
  'categoria-outras-religioes': 'hf_20261007_204335_f879ef24-86eb-42c4-8954-c9f1f86039a9',
  'categoria-historia-igreja': 'hf_20261007_204334_8e109319-b00f-40c2-b34e-7fedd6de235a',
  catecumeno: 'hf_20261007_204334_601e9c3a-6fae-4337-9317-bddf3f7f3ce2',
  neofito: 'hf_20261007_204331_0cc86357-9e30-4ec6-9f90-15f4b20c5610',
  discipulo: 'hf_20261007_204333_2bd11bfe-cdec-4916-bc6a-c9ad5d5d784f',
  apologista: 'hf_20261007_204333_843dbd6a-66f8-4ac1-862c-ea3e890cf784',
  defensor: 'hf_20261007_204331_d9fad7dc-33e9-4c7c-b72e-3f2d6b58f43b',
  mestre: 'hf_20261007_204334_bf737eaf-859d-486d-9248-7e73508b9e29',
};
const LEVEL_IDS = ['catecumeno', 'neofito', 'discipulo', 'apologista', 'defensor', 'mestre'];

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
const done = [];
for (const [id, file] of Object.entries(EMBLEMS)) {
  const target = path.join(OUT, `${id}.png`);
  if (!fs.existsSync(target)) {
    const res = await fetch(`${BASE}/${file}.png`);
    if (!res.ok) throw new Error(`${id}: HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const dataUrl = `data:image/png;base64,${buf.toString('base64')}`;
    // Redimensiona no canvas do Chromium, mantendo o alfa.
    const out = await page.evaluate(async ({ dataUrl, size }) => {
      const img = new Image();
      img.src = dataUrl;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, size, size);
      return c.toDataURL('image/png');
    }, { dataUrl, size: SIZE });
    fs.writeFileSync(target, Buffer.from(out.split(',')[1], 'base64'));
  }
  done.push(id);
  console.log(`${id}: ${(fs.statSync(target).size / 1024).toFixed(0)} KB`);
}
await browser.close();

// Mapa estático para o Metro (require literal por id).
const line = (id) => `  '${id}': require('../../assets/journey/${id}.png'),`;
const badges = done.filter((id) => !LEVEL_IDS.includes(id));
const levels = done.filter((id) => LEVEL_IDS.includes(id));
const src = `// Emblemas ilustrados da Jornada, por id de conquista (src/utils/journey.js,
// BADGES) e de nível (LEVELS). Gerados no Higgsfield e baixados por
// scripts/fetch-journey-emblems.mjs. O Metro só empacota o que está escrito
// num require() literal, por isso o mapa é estático. Quem não tem emblema cai
// no ícone Ionicons da própria conquista (BadgeEmblem).
export const JOURNEY_ART = {
${badges.map(line).join('\n')}
};

export const LEVEL_ART = {
${levels.map(line).join('\n')}
};

export const hasArt = (id) => Boolean(JOURNEY_ART[id] || LEVEL_ART[id]);
`;
fs.writeFileSync(path.join(ROOT, 'src', 'data', 'journeyArt.js'), src);
console.log(`journeyArt.js: ${badges.length} conquistas, ${levels.length} níveis`);
