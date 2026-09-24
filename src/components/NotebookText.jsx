import { Fragment } from 'react';
import { Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Renderiza o texto de uma página do caderno, transformando os tokens de
// referência em links:
//   @[Mt 16,18](v:mt/16/18)        -> versículo  (onOpenVerse)
//   @[Igreja Católica](a:igreja...) -> artigo     (onOpenArticle)
//   @[Mt 16,18 (CIC)](r:mt-16-18)   -> referência do app (onOpenRef)
// O restante é texto normal em text('reading'); os links vão em tint com
// sublinhado. Parágrafos são as quebras de linha do próprio texto.
const REF_RE = /@\[([^\]]+)\]\((v|a|r):([^)]+)\)/g;

// Referências citadas num texto, na ordem em que aparecem e sem repetição:
// [{ kind: 'v' | 'a' | 'r', label, payload }]. A página do caderno lista
// essas referências como linhas abaixo do texto.
export function extractRefs(text) {
  const out = [];
  const seen = new Set();
  for (const m of String(text || '').matchAll(REF_RE)) {
    const key = `${m[2]}:${m[3]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ kind: m[2], label: m[1], payload: m[3] });
  }
  return out;
}

// Despacha uma referência para o handler do tipo dela.
export function openRef({ kind, payload }, { onOpenVerse, onOpenArticle, onOpenRef }) {
  if (kind === 'v') {
    const [bookId, chapter, verse] = payload.split('/');
    onOpenVerse?.(bookId, Number(chapter), Number(verse));
  } else if (kind === 'r') {
    onOpenRef?.(payload);
  } else {
    onOpenArticle?.(payload);
  }
}

export default function NotebookText({ text: content, onOpenVerse, onOpenArticle, onOpenRef, style }) {
  const { colors, text } = useTheme();
  const handlers = { onOpenVerse, onOpenArticle, onOpenRef };
  const link = { color: colors.tint, textDecorationLine: 'underline' };

  const renderInline = (str, keyBase) => {
    const out = [];
    let last = 0;
    for (const m of str.matchAll(REF_RE)) {
      if (m.index > last) out.push(<Fragment key={`${keyBase}-t${last}`}>{str.slice(last, m.index)}</Fragment>);
      const ref = { kind: m[2], label: m[1], payload: m[3] };
      out.push(
        <Text key={`${keyBase}-r${m.index}`} role="link" style={link} onPress={() => openRef(ref, handlers)}>
          {ref.label}
        </Text>
      );
      last = m.index + m[0].length;
    }
    if (last < str.length) out.push(<Fragment key={`${keyBase}-end`}>{str.slice(last)}</Fragment>);
    return out;
  };

  const lines = String(content || '').split('\n');

  return (
    <Text style={[text('reading'), { color: colors.text }, style]}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {renderInline(line, `l${i}`)}
          {i < lines.length - 1 ? '\n' : null}
        </Fragment>
      ))}
    </Text>
  );
}
