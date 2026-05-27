import { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Ops, algo deu errado</Text>
          <Text style={styles.body}>
            Encontramos um problema inesperado. Toque abaixo para tentar de novo.
          </Text>
          {__DEV__ && this.state.error ? (
            <Text style={styles.err}>{String(this.state.error?.message || this.state.error)}</Text>
          ) : null}
          <TouchableOpacity style={styles.btn} onPress={this.reset}>
            <Text style={styles.btnText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#1a3a5c' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  body: { fontSize: 14, color: '#c9a84c', textAlign: 'center', marginBottom: 16, lineHeight: 22 },
  err: { fontSize: 11, color: '#ffd', textAlign: 'center', marginBottom: 16, fontFamily: 'monospace' },
  btn: { backgroundColor: '#c9a84c', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  btnText: { color: '#1a3a5c', fontWeight: 'bold', fontSize: 15 },
});
