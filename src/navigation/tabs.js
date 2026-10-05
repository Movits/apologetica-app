// As cinco abas. Os nomes de rota são strings em português e fazem parte da
// API de navegação (navigate('Bíblia', ...), deep links em App.js): não mudar.
// O rótulo visível vem de t(TAB_LABEL_KEYS[route]).
export const TAB_ROUTES = ['Início', 'Artigos', 'Bíblia', 'Ferramentas', 'Ajustes'];

// Mesmas chaves do LABELS de App.js (src/i18n/strings.js: 'tab.*').
export const TAB_LABEL_KEYS = {
  'Início': 'tab.home',
  'Artigos': 'tab.articles',
  'Bíblia': 'tab.bible',
  'Ferramentas': 'tab.tools',
  'Ajustes': 'tab.settings',
};

// Ionicons (glifos conferidos em node_modules/@expo/vector-icons/build/vendor/
// react-native-vector-icons/glyphmaps/Ionicons.json). Decisão E15 do
// diagnóstico: Artigos = jornal, Bíblia = livro, Ferramentas = brilho.
export const TAB_ICONS = {
  'Início': { on: 'home', off: 'home-outline' },
  'Artigos': { on: 'newspaper', off: 'newspaper-outline' },
  'Bíblia': { on: 'book', off: 'book-outline' },
  'Ferramentas': { on: 'sparkles', off: 'sparkles-outline' },
  'Ajustes': { on: 'settings', off: 'settings-outline' },
};
