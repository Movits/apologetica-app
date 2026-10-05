import { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { glossary, glossaryByTerm } from '../data/glossary';

// Renderiza um texto com markdown simples, no papel de leitura do tema
// (text('reading'), serifa do sistema):
//   ## Subtítulo          -> h2 (text('section'), display)
//   ### Subtítulo menor   -> h3 (text('headline'))
//   > citação             -> bloco com fundo `card` e cantos `radius.md`
//   - item                -> lista com marcador simples
//   **negrito** / *itálico* / _itálico_ -> ênfase inline
//   [[Theotokos]]         -> termo do glossário clicável (override manual)
// Além do [[ ]] manual, os termos do glossário são destacados AUTOMATICAMENTE:
// a 1a ocorrência de cada termo por artigo vira link (compartilhando um Set de
// ids ao longo de todos os blocos). Parágrafos são separados por linhas em branco.

// ---- Matcher do glossário (montado uma vez no módulo) ----
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// minúsculo -> entrada do glossário (cobre term e termEn).
const TERM_LOOKUP = (() => {
  const map = new Map();
  for (const g of glossary) {
    if (g.term) map.set(g.term.toLowerCase(), g);
    if (g.termEn) map.set(g.termEn.toLowerCase(), g);
  }
  return map;
})();

// Alternância única, termos mais longos primeiro ("Sola Scriptura" antes de "Sola").
// Sem \b (acentos quebram \b); a fronteira de palavra é checada na mão.
const MATCH_RE = (() => {
  const terms = [...TERM_LOOKUP.keys()].sort((a, b) => b.length - a.length).map(escapeRe);
  if (!terms.length) return null;
  return new RegExp(`(${terms.join('|')})`, 'giu');
})();

const isLetter = (ch) => !!ch && /\p{L}/u.test(ch);

// Ênfase inline: **negrito**, __negrito__, *itálico*, _itálico_. O conteúdo
// começa e termina em não-espaço e não atravessa linha; sem lookbehind, que o
// Hermes antigo não entende. Marcador de um caractere não pode conter outro
// marcador (evita casar "*a* e *b*" como um trecho só).
const INLINE_RE = /(\*\*|__)(\S(?:[^\n]*?\S)?)\1|(\*|_)(\S(?:[^*_\n]*?\S)?)\3/g;

// Quebra um trecho em pedaços { text, bold, italic }. Sublinhado colado em
// letra (snake_case) não é ênfase.
function splitInline(str) {
  const parts = [];
  let last = 0;
  INLINE_RE.lastIndex = 0;
  let m;
  while ((m = INLINE_RE.exec(str)) !== null) {
    const marker = m[1] || m[3];
    const inner = m[2] ?? m[4];
    const start = m.index;
    const end = start + m[0].length;
    if (marker === '_' && (isLetter(str[start - 1]) || isLetter(str[end]))) continue;
    if (start > last) parts.push({ text: str.slice(last, start) });
    parts.push({ text: inner, bold: marker.length === 2, italic: marker.length === 1 });
    last = end;
  }
  if (last < str.length) parts.push({ text: str.slice(last) });
  return parts;
}

// Quebra um trecho de texto puro destacando a 1a ocorrência (ainda não usada
// neste artigo) de cada termo do glossário.
function autoScan(str, linkedIds) {
  if (!MATCH_RE) return [{ type: 'text', text: str }];
  const parts = [];
  let last = 0;
  MATCH_RE.lastIndex = 0;
  let m;
  while ((m = MATCH_RE.exec(str)) !== null) {
    const w = m[0];
    const idx = m.index;
    // precisa estar isolado (não ser pedaço de outra palavra)
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

// Ênfase primeiro, links depois: assim "[[termo]]" ou um termo automático
// dentro de *itálico* continua virando link e herda a ênfase.
function inlineParts(str, linkedIds, auto) {
  const out = [];
  for (const seg of splitInline(str)) {
    for (const p of linkify(seg.text, linkedIds, auto)) {
      out.push(seg.bold || seg.italic ? { ...p, bold: seg.bold, italic: seg.italic } : p);
    }
  }
  return out;
}

function MarkdownText({ text: source, onOpenGlossary }) {
  const { colors, tokens, text } = useTheme();
  const auto = !!onOpenGlossary;
  const styles = useMemo(() => makeStyles(colors, tokens, text), [colors, tokens, text]);

  // Linkifica o artigo inteiro de uma vez, em ordem, com um Set compartilhado
  // -> garante "1a ocorrência por artigo" de forma determinística.
  const rendered = useMemo(() => {
    const blocks = parseBlocks(source || '');
    const linkedIds = new Set();
    return blocks.map((b) => {
      if (b.type === 'h2' || b.type === 'h3') return b; // títulos não recebem link
      if (b.type === 'list') return { ...b, itemParts: b.items.map((it) => inlineParts(it, linkedIds, auto)) };
      return { ...b, parts: inlineParts(b.text, linkedIds, auto) };
    });
  }, [source, auto]);

  const emphasis = (p) => [p.bold ? styles.bold : null, p.italic ? styles.italic : null];

  const renderParts = (parts, key) =>
    parts.map((p, i) => {
      if (p.type === 'glossary') {
        return (
          <Text key={`${key}-${i}`} style={[styles.link, emphasis(p)]} onPress={() => onOpenGlossary?.(p.term)}>
            {p.text}
          </Text>
        );
      }
      return (
        <Text key={`${key}-${i}`} style={[styles.base, emphasis(p)]}>
          {p.text}
        </Text>
      );
    });

  return (
    <View>
      {rendered.map((b, i) => {
        if (b.type === 'h2' || b.type === 'h3') {
          return (
            <Text key={i} role="heading" style={b.type === 'h2' ? styles.h2 : styles.h3}>
              {b.text}
            </Text>
          );
        }
        if (b.type === 'quote') {
          return (
            <View key={i} style={styles.quote}>
              <Text style={styles.quoteText}>{renderParts(b.parts, `q${i}`)}</Text>
            </View>
          );
        }
        if (b.type === 'list') {
          return (
            <View key={i} style={styles.list}>
              {b.items.map((it, j) => (
                <View key={j} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={[styles.base, styles.listText]}>{renderParts(b.itemParts[j], `l${i}-${j}`)}</Text>
                </View>
              ))}
            </View>
          );
        }
        return (
          <Text key={i} style={styles.paragraph}>
            {renderParts(b.parts, `p${i}`)}
          </Text>
        );
      })}
    </View>
  );
}

// Memo: a tela do artigo re-renderiza a cada evento de scroll (barra de
// progresso), e o corpo só muda quando o texto ou o handler mudam.
export default memo(MarkdownText);

function parseBlocks(text) {
  const lines = text.split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4).trim() });
      i++;
    } else if (line.startsWith('## ')) {
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
      // parágrafo: até a próxima linha em branco
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

// Tudo em tokens: papéis de texto do tema, espaço e raio da grade de 4 pt.
function makeStyles(c, { space, radius }, text) {
  const reading = text('reading');
  return {
    base: [reading, { color: c.text }],
    paragraph: [reading, { color: c.text, marginBottom: space.md }],
    h2: [text('section'), { color: c.text, marginTop: space.xl, marginBottom: space.sm }],
    h3: [text('headline'), { color: c.text, marginTop: space.lg, marginBottom: space.xs }],
    quote: { backgroundColor: c.card, borderRadius: radius.md, padding: space.md, marginBottom: space.md },
    quoteText: [reading, { color: c.text, fontStyle: 'italic' }],
    list: { marginBottom: space.md },
    listItem: { flexDirection: 'row', marginBottom: space.xxs },
    listText: { flex: 1 },
    bullet: [reading, { color: c.textSubtle, marginRight: space.xs }],
    // Mesmo destaque de antes (cor + sublinhado), só que na cor tint do tema.
    link: [reading, { color: c.tint, textDecorationLine: 'underline' }],
    bold: { fontWeight: '600' },
    italic: { fontStyle: 'italic' },
  };
}
