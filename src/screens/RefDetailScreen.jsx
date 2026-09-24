import { useMemo } from 'react';
import { View, Text, ScrollView, Linking } from 'react-native';
import {
  referenceById, withEn, translateAuthor, translateYear, translateFullSource, resolveRefUrl,
  formatCitation, citationKindLabel,
} from '../data/references';
import { translateSource } from '../data/referenceSources';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { pick, pickPair } from '../utils/i18nData';
import { refLabel } from '../utils/refLabel';
import { shareReference } from '../utils/share';
import { openBible } from '../navigation/links';
import { Button, EmptyState, Group, Row } from '../components/ui';

const VATICAN_BASE_PT = 'https://www.vatican.va/archive/cathechism_po/index_new/prima-pagina-cic_po.html';
const VATICAN_BASE_EN = 'https://www.vatican.va/archive/ENG0015/_INDEX.HTM';

// Tipo de mídia (fotos e vídeos históricos) para o cabeçalho da ficha.
const MEDIA_TYPE_KEY = {
  photo: 'ref.media.photo',
  film: 'ref.media.film',
  audio: 'ref.media.audio',
  'document-scan': 'ref.media.documentScan',
};

// Linha rótulo + valor para as fichas: rótulo em footnote secundário em cima,
// valor em body embaixo, quebrando à vontade (uma citação de periódico ou o
// significado de uma palavra grega não cabem numa linha).
function InfoRow({ label, value }) {
  const { colors, text } = useTheme();
  if (!value) return null;
  return (
    <Row>
      <Text style={[text('footnote'), { color: colors.textSubtle }]}>{label}</Text>
      <Text style={[text('body'), { color: colors.text }]} selectable>{value}</Text>
    </Row>
  );
}

// Tela de UMA referência (Onda 9c), aberta de um artigo, da busca ou do
// catálogo: a citação em destaque, a procedência, as ações e as fichas
// (palavra no original, publicação científica, mídia histórica).
export default function RefDetailScreen({ route, navigation }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, radius } = tokens;
  const refId = route?.params?.highlightId;

  // Mesclada com a tradução EN, campo a campo, para o `pick` cair no PT
  // quando a tradução não existe.
  const item = useMemo(() => withEn(referenceById(refId)), [refId]);

  if (!item) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <EmptyState icon="library-outline" title={t('ref.notFound')} />
      </View>
    );
  }

  const label = refLabel(item, isEn);
  const quote = pick(item, 'text', isEn);
  const topic = pick(item, 'topic', isEn);
  // Sem tradução curada, os tradutores heurísticos entram como fallback.
  const fullSource = pick(item, 'fullSource', isEn, translateFullSource);
  const author = pick(item, 'author', isEn, translateAuthor);
  const year = pick(item, 'year', isEn, translateYear);
  const credit = [author, year].filter(Boolean).join(' · ');
  const sourceName = translateSource(item.source, isEn);

  // Algumas referências divergem de capítulo/versículo entre a Bíblia PT
  // (Ave Maria) e EN (Douay-Rheims), ex.: Joel 3,4 (PT) = Joel 2,31 (EN).
  const openInBible = () => openBible(navigation, (isEn && item.bibleNavEn) || item.bibleNav);

  // Catecismo abre o site do Vaticano no idioma do app quando a referência
  // não traz url própria. O resto resolve pelo mesmo caminho da lista.
  const isCatechismRef = item.id?.startsWith('cic-');
  const sourceUrl = isCatechismRef
    ? (item.url || (isEn ? VATICAN_BASE_EN : VATICAN_BASE_PT))
    : resolveRefUrl(item, item, isEn);
  const openSource = () => {
    if (!sourceUrl) return;
    Linking.openURL(sourceUrl).catch(() => {});
  };

  const share = () => shareReference({ text: quote, label: credit ? `${label} (${credit})` : label });

  const ol = item.originalLanguage;
  const meaning = ol ? pickPair(ol.meaning, item.meaningEn, isEn) : null;
  const citationLine = formatCitation(item.citation, isEn);
  const kindLine = citationKindLabel(item.citation, isEn);
  const media = item.media;
  const mediaTitle = media ? t(MEDIA_TYPE_KEY[media.type] || 'ref.media.record') : null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: space.md, paddingBottom: space.xl, gap: space.md }}
    >
      {/* Citação */}
      <View style={{ backgroundColor: colors.card, borderRadius: radius.md, padding: space.md }}>
        <Text style={[text('reading'), { color: colors.text }]} selectable>{quote}</Text>
        {isEn && !item.textEn && item.text ? (
          <Text style={[text('footnote'), { color: colors.textSubtle, marginTop: space.sm }]}>{t('ref.ptOnly')}</Text>
        ) : null}
      </View>

      {/* Procedência */}
      <View style={{ gap: space.xxs }}>
        <Text style={[text('headline'), { color: colors.text }]} role="heading">{label}</Text>
        {fullSource ? <Text style={[text('subhead'), { color: colors.textSubtle }]}>{fullSource}</Text> : null}
        {credit ? <Text style={[text('subhead'), { color: colors.textSubtle }]}>{credit}</Text> : null}
        <Text style={[text('footnote'), { color: colors.textSubtle }]}>
          {sourceName}{topic ? ` · ${topic}` : ''}
        </Text>
      </View>

      {/* Ações */}
      <View style={{ gap: space.sm }}>
        {item.bibleNav ? (
          <Button icon="book-outline" label={t('ref.readInApp')} onPress={openInBible} haptic="impact" />
        ) : null}
        {sourceUrl ? (
          <Button
            variant="secondary"
            icon="open-outline"
            label={isCatechismRef ? t('ref.openCatechism') : t('ref.openSource')}
            onPress={openSource}
          />
        ) : null}
        <Button variant="plain" icon="share-outline" label={t('common.share')} onPress={share} />
      </View>

      {/* Palavra no original */}
      {ol ? (
        <Group header={t('ref.original', { lang: ol.language })}>
          <InfoRow label={t('ref.word')} value={ol.word} />
          <InfoRow label={t('ref.transliteration')} value={ol.transliteration} />
          <InfoRow label={t('ref.strongs')} value={ol.strongs} />
          <InfoRow label={t('ref.meaning')} value={meaning} />
        </Group>
      ) : null}

      {/* Ficha bibliográfica */}
      {citationLine || kindLine ? (
        <Group header={t('ref.publication')}>
          <InfoRow label={t('ref.citation')} value={citationLine} />
          <InfoRow label={t('ref.publicationKind')} value={kindLine} />
        </Group>
      ) : null}

      {/* Ficha de mídia: referência textual, a imagem fica no acervo */}
      {media ? (
        <Group header={mediaTitle}>
          <InfoRow label={t('ref.media.publishedIn')} value={media.publishedIn} />
          <InfoRow
            label={t('ref.media.archive')}
            value={media.archive ? `${media.archive}${media.archiveId ? ` (${media.archiveId})` : ''}` : null}
          />
          <InfoRow
            label={t('ref.media.license')}
            value={media.license === 'public-domain' ? t('ref.media.publicDomain') : media.license}
          />
        </Group>
      ) : null}
    </ScrollView>
  );
}
