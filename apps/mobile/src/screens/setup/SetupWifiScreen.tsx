import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { useSetupStore } from '@/store/setupStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { RootScreenProps } from '@/navigation/types';

export function SetupWifiScreen({ navigation }: RootScreenProps<'SetupWifi'>) {
  const theme = useTheme();
  const { setWifi, advance } = useSetupStore();
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit = ssid.length > 0 && password.length >= 8 && !busy;

  const handleContinue = async () => {
    setBusy(true);
    setWifi(ssid, password);
    // Simulate provisioning handshake: SoftAP push → device joins network → MQTT claim.
    await new Promise((resolve) => setTimeout(resolve, 900));
    setBusy(false);
    advance('room');
    navigation.navigate('SetupRoom');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>WLAN einrichten</Text>
      <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
        Dein MagnaX-Gerät verbindet sich mit deinem Heimnetz. Die Zugangsdaten werden verschlüsselt
        übertragen und nicht auf dem Server gespeichert.
      </Text>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Netzwerkname (SSID)</Text>
        <TextInput
          value={ssid}
          onChangeText={setSsid}
          placeholder="WLAN-Heim"
          placeholderTextColor={theme.colors.textSecondary}
          style={[styles.input, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Passwort</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Mindestens 8 Zeichen"
          placeholderTextColor={theme.colors.textSecondary}
          style={[styles.input, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
          secureTextEntry
        />
      </View>

      <Button
        label={busy ? 'Verbinde …' : 'Verbinden'}
        onPress={handleContinue}
        disabled={!canSubmit}
        loading={busy}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  body: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 6 },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 16 },
});
