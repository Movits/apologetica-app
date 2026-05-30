import { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { watchNotebook } from '../services/userData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

// Remove tokens de referência do preview: @[Mt 16,18](v:..) -> Mt 16,18
const stripRefs = (s) => String(s || '').replace(/@\[([^\]]+)\]\((?:v|a|r):[^)]+\)/g, '$1');

export default function NotebookScreen({ navigation }) {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const { user, exitGuest } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const styles = makeStyles(colors, fs);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('NotebookPage', {})} hitSlop={10} style={{ paddingRight: 4 }}>
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const unsub = watchNotebook((list) => {
      setItems(list);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();

  if (loading) {
    return <View style={styles.center}><Text style={styles.muted}>{t('common.loading')}</Text></View>;
  }

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Ionicons name="lock-closed-outline" size={56} color={colors.textSubtle} />
        <Text style={styles.emptyTitle}>{t('empty.createAccount')}</Text>
        <Text style={styles.muted}>
          {isEn
            ? 'Your notebook is saved and synced between devices when you have an account.'
            : 'Seu caderno fica salvo e sincronizado entre dispositivos quando você tem conta.'}
        </Text>
        <TouchableOpacity
          style={{ marginTop: 16, backgroundColor: colors.accent, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 }}
          onPress={() => exitGuest()}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: fs(14) }}>{t('auth.signup')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="journal-outline" size={56} color={colors.textSubtle} />
          <Text style={styles.emptyTitle}>{isEn ? 'Your notebook is empty' : 'Seu caderno está vazio'}</Text>
          <Text style={styles.muted}>
            {isEn
              ? 'Tap + to create a page. Write freely and use @ to link verses and articles.'
              : 'Toque em + para criar uma página. Escreva à vontade e use @ para citar versículos e artigos.'}
          </Text>
          <TouchableOpacity
            style={{ marginTop: 16, backgroundColor: colors.accent, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 }}
            onPress={() => navigation.navigate('NotebookPage', {})}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: fs(14) }}>{isEn ? 'New page' : 'Nova página'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(p) => p.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            onScroll={onScroll}
            onContentSizeChange={onContentSizeChange}
            onLayout={onLayout}
            scrollEventThrottle={32}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('NotebookPage', { pageId: item.id })}
              >
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title?.trim() || (isEn ? 'Untitled' : 'Sem título')}
                </Text>
                {item.text ? (
                  <Text style={styles.cardBody} numberOfLines={3}>{stripRefs(item.text)}</Text>
                ) : null}
              </TouchableOpacity>
            )}
          />
          <ScrollHint direction="up" visible={showTop} />
          <ScrollHint direction="down" visible={showBottom} />
        </>
      )}
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
    emptyTitle: { fontSize: fs(17), fontWeight: 'bold', color: c.primaryText },
    muted: { fontSize: fs(13), color: c.textMuted, textAlign: 'center', lineHeight: fs(20) },
    card: { backgroundColor: c.card, borderRadius: 12, padding: 14, marginBottom: 8 },
    cardTitle: { fontSize: fs(15), fontWeight: 'bold', color: c.primaryText, marginBottom: 4 },
    cardBody: { fontSize: fs(13), color: c.textMuted, lineHeight: fs(19) },
  });
