import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { seedDemoLivingRoom } from '@/services/demoSeed';
import { useDeviceStore } from '@/store/deviceStore';
import type { RootScreenProps } from '@/navigation/types';

export function LoginScreen({ navigation }: RootScreenProps<'Login'>) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const hasExistingDevices = useDeviceStore((s) => s.orderedIds.length > 0);

  const canSubmit = email.includes('@') && password.length >= 6 && !busy;

  const handleLogin = async () => {
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setBusy(false);
    navigation.replace('SetupProduct');
  };

  const handleDemoJump = () => {
    seedDemoLivingRoom();
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.inner,
            { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
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

          <View style={styles.demoSeparator}>
            <View style={styles.line} />
            <Text style={styles.demoSeparatorText}>DEMO · PRÄSENTATION</Text>
            <View style={styles.line} />
          </View>

          <GlassCard intensity="low" style={styles.demoCard}>
            <View style={styles.demoHeaderRow}>
              <View style={styles.demoDot} />
              <Text style={styles.demoHeader}>Direkt ins Dashboard</Text>
            </View>
            <Text style={styles.demoBody}>
              {hasExistingDevices
                ? 'Deine bereits eingerichteten Geräte sind gespeichert. Mit einem Tap ohne Setup ins Dashboard springen.'
                : 'Ohne Onboarding starten — wir befüllen dein Wohnzimmer mit Licht, Sensorik, Jalousie, Fenster, Lüfter, Bewegungssensor und Kamera.'}
            </Text>
            <View style={{ height: 12 }} />
            <Button
              label={hasExistingDevices ? 'Weiter zum Dashboard' : 'Demo-Wohnzimmer starten'}
              onPress={handleDemoJump}
            />
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05090F', overflow: 'hidden' },
  inner: { paddingHorizontal: 24 },
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
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  or: { color: 'rgba(232,238,243,0.5)', fontSize: 11, letterSpacing: 2, marginHorizontal: 10 },
  demoSeparator: { flexDirection: 'row', alignItems: 'center', marginTop: 28, marginBottom: 14 },
  demoSeparatorText: {
    color: 'rgba(26,138,125,0.85)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '700',
    marginHorizontal: 10,
  },
  demoCard: { padding: 16 },
  demoHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  demoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1A8A7D',
    marginRight: 8,
    shadowColor: '#1A8A7D',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  demoHeader: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  demoBody: {
    color: 'rgba(232,238,243,0.7)',
    fontSize: 12.5,
    marginTop: 8,
    lineHeight: 18,
  },
});
