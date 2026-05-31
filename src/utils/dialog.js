import { Platform, Alert } from 'react-native';

// Diálogos multiplataforma. No react-native-web o Alert.alert é no-op, então na
// web usamos window.confirm/window.alert. No nativo, usamos o Alert nativo.

// Confirmação com ação (ex.: excluir, sair). Chama onConfirm se confirmado.
export function confirmAction({
  title,
  message,
  confirmText,
  cancelText,
  destructive = false,
  onConfirm,
  onCancel,
}) {
  if (Platform.OS === 'web') {
    const ok = window.confirm([title, message].filter(Boolean).join('\n\n'));
    if (ok) onConfirm?.();
    else onCancel?.();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelText || 'Cancelar', style: 'cancel', onPress: onCancel },
    {
      text: confirmText || 'OK',
      style: destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ]);
}

// Aviso simples (título + mensagem), sem ação.
export function notify(title, message) {
  if (Platform.OS === 'web') {
    window.alert([title, message].filter(Boolean).join('\n\n'));
    return;
  }
  Alert.alert(title, message);
}
