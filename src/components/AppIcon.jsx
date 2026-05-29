import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Renderiza um ícone de Ionicons (padrão) ou MaterialCommunityIcons conforme `set`.
// Permite que os metadados de categoria/fonte escolham o conjunto de ícones mais
// adequado (ex.: 'church' só existe em MaterialCommunityIcons).
export default function AppIcon({ set = 'ion', name, size, color, style }) {
  return set === 'mci'
    ? <MaterialCommunityIcons name={name} size={size} color={color} style={style} />
    : <Ionicons name={name} size={size} color={color} style={style} />;
}
