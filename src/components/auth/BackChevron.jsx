import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { BackButton } from '../HeaderButton';

// Botão voltar das telas de entrada sem header (Cadastro, Recuperar senha): o
// mesmo BackButton do resto do app (chevron no tint, alvo de 44), na linha
// das pílulas do topo, puxado para a esquerda para o traço do chevron cair um
// pouco antes do texto abaixo, como nas barras do app.
export default function BackChevron({ onPress }) {
  const { tokens } = useTheme();
  const { t } = useLanguage();
  const { space } = tokens;
  return (
    <BackButton
      a11yLabel={t('common.back')}
      onPress={onPress}
      style={{ alignSelf: 'flex-start', marginLeft: -space.md, marginBottom: space.lg }}
    />
  );
}
