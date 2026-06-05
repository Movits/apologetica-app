import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { glossary, glossaryByTerm } from '../data/glossary';

// Renderiza um texto com markdown simples:
//   ## Subtitulo          -> H2
//   > citacao             -> blockquote
//   - item                -> bullet
//   [[Theotokos]]         -> termo do glossario clicavel (override manual)
// Alem do [[ ]] manual, os termos do glossario sao destacados AUTOMATICAMENTE:
// a 1a ocorrencia de cada termo por artigo vira link (compartilhando um Set de
// ids ao longo de todos os blocos). Paragrafos sao separados por linhas em branco.

// ---- Matcher do glossario (montado uma vez no modulo) ----
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// minusculo -> entrada do glossario (cobre term e termEn).
const TERM_LOOKUP = (() => {
  const map = new Map();
  for (const g of glossary) {
    if (g.term) map.set(g.term.toLowerCase(), g);
    if (g.termEn) map.set(g.termEn.toLowerCase(), g);
  }
  return map;
})();

// Alternancia unica, termos mais longos primeiro ("Sola Scriptura" antes de "Sola").
// Sem \b (acentos quebram \b); a fronteira de palavra e checada na mao.
const MATCH_RE = (() => {
  const terms = [...TERM_LOOKUP.keys()].sort((a, b) => b.length - a.length).map(escapeRe);
  if (!terms.length) return null;
  return new RegExp(`(${terms.join('|')})`, 'giu');
})();

const isLetter = (ch) => !!ch && /\p{L}/u.test(ch);

// Quebra um trecho de texto puro destacando a 1a ocorrencia (ainda nao usada
// neste artigo) de cada termo do glossario.
function autoScan(str, linkedIds) {
  if (!MATCH_RE) return [{ type: 'text', text: str }];
  const parts = [];
  let last = 0;
  MATCH_RE.lastIndex = 0;
  let m;
  while ((m = MATCH_RE.exec(str)) !== null) {
    const w = m[0];
    const idx = m.index;
    // precisa estar isolado (nao ser pedaco de outra palavra)
    if (isLetter(str[idx - 1]) || isLetter(str[idx + w.length])) continue;
    const entry = TERM_LOOKUP.get(w.toLowerCase());
    if (!entry || linkedIds.has(entry.id)) continue;
    if (idx > last) parts.push({ type: 'text', text: str.slice(last, idx) });
    parts.push({ type: 'glossary', term: entry.term, text: w });
    linkedIds.add(entry.id);
    last = idx + w.length;
  }
  if (last < str.length) parts.push({ type: 'text', text: str.slice(last) });
  return parts;
}

// Resolve [[ ]] manuais e, no texto restante, roda o autoScan (quando auto=true).
function linkify(str, linkedIds, auto) {
  const out = [];
  const pushText = (chunk) => {
    if (!chunk) return;
    if (auto) autoScan(chunk, linkedIds).forEach((p) => out.push(p));
    else out.push({ type: 'text', text: chunk });
  };
  const re = /\[\[([^\]]+)\]\]/g;
  let last = 0;
  let m;
  while ((m = re.exec(str)) !== null) {
    if (m.index > last) pushText(str.slice(last, m.index));
    const term = m[1];
    const entry = glossaryByTerm(term);
    if (entry) {
      out.push({ type: 'glossary', term: entry.term, text: term });
      linkedIds.add(entry.id);
    } else {
      out.push({ type: 'text', text: term });
    }
    last = m.index + m[0].length;
  }
  if (last < str.length) pushText(str.slice(last));
  return out;
}

export default function MarkdownText({ text, onOpenGlossary, baseStyle, h2Style, quoteStyle, bulletStyle, linkStyle }) {
  const { colors, fs } = useTheme();
  const auto = !!onOpenGlossary;
  const styles = makeStyles(colors, fs);

  // Linkifica o artigo inteiro de uma vez, em ordem, com um Set compartilhado
  // -> garante "1a ocorrencia por artigo" de forma deterministica.
  const rendered = useMemo(() => {
    const blocks = parseBlocks(text || '');
    const linkedIds = new Set();
    return blocks.map((b) => {
      if (b.type === 'h2') return b; // headings nao recebem link
      if (b.type === 'list') return { ...b, itemParts: b.items.map((it) => linkify(it, linkedIds, auto)) };
      return { ...b, parts: linkify(b.text, linkedIds, auto) };
    });
  }, [text, auto]);

  const renderParts = (parts, key) =>
    parts.map((p, i) => {
      if (p.type === 'glossary') {
        return (
          <Text
            key={`${key}-${i}`}
            style={[styles.link, linkStyle]}
            onPress={() => onOpenGlossary?.(p.term)}
          >
            {p.text}
          </Text>
        );
      }
      return (
        <Text key={`${key}-${i}`} style={[styles.base, baseStyle]}>
          {p.text}
        </Text>
      );
    });

  return (
    <View>
      {rendered.map((b, i) => {
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
              <Text style={[styles.quoteText]}>{renderParts(b.parts, `q${i}`)}</Text>
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
                    {renderParts(b.itemParts[j], `l${i}-${j}`)}
                  </Text>
                </View>
              ))}
            </View>
          );
        }
        return (
          <Text key={i} style={[styles.paragraph, baseStyle]}>
            {renderParts(b.parts, `p${i}`)}
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
