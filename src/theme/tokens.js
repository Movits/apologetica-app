// Tokens de design do app: espaço, raio, tipografia, ícone, movimento e sombra.
// Os números vêm de docs/design/pesquisa-apple.md §12 (tabelas 12.2 a 12.6) e
// do plano da Fase 5 (docs/design/plano-fase-5.md, Onda 1).
//
// Regra: este arquivo NÃO importa react-native (nem reanimated, nem nada) para
// poder rodar no `node --test` (tests/tokens.test.mjs). O que depende de
// plataforma ou de estado (fonte por SO, escala de fonte) é resolvido no
// ThemeContext, que consome estas constantes puras.

// Famílias de fonte por plataforma. `sans: undefined` deixa a fonte do sistema
// (SF no iOS, Roboto no Android, a pilha do navegador na web). A display é a
// Cormorant Garamond SemiBold empacotada em assets/fonts (único peso).
const FAMILY_BASE = { display: 'CormorantGaramond-SemiBold', sans: undefined };

export const FONT_FAMILY_BY_PLATFORM = {
  ios: { ...FAMILY_BASE, serif: 'Georgia' },
  android: { ...FAMILY_BASE, serif: 'serif' },
  web: { ...FAMILY_BASE, serif: 'Georgia, "Times New Roman", serif' },
};

// Default neutro (o ThemeContext escolhe por Platform.OS).
export const FONT_FAMILY = FONT_FAMILY_BY_PLATFORM.ios;

// Famílias da plataforma `os` ('ios' | 'android' | 'web'), caindo no default
// neutro para qualquer outro valor. É o que ThemeContext e ErrorBoundary usam
// com Platform.OS, sem cada um repetir o `|| FONT_FAMILY_BY_PLATFORM.ios`.
export function fontFamilyFor(os) {
  return FONT_FAMILY_BY_PLATFORM[os] || FONT_FAMILY_BY_PLATFORM.ios;
}

// Grade de 4 pt (§12.2).
export const space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40 };

// Raios (§12.3). `full` vira cápsula ou círculo.
export const radius = { xs: 4, sm: 8, md: 12, lg: 18, full: 9999 };

// Tamanhos de ícone (Ionicons) por contexto: linha de lista, ação, destaque.
export const icon = { sm: 18, md: 22, lg: 26 };

// Lados das miniaturas: `sm` (notícia), `md` (capa de artigo na lista) e a
// foto da estação litúrgica na Início, em 7:5 (`seasonW` x `seasonH`).
export const thumb = { sm: 56, md: 72, seasonW: 56, seasonH: 40 };

// Papéis de texto (§12.4, tamanhos do iOS no Large). `size` e `lineHeight` são
// os valores sem escala. `fixed: true` faz o papel ignorar a escala de fonte
// (só o rótulo da tab bar, que não cresce).
export const type = {
  largeTitle: { size: 34, lineHeight: 41, weight: '600', family: 'display' },
  title: { size: 28, lineHeight: 34, weight: '600', family: 'display' },
  section: { size: 22, lineHeight: 28, weight: '600', family: 'display' },
  title3: { size: 20, lineHeight: 25, weight: '600', family: 'sans' },
  headline: { size: 17, lineHeight: 22, weight: '600', family: 'sans' },
  body: { size: 17, lineHeight: 22, weight: '400', family: 'sans' },
  callout: { size: 16, lineHeight: 21, weight: '400', family: 'sans' },
  subhead: { size: 15, lineHeight: 20, weight: '400', family: 'sans' },
  footnote: { size: 13, lineHeight: 18, weight: '400', family: 'sans' },
  caption1: { size: 12, lineHeight: 16, weight: '400', family: 'sans' },
  caption2: { size: 11, lineHeight: 13, weight: '400', family: 'sans' },
  // Leitura longa em serifa: artigo, versículo e o Body com entrelinha solta.
  reading: { size: 18, lineHeight: 28, weight: '400', family: 'serif' },
  readingBible: { size: 19, lineHeight: 30, weight: '400', family: 'serif' },
  bodySerif: { size: 17, lineHeight: 26, weight: '400', family: 'serif' },
  tabLabel: { size: 11, lineHeight: 13, weight: '500', family: 'sans', fixed: true },
};

// Compõe o estilo de Text do RN para um papel. `fs` é a função de escala do
// tema (fontSize e lineHeight escalam juntos, salvo `fixed`). `families` é o
// mapa de fontes da plataforma atual.
export function textStyle(role, fs, families = FONT_FAMILY) {
  const t = type[role];
  if (!t) throw new Error(`textStyle: papel de texto desconhecido "${role}"`);
  const scale = t.fixed ? (n) => n : fs;
  return {
    fontSize: scale(t.size),
    lineHeight: scale(t.lineHeight),
    fontWeight: t.weight,
    fontFamily: families[t.family],
  };
}

// Durações em ms, curva padrão do Core Animation e escala do press (§12.6).
// `screen` é a referência para a transição de tela quando o sistema não cuida
// dela (a nativa fica com `animation: 'ios_from_right'`).
export const motion = {
  touch: 150,
  aba: 200,
  layout: 350,
  screen: 350,
  heavy: 500,
  spring: 550,
  stagger: 40,
  easing: [0.25, 0.1, 0.25, 1],
  press: { scale: 0.97 },
};

// Sombras no formato novo do RN 0.81 (`boxShadow` como array de objetos), que
// funciona igual no nativo e na web. `card` é só do tema claro: no escuro a
// separação vem do fundo `card` sobre `bg` mais a hairline, sem sombra.
export const shadow = {
  card: { boxShadow: [{ offsetX: 0, offsetY: 1, blurRadius: 3, color: 'rgba(26,58,92,0.08)' }] },
  floating: { boxShadow: [{ offsetX: 0, offsetY: 6, blurRadius: 18, color: 'rgba(0,0,0,0.16)' }] },
  sheet: { boxShadow: [{ offsetX: 0, offsetY: -4, blurRadius: 24, color: 'rgba(0,0,0,0.18)' }] },
};
