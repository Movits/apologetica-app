// Identidades visuais do app: paleta (clara e escura), fonte dos títulos e
// marca. Puro (sem react-native), testado em tests/identities.test.mjs, que
// garante as mesmas chaves em todas as paletas e contraste AA nos pares de
// texto e fundo que as telas usam.
//
// A Clássica é a identidade de sempre e continua o padrão. As outras três
// nasceram dos painéis de marca em design/identidade/ (outubro de 2026) para
// o dono comparar no próprio app, em Ajustes > Aparência:
// - Âncora: a cruz-âncora das catacumbas (Hebreus 6,19), tinta marinha,
//   terracota e marfim, títulos em EB Garamond.
// - Basílica: mosaico bizantino, lápis-lazúli, ouro e pórfiro, capitulares
//   romanas (Cinzel), da mesma família do Museu Virtual.
// - Lumen: marfim, tinta e âmbar de vela, a cruz recortada num balão de fala
//   ("a resposta"), títulos em Instrument Serif.
//
// `display` é a chave da fonte no expo-font (o arquivo está em assets/fonts e
// o ThemeContext carrega só a da identidade escolhida). `displayScale`
// compensa fontes mais largas ou mais estreitas que a Cormorant, para os
// títulos ocuparem o mesmo espaço. `mark` escolhe o desenho do BrandMark.

const CLASSICA_LIGHT = {
  mode: 'light',
  primary: '#1a3a5c',
  primaryText: '#1a3a5c',
  accent: '#c9a84c',          // dourado para ícones e preenchimentos
  accentText: '#806418',      // dourado escurecido com contraste AA (>=4.5:1) sobre creme e branco, para TEXTO
  bg: '#f5f0e8',
  card: '#ffffff',
  cardBorder: '#eee',
  text: '#222222',
  textMuted: '#666666',
  textSubtle: '#6a6457',      // cinza quente com contraste AA sobre creme e branco
  divider: '#dddddd',
  inputBg: '#ffffff',
  badgeBg: '#efe8da',         // creme mais fundo (o azul-acinzentado antigo destoava da paleta quente)
  badgeText: '#1a3a5c',
  heroSub: '#ccd9e8',
  deepLinkHl: '#f6e6b0',      // destaque temporário (chegada por referência) bem visível
  // Cor de ação (botões, links, aba ativa) e o texto que vai por cima dela.
  tint: '#1a3a5c',
  onTint: '#ffffff',
  // Texto sobre o fundo principal (primary).
  onPrimary: '#ffffff',
  // Terceiro nível (ícones e enfeites; para texto, textSubtle).
  textTertiary: '#948c7c',
  // Linhas finas: separator entre linhas de lista, hairline na borda das barras.
  separator: 'rgba(26,58,92,0.14)',
  hairline: 'rgba(0,0,0,0.14)',
  // Fundo translúcido das barras (header e tab bar) por cima do conteúdo.
  material: 'rgba(245,240,232,0.72)',
  // Superfície elevada (sheets, menus) e véu escuro atrás dos modais.
  elevated: '#ffffff',
  overlay: 'rgba(0,0,0,0.4)',
  // Semânticas: ação destrutiva ou erro, e sucesso.
  danger: '#b3261e',
  success: '#2f7a4a',
  // Cores litúrgicas (tempo comum, e advento/quaresma).
  seasonGreen: '#2f7a4a',
  seasonPurple: '#5b3f8a',
};

// "Noite na catedral": navy profundo com dourado quente, texto cor de creme.
const CLASSICA_DARK = {
  mode: 'dark',
  primary: '#142844',
  primaryText: '#e6c878',
  accent: '#d4b86a',
  accentText: '#d4b86a',
  bg: '#0d1722',
  card: '#172538',
  cardBorder: '#243248',
  text: '#ece8d8',
  textMuted: '#a8a395',
  textSubtle: '#938d7e',
  divider: '#243248',
  inputBg: '#172538',
  badgeBg: '#243248',
  badgeText: '#e6c878',
  heroSub: '#b8c4d8',
  deepLinkHl: '#3a3320',
  tint: '#d4b86a',
  onTint: '#0d1722',
  onPrimary: '#ffffff',
  textTertiary: '#7d7767',
  separator: 'rgba(236,232,216,0.14)',
  hairline: 'rgba(255,255,255,0.14)',
  material: 'rgba(13,23,34,0.72)',
  elevated: '#1e2f47',
  overlay: 'rgba(0,0,0,0.4)',
  danger: '#f28b82',
  success: '#8fd19e',
  seasonGreen: '#8fd19e',
  seasonPurple: '#b59ae6',
};

const ANCORA_LIGHT = {
  mode: 'light',
  primary: '#0f2f3a',
  primaryText: '#0f2f3a',
  accent: '#c99a4e',
  accentText: '#8a4a22',
  bg: '#f1e8d8',
  card: '#fbf6ec',
  cardBorder: '#e6dccb',
  text: '#1d2a2e',
  textMuted: '#55615f',
  textSubtle: '#5c5649',
  divider: '#ddd2bf',
  inputBg: '#fbf6ec',
  badgeBg: '#e6d9c2',
  badgeText: '#0f2f3a',
  heroSub: '#c9d6d6',
  deepLinkHl: '#f0d9b5',
  tint: '#9a4426',
  onTint: '#fff8ee',
  onPrimary: '#ffffff',
  textTertiary: '#8f877a',
  separator: 'rgba(15,47,58,0.14)',
  hairline: 'rgba(0,0,0,0.12)',
  material: 'rgba(241,232,216,0.78)',
  elevated: '#fbf6ec',
  overlay: 'rgba(0,0,0,0.4)',
  danger: '#b3261e',
  success: '#2f7a4a',
  seasonGreen: '#2f7a4a',
  seasonPurple: '#5b3f8a',
};

const ANCORA_DARK = {
  mode: 'dark',
  primary: '#0f2f3a',
  primaryText: '#e3b86e',
  accent: '#d8aa5e',
  accentText: '#d8aa5e',
  bg: '#0b1c22',
  card: '#12303a',
  cardBorder: '#1f4350',
  text: '#efe6d6',
  textMuted: '#a9b2ad',
  textSubtle: '#9fa8a3',
  divider: '#1f4350',
  inputBg: '#12303a',
  badgeBg: '#1f4350',
  badgeText: '#e3b86e',
  heroSub: '#b7c7c7',
  deepLinkHl: '#3a3020',
  tint: '#e6936c',
  onTint: '#0b1c22',
  onPrimary: '#ffffff',
  textTertiary: '#76807c',
  separator: 'rgba(239,230,214,0.14)',
  hairline: 'rgba(255,255,255,0.14)',
  material: 'rgba(11,28,34,0.78)',
  elevated: '#163843',
  overlay: 'rgba(0,0,0,0.5)',
  danger: '#f28b82',
  success: '#8fd19e',
  seasonGreen: '#8fd19e',
  seasonPurple: '#b59ae6',
};

const BASILICA_LIGHT = {
  mode: 'light',
  primary: '#1d3a8a',
  primaryText: '#1d3a8a',
  accent: '#d4a73a',
  accentText: '#7f5c12',
  bg: '#f4f1ea',
  card: '#ffffff',
  cardBorder: '#e7e2d6',
  text: '#14172a',
  textMuted: '#4f5366',
  textSubtle: '#5d5a52',
  divider: '#ddd8cc',
  inputBg: '#ffffff',
  badgeBg: '#e6eaf5',
  badgeText: '#1d3a8a',
  heroSub: '#c8d2ee',
  deepLinkHl: '#f3e2a9',
  tint: '#1d3a8a',
  onTint: '#ffffff',
  onPrimary: '#ffffff',
  textTertiary: '#8d8a80',
  separator: 'rgba(29,58,138,0.14)',
  hairline: 'rgba(0,0,0,0.12)',
  material: 'rgba(244,241,234,0.78)',
  elevated: '#ffffff',
  overlay: 'rgba(0,0,0,0.4)',
  danger: '#9b2335',
  success: '#2f7a4a',
  seasonGreen: '#2f7a4a',
  seasonPurple: '#5b3f8a',
};

const BASILICA_DARK = {
  mode: 'dark',
  primary: '#1d3a8a',
  primaryText: '#e2bc5c',
  accent: '#d4a73a',
  accentText: '#d9b04a',
  bg: '#0d0f1a',
  card: '#161a2e',
  cardBorder: '#252a44',
  text: '#f1ede2',
  textMuted: '#aaa9b4',
  textSubtle: '#a09eab',
  divider: '#252a44',
  inputBg: '#161a2e',
  badgeBg: '#222849',
  badgeText: '#e2bc5c',
  heroSub: '#b9c3e6',
  deepLinkHl: '#3a3218',
  tint: '#d9b04a',
  onTint: '#0d0f1a',
  onPrimary: '#ffffff',
  textTertiary: '#77768a',
  separator: 'rgba(241,237,226,0.14)',
  hairline: 'rgba(255,255,255,0.14)',
  material: 'rgba(13,15,26,0.78)',
  elevated: '#1d2240',
  overlay: 'rgba(0,0,0,0.5)',
  danger: '#f28b82',
  success: '#8fd19e',
  seasonGreen: '#8fd19e',
  seasonPurple: '#b59ae6',
};

const LUMEN_LIGHT = {
  mode: 'light',
  primary: '#16171b',
  primaryText: '#16171b',
  accent: '#e09a2d',
  accentText: '#8f560a',
  bg: '#f6f3ee',
  card: '#ffffff',
  cardBorder: '#e9e4dc',
  text: '#16171b',
  textMuted: '#55575e',
  textSubtle: '#5b5d65',
  divider: '#e2ddd4',
  inputBg: '#ffffff',
  badgeBg: '#f3e7d2',
  badgeText: '#6e4206',
  heroSub: '#d9d6cf',
  deepLinkHl: '#fbe3b8',
  tint: '#16171b',
  onTint: '#ffffff',
  onPrimary: '#ffffff',
  textTertiary: '#8c8e95',
  separator: 'rgba(22,23,27,0.12)',
  hairline: 'rgba(0,0,0,0.12)',
  material: 'rgba(246,243,238,0.8)',
  elevated: '#ffffff',
  overlay: 'rgba(0,0,0,0.4)',
  danger: '#b3261e',
  success: '#2f7a4a',
  seasonGreen: '#2f7a4a',
  seasonPurple: '#5b3f8a',
};

const LUMEN_DARK = {
  mode: 'dark',
  primary: '#1c1d22',
  primaryText: '#f0b553',
  accent: '#e9a23b',
  accentText: '#eaa940',
  bg: '#121316',
  card: '#1c1d22',
  cardBorder: '#2a2b31',
  text: '#f2efe9',
  textMuted: '#a9aab0',
  textSubtle: '#a2a3aa',
  divider: '#2a2b31',
  inputBg: '#1c1d22',
  badgeBg: '#2a2620',
  badgeText: '#f0b553',
  heroSub: '#c9c7c2',
  deepLinkHl: '#3b2f1c',
  tint: '#eaa940',
  onTint: '#121316',
  onPrimary: '#ffffff',
  textTertiary: '#7a7b82',
  separator: 'rgba(242,239,233,0.12)',
  hairline: 'rgba(255,255,255,0.12)',
  material: 'rgba(18,19,22,0.8)',
  elevated: '#232429',
  overlay: 'rgba(0,0,0,0.55)',
  danger: '#f28b82',
  success: '#8fd19e',
  seasonGreen: '#8fd19e',
  seasonPurple: '#b59ae6',
};

export const IDENTITIES = {
  classica: {
    id: 'classica',
    name: 'Clássica',
    nameEn: 'Classic',
    concept: 'Azul-marinho e ouro, a cruz latina. A identidade de sempre.',
    conceptEn: 'Navy and gold, the Latin cross. The original identity.',
    display: 'CormorantGaramond-SemiBold',
    displayWeight: '600',
    displayScale: 1,
    mark: 'cross',
    light: CLASSICA_LIGHT,
    dark: CLASSICA_DARK,
  },
  ancora: {
    id: 'ancora',
    name: 'Âncora',
    nameEn: 'Anchor',
    concept: 'A cruz-âncora das catacumbas: a esperança como âncora da alma.',
    conceptEn: 'The anchor-cross of the catacombs: hope as an anchor of the soul.',
    display: 'EBGaramond-SemiBold',
    displayWeight: '600',
    displayScale: 0.92,
    mark: 'anchor',
    light: ANCORA_LIGHT,
    dark: ANCORA_DARK,
  },
  basilica: {
    id: 'basilica',
    name: 'Basílica',
    nameEn: 'Basilica',
    concept: 'Mosaico bizantino e capitulares romanas, o Chi-Rho de ouro.',
    conceptEn: 'Byzantine mosaic and Roman capitals, the golden Chi-Rho.',
    display: 'Cinzel-SemiBold',
    displayWeight: '600',
    displayScale: 0.8,
    mark: 'chirho',
    light: BASILICA_LIGHT,
    dark: BASILICA_DARK,
  },
  lumen: {
    id: 'lumen',
    name: 'Lumen',
    nameEn: 'Lumen',
    concept: 'Moderna e clara: a cruz recortada num balão de fala, a resposta.',
    conceptEn: 'Modern and clear: a cross cut into a speech bubble, the answer.',
    display: 'InstrumentSerif-Regular',
    displayWeight: '400',
    displayScale: 1.04,
    mark: 'bubble',
    light: LUMEN_LIGHT,
    dark: LUMEN_DARK,
  },
};

export const IDENTITY_IDS = Object.keys(IDENTITIES);
export const DEFAULT_IDENTITY = 'classica';

export function identityFor(id) {
  return IDENTITIES[id] || IDENTITIES[DEFAULT_IDENTITY];
}

// Razão de contraste da WCAG 2 entre duas cores #rrggbb (ou #rgb).
function luminance(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
