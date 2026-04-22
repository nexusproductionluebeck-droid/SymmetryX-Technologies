import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BleAdvertisement } from '@magnax/shared';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { getBleService } from '@/services/ble';
import { useDeviceStore } from '@/store/deviceStore';
import { useSetupStore } from '@/store/setupStore';
import type { RootScreenProps } from '@/navigation/types';

export function SetupBluetoothScreen({ navigation }: RootScreenProps<'SetupBluetooth'>) {
  const insets = useSafeAreaInsets();
  const { productType, setDiscoveredDevice, advance } = useSetupStore();
  const upsert = useDeviceStore((s) => s.upsert);
  const [results, setResults] = useState<BleAdvertisement[]>([]);
  const [scanning, setScanning] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const ble = getBleService();
    stopRef.current = ble.startScan((adv) => {
      if (productType && adv.type !== productType) return;
      setResults((prev) => (prev.some((r) => r.id === adv.id) ? prev : [...prev, adv]));
    });

    const timer = setTimeout(() => setScanning(false), 6000);
    return () => {
      clearTimeout(timer);
      stopRef.current?.();
    };
  }, [productType]);

  const handleSelect = (adv: BleAdvertisement) => {
    setSelectedId(adv.id);
    upsert(adv.device);
    setDiscoveredDevice(adv.id);
  };

  const handleContinue = () => {
    if (!selectedId) return;
    advance('wifi');
    navigation.navigate('SetupWifi');
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground intensity="active" />
      <View style={[styles.inner, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.eyebrow}>SCHRITT 2 VON 5</Text>
        <Text style={styles.title}>Gerät in der Nähe</Text>
        <Text style={styles.body}>
          Dein MagnaX-Punkt signalisiert Bereitschaft durch langsames Pulsieren der LED.
        </Text>

        {scanning && (
          <View style={styles.scanning}>
            <ActivityIndicator color="#1A8A7D" />
            <Text style={styles.scanningText}>Scanne via Bluetooth …</Text>
          </View>
        )}

        <FlatList
          data={results}
          keyExtractor={(adv) => adv.id}
          contentContainerStyle={{ paddingVertical: 10, gap: 8 }}
          ListEmptyComponent={
            !scanning ? (
              <Text style={styles.empty}>Keine Geräte gefunden. Strom prüfen und erneut versuchen.</Text>
            ) : null
          }
          renderItem={({ item }) => {
            const selected = item.id === selectedId;
            return (
              <Pressable onPress={() => handleSelect(item)}>
                <GlassCard intensity={selected ? 'high' : 'low'} glow={selected} style={{ padding: 14 }}>
                  <View style={styles.row}>
                    <View
                      style={[
                        styles.signalDot,
                        {
                          backgroundColor:
                            item.rssiDbm > -60 ? '#4CD294' : item.rssiDbm > -75 ? '#FFB547' : '#EF5350',
                        },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{item.localName}</Text>
                      <Text style={styles.rowSub}>
                        {item.device.macAddress}  ·  {item.rssiDbm} dBm
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              </Pressable>
            );
          }}
        />

        <Button
          label="Weiter"
          onPress={handleContinue}
          disabled={!selectedId}
          style={{ marginBottom: insets.bottom + 16 }}
        />
      </View>
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
  scanning: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  scanningText: { color: 'rgba(232,238,243,0.65)', fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  signalDot: { width: 10, height: 10, borderRadius: 5 },
  rowTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  rowSub: { color: 'rgba(232,238,243,0.55)', fontSize: 12, marginTop: 2, fontVariant: ['tabular-nums'] },
  empty: { color: 'rgba(232,238,243,0.65)', fontSize: 14, textAlign: 'center', paddingVertical: 24 },
});
