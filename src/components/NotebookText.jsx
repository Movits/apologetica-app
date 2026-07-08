import { Fragment } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Renderiza o texto de uma página do caderno, transformando os tokens de
// referência em links clicáveis:
//   @[Mt 16,18](v:mt/16/18)        -> versículo  (onOpenVerse)
//   @[Igreja Católica](a:igreja...) -> artigo     (onOpenArticle)
//   @[Mt 16,18 (CIC)](r:mt-16-18)   -> referência do app (onOpenRef)
// O restante é texto normal (parágrafos separados por quebras de linha).
const REF_RE = /@\[([^\]]+)\]\((v|a|r):([^)]+)\)/g;

export default function NotebookText({ text, onOpenVerse, onOpenArticle, onOpenRef, baseStyle }) {
  const { colors, fs } = useTheme();
  const styles = makeStyles(colors, fs);

  const renderInline = (str, keyBase) => {
    const out = [];
    let last = 0;
    let m;
    REF_RE.lastIndex = 0;
    while ((m = REF_RE.exec(str)) !== null) {
      if (m.index > last) out.push(<Fragment key={`${keyBase}-t${last}`}>{str.slice(last, m.index)}</Fragment>);
      const label = m[1];
      const kind = m[2];
      const payload = m[3];
      out.push(
        <Text
          key={`${keyBase}-r${m.index}`}
          style={styles.link}
          onPress={() => {
            if (kind === 'v') {
              const [bookId, chapter, verse] = payload.split('/');
              onOpenVerse?.(bookId, Number(chapter), Number(verse));
            } else if (kind === 'r') {
              onOpenRef?.(payload);
            } else {
              onOpenArticle?.(payload);
            }
          }}
        >
          {label}
        </Text>
      );
      last = m.index + m[0].length;
    }
    if (last < str.length) out.push(<Fragment key={`${keyBase}-end`}>{str.slice(last)}</Fragment>);
    return out;
  };

  const lines = String(text || '').split('\n');

  return (
    <Text style={[styles.base, baseStyle]}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {renderInline(line, `l${i}`)}
          {i < lines.length - 1 ? '\n' : null}
        </Fragment>
      ))}
    </Text>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    base: { color: c.text, fontSize: fs(16), lineHeight: fs(26) },
    link: { color: c.accentText, textDecorationLine: 'underline', fontWeight: '600' },
  });
