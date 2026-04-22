import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { BleAdvertisement } from '@magnax/shared';

import { Button } from '@/components/Button';
import { getBleService } from '@/services/ble';
import { useDeviceStore } from '@/store/deviceStore';
import { useSetupStore } from '@/store/setupStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { RootScreenProps } from '@/navigation/types';

export function SetupBluetoothScreen({ navigation }: RootScreenProps<'SetupBluetooth'>) {
  const theme = useTheme();
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          MagnaX-Geräte in der Nähe
        </Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          Dein Gerät signalisiert Bereitschaft durch langsames Pulsieren der LED. Wähle das passende
          aus der Liste.
        </Text>
      </View>

      {scanning && (
        <View style={styles.scanning}>
          <ActivityIndicator color={theme.palette.teal} />
          <Text style={[styles.scanningText, { color: theme.colors.textSecondary }]}>
            Scanne via Bluetooth …
          </Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(adv) => adv.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={
          !scanning ? (
            <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
              Keine Geräte gefunden. Strom prüfen und erneut versuchen.
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const selected = item.id === selectedId;
          return (
            <Pressable
              onPress={() => handleSelect(item)}
              style={[
                styles.row,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: selected ? theme.palette.teal : theme.colors.border,
                  borderWidth: selected ? 2 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.signalDot,
                  { backgroundColor: item.rssiDbm > -60 ? theme.palette.green : theme.palette.orange },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>
                  {item.localName}
                </Text>
                <Text style={[styles.rowSub, { color: theme.colors.textSecondary }]}>
                  {item.device.macAddress}  ·  {item.rssiDbm} dBm
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      <Button label="Weiter" onPress={handleContinue} disabled={!selectedId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { gap: 6, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 20 },
  scanning: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  scanningText: { fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    marginVertical: 5,
  },
  signalDot: { width: 10, height: 10, borderRadius: 5 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 12, marginTop: 2, fontVariant: ['tabular-nums'] },
  empty: { fontSize: 14, textAlign: 'center', paddingVertical: 24 },
});
