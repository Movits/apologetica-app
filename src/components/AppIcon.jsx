import { Ionicons } from '@expo/vector-icons';

// Renderiza um ícone de Ionicons. Os chamadores ainda podem passar `set`
// ('ion' | 'mci'), que hoje é ignorado: a prop existia para escolher
// MaterialCommunityIcons (o único uso era 'church' na categoria Igreja
// Católica) e sumiu junto com o import de MCI, para a fonte (~1 MB) sair do
// bundle web.
export default function AppIcon({ name, size, color, style }) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}
