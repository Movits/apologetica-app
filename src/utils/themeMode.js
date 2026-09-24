// Tema em três estados: seguir o sistema, claro ou escuro. Módulo puro (sem
// react-native) para o ThemeContext e os testes compartilharem a mesma regra.
//
// Precedência na hidratação: a escolha feita na landing web (appg_theme, que
// só conhece 'light' e 'dark') vence a salva pelo app (settings:theme); sem
// nenhuma das duas, o app segue o sistema.

export const THEME_MODES = ['system', 'light', 'dark'];

const isExplicit = (v) => v === 'light' || v === 'dark';

export function resolveThemeMode({ landing, saved } = {}) {
  if (isExplicit(landing)) return landing;
  if (THEME_MODES.includes(saved)) return saved;
  return 'system';
}

// `systemScheme` é o que Appearance.getColorScheme() devolve ('light', 'dark'
// ou null/undefined quando o sistema não informa; aí o padrão é claro).
export function isDarkFor(mode, systemScheme) {
  return mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
}
