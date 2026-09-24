import { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Appearance, Platform } from 'react-native';
import { LIGHT, DARK } from '../context/ThemeContext';
import { space, radius, textStyle, fontFamilyFor } from '../theme/tokens';

// Este boundary embrulha o ThemeProvider em App.js, então não pode usar
// useTheme(): lê as paletas exportadas e escolhe pelo esquema do sistema, e
// compõe os papéis de texto direto dos tokens, sem a escala de fonte do tema.
// Só papéis em sans, porque a fonte de títulos pode não ter carregado quando o
// erro acontece.
const FAMILIES = fontFamilyFor(Platform.OS);
const semEscala = (n) => n;

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log local. Quando Sentry estiver plugado, captura aqui.
    if (global.Sentry?.Native?.captureException) {
      try { global.Sentry.Native.captureException(error); } catch {}
    }
    if (__DEV__) console.error('ErrorBoundary:', error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      const styles = makeStyles(Appearance.getColorScheme() === 'dark' ? DARK : LIGHT);
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Ops, algo deu errado</Text>
          <Text style={styles.body}>
            Encontramos um problema inesperado. Toque abaixo para tentar de novo.
          </Text>
          {__DEV__ && this.state.error ? (
            <Text style={styles.err}>{String(this.state.error?.message || this.state.error)}</Text>
          ) : null}
          <TouchableOpacity style={styles.btn} onPress={this.reset} role="button">
            <Text style={styles.btnText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

// Fundo navy (primary) com texto e botão em dourado (accent), nos dois temas.
const makeStyles = (c) =>
  StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: space.xxl, backgroundColor: c.primary },
    title: { ...textStyle('title3', semEscala, FAMILIES), color: c.onPrimary, marginBottom: space.sm },
    body: { ...textStyle('subhead', semEscala, FAMILIES), color: c.accent, textAlign: 'center', marginBottom: space.md },
    err: { ...textStyle('caption2', semEscala, FAMILIES), color: c.heroSub, textAlign: 'center', marginBottom: space.md, fontFamily: 'monospace' },
    btn: { backgroundColor: c.accent, paddingHorizontal: space.xl, paddingVertical: space.sm, borderRadius: radius.md },
    btnText: { ...textStyle('headline', semEscala, FAMILIES), color: c.primary },
  });
