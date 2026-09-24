import { useMemo, useRef } from 'react';
import { Platform, Text, View } from 'react-native';
import { getVerseOfDay } from '../data/dailyVerses';
import { shareVerse } from '../utils/share';
import { captureAndShareImage } from '../utils/shareAsImage';
import { pick } from '../utils/i18nData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Group, Row } from './ui';
import ShareVerseCard from './ShareVerseCard';

// Versículo do dia (Conteúdo do dia): um Group com o texto em serifa de
// leitura, a referência em footnote e as ações como linhas (ler na Bíblia,
// compartilhar o texto e, no nativo, compartilhar como imagem). O card de
// captura fica fora do Group, senão ganharia um separador.
export default function VerseOfDayCard({ onOpen, style }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space } = tokens;
  const verse = useMemo(() => getVerseOfDay(), []);
  const shareCardRef = useRef(null);

  const verseText = pick(verse, 'text', isEn);
  const ref = pick(verse, 'ref', isEn);

  // Compartilha a referência exatamente como o card exibe (o `ref` curado, já
  // no idioma certo), em vez de remontá-la por regex, que gerava "Salmo 23 1,1".
  const handleShare = () => shareVerse({ ref, text: verseText, isEn });
  const handleShareAsImage = () => captureAndShareImage(shareCardRef, `"${verseText}"\n\n${ref}`);
  const openVerse = () => onOpen?.({ bookId: verse.bookId, chapter: verse.chapter, verse: verse.verse });

  return (
    <>
      <Group header={t('home.verse.label')} style={style}>
        <View style={{ padding: space.md, gap: space.xs }}>
          <Text style={[text('reading'), { color: colors.text }]}>“{verseText}”</Text>
          <Text style={[text('footnote'), { color: colors.textSubtle }]}>{ref}</Text>
        </View>
        <Row icon="book-outline" title={t('today.readInBible')} trailing="chevron" onPress={openVerse} />
        <Row icon="share-social-outline" title={t('today.shareText')} onPress={handleShare} />
        {Platform.OS !== 'web' ? (
          <Row icon="image-outline" title={t('today.shareImage')} onPress={handleShareAsImage} />
        ) : null}
      </Group>

      {/* Card offscreen renderizado para captura como imagem. */}
      <View style={{ position: 'absolute', left: -10000, top: -10000, opacity: 0 }} pointerEvents="none">
        <ShareVerseCard ref={shareCardRef} text={verseText} passageRef={ref} />
      </View>
    </>
  );
}
