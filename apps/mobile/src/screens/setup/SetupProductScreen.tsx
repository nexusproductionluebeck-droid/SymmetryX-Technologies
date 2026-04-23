import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEVICE_METADATA, type DeviceType } from '@magnax/shared';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { useSetupStore } from '@/store/setupStore';
import type { RootScreenProps } from '@/navigation/types';

const AVAILABLE: DeviceType[] = ['pure', 'mesh', 'sense', 'sense-smoke', 'cam', 'stick'];

export function SetupProductScreen({ navigation }: RootScreenProps<'SetupProduct'>) {
  const insets = useSafeAreaInsets();
  const { productType, setProductType, advance } = useSetupStore();

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <View style={[styles.inner, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.eyebrow}>SCHRITT 1 VON 5</Text>
        <Text style={styles.title}>Welches MagnaX?</Text>
        <Text style={styles.intro}>
          Wähle die Variante aus, die in deiner Decke steckt. Die nächsten Schritte passen
          sich automatisch an.
        </Text>

        <FlatList
          data={AVAILABLE}
          keyExtractor={(type) => type}
          contentContainerStyle={{ paddingVertical: 14, gap: 10 }}
          renderItem={({ item }) => {
            const meta = DEVICE_METADATA[item];
            const active = productType === item;
            return (
              <Pressable onPress={() => setProductType(item)}>
                <GlassCard
                  intensity={active ? 'high' : 'low'}
                  glow={active}
                  style={{ padding: 14 }}
                >
                  <View style={styles.row}>
                    <View style={[styles.iconPill, active && styles.iconPillActive]}>
                      <Text style={styles.iconText}>{item[0]?.toUpperCase() ?? '?'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{meta.label}</Text>
                      <Text style={styles.cardBody}>{meta.tagline}</Text>
                    </View>
                    {active && <View style={styles.checkDot} />}
                  </View>
                </GlassCard>
              </Pressable>
            );
          }}
        />

        <Button
          label="Weiter"
          onPress={() => {
            if (!productType) return;
            advance('bluetooth');
            navigation.navigate('SetupBluetooth');
          }}
          disabled={!productType}
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
  intro: { color: 'rgba(232,238,243,0.65)', fontSize: 14, marginTop: 8, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconPill: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(46,117,182,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  iconPillActive: { backgroundColor: 'rgba(26,138,125,0.35)' },
  iconText: { color: '#FFFFFF', fontWeight: '700', fontSize: 18 },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  cardBody: { color: 'rgba(232,238,243,0.6)', fontSize: 12, marginTop: 2 },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1A8A7D',
    shadowColor: '#1A8A7D',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});
