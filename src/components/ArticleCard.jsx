import { memo } from 'react';
import { Image, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { categoryLabel, pick } from '../utils/i18nData';
import PressScale from './ui/PressScale';
import { articleThumb } from '../data/articleThumbs';

// Cartão de artigo da grade do desktop (aba Artigos em janela larga): imagem
// em 16:9 no topo, categoria, título e resumo. Mesmas props e mesmo texto
// acessível do ArticleListItem, que continua sendo a forma no celular.
// `width` vem da tela (a grade calcula a largura de cada coluna).
const ArticleCard = memo(function ArticleCard({ article, read = false, completed = false, showCategory = true, width, onPress }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, radius, icon } = tokens;

  const title = pick(article, 'title', isEn);
  const summary = pick(article, 'summary', isEn);
  const category = showCategory ? categoryLabel(article.category, t) : null;
  const readLabel = completed ? t('articles.completed') : t('articles.read');
  const done = read || completed;
  const meta = [title, category, done ? readLabel : null].filter(Boolean).join(', ');
  const doneColor = completed ? colors.accentText : colors.success;

  return (
    <PressScale
      role="button"
      aria-label={meta}
      testID="article-item"
      onPress={() => onPress?.(article.id)}
      style={({ hovered }) => ({
        width,
        borderRadius: radius.md,
        backgroundColor: colors.card,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: hovered ? colors.separator : 'transparent',
      })}
    >
      {/* Decorativa: o título vem escrito embaixo. */}
      <Image
        source={articleThumb(article)}
        aria-hidden
        accessible={false}
        resizeMode="cover"
        style={{ width, height: Math.round((width * 9) / 16), backgroundColor: colors.separator }}
      />
      <View style={{ padding: space.md, gap: space.xxs }}>
        {category || done ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs }}>
            {category ? (
              <Text style={[text('footnote'), { color: colors.textSubtle, flexShrink: 1 }]} numberOfLines={1}>
                {category}
              </Text>
            ) : null}
            {done ? (
              <Ionicons
                name={completed ? 'ribbon' : 'checkmark-circle'}
                size={icon.sm}
                color={doneColor}
                aria-label={readLabel}
                style={{ marginLeft: 'auto' }}
              />
            ) : null}
          </View>
        ) : null}
        <Text style={[text('headline'), { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        {summary ? (
          <Text style={[text('subhead'), { color: colors.textSubtle }]} numberOfLines={3}>
            {summary}
          </Text>
        ) : null}
      </View>
    </PressScale>
  );
});

export default ArticleCard;
