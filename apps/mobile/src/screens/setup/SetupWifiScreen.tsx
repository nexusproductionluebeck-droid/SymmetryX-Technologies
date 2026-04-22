import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { useSetupStore } from '@/store/setupStore';
import type { RootScreenProps } from '@/navigation/types';

export function SetupWifiScreen({ navigation }: RootScreenProps<'SetupWifi'>) {
  const insets = useSafeAreaInsets();
  const { setWifi, advance } = useSetupStore();
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit = ssid.length > 0 && password.length >= 8 && !busy;

  const handleContinue = async () => {
    setBusy(true);
    setWifi(ssid, password);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setBusy(false);
    advance('room');
    navigation.navigate('SetupRoom');
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.inner, { paddingTop: insets.top + 60 }]}
      >
        <Text style={styles.eyebrow}>SCHRITT 3 VON 5</Text>
        <Text style={styles.title}>WLAN verbinden</Text>
        <Text style={styles.body}>
          Die Zugangsdaten werden verschlüsselt an dein Gerät übertragen und nicht auf unseren
          Servern gespeichert.
        </Text>

        <GlassCard style={{ marginTop: 24 }}>
          <View style={styles.field}>
            <Text style={styles.label}>NETZWERKNAME</Text>
            <TextInput
              value={ssid}
              onChangeText={setSsid}
              placeholder="WLAN-Heim"
              placeholderTextColor="rgba(232,238,243,0.35)"
              style={styles.input}
              autoCapitalize="none"
            />
          </View>
          <View style={[styles.field, { marginTop: 14 }]}>
            <Text style={styles.label}>PASSWORT</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Mindestens 8 Zeichen"
              placeholderTextColor="rgba(232,238,243,0.35)"
              style={styles.input}
              secureTextEntry
            />
          </View>
        </GlassCard>

        <View style={{ flex: 1 }} />
        <Button
          label={busy ? 'Verbinde …' : 'Verbinden'}
          onPress={handleContinue}
          disabled={!canSubmit}
          loading={busy}
          style={{ marginBottom: insets.bottom + 16 }}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05090F' },
  inner: { flex: 1, paddingHorizontal: 20 },
  eyebrow: {
    color: 'rgba(232,238,243,0.5)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '700', marginTop: 6, letterSpacing: -0.6 },
  body: { color: 'rgba(232,238,243,0.65)', fontSize: 14, marginTop: 8, lineHeight: 20 },
  field: {},
  label: { color: 'rgba(232,238,243,0.55)', fontSize: 10, letterSpacing: 2, fontWeight: '600', marginBottom: 8 },
  input: {
    height: 44,
    color: '#FFFFFF',
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
});
