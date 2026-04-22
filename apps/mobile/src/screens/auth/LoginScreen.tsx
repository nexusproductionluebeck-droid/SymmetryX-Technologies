import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeProvider';
import type { RootScreenProps } from '@/navigation/types';

export function LoginScreen({ navigation }: RootScreenProps<'Login'>) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit = email.includes('@') && password.length >= 6 && !busy;

  const handleLogin = async () => {
    setBusy(true);
    // Simulated auth — real version swaps in Supabase/Firebase session flow.
    await new Promise((resolve) => setTimeout(resolve, 400));
    setBusy(false);
    navigation.reset({ index: 0, routes: [{ name: 'SetupProduct' }] });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.heading, { color: theme.colors.textPrimary }]}>Willkommen zurück</Text>
      <Text style={[styles.subheading, { color: theme.colors.textSecondary }]}>
        Melde dich an, um dein Zuhause zu verwalten.
      </Text>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>E-Mail</Text>
        <TextInput
          style={[styles.input, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="du@beispiel.de"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Passwort</Text>
        <TextInput
          style={[styles.input, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <Button label="Anmelden" onPress={handleLogin} disabled={!canSubmit} loading={busy} />

      <View style={styles.divider}>
        <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
        <Text style={[styles.or, { color: theme.colors.textSecondary }]}>oder</Text>
        <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
      </View>

      <Button label="Mit Apple fortfahren" variant="secondary" onPress={handleLogin} />
      <View style={{ height: 8 }} />
      <Button label="Mit Google fortfahren" variant="secondary" onPress={handleLogin} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  heading: { fontSize: 28, fontWeight: '700', marginBottom: 6 },
  subheading: { fontSize: 15, marginBottom: 24 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 6 },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 20,
  },
  line: { flex: 1, height: 1 },
  or: { fontSize: 13, letterSpacing: 1.5 },
});
