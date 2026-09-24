import { useRef } from 'react';
import { Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Group, Row, Sheet } from './ui';

// Folha de ações de um item das listas do usuário (uma marcação, uma nota, um
// favorito): aberta enquanto `item` existe, título com a referência e uma
// lista agrupada de ações { icon, label, onPress, danger }. O pai guarda só o
// item ativo (useState(null)) e o zera em `onClose`.
//
// Quando a ação roda depende da plataforma. Na web ela roda dentro do gesto e
// antes de fechar a folha: o navigator.share exige a ativação do usuário e,
// disparado depois, o Safari recusa (NotAllowedError). Só as destrutivas
// esperam a folha fechar, para a confirmação não abrir por cima dela. No
// nativo tudo espera a saída do Sheet (`onDismissed`, o Modal já saindo de
// cena): um Alert ou a folha de compartilhar são apresentados a partir do
// Modal e, se ele ainda está fechando, são descartados junto com ele.
export default function ItemActionsSheet({ item, title, actions, onClose }) {
  const { colors } = useTheme();

  // Enquanto a folha anima a saída, `item` já é null e o pai manda título e
  // ações vazios: guarda o último estado para o conteúdo não sumir antes.
  const snap = useRef({ title: '', actions: [] });
  if (item) snap.current = { title, actions: actions || [] };
  const shown = snap.current;
  // A ação que espera a folha terminar de sair.
  const pending = useRef(null);

  const run = (action) => {
    if (Platform.OS === 'web' && !action.danger) {
      action.onPress?.();
      onClose?.();
      return;
    }
    pending.current = action.onPress;
    onClose?.();
  };

  const dismissed = () => {
    const fn = pending.current;
    pending.current = null;
    fn?.();
  };

  return (
    <Sheet visible={Boolean(item)} onClose={onClose} onDismissed={dismissed} title={shown.title}>
      <Group>
        {shown.actions.map((action) => (
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
