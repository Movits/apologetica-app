import { Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Group, Row, Sheet } from './ui';

// Folha de ações de um item das listas do usuário (uma marcação, uma nota, um
// favorito): título com a referência e uma lista agrupada de ações
// { icon, label, onPress, danger }.
//
// Quando a ação roda depende da plataforma. Na web ela roda dentro do gesto e
// antes de fechar a folha: o navigator.share exige a ativação do usuário e,
// disparado de um setTimeout, o Safari recusa (NotAllowedError). Só as
// destrutivas esperam a folha fechar, para a confirmação não abrir por cima
// dela. No nativo tudo espera a saída do Sheet (duração mais uma folga): um
// Alert ou a folha de compartilhar são apresentados a partir do Modal e, se
// ele ainda está fechando, são descartados junto com ele.
export default function ItemActionsSheet({ visible, title, actions, onClose }) {
  const { colors, tokens } = useTheme();
  const { motion } = tokens;

  const run = (action) => {
    if (Platform.OS === 'web' && !action.danger) {
      action.onPress?.();
      onClose?.();
      return;
    }
    onClose?.();
    setTimeout(() => action.onPress?.(), motion.aba + motion.stagger);
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <Group>
        {(actions || []).map((action) => (
          <Row
            key={action.label}
            icon={action.icon}
            iconColor={action.danger ? colors.danger : undefined}
            title={action.label}
            onPress={() => run(action)}
          />
        ))}
      </Group>
    </Sheet>
  );
}
