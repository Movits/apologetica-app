import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { PressScale } from '../ui';

// Botão voltar das telas de entrada sem header (Cadastro, Recuperar senha):
// chevron no tint, alvo de 44, na linha das pílulas do topo, puxado para a
// esquerda para o ícone alinhar com o texto abaixo.
export default function BackChevron({ onPress }) {
  const { colors, tokens } = useTheme();
  const { t } = useLanguage();
  const { space, icon } = tokens;
  return (
    <PressScale
      role="button"
      aria-label={t('common.back')}
      onPress={onPress}
      style={{ alignSelf: 'flex-start', minWidth: 44, minHeight: 44, justifyContent: 'center', marginLeft: -space.sm, marginBottom: space.lg }}
    >
      <Ionicons name="chevron-back" size={icon.lg} color={colors.tint} />
    </PressScale>
  );
}
