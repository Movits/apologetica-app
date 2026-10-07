import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

// Marca vetorial de uma conquista ou nível da Jornada, desenhada com os
// elementos de src/data/journeyMarks.js no mesmo sistema do BrandMark: caixa
// 64 x 64, traço de 4,5 com pontas redondas, uma cor só (a do chamador).
// `fill: true` num elemento preenche com a cor em vez de traçar (áreas
// pequenas e sólidas, como a cruz do BrandMark). Decorativa: quem a embrulha
// (BadgeEmblem, aria-hidden) já a esconde do leitor de tela.
const STROKE = 4.5;
const TAGS = { path: Path, circle: Circle, rect: Rect, line: Line, polyline: Polyline, polygon: Polygon };

export default function EmblemMark({ elements, color, size }) {
  if (!elements || !elements.length) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {elements.map((e, i) => {
        const Tag = TAGS[e.tag];
        if (!Tag) return null;
        const { tag: _tag, fill, strokeWidth, linecap, ...attrs } = e;
        return (
          <Tag
            key={i}
            {...attrs}
            fill={fill ? color : 'none'}
            stroke={fill ? 'none' : color}
            strokeWidth={strokeWidth ?? STROKE}
            strokeLinecap={linecap || 'round'}
            strokeLinejoin="round"
          />
        );
      })}
    </Svg>
  );
}
