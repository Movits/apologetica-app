import { useTheme } from '../../context/ThemeContext';
import Row from './Row';
import ProgressBar from './ProgressBar';

// Linha "continuar de onde parou" para dentro de um Group: ícone, título (até
// duas linhas), subtítulo e, quando há `progress` (0 a 1), uma ProgressBar de
// 3 px abaixo do subtítulo. Não lê armazenamento nenhum: quem chama resolve os
// dados (a Início lê o último artigo aberto em utils/lastRead.js; a Bíblia, o
// capítulo onde parou) e passa aqui. Sem `progress` numérico a barra não
// aparece, para não desenhar uma trilha vazia quando o app não tem o dado.
export default function ContinueRow({
  icon = 'reader-outline',
  title,
  subtitle,
  progress,
  progressLabel,
  onPress,
  accessibilityLabel,
  style,
}) {
  const { tokens } = useTheme();
  const hasProgress = typeof progress === 'number' && Number.isFinite(progress);

  return (
    <Row
      icon={icon}
      title={title}
      subtitle={subtitle}
      titleLines={2}
      trailing="chevron"
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      {hasProgress ? (
        <ProgressBar
          value={progress}
          accessibilityLabel={progressLabel}
          style={{ marginTop: tokens.space.xs }}
        />
      ) : null}
    </Row>
  );
}
