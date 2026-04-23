import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  info: ErrorInfo | null;
}

/**
 * Top-level error boundary.
 *
 * Prevents the "black screen" failure mode where an unhandled React
 * render error takes down the entire app. Shows the error message +
 * stack so we can debug instead of staring into a void.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({ error, info });
    console.error('[ErrorBoundary]', error, info);
  }

  override render() {
    if (this.state.error) {
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>MAGNA-X · FEHLER</Text>
          <Text style={styles.title}>Da ist etwas schiefgegangen.</Text>
          <Text style={styles.body}>
            Die App ist abgestürzt. Bitte schick uns den unten stehenden Text, damit wir den
            Fehler beheben können.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Meldung</Text>
            <Text selectable style={styles.cardText}>
              {this.state.error.message}
            </Text>
          </View>

          {this.state.error.stack ? (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Stack</Text>
              <Text selectable style={styles.stack}>
                {this.state.error.stack}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05090F' },
  content: { padding: 24, paddingTop: 80 },
  eyebrow: {
    color: 'rgba(232,238,243,0.5)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginTop: 8 },
  body: { color: 'rgba(232,238,243,0.7)', fontSize: 14, marginTop: 12, lineHeight: 20 },
  card: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  cardLabel: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardText: { color: '#FFFFFF', fontSize: 13, lineHeight: 20 },
  stack: {
    color: 'rgba(232,238,243,0.7)',
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'JetBrains Mono, monospace',
  },
});
