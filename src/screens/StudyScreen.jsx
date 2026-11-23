import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Chip, ChipRow } from '../components/ui';
import { COLUMN_MAX, centeredColumn } from '../components/ReadingColumn';
import FavoritesScreen from './FavoritesScreen';
import HighlightsScreen from './HighlightsScreen';
import NotesScreen from './NotesScreen';
import NotebookScreen from './NotebookScreen';

// Meu Estudo: uma tela só para o que a pessoa guardou, com um segmento por
// tipo (favoritos, marcações, notas, caderno). Antes eram quatro linhas em
// Praticar levando a quatro telas iguais. Cada segmento é a tela antiga
// inteira (as rotas Favorites, Highlights, Notes e Notebook continuam
// registradas e abrem direto); `route.params.tab` escolhe o segmento inicial.
// Visitante: as telas de conta já mostram o GuestGate sozinhas.
const TABS = [
  { id: 'favorites', label: 'study.favorites', Screen: FavoritesScreen },
  { id: 'highlights', label: 'study.highlights', Screen: HighlightsScreen },
  { id: 'notes', label: 'study.notes', Screen: NotesScreen },
  { id: 'notebook', label: 'study.notebook', Screen: NotebookScreen },
];

export default function StudyScreen({ navigation, route }) {
  const { colors, tokens } = useTheme();
  const { t } = useLanguage();
  const { space } = tokens;
  const [tab, setTab] = useState(() => (TABS.some((x) => x.id === route?.params?.tab) ? route.params.tab : 'favorites'));
  const current = TABS.find((x) => x.id === tab);

  // O Caderno põe o "+" no header; nos outros segmentos ele sai.
  useEffect(() => {
    if (tab !== 'notebook') navigation.setOptions({ headerRight: undefined });
  }, [tab, navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: space.md, paddingTop: space.sm, ...centeredColumn(COLUMN_MAX, space.md) }}>
        <ChipRow role="tablist">
          {TABS.map((x) => (
            <Chip key={x.id} label={t(x.label)} selected={tab === x.id} onPress={() => setTab(x.id)} haptic />
          ))}
        </ChipRow>
      </View>
      <current.Screen navigation={navigation} route={route} />
    </View>
  );
}
