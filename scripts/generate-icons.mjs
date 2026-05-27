// Gera os icones do app a partir de codigo (cruz dourada sobre fundo navy).
// Roda: node scripts/generate-icons.mjs
// Output: assets/icon.png, adaptive-icon.png, notification-icon.png, splash-icon.png

import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';

const NAVY = [26, 58, 92, 255];      // #1a3a5c
const GOLD = [201, 168, 76, 255];    // #c9a84c
const WHITE = [255, 255, 255, 255];
const TRANSPARENT = [0, 0, 0, 0];

function fillRect(png, x0, y0, w, h, color, size) {
  const x1 = Math.min(size, x0 + w);
  const y1 = Math.min(size, y0 + h);
  for (let y = Math.max(0, y0); y < y1; y++) {
    for (let x = Math.max(0, x0); x < x1; x++) {
      const i = (size * y + x) << 2;
      png.data[i] = color[0];
      png.data[i + 1] = color[1];
      png.data[i + 2] = color[2];
      png.data[i + 3] = color[3];
    }
  }
}

function makeIcon({ size, bg, cross, save }) {
  const png = new PNG({ width: size, height: size });
  // Background
  fillRect(png, 0, 0, size, size, bg, size);
  // Cruz Latina centralizada, barra horizontal no terco superior
  const vw = Math.round(size * 0.12);
  const vh = Math.round(size * 0.66);
  const vx = Math.round((size - vw) / 2);
  const vy = Math.round(size * 0.17);
  fillRect(png, vx, vy, vw, vh, cross, size);

  const hw = Math.round(size * 0.55);
  const hh = Math.round(size * 0.12);
  const hx = Math.round((size - hw) / 2);
  const hy = Math.round(size * 0.31);
  fillRect(png, hx, hy, hw, hh, cross, size);

  const dir = path.dirname(save);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(save, PNG.sync.write(png));
  console.log('Gerado:', save, `(${size}x${size})`);
}

// Icone principal (1024x1024) — fundo navy, cruz dourada
makeIcon({ size: 1024, bg: NAVY, cross: GOLD, save: 'assets/icon.png' });

// Adaptive icon (Android) — foreground apenas (cruz dourada, fundo transparente)
// O Android compoe com a backgroundColor do app.json
makeIcon({ size: 1024, bg: TRANSPARENT, cross: GOLD, save: 'assets/adaptive-icon.png' });

// Notification icon (Android) — cruz branca pura, fundo transparente
// (Android exige monocromatico branco para notificacoes)
makeIcon({ size: 96, bg: TRANSPARENT, cross: WHITE, save: 'assets/notification-icon.png' });

// Splash screen — cruz dourada centralizada sobre fundo navy
makeIcon({ size: 512, bg: NAVY, cross: GOLD, save: 'assets/splash-icon.png' });

// Favicon (web, caso tenha — opcional)
makeIcon({ size: 48, bg: NAVY, cross: GOLD, save: 'assets/favicon.png' });

console.log('\nIcones gerados em assets/');
