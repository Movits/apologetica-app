import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCitation, citationKindLabel } from '../data/references';

// Bloco de procedência de uma referência: dados bibliográficos (papers) e
// ficha de mídia (fotos e vídeos históricos). Retorna null quando a referência
// não tem nenhum dos dois, que é o caso da grande maioria.
// Compartilhado por ReferencesScreen e RefDetailScreen para o JSX não virar
// uma quarta cópia.
export default function RefSourceBlock({ item }) {
  const { colors, fs } = useTheme();
  const { isEn } = useLanguage();
  const styles = makeStyles(colors, fs);

  const citation = item?.citation;
  const media = item?.media;
  if (!citation && !media) return null;

  const citationLine = formatCitation(citation, isEn);
  const kindLine = citationKindLabel(citation, isEn);

  const mediaTypeLabel = {
    photo: isEn ? 'Photograph' : 'Fotografia',
    film: isEn ? 'Film or broadcast' : 'Filme ou transmissão',
    audio: isEn ? 'Audio recording' : 'Gravação de áudio',
    'document-scan': isEn ? 'Scanned document' : 'Documento digitalizado',
  };

  return (
    <View style={styles.box}>
      {citation && (
        <>
          <View style={styles.header}>
            <Ionicons name="flask-outline" size={14} color={colors.accent} />
            <Text style={styles.label}>{isEn ? 'Publication' : 'Publicação'}</Text>
          </View>
          {citationLine ? <Text style={styles.line}>{citationLine}</Text> : null}
          {kindLine ? <Text style={styles.sub}>{kindLine}</Text> : null}
        </>
      )}

      {media && (
        <>
          <View style={[styles.header, citation && styles.headerSpaced]}>
            <Ionicons name="camera-outline" size={14} color={colors.accent} />
            <Text style={styles.label}>
              {mediaTypeLabel[media.type] || (isEn ? 'Historical record' : 'Registro histórico')}
            </Text>
          </View>
          {media.publishedIn ? (
            <Text style={styles.line}>
              {isEn ? 'Published in: ' : 'Publicado em: '}{media.publishedIn}
            </Text>
          ) : null}
          {media.archive ? (
            <Text style={styles.line}>
              {isEn ? 'Archive: ' : 'Acervo: '}{media.archive}
              {media.archiveId ? ` (${media.archiveId})` : ''}
            </Text>
          ) : null}
          {media.license === 'public-domain' ? (
            <Text style={styles.sub}>{isEn ? 'Public domain' : 'Domínio público'}</Text>
          ) : null}
        </>
      )}
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    box: {
      marginTop: 12,
      padding: 12,
      borderRadius: 10,
      backgroundColor: c.badgeBg,
      borderLeftWidth: 3,
      borderLeftColor: c.accent,
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    headerSpaced: { marginTop: 12 },
    label: {
      fontSize: fs(11),
      fontWeight: '700',
      color: c.accent,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    line: { fontSize: fs(13), color: c.text, marginTop: 4, lineHeight: fs(19) },
    sub: { fontSize: fs(12), color: c.textSubtle, marginTop: 4, fontStyle: 'italic' },
  });
