// Marcas vetoriais das conquistas e níveis da Jornada, uma por id de BADGES e
// LEVELS (src/utils/journey.js), desenhadas por src/components/lesson/
// EmblemMark.jsx no mesmo sistema do BrandMark: caixa 64 x 64, traço de 4,5
// com pontas redondas, uma cor só (a do tema), tudo dentro do círculo de raio
// 27 em volta do centro, no máximo quatro elementos por marca. A cor nunca é
// escrita aqui. `fill: true` preenche o elemento em vez de traçar; um caminho
// de comprimento quase zero (M32 24v0.01) vira um ponto redondo.
//
// Decisão de outubro de 2026: nada de imagem gerada por IA como emblema. As
// marcas são desenhadas à mão (por pessoa ou agente) e conferidas numa folha
// de contato em 28, 40, 56 e 96 px nos dois temas. Integridade em
// tests/journeyMarks.test.mjs.

export const MARKS = {
  'primeiro-passo': [
    { tag: 'path', d: 'M32 56V30 M32 30c-10 0-16-6-18-14 10 0 16 4 18 14z M32 36c10 0 16-6 18-14-10 0-16 4-18 14z' },
  ],
  'categoria-existencia-deus': [
    { tag: 'circle', cx: 32, cy: 32, r: 9 },
    { tag: 'path', d: 'M47 32h7 M32 47v7 M17 32h-7 M32 17v-7 M42.6 42.6l5 5 M21.4 42.6l-5 5 M21.4 21.4l-5-5 M42.6 21.4l5-5' },
  ],
  'categoria-igreja-catolica': [
    { tag: 'circle', cx: 18, cy: 46, r: 6 },
    { tag: 'path', d: 'M22 42L45 19 M45 19l5 5 M39 25l5 5' },
    { tag: 'circle', cx: 46, cy: 46, r: 6 },
    { tag: 'path', d: 'M42 42L19 19 M19 19l-5 5 M25 25l-5 5' },
  ],
  'categoria-sagrada-escritura': [
    { tag: 'path', d: 'M32 20c-6-4-13-4-20-2v28c7-2 14-2 20 2 6-4 13-4 20-2V18c-7-2-14-2-20 2z' },
    { tag: 'path', d: 'M32 20v28' },
  ],
  'categoria-moral': [
    { tag: 'path', d: 'M32 12v40 M22 52h20 M14 22h36' },
    { tag: 'path', d: 'M14 22l-6 14h12z M50 22l-6 14h12z' },
    { tag: 'path', d: 'M8 36a6 6 0 0 0 12 0 M44 36a6 6 0 0 0 12 0' },
  ],
  'categoria-outras-religioes': [
    { tag: 'circle', cx: 32, cy: 32, r: 20 },
    { tag: 'path', d: 'M12 32h40 M32 12c-9 5-9 35 0 40 M32 12c9 5 9 35 0 40' },
  ],
  'categoria-historia-igreja': [
    { tag: 'path', d: 'M20 12h24 M20 52h24' },
    { tag: 'path', d: 'M22 12c0 12 10 14 10 20s-10 8-10 20 M42 12c0 12-10 14-10 20s10 8 10 20' },
    { tag: 'path', d: 'M32 45v0.01' },
  ],
  'sequencia-3': [
    { tag: 'path', d: 'M32 12c-8 8-14 14-14 24a14 14 0 0 0 28 0c0-10-6-16-14-24z' },
    { tag: 'path', d: 'M32 33c-3 3-5 6-5 9a5 5 0 0 0 10 0c0-3-2-6-5-9z' },
  ],
  'sequencia-7': [
    { tag: 'rect', x: 25, y: 28, width: 14, height: 26, rx: 2 },
    { tag: 'path', d: 'M32 8c-5 6-7 9-7 13a7 7 0 0 0 14 0c0-4-2-7-7-13z M32 23v5' },
  ],
  'sequencia-30': [
    { tag: 'rect', x: 20, y: 22, width: 24, height: 30, rx: 3 },
    { tag: 'path', d: 'M26 22v-6h12v6 M32 30c-4 4-6 7-6 10a6 6 0 0 0 12 0c0-3-2-6-6-10z' },
  ],
  'dez-perfeitos': [
    { tag: 'path', d: 'M21 8l11 15 11-15' },
    { tag: 'circle', cx: 32, cy: 38, r: 13 },
    { tag: 'path', d: 'M32 38v0.01' },
  ],
  'trinta-artigos': [
    { tag: 'rect', x: 14, y: 40, width: 36, height: 9, rx: 2 },
    { tag: 'rect', x: 18, y: 29, width: 28, height: 9, rx: 2 },
    { tag: 'rect', x: 16, y: 18, width: 32, height: 9, rx: 2 },
  ],
  'todos-os-artigos': [
    { tag: 'circle', cx: 32, cy: 32, r: 22 },
    { tag: 'circle', cx: 32, cy: 32, r: 6 },
    { tag: 'path', d: 'M41 32h11 M32 41v11 M23 32H12 M32 23V12 M38.4 38.4l7.7 7.7 M25.6 38.4l-7.7 7.7 M25.6 25.6l-7.7-7.7 M38.4 25.6l7.7-7.7' },
  ],
  'trilho-fundamentos': [
    { tag: 'rect', x: 10, y: 22, width: 44, height: 28, rx: 2 },
    { tag: 'path', d: 'M10 31h44 M10 41h44' },
    { tag: 'path', d: 'M24 22v9 M40 22v9 M18 31v10 M32 31v10 M46 31v10 M26 41v9 M38 41v9' },
  ],
  'trilho-aprofundamento': [
    { tag: 'path', d: 'M22 10v44 M42 10v44' },
    { tag: 'path', d: 'M22 20h20 M22 32h20 M22 44h20' },
  ],
  'quiz-7': [
    { tag: 'path', d: 'M22 24a10 10 0 1 1 14 9c-3 2-4 4-4 8' },
    { tag: 'path', d: 'M32 50v0.01' },
  ],
  catecumeno: [
    { tag: 'path', d: 'M16 54V30a16 16 0 0 1 32 0v24' },
    { tag: 'path', d: 'M10 54h44' },
  ],
  neofito: [
    { tag: 'path', d: 'M32 54L14 36a18 18 0 0 1 36 0z' },
    { tag: 'path', d: 'M32 54V18 M32 54L20 22 M32 54L44 22' },
    { tag: 'path', d: 'M24 10v0.01 M32 7v0.01 M40 10v0.01' },
  ],
  discipulo: [
    { tag: 'path', d: 'M10 32C20 19 36 19 46 30L56 40 M10 32c10 13 26 13 36 2l10-10' },
    { tag: 'path', d: 'M20 29v0.01' },
  ],
  apologista: [
    { tag: 'path', d: 'M32 10l18 6v14c0 12-8 20-18 24-10-4-18-12-18-24V16z' },
    { tag: 'path', d: 'M32 22v18 M24 30h16' },
  ],
  defensor: [
    { tag: 'path', d: 'M32 10l18 6v14c0 12-8 20-18 24-10-4-18-12-18-24V16z' },
    { tag: 'path', d: 'M32 20v26 M26 28h12 M29 46h6' },
  ],
  mestre: [
    { tag: 'path', d: 'M13 45h38l3-23-11 9-11-13-11 13-11-9z' },
    { tag: 'path', d: 'M15 53h34' },
  ],
};
