import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { categoryLabel, pick } from '../utils/i18nData';
import PressScale from './ui/PressScale';

// Item de lista de artigos (Onda 9), no espírito do Apple Books: capa quadrada
// à esquerda, título em headline, resumo em subhead secundário (2 linhas) e a
// linha de metadados em footnote (categoria e a marca de "lido"). Usado pela
// aba Artigos e pela lista por categoria. O separador entre itens vai à parte
// (ArticleListSeparator), recuado até o começo do texto.
//
// Props:
// - article: item de src/data/articles (title/titleEn, summary/summaryEn,
//   category, image).
// - read: mostra o checkmark de lido.
// - showCategory: esconde a categoria quando a lista já é de uma categoria só.
// - onPress: abre o artigo (a tela decide a rota).

// O lado da capa é tokens.thumb.md: a imagem do artigo é recortada em
// quadrado (cover).
export default function ArticleListItem({ article, read = false, showCategory = true, onPress }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, radius, icon, thumb } = tokens;

  const title = pick(article, 'title', isEn);
  const summary = pick(article, 'summary', isEn);
  const category = showCategory ? categoryLabel(article.category, t) : null;
  const readLabel = t('articles.read');
  const meta = [title, category, read ? readLabel : null].filter(Boolean).join(', ');
  const footnote = [text('footnote'), { color: colors.textTertiary }];

  return (
    <PressScale
      role="button"
      aria-label={meta}
      testID="article-item"
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: space.sm,
        paddingVertical: space.sm,
        minHeight: 44,
      }}
    >
      {/* Decorativa: o título vem escrito ao lado. */}
      <Image
        source={article.image}
        aria-hidden
        accessible={false}
        resizeMode="cover"
        style={{
          width: thumb.md,
          height: thumb.md,
          borderRadius: radius.md,
          backgroundColor: colors.separator,
        }}
      />
      <View style={{ flex: 1, minWidth: 0, gap: space.xxs }}>
        <Text style={[text('headline'), { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        {summary ? (
          <Text style={[text('subhead'), { color: colors.textSubtle }]} numberOfLines={2}>
            {summary}
          </Text>
        ) : null}
        {category || read ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs }}>
            {category ? (
              <Text style={[footnote, { flexShrink: 1 }]} numberOfLines={1}>{category}</Text>
            ) : null}
            {category && read ? <Text style={footnote}>·</Text> : null}
            {read ? (
              <>
                <Ionicons name="checkmark-circle" size={icon.sm} color={colors.success} />
                <Text style={[text('footnote'), { color: colors.success }]}>{readLabel}</Text>
              </>
            ) : null}
          </View>
        ) : null}
      </View>
    </PressScale>
  );
}

// Separador de meia linha entre itens, recuado até o texto (capa + vão), como
// o separatorInset das listas do iOS. Serve de ItemSeparatorComponent.
export function ArticleListSeparator() {
  const { colors, tokens } = useTheme();
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.separator,
        marginLeft: tokens.thumb.md + tokens.space.sm,
      }}
    />
  );
}
