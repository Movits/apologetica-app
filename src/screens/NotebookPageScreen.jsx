import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { confirmAction, notify } from '../utils/dialog';
import {
  addNotebookPage, updateNotebookPage, removeNotebookPage, getNotebookPage,
} from '../services/userData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import NotebookText, { extractRefs, openRef } from '../components/NotebookText';
import ReferencePickerModal from '../components/ReferencePickerModal';
import HeaderButton from '../components/HeaderButton';
import { openBible, openArticle as openArticleScreen } from '../navigation/links';
import { Button, Field, Group, Row, SectionTitle } from '../components/ui';

// Ícone da linha de cada referência citada, por tipo de token.
const REF_ICON = { v: 'book-outline', a: 'document-text-outline', r: 'bookmark-outline' };

// Uma página do caderno em dois modos. Leitura: título em display, o texto
// em text('reading') com os tokens virando links, e as referências citadas
// listadas como linhas abaixo. Edição: título e texto em Fields dentro de um
// Group, botão para inserir referência (o "@" digitado também abre o
// seletor) e "Salvar" no header. Página nova começa em edição.
export default function NotebookPageScreen({ route, navigation }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space } = tokens;

  const initialId = route.params?.pageId || null;
  const [pageId, setPageId] = useState(initialId);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mode, setMode] = useState(initialId ? 'read' : 'edit');
  const [loading, setLoading] = useState(Boolean(initialId));
  const [busy, setBusy] = useState(false);
  const [picker, setPicker] = useState({ open: false, pos: 0, replace: false });
  const selRef = useRef({ start: 0, end: 0 });

  // Carrega a página existente (só a que chegou pelos params: depois de
  // salvar uma nova, o id muda mas o texto já está em memória).
  useEffect(() => {
    if (!initialId) return undefined;
    let alive = true;
    getNotebookPage(initialId)
      .then((page) => {
        if (!alive) return;
        if (page) {
          setTitle(page.title || '');
          setBody(page.text || '');
        }
        setLoading(false);
      })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [initialId]);

  const save = async () => {
    if (!title.trim() && !body.trim()) {
      // nada a salvar: volta sem criar página vazia
      navigation.goBack();
      return;
    }
    setBusy(true);
    try {
      if (pageId) {
        await updateNotebookPage(pageId, { title: title.trim(), text: body });
      } else {
        const ref = await addNotebookPage({ title: title.trim(), text: body });
        setPageId(ref.id);
      }
      setMode('read');
    } catch (e) {
      notify(isEn ? 'Error' : 'Erro', e.message || (isEn ? 'Could not save.' : 'Não foi possível salvar.'));
    } finally {
      setBusy(false);
    }
  };
  // O header lê a versão atual pela ref, então o efeito abaixo só depende do
  // que muda o visual (modo e ocupado), sem closure velha nem re-set por render.
  const saveRef = useRef(save);
  saveRef.current = save;

  const confirmDelete = () => {
    if (!pageId) return navigation.goBack();
    confirmAction({
      title: isEn ? 'Delete page?' : 'Excluir página?',
      message: isEn ? 'This page will be permanently removed.' : 'Esta página será removida permanentemente.',
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      destructive: true,
      onConfirm: async () => {
        await removeNotebookPage(pageId);
        navigation.goBack();
      },
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        mode === 'edit' ? (
          <HeaderButton label={t('common.save')} loading={busy} onPress={() => saveRef.current()} />
        ) : (
          <HeaderButton icon="create-outline" label={t('common.edit')} onPress={() => setMode('edit')} />
        ),
    });
  }, [navigation, mode, busy, t]);

  // Detecta '@' digitado para abrir o seletor de referência.
  const onChangeText = (next) => {
    if (next.length === body.length + 1) {
      const pos = selRef.current.start; // cursor antes da inserção
      if (next[pos] === '@') {
        setPicker({ open: true, pos, replace: true });
      }
    }
    setBody(next);
  };

  const insertReference = (token) => {
    setBody((prev) => {
      const pos = Math.min(picker.pos, prev.length);
      const before = prev.slice(0, pos);
      const after = prev.slice(pos + (picker.replace ? 1 : 0)); // remove o '@' se for o caso
      return `${before}${token} ${after}`;
    });
  };

  const handlers = {
    onOpenVerse: (bookId, chapter, verse) => openBible(navigation, { bookId, chapter, verse }),
    onOpenArticle: (articleId) => openArticleScreen(navigation, articleId),
    onOpenRef: (refId) => navigation.navigate('RefDetail', { highlightId: refId }),
  };
  const refs = useMemo(() => extractRefs(body), [body]);
  const kindLabel = { v: t('common.verse'), a: t('header.article'), r: t('header.reference') };
  const readingLine = text('reading').lineHeight;

  const deleteButton = pageId ? (
    <Button
      variant="plain"
      label={t('notebook.deletePage')}
      textStyle={{ color: colors.danger }}
      onPress={confirmDelete}
      disabled={busy}
    />
  ) : null;

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: space.md, paddingBottom: space.xxl, gap: space.md }}
      >
        {mode === 'edit' ? (
          <>
            <Group>
              <Field
                label={isEn ? 'Title' : 'Título'}
                value={title}
                onChangeText={setTitle}
                inputStyle={text('headline')}
                returnKeyType="next"
              />
              <Field
                aria-label={isEn ? 'Page text' : 'Texto da página'}
                value={body}
                onChangeText={onChangeText}
                onSelectionChange={(e) => { selRef.current = e.nativeEvent.selection; }}
                placeholder={isEn ? 'Write freely. Type @ to link a verse or article.' : 'Escreva à vontade. Digite @ para citar um versículo ou artigo.'}
                multiline
                autoFocus={!initialId}
                inputStyle={[text('reading'), { minHeight: readingLine * 8 }]}
              />
            </Group>
            <Button
              variant="secondary"
              icon="at-outline"
              label={t('notebook.addReference')}
              onPress={() => setPicker({ open: true, pos: selRef.current.start, replace: false })}
            />
            {deleteButton}
          </>
        ) : (
          <>
            {title.trim() ? (
              <Text role="heading" style={[text('title'), { color: colors.text }]}>{title}</Text>
            ) : null}
            <NotebookText text={body} {...handlers} />
            {refs.length ? (
              <View>
                <SectionTitle title={t('notebook.references')} style={{ marginHorizontal: 0, marginTop: 0 }} />
                <Group>
                  {refs.map((r) => (
                    <Row
                      key={`${r.kind}:${r.payload}`}
                      icon={REF_ICON[r.kind]}
                      title={r.label}
                      subtitle={kindLabel[r.kind]}
                      trailing="chevron"
                      onPress={() => openRef(r, handlers)}
                    />
                  ))}
                </Group>
              </View>
            ) : null}
            {deleteButton}
          </>
        )}
      </ScrollView>

      <ReferencePickerModal
        visible={picker.open}
        onClose={() => setPicker((p) => ({ ...p, open: false }))}
        onPick={insertReference}
      />
    </KeyboardAvoidingView>
  );
}
