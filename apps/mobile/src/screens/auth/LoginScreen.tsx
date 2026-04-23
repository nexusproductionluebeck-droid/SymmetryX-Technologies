import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import type { RootScreenProps } from '@/navigation/types';

export function LoginScreen({ navigation }: RootScreenProps<'Login'>) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit = email.includes('@') && password.length >= 6 && !busy;

  const handleLogin = async () => {
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setBusy(false);
    navigation.reset({ index: 0, routes: [{ name: 'SetupProduct' }] });
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.inner, { paddingTop: insets.top + 60 }]}
      >
        <Text style={styles.eyebrow}>MAGNA-X</Text>
        <Text style={styles.heading}>Willkommen zurück</Text>
        <Text style={styles.subheading}>
          Melde dich an, um dein Zuhause zu verwalten.
        </Text>

        <GlassCard style={{ marginTop: 28 }}>
          <View style={styles.field}>
            <Text style={styles.label}>E-Mail</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="du@beispiel.de"
              placeholderTextColor="rgba(232,238,243,0.35)"
            />
          </View>
          <View style={[styles.field, { marginTop: 14 }]}>
            <Text style={styles.label}>Passwort</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="rgba(232,238,243,0.35)"
            />
          </View>
        </GlassCard>

        <View style={{ height: 18 }} />
        <Button label="Anmelden" onPress={handleLogin} disabled={!canSubmit} loading={busy} />

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>oder</Text>
          <View style={styles.line} />
        </View>

        <Button label="Mit Apple fortfahren" variant="secondary" onPress={handleLogin} />
        <View style={{ height: 10 }} />
        <Button label="Mit Google fortfahren" variant="secondary" onPress={handleLogin} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05090F' },
  inner: { flex: 1, paddingHorizontal: 24 },
  eyebrow: {
    color: 'rgba(232,238,243,0.5)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  heading: { color: '#FFFFFF', fontSize: 30, fontWeight: '700', marginTop: 8, letterSpacing: -0.6 },
  subheading: { color: 'rgba(232,238,243,0.65)', fontSize: 15, marginTop: 6 },
  field: {},
  label: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 11,
    letterSpacing: 1.8,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 44,
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 18 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  or: { color: 'rgba(232,238,243,0.5)', fontSize: 11, letterSpacing: 2 },
});
