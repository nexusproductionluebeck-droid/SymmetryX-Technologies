import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEVICE_METADATA, type DeviceType } from '@magnax/shared';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { useSetupStore } from '@/store/setupStore';
import type { RootScreenProps } from '@/navigation/types';

const AVAILABLE: DeviceType[] = ['pure', 'mesh', 'sense', 'sense-smoke', 'cam', 'stick'];

/**
 * Per-product feature pills. Small badge list shown underneath the
 * product tagline so reviewers see at a glance what's in the box.
 */
const FEATURES: Record<DeviceType, ReadonlyArray<string>> = {
  pure: ['Dimmer', 'Warm/Kalt'],
  mesh: ['Dimmer', 'WLAN-Mesh'],
  sense: ['Dimmer', 'Temperatur', 'Luft', 'Bewegung'],
  'sense-smoke': ['Dimmer', 'Sensorik', 'Rauchmelder'],
  cam: ['Dimmer', 'Kamera 160°', 'Mesh'],
  stick: ['Neon-Ersatz', 'Dimmer'],
  industrial: ['Großformat', 'Alle Sensoren'],
  plug: ['Steckdose'],
  pole: ['Teleskopstange'],
  switch: ['Schalter'],
  blind: [],
  window: [],
  fan: [],
  heater: [],
  outlet: [],
  motion: [],
};

export function SetupProductScreen({ navigation }: RootScreenProps<'SetupProduct'>) {
  const insets = useSafeAreaInsets();
  const { productType, setProductType, advance } = useSetupStore();

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <View style={[styles.inner, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.eyebrow}>SCHRITT 1 VON 5</Text>
        <Text style={styles.title}>Welches MAGNA-X?</Text>
        <Text style={styles.intro}>
          Wähle die Variante aus, die in deiner Decke steckt. Die nächsten Schritte passen
          sich automatisch an.
        </Text>

        <FlatList
          style={styles.list}
          data={AVAILABLE}
          keyExtractor={(type) => type}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          renderItem={({ item }) => {
            const meta = DEVICE_METADATA[item];
            const active = productType === item;
            const features = FEATURES[item] ?? [];
            return (
              <Pressable onPress={() => setProductType(item)} style={styles.cardWrap}>
                <GlassCard
                  intensity={active ? 'high' : 'low'}
                  glow={active}
                  style={styles.card}
                >
                  <View style={styles.cardRow}>
                    <View style={[styles.iconPill, active && styles.iconPillActive]}>
                      <Text style={styles.iconLetter}>{item[0]?.toUpperCase() ?? '?'}</Text>
                    </View>
                    <View style={styles.cardBody}>
                      <View style={styles.headerLine}>
                        <Text style={styles.cardTitle}>{meta.label}</Text>
                        {active && <View style={styles.checkDot} />}
                      </View>
                      <Text style={styles.cardTagline}>{meta.tagline}</Text>
                      {features.length > 0 && (
                        <View style={styles.pillsRow}>
                          {features.map((feature) => (
                            <View
                              key={feature}
                              style={[
                                styles.pill,
                                active && styles.pillActive,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.pillText,
                                  active && styles.pillTextActive,
                                ]}
                              >
                                {feature}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
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
  container: { flex: 1, backgroundColor: '#05090F', overflow: 'hidden' },
  inner: { flex: 1, paddingHorizontal: 20 },
  eyebrow: {
    color: 'rgba(232,238,243,0.5)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '700', marginTop: 6, letterSpacing: -0.6 },
  intro: { color: 'rgba(232,238,243,0.65)', fontSize: 14, marginTop: 8, lineHeight: 20 },
  list: { flex: 1, marginTop: 12 },
  listContent: { paddingVertical: 4, gap: 10 },
  cardWrap: {},
  card: { padding: 16 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  iconPill: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(46,117,182,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginRight: 14,
  },
  iconPillActive: {
    backgroundColor: 'rgba(26,138,125,0.35)',
    borderColor: '#1A8A7D',
  },
  iconLetter: { color: '#FFFFFF', fontWeight: '700', fontSize: 22 },
  cardBody: { flex: 1 },
  headerLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  cardTagline: {
    color: 'rgba(232,238,243,0.65)',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginRight: 6,
    marginTop: 6,
  },
  pillActive: {
    backgroundColor: 'rgba(26,138,125,0.18)',
    borderColor: 'rgba(26,138,125,0.45)',
  },
  pillText: {
    color: 'rgba(232,238,243,0.7)',
    fontSize: 10.5,
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  pillTextActive: { color: '#FFFFFF' },
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
