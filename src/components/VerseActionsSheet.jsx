import { useRef } from 'react';
import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Sheet, Group, Row, PressScale, Button } from './ui';

// Folha de ações de um versículo (Onda 6): abre por toque simples ou longo na
// tela da Bíblia. Linha com as cinco cores de marcação, depois Anotar, Copiar
// e Compartilhar num Group, mais "Abrir nota" quando o versículo já tem nota
// e "Remover marcação" quando já está marcado.
//
// As cores são DADOS: o valor vai para o Firestore como `color` da marcação
// (src/services/userData.js) e é lido de volta pela tela de Marcações. Por isso
// os hex ficam aqui, e só aqui, fora do tema.
export const HIGHLIGHT_COLORS = [
  { key: 'yellow', value: '#fff3a6', labelPt: 'Marcar em amarelo', labelEn: 'Highlight in yellow' },
  { key: 'green', value: '#c8f0c0', labelPt: 'Marcar em verde', labelEn: 'Highlight in green' },
  { key: 'blue', value: '#c4dffb', labelPt: 'Marcar em azul', labelEn: 'Highlight in blue' },
  { key: 'pink', value: '#f8c4d3', labelPt: 'Marcar em rosa', labelEn: 'Highlight in pink' },
  { key: 'orange', value: '#ffd9a8', labelPt: 'Marcar em laranja', labelEn: 'Highlight in orange' },
];

// Alvo de toque de cada cor. O anel da cor ativa é o fundo `tint` do alvo
// aparecendo por trás do disco, que fica `space.xxs` menor de cada lado.
const TARGET = 44;

export default function VerseActionsSheet({
  verse,
  title,
  currentColor,
  hasNote,
  onColor,
  onRemoveHighlight,
  onNote,
  onOpenNote,
  onCopy,
  onShare,
  onClose,
}) {
  const { colors, tokens } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, radius } = tokens;

  // Enquanto a folha anima a saída, `verse` já é null: guarda o último estado
  // para o conteúdo não piscar vazio antes de sumir.
  const snap = useRef({});
  if (verse) snap.current = { title, currentColor, hasNote };
  const shown = snap.current;
  const dot = TARGET - space.xxs * 2;

  return (
    <Sheet visible={Boolean(verse)} onClose={onClose} title={shown.title}>
      <View style={{ flexDirection: 'row', gap: space.sm, marginBottom: space.md }}>
        {HIGHLIGHT_COLORS.map((c) => {
          const active = shown.currentColor === c.value;
          return (
            <PressScale
              key={c.key}
              role="button"
              aria-label={isEn ? c.labelEn : c.labelPt}
              aria-pressed={active}
              haptic="selection"
              onPress={() => onColor?.(c.value)}
              style={{
                width: TARGET,
                height: TARGET,
                borderRadius: radius.full,
                padding: space.xxs,
                backgroundColor: active ? colors.tint : 'transparent',
              }}
            >
              <View style={{ width: dot, height: dot, borderRadius: radius.full, backgroundColor: c.value }} />
            </PressScale>
          );
        })}
      </View>

      <Group>
        <Row title={t('bible.annotate')} onPress={onNote} />
        {shown.hasNote ? <Row title={t('bible.openNote')} onPress={onOpenNote} /> : null}
        <Row title={t('bible.copy')} onPress={onCopy} />
        <Row title={t('common.share')} onPress={onShare} />
        {shown.currentColor ? <Row title={t('bible.removeHighlight')} onPress={onRemoveHighlight} /> : null}
      </Group>

      <Button variant="plain" label={t('common.close')} onPress={onClose} style={{ marginTop: space.xs }} />
    </Sheet>
  );
}
