import { useTheme } from '../context/ThemeContext';
import { Group, Row, Sheet } from './ui';

// Folha de ações de um item das listas do usuário (uma marcação, uma nota):
// título com a referência e uma lista agrupada de ações
// { icon, label, onPress, danger }. A ação roda depois que a folha fechou
// (duração de saída do Sheet mais uma folga), porque no nativo um Alert ou a
// folha de compartilhar apresentados por cima de um Modal que ainda está
// fechando podem não aparecer. Na web o atraso curto ainda cabe na janela de
// ativação do usuário que o navigator.share exige.
export default function ItemActionsSheet({ visible, title, actions, onClose }) {
  const { colors, tokens } = useTheme();
  const { motion } = tokens;

  const run = (action) => {
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
