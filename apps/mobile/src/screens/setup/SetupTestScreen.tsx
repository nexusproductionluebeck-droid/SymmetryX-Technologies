import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ColorTempSlider } from '@/components/ColorTempSlider';
import { Dimmer } from '@/components/Dimmer';
import { getMqttService } from '@/services/mqtt';
import { useDeviceStore } from '@/store/deviceStore';
import { useSetupStore } from '@/store/setupStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { RootScreenProps } from '@/navigation/types';

export function SetupTestScreen({ navigation }: RootScreenProps<'SetupTest'>) {
  const theme = useTheme();
  const { discoveredDeviceId, advance } = useSetupStore();
  const device = useDeviceStore((s) => (discoveredDeviceId ? s.devices[discoveredDeviceId] : undefined));
  const setBrightness = useDeviceStore((s) => s.setBrightness);
  const setColorTemp = useDeviceStore((s) => s.setColorTemp);
  const setOn = useDeviceStore((s) => s.setOn);

  const [brightness, setBrightnessLocal] = useState(device?.state.brightness ?? 60);
  const [colorTempK, setColorTempLocal] = useState(device?.state.colorTempK ?? 3000);

  useEffect(() => {
    if (!discoveredDeviceId) return;
    getMqttService().ensureDeviceSim(discoveredDeviceId);
  }, [discoveredDeviceId]);

  const pushCommand = (next: { brightness?: number; colorTempK?: number; on?: boolean }) => {
    if (!discoveredDeviceId) return;
    getMqttService().publishCommand(discoveredDeviceId, next);
  };

  if (!device || !discoveredDeviceId) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.textPrimary }}>Kein Gerät zum Testen ausgewählt.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Funktionstest</Text>
      <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
        Probiere deinen neuen MagnaX-Punkt aus. Dimmer und Farbtemperatur antworten live.
      </Text>

      <View style={styles.controlBlock}>
        <Dimmer
          value={brightness}
          label="Helligkeit"
          onChange={(v) => {
            setBrightnessLocal(v);
            setBrightness(discoveredDeviceId, v);
          }}
          onCommit={(v) => pushCommand({ brightness: v, on: v > 0 })}
        />
      </View>

      <View style={styles.controlBlock}>
        <ColorTempSlider
          valueK={colorTempK}
          onChange={(v) => {
            setColorTempLocal(v);
            setColorTemp(discoveredDeviceId, v);
          }}
          onCommit={(v) => pushCommand({ colorTempK: v })}
        />
      </View>

      <View style={styles.row}>
        <Button
          label="Einschalten"
          variant="secondary"
          onPress={() => {
            setOn(discoveredDeviceId, true);
            pushCommand({ on: true });
          }}
          style={{ flex: 1 }}
        />
        <View style={{ width: 8 }} />
        <Button
          label="Ausschalten"
          variant="secondary"
          onPress={() => {
            setOn(discoveredDeviceId, false);
            pushCommand({ on: false });
          }}
          style={{ flex: 1 }}
        />
      </View>

      <Button
        label="Alles funktioniert"
        onPress={() => {
          advance('complete');
          navigation.navigate('SetupComplete');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 20 },
  title: { fontSize: 24, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 20 },
  controlBlock: { alignItems: 'center', paddingVertical: 6 },
  row: { flexDirection: 'row' },
});
