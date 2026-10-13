// Paleta do app (identidade Clássica: azul-marinho, ouro e creme), clara e
// escura. Puro (sem react-native), testado em tests/palette.test.mjs, que
// garante as mesmas chaves nas duas paletas e contraste AA nos pares de texto
// e fundo que as telas usam. O ThemeContext reexporta LIGHT e DARK e entrega a
// do tema ativo em useTheme().colors.
//
// Em outubro de 2026 o app testou outras três identidades (Âncora, Basílica e
// Lumen) e o dono ficou com a Clássica. As propostas estão arquivadas em
// design/identidade/ e no histórico do git (commit 09c0e4e).

export const LIGHT = {
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
export const DARK = {
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
