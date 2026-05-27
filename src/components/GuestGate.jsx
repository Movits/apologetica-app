import { useAuth } from '../context/AuthContext';
import { useAccountPrompt } from './AccountPrompt';

// Hook que retorna uma função "requireAccount(callback, opts?)":
//   - Se o usuário está logado, executa o callback normalmente.
//   - Se é visitante (guest), abre o modal "Criar conta?" customizado.
//
// Uso: const requireAccount = useRequireAccount();
//      <Button onPress={() => requireAccount(() => fazAlgumaCoisa())} />
//
// opts opcionais: { title, message, icon } pra customizar o modal por contexto.
export function useRequireAccount() {
  const { user } = useAuth();
  const { show } = useAccountPrompt();

  return (callback, opts) => {
    if (user) {
      callback?.();
      return;
    }
    show(opts);
  };
}
