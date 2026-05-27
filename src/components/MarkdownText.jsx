import { Fragment, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { glossaryByTerm } from '../data/glossary';

// Renderiza um texto com markdown simples:
//   ## Subtitulo          -> H2
//   > citacao             -> blockquote
//   - item                -> bullet
//   [[Theotokos]]         -> termo do glossario clicavel
// Paragrafos sao separados por linhas em branco.
export default function MarkdownText({ text, onOpenGlossary, baseStyle, h2Style, quoteStyle, bulletStyle, linkStyle }) {
  const { colors, fs } = useTheme();
  const blocks = useMemo(() => parseBlocks(text || ''), [text]);
  const styles = makeStyles(colors, fs);

  const renderInline = (str, key) => {
    const parts = splitGlossaryLinks(str);
    return parts.map((p, i) => {
      if (p.type === 'glossary') {
        return (
          <Text
            key={`${key}-${i}`}
            style={[styles.link, linkStyle]}
            onPress={() => onOpenGlossary?.(p.term)}
          >
            {p.term}
          </Text>
        );
      }
      return (
        <Text key={`${key}-${i}`} style={[styles.base, baseStyle]}>
          {p.text}
        </Text>
      );
    });
  };

  return (
    <View>
      {blocks.map((b, i) => {
        if (b.type === 'h2') {
          return (
            <Text key={i} style={[styles.h2, h2Style]}>
              {b.text}
            </Text>
          );
        }
        if (b.type === 'quote') {
          return (
            <View key={i} style={[styles.quote, quoteStyle]}>
              <Text style={[styles.quoteText]}>{renderInline(b.text, `q${i}`)}</Text>
            </View>
          );
        }
        if (b.type === 'list') {
          return (
            <View key={i} style={styles.list}>
              {b.items.map((it, j) => (
                <View key={j} style={styles.listItem}>
                  <Text style={[styles.bullet, bulletStyle]}>•</Text>
                  <Text style={[styles.base, baseStyle, { flex: 1 }]}>
                    {renderInline(it, `l${i}-${j}`)}
                  </Text>
                </View>
              ))}
            </View>
          );
        }
        return (
          <Text key={i} style={[styles.paragraph, baseStyle]}>
            {renderInline(b.text, `p${i}`)}
          </Text>
        );
      })}
    </View>
  );
}

function parseBlocks(text) {
  const lines = text.split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3).trim() });
      i++;
    } else if (line.startsWith('> ')) {
      const chunk = [line.slice(2).trim()];
      i++;
      while (i < lines.length && lines[i].startsWith('> ')) {
        chunk.push(lines[i].slice(2).trim());
        i++;
      }
      blocks.push({ type: 'quote', text: chunk.join(' ') });
    } else if (line.startsWith('- ')) {
      const items = [line.slice(2).trim()];
      i++;
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2).trim());
        i++;
      }
      blocks.push({ type: 'list', items });
    } else {
      // paragrafo: ate proxima linha em branco
      const chunk = [line];
      i++;
      while (i < lines.length && lines[i].trim() && !lines[i].match(/^(##|> |- )/)) {
        chunk.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'paragraph', text: chunk.join(' ') });
    }
  }
  return blocks;
}

function splitGlossaryLinks(str) {
  const re = /\[\[([^\]]+)\]\]/g;
  const parts = [];
  let last = 0;
  let m;
  while ((m = re.exec(str)) !== null) {
    if (m.index > last) parts.push({ type: 'text', text: str.slice(last, m.index) });
    const term = m[1];
    const exists = !!glossaryByTerm(term);
    parts.push({ type: exists ? 'glossary' : 'text', term, text: term });
    last = m.index + m[0].length;
  }
  if (last < str.length) parts.push({ type: 'text', text: str.slice(last) });
  return parts;
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    base: { color: c.text, fontSize: fs(16), lineHeight: fs(26) },
    paragraph: { color: c.text, fontSize: fs(16), lineHeight: fs(26), marginBottom: 14 },
    h2: { color: c.primaryText, fontSize: fs(18), fontWeight: 'bold', marginTop: 18, marginBottom: 8 },
    quote: {
      borderLeftWidth: 3,
      borderLeftColor: c.accent,
      paddingLeft: 12,
      paddingVertical: 6,
      marginBottom: 14,
      backgroundColor: c.badgeBg,
    },
    quoteText: { color: c.text, fontSize: fs(15), lineHeight: fs(24), fontStyle: 'italic' },
    list: { marginBottom: 14 },
    listItem: { flexDirection: 'row', marginBottom: 6, paddingRight: 8 },
    bullet: { color: c.accent, fontSize: fs(16), marginRight: 8, lineHeight: fs(26) },
    link: { color: c.accent, textDecorationLine: 'underline', fontSize: fs(16), lineHeight: fs(26) },
  });
