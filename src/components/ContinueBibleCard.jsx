import { useLanguage } from '../context/LanguageContext';
import { Group, ContinueRow } from './ui';

// "Continue lendo" no topo da lista de livros da Bíblia (Onda 6): um Group com
// o ContinueRow partilhado com a Início (ícone de livro, "Continuar em João 3",
// progresso em texto e a ProgressBar do capítulo por baixo). Só aparece quando
// existe uma posição salva (ver src/utils/bibleProgress.js) e nunca sequestra
// a navegação: a retomada é sempre um toque.
export default function ContinueBibleCard({ label, chapterRatio = 0, stats, onPress, style }) {
  const { t } = useLanguage();
  const ratio = Math.max(0, Math.min(1, Number(chapterRatio) || 0));
  const pct = Math.round(ratio * 100);

  const parts = [t('bible.chapterPct', { pct })];
  if (stats?.chaptersRead > 0) {
    parts.push(`${t('bible.ofTotal', { n: stats.chaptersRead, total: stats.total })} ${t('bible.chaptersRead')}`);
  }

  return (
    <Group style={style}>
      <ContinueRow
        icon="book-outline"
        title={t('bible.continueIn', { ref: label })}
        subtitle={parts.join(' · ')}
        progress={ratio}
        progressLabel={t('bible.chapterPct', { pct })}
        onPress={onPress}
        accessibilityLabel={`${t('bible.continue')}: ${label}`}
      />
    </Group>
  );
}
