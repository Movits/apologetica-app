// Marcas vetoriais das conquistas e níveis da Jornada, uma por id de BADGES e
// LEVELS (src/utils/journey.js), desenhadas por src/components/lesson/
// EmblemMark.jsx no mesmo sistema do BrandMark: caixa 64 x 64, traço de 4,5
// com pontas redondas, uma cor só (a do tema), tudo dentro do círculo de raio
// 27 em volta do centro, no máximo quatro elementos por marca. A cor nunca é
// escrita aqui. `fill: true` preenche o elemento em vez de traçar (áreas
// pequenas e sólidas, como as barras da cruz do BrandMark); um caminho de
// comprimento quase zero (M32 24v0.01) vira um ponto redondo.
//
// Decisão de outubro de 2026: nada de imagem gerada por IA como emblema. Este
// conjunto saiu de um painel (três designers com ângulos diferentes, três
// juízes por candidato, síntese), conferido numa folha de contato em 28, 40,
// 56 e 96 px nos dois temas, com as marcas do app como referência. Os seis
// níveis leem como uma escada: portal, vieira, peixe, escudo, torre, coroa.
// Integridade em tests/journeyMarks.test.mjs.

export const MARKS = {
  // Broto: haste e duas folhas, a semente que acabou de abrir.
  'primeiro-passo': [
    { tag: 'path', d: 'M32 56V34' },
    { tag: 'path', d: 'M32 34C32 24 24 18 14 20C16 30 22 34 32 34Z' },
    { tag: 'path', d: 'M32 30C32 20 40 14 50 16C48 26 42 30 32 30Z' },
  ],
  // Sol em esplendor: disco e oito raios alternados, o resplendor do ostensório.
  'categoria-existencia-deus': [
    { tag: 'circle', cx: 32, cy: 32, r: 9 },
    { tag: 'path', d: 'M47.5 32L56.5 32 M32 47.5L32 56.5 M16.5 32L7.5 32 M32 16.5L32 7.5 M43 43L46.8 46.8 M21 43L17.2 46.8 M21 21L17.2 17.2 M43 21L46.8 17.2' },
  ],
  // Chaves de Pedro: argolas embaixo, hastes cruzadas, palhetões cheios.
  'categoria-igreja-catolica': [
    { tag: 'circle', cx: 19, cy: 45, r: 6 },
    { tag: 'circle', cx: 45, cy: 45, r: 6 },
    { tag: 'path', d: 'M23.2 40.8L46 18 M40.8 40.8L18 18' },
    { tag: 'path', d: 'M46 18L53 25L49.5 28.5L46.5 25.5L43.5 28.5L38.5 23.5Z M18 18L11 25L14.5 28.5L17.5 25.5L20.5 28.5L25.5 23.5Z', fill: true },
  ],
  // Livro aberto com lombada.
  'categoria-sagrada-escritura': [
    { tag: 'path', d: 'M32 22C26 18 19.5 17.5 12.5 19.5V45.5C19.5 43.5 26 44 32 48C38 44 44.5 43.5 51.5 45.5V19.5C44.5 17.5 38 18 32 22Z' },
    { tag: 'path', d: 'M32 22V48' },
  ],
  // Balança de coluna, travessão e dois pratos.
  'categoria-moral': [
    { tag: 'path', d: 'M32 10.5V53 M22 53H42 M13 19H51' },
    { tag: 'path', d: 'M15 19V32 M7.5 32a7.5 7.5 0 0 0 15 0 M49 19V32 M41.5 32a7.5 7.5 0 0 0 15 0' },
  ],
  // Globo de meridianos, neutro: o diálogo com as nações.
  'categoria-outras-religioes': [
    { tag: 'circle', cx: 32, cy: 32, r: 20 },
    { tag: 'path', d: 'M12 32h40 M32 12c-9 5-9 35 0 40 M32 12c9 5 9 35 0 40' },
  ],
  // Ampulheta de paredes curvas, o tempo da Igreja.
  'categoria-historia-igreja': [
    { tag: 'path', d: 'M18 12.5H46 M18 51.5H46' },
    { tag: 'path', d: 'M21 12.5C21 24 30 28 30 32C30 36 21 40 21 51.5 M43 12.5C43 24 34 28 34 32C34 36 43 40 43 51.5' },
  ],
  // Uma vela acesa.
  'sequencia-3': [
    { tag: 'path', d: 'M28 30h8a1.5 1.5 0 0 1 1.5 1.5v22a1.5 1.5 0 0 1 -1.5 1.5h-8a1.5 1.5 0 0 1 -1.5 -1.5v-22a1.5 1.5 0 0 1 1.5 -1.5z', fill: true },
    { tag: 'path', d: 'M34.2 8C26 16 26 15.6 26 21A6 6 0 0 0 38 21C38 12 35.6 13.7 34.2 8Z', fill: true },
  ],
  // Duas velas acesas.
  'sequencia-7': [
    { tag: 'path', d: 'M19.5 32h6a1.5 1.5 0 0 1 1.5 1.5v19a1.5 1.5 0 0 1 -1.5 1.5h-6a1.5 1.5 0 0 1 -1.5 -1.5v-19a1.5 1.5 0 0 1 1.5 -1.5zM38.5 32h6a1.5 1.5 0 0 1 1.5 1.5v19a1.5 1.5 0 0 1 -1.5 1.5h-6a1.5 1.5 0 0 1 -1.5 -1.5v-19a1.5 1.5 0 0 1 1.5 -1.5z', fill: true },
    { tag: 'path', d: 'M24.3 13C17.5 19.7 17.5 19.5 17.5 24A5 5 0 0 0 27.5 24C27.5 16.5 25.5 17.8 24.3 13ZM43.3 13C36.5 19.7 36.5 19.5 36.5 24A5 5 0 0 0 46.5 24C46.5 16.5 44.5 17.8 43.3 13Z', fill: true },
  ],
  // Três velas acesas (a contagem é a progressão).
  'sequencia-30': [
    { tag: 'path', d: 'M14.8 35h4.5a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1 -1.5 1.5h-4.5a1.5 1.5 0 0 1 -1.5 -1.5v-14a1.5 1.5 0 0 1 1.5 -1.5zM29.8 35h4.5a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1 -1.5 1.5h-4.5a1.5 1.5 0 0 1 -1.5 -1.5v-14a1.5 1.5 0 0 1 1.5 -1.5zM44.8 35h4.5a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1 -1.5 1.5h-4.5a1.5 1.5 0 0 1 -1.5 -1.5v-14a1.5 1.5 0 0 1 1.5 -1.5z', fill: true },
    { tag: 'path', d: 'M18.5 19C12.8 24.5 12.8 23.9 12.8 27.8A4.25 4.25 0 0 0 21.3 27.8C21.3 21.4 19.6 22.9 18.5 19ZM33.5 19C27.8 24.5 27.8 23.9 27.8 27.8A4.25 4.25 0 0 0 36.3 27.8C36.3 21.4 34.6 22.9 33.5 19ZM48.5 19C42.8 24.5 42.8 23.9 42.8 27.8A4.25 4.25 0 0 0 51.3 27.8C51.3 21.4 49.6 22.9 48.5 19Z', fill: true },
  ],
  // Estrela de Belém de oito pontas, cheia.
  'dez-perfeitos': [
    { tag: 'polygon', points: '32,6.5 35.6,23.2 42.6,21.4 40.8,28.4 57.5,32 40.8,35.6 42.6,42.6 35.6,40.8 32,57.5 28.4,40.8 21.4,42.6 23.2,35.6 6.5,32 23.2,28.4 21.4,21.4 28.4,23.2', fill: true },
  ],
  // Pilha de três volumes, o de cima pousado de lado.
  'trinta-artigos': [
    { tag: 'rect', x: 15.5, y: 33, width: 33, height: 17, rx: 1.5 },
    { tag: 'path', d: 'M15.5 41.5H48.5' },
    { tag: 'polygon', points: '15.1,17.5 47.8,13.5 48.9,22.5 16.2,26.5' },
  ],
  // Rosácea: quadrifólio que ocupa o disco e deixa o óculo vazio.
  'todos-os-artigos': [
    { tag: 'path', d: 'M27.5 27.5A10.5 10.5 0 1 1 36.5 27.5A10.5 10.5 0 1 1 36.5 36.5A10.5 10.5 0 1 1 27.5 36.5A10.5 10.5 0 1 1 27.5 27.5Z' },
  ],
  // Igreja sobre a rocha: empena com cruz sobre laje cheia (Mateus 16,18).
  'trilho-fundamentos': [
    { tag: 'path', d: 'M17 43V32L32 20L47 32V43' },
    { tag: 'path', d: 'M32 20V9 M27.5 13.5H36.5' },
    { tag: 'rect', x: 15, y: 47, width: 34, height: 6, rx: 1.5, fill: true },
  ],
  // Calvário: a cruz plantada no monte sobre a linha do chão.
  'trilho-aprofundamento': [
    { tag: 'path', d: 'M32 9V38 M23 18H41' },
    { tag: 'path', d: 'M16 48A17.5 17.5 0 0 1 48 48 M14 48H50' },
  ],
  // Ponto de interrogação, a pergunta do dia.
  'quiz-7': [
    { tag: 'path', d: 'M18.5 21.5a13.5 13.5 0 1 1 20.3 11.7C35 35.5 32 38.5 32 44.5' },
    { tag: 'circle', cx: 32, cy: 54.5, r: 4.2, fill: true },
  ],
  // Portal ogival: arco em ponta sobre ombreiras e soleira, a porta da igreja.
  catecumeno: [
    { tag: 'path', d: 'M18 48V30A19 19 0 0 1 32 11.7A19 19 0 0 1 46 30V48' },
    { tag: 'path', d: 'M13.5 48H50.5' },
  ],
  // Vieira batismal com três nervuras.
  neofito: [
    { tag: 'path', d: 'M10 36A22 22 0 0 1 54 36L32 55Z' },
    { tag: 'path', d: 'M32 45V14 M27.9 45.9L16.4 20.4 M36.1 45.9L47.6 20.4' },
  ],
  // Ichthys: dois arcos cruzados na cauda.
  discipulo: [
    { tag: 'path', d: 'M10 32C19.5 16 37 16 53 43.5 M10 32C19.5 48 37 48 53 20.5' },
  ],
  // Escudo heráldico com a cruz latina cheia.
  apologista: [
    { tag: 'path', d: 'M16 14H48V30C48 42 40 50 32 54C24 50 16 42 16 30Z' },
    { tag: 'rect', x: 29.5, y: 20, width: 5, height: 24, rx: 1.5, fill: true },
    { tag: 'rect', x: 24, y: 26, width: 16, height: 5, rx: 1.5, fill: true },
  ],
  // Torre ameada com porta em arco (Provérbios 18,10).
  defensor: [
    { tag: 'path', d: 'M19 50V12H26V18H38V12H45V50' },
    { tag: 'path', d: 'M27 50V41A5 5 0 0 1 37 41V50' },
    { tag: 'path', d: 'M16 50H48' },
  ],
  // Coroa de três pontas com a cruz na ponta central (2 Timóteo 4,8).
  mestre: [
    { tag: 'polygon', points: '12,29 21,38 32,23 43,38 52,29 48,50 16,50' },
    { tag: 'path', d: 'M32 22V9 M27 13.5H37' },
  ],
};
