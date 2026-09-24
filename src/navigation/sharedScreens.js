import TodayScreen from '../screens/TodayScreen';
import NotebookScreen from '../screens/NotebookScreen';
import NotebookPageScreen from '../screens/NotebookPageScreen';
import GlossaryScreen from '../screens/GlossaryScreen';
import RosaryScreen from '../screens/RosaryScreen';
import ExamConscienceScreen from '../screens/ExamConscienceScreen';
import HighlightsScreen from '../screens/HighlightsScreen';
import NotesScreen from '../screens/NotesScreen';
import LiturgyScreen from '../screens/LiturgyScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import RefDetailScreen from '../screens/RefDetailScreen';
import QuizScreen from '../screens/QuizScreen';
import DialogueScreen from '../screens/DialogueScreen';
import DebateStrategiesScreen from '../screens/DebateStrategiesScreen';
import BibleMapScreen from '../screens/BibleMapScreen';
import LegalScreen from '../screens/LegalScreen';

// Telas secundárias registradas em mais de um stack de aba. Cada stack (Início,
// Artigos, Ferramentas, Ajustes) chama isto dentro do próprio Navigator:
//
//   <HomeNav.Navigator screenOptions={...}>
//     <HomeNav.Screen name="HomeMain" ... />
//     {sharedScreens(HomeNav, t)}
//   </HomeNav.Navigator>
//
// A duplicação de registro é de propósito (CLAUDE.md): o tap resolve dentro
// da aba ativa e a tab bar continua visível. Os nomes de rota são API
// (deep links em App.js, navigate(...) nas telas): não mudar.
//
// É uma função chamada inline, não um componente. O useNavigationBuilder do
// @react-navigation/core 6.4 só aceita Screen, Group e Fragment como filhos
// diretos e desce dentro de Group/Fragment (node_modules/@react-navigation/
// core/lib/module/useNavigationBuilder.js:56-63); qualquer outro elemento,
// como um componente próprio em JSX, lança na linha :67. A chamada devolve um
// <Nav.Group>, que é aceito.
//
// Ficam de fora: as raízes (HomeMain, ToolsMain, SettingsMain, ArticlesList,
// ArticleDetail), as que existem num stack só (References, Tools, Search em
// Início) e CategoryArticles, que precisa de isEn e só tem chamador em Início.
export function sharedScreens(Nav, t) {
  return (
    <Nav.Group>
      <Nav.Screen name="Today" component={TodayScreen} options={{ title: t('header.today') }} />
      <Nav.Screen name="Notebook" component={NotebookScreen} options={{ title: t('header.notebook') }} />
      <Nav.Screen name="NotebookPage" component={NotebookPageScreen} options={{ title: t('header.notebook') }} />
      <Nav.Screen name="Glossary" component={GlossaryScreen} options={{ title: t('header.glossary') }} />
      <Nav.Screen name="Rosary" component={RosaryScreen} options={{ title: t('header.rosary') }} />
      <Nav.Screen name="ExamConscience" component={ExamConscienceScreen} options={{ title: t('header.exam') }} />
      <Nav.Screen name="Highlights" component={HighlightsScreen} options={{ title: t('header.highlights') }} />
      <Nav.Screen name="Notes" component={NotesScreen} options={{ title: t('header.notes') }} />
      <Nav.Screen name="Liturgy" component={LiturgyScreen} options={{ title: t('header.liturgy') }} />
      {/* O mesmo ArticleDetailScreen também vive como 'ArticleDetail' no stack
          de Artigos; ele faz push(route.name) para funcionar sob os dois nomes. */}
      <Nav.Screen name="ArticleFromSearch" component={ArticleDetailScreen} options={{ title: t('header.article') }} />
      <Nav.Screen name="RefDetail" component={RefDetailScreen} options={{ title: t('header.reference') }} />
      <Nav.Screen name="Quiz" component={QuizScreen} options={{ title: t('header.quiz') }} />
      <Nav.Screen name="Dialogue" component={DialogueScreen} options={{ title: t('header.dialogue') }} />
      <Nav.Screen name="DebateStrategies" component={DebateStrategiesScreen} options={{ title: t('header.debate') }} />
      <Nav.Screen name="BibleMap" component={BibleMapScreen} options={{ title: t('header.bibleMap') }} />
      <Nav.Screen
        name="Legal"
        component={LegalScreen}
        options={({ route }) => ({ title: route.params?.kind === 'terms' ? t('settings.terms') : t('settings.privacy') })}
      />
    </Nav.Group>
  );
}
