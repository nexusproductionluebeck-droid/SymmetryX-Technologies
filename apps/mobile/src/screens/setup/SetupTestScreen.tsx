import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button } from '@/components/Button';
import { ColorTempSlider } from '@/components/ColorTempSlider';
import { GlassCard } from '@/components/GlassCard';
import { LightHalo } from '@/components/LightHalo';
import { RadialDimmer } from '@/components/RadialDimmer';
import { getMqttService } from '@/services/mqtt';
import { useDeviceStore } from '@/store/deviceStore';
import { useSetupStore } from '@/store/setupStore';
import type { RootScreenProps } from '@/navigation/types';

export function SetupTestScreen({ navigation }: RootScreenProps<'SetupTest'>) {
  const insets = useSafeAreaInsets();
  const { discoveredDeviceId, advance } = useSetupStore();
  const device = useDeviceStore((s) => (discoveredDeviceId ? s.devices[discoveredDeviceId] : undefined));
  const setBrightness = useDeviceStore((s) => s.setBrightness);
  const setColorTemp = useDeviceStore((s) => s.setColorTemp);

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
      <View style={styles.container}>
        <AnimatedBackground />
        <Text style={{ color: '#FFFFFF', padding: 20, paddingTop: 80 }}>
          Kein Gerät zum Testen ausgewählt.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedBackground intensity="active" />
      <View style={[styles.inner, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.eyebrow}>SCHRITT 5 VON 5</Text>
        <Text style={styles.title}>Funktionstest</Text>

        <View style={styles.heroStage}>
          <LightHalo size={340} brightness={brightness} colorTempK={colorTempK} />
          <RadialDimmer
            size={240}
            value={brightness}
            onChange={(v) => {
              setBrightnessLocal(v);
              setBrightness(discoveredDeviceId, v);
            }}
            onCommit={(v) => pushCommand({ brightness: v, on: v > 0 })}
          />
        </View>

        <GlassCard style={{ alignItems: 'center' }}>
          <Text style={styles.sectionLabel}>FARBTEMPERATUR</Text>
          <View style={{ height: 12 }} />
          <ColorTempSlider
            valueK={colorTempK}
            onChange={(v) => {
              setColorTempLocal(v);
              setColorTemp(discoveredDeviceId, v);
            }}
            onCommit={(v) => pushCommand({ colorTempK: v })}
          />
        </GlassCard>

        <View style={{ flex: 1 }} />
        <Button
          label="Alles funktioniert"
          onPress={() => {
            advance('complete');
            navigation.navigate('SetupComplete');
          }}
          style={{ marginBottom: insets.bottom + 16 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05090F', overflow: 'hidden' },
  inner: { flex: 1, paddingHorizontal: 20, gap: 16 },
  eyebrow: {
    color: 'rgba(232,238,243,0.5)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '700', marginTop: 6, letterSpacing: -0.6 },
  heroStage: { alignItems: 'center', justifyContent: 'center', height: 280, marginVertical: 4 },
  sectionLabel: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
});
