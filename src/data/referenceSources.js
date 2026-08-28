// Metadados das fontes de referência: ordem de exibição + ícone (Ionicons).
// A descrição vem do i18n (source.<id>.desc) e a contagem é calculada do array
// de referências.
//
// ATENÇÃO: ReferencesScreen monta as seções iterando este array. Uma referência
// com `source` fora desta lista não aparece em lugar nenhum da tela, sem erro e
// sem warning. É o que `scripts/check-refs.mjs` existe para pegar.

export const REFERENCE_SOURCES = [
  { id: 'Bíblia', icon: 'book-outline' },
  { id: 'Catecismo', icon: 'school-outline' },
  { id: 'Documentos', icon: 'document-text-outline' },
  { id: 'Teólogos', icon: 'people-outline' },
  { id: 'Ciência', icon: 'flask-outline' },
  { id: 'Mídia', icon: 'camera-outline' },
  { id: 'Outros', icon: 'ellipsis-horizontal-circle-outline' },
];

// Fonte única do rótulo em inglês. Antes estava duplicado em ReferencesScreen,
// RefDetailScreen e SearchScreen, e as três cópias saíam de sincronia.
export const SOURCE_LABELS_EN = {
  'Bíblia': 'Bible',
  'Catecismo': 'Catechism',
  'Documentos': 'Documents',
  'Teólogos': 'Theologians',
  'Ciência': 'Science',
  'Mídia': 'Media',
  'Outros': 'Others',
};

export const translateSource = (s, isEn) => (isEn ? (SOURCE_LABELS_EN[s] || s) : s);

// Conjunto fechado dos valores válidos de `source`, usado pela validação.
export const SOURCE_IDS = new Set(REFERENCE_SOURCES.map((s) => s.id));
