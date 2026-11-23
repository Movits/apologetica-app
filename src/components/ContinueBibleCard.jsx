import { useLanguage } from '../context/LanguageContext';
import { Group, Row } from './ui';

// "Último aberto" na lista de livros da Bíblia: só um atalho para o capítulo
// aberto por último fora da leitura contínua (busca, referência, terço,
// grade). Porcentagem e capítulos lidos ficam no cartão "Minha leitura", que
// é a leitura de verdade. Só aparece quando existe uma posição salva (ver
// src/utils/bibleProgress.js) e nunca sequestra a navegação.
export default function ContinueBibleCard({ label, onPress, style }) {
  const { t } = useLanguage();
  const title = t('bible.lastOpenedIn', { ref: label });
  return (
    <Group style={style}>
      <Row icon="book-outline" title={title} trailing="chevron" onPress={onPress} accessibilityLabel={title} />
    </Group>
  );
}
