import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEVICE_METADATA, isAccessory } from '@magnax/shared';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { GlassCard } from '@/components/GlassCard';
import { BlindSlider } from '@/components/accessories/BlindSlider';
import { FanDial } from '@/components/accessories/FanDial';
import { WindowTile } from '@/components/accessories/WindowTile';
import { Dimmer } from '@/components/Dimmer';
import { useDeviceStore } from '@/store/deviceStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { RootScreenProps } from '@/navigation/types';

export function RoomDetailScreen({ navigation, route }: RootScreenProps<'RoomDetail'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { roomName } = route.params;

  const deviceRecord = useDeviceStore((s) => s.devices);
  const orderedIds = useDeviceStore((s) => s.orderedIds);
  const setOn = useDeviceStore((s) => s.setOn);
  const setBrightness = useDeviceStore((s) => s.setBrightness);
  const setBlindPosition = useDeviceStore((s) => s.setBlindPosition);
  const setWindowMode = useDeviceStore((s) => s.setWindowMode);
  const setFanSpeed = useDeviceStore((s) => s.setFanSpeed);

  const roomDevices = orderedIds
    .map((id) => deviceRecord[id])
    .filter(
      (d): d is NonNullable<typeof d> =>
        Boolean(d) && (d?.roomId ?? '').toLowerCase() === roomName.toLowerCase(),
    );

  const lights = roomDevices.filter((d) => !isAccessory(d.type));
  const blinds = roomDevices.filter((d) => d.type === 'blind');
  const windows = roomDevices.filter((d) => d.type === 'window');
  const fans = roomDevices.filter((d) => d.type === 'fan');

  const anyLightOn = lights.some((l) => l.state.on);

  const toggleAllLights = (next: boolean) => {
    for (const l of lights) setOn(l.id, next);
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground intensity="calm" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={16} style={styles.backBtn}>
            <Text style={styles.backGlyph}>‹</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <View style={styles.brandRow}>
              <View style={styles.brandDot} />
              <Text style={styles.brandText}>RAUM · {roomName.toUpperCase()}</Text>
            </View>
            <Text style={styles.title}>{roomName}</Text>
            <Text style={styles.subtitle}>
              {roomDevices.length} Geräte · {lights.length} Licht · {blinds.length} Jalousie ·{' '}
              {windows.length} Fenster · {fans.length} Lüfter
            </Text>
          </View>
        </View>

        {lights.length > 0 && (
          <GlassCard style={styles.section} glow={anyLightOn}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Licht</Text>
              <Switch
                value={anyLightOn}
                onValueChange={toggleAllLights}
                thumbColor="#FFFFFF"
                trackColor={{ true: theme.palette.teal, false: 'rgba(232,238,243,0.2)' }}
              />
            </View>

            {lights.map((l) => (
              <View key={l.id} style={styles.lightRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lightName}>{l.name}</Text>
                  <Text style={styles.lightMeta}>{DEVICE_METADATA[l.type].label}</Text>
                </View>
                <View style={{ width: 200 }}>
                  <Dimmer
                    value={l.state.on ? l.state.brightness : 0}
                    onChange={(v) => setBrightness(l.id, v)}
                    onCommit={(v) => setOn(l.id, v > 0)}
                  />
                </View>
              </View>
            ))}
          </GlassCard>
        )}

        <View style={styles.twoColumn}>
          {blinds.length > 0 && (
            <GlassCard intensity="low" style={styles.halfCard}>
              <BlindSlider
                position={blinds[0]!.state.accessory.blindPosition ?? 0}
                onChange={(v) => setBlindPosition(blinds[0]!.id, v)}
              />
            </GlassCard>
          )}

          {windows.length > 0 && (
            <GlassCard intensity="low" style={styles.halfCard}>
              <WindowTile
                mode={windows[0]!.state.accessory.windowMode ?? 'closed'}
                onChange={(m) => setWindowMode(windows[0]!.id, m)}
              />
            </GlassCard>
          )}
        </View>

        {fans.length > 0 && (
          <GlassCard intensity="low" style={styles.section}>
            <Text style={styles.sectionTitle}>Klima</Text>
            <View style={styles.fansRow}>
              {fans.map((f) => (
                <View key={f.id} style={{ flex: 1, alignItems: 'center' }}>
                  <FanDial
                    speed={f.state.accessory.fanSpeed ?? 0}
                    onChange={(v) => setFanSpeed(f.id, v)}
                  />
                  <Text style={styles.fanLabel}>{f.name}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        )}

        {roomDevices.length === 0 && (
          <GlassCard style={styles.empty}>
            <Text style={styles.emptyTitle}>Noch keine Geräte in diesem Raum</Text>
            <Text style={styles.emptyBody}>
              Füge ein Licht, eine Jalousie oder andere Accessoires hinzu, um hier zu
              steuern.
            </Text>
          </GlassCard>
        )}

        <Text style={styles.signature}>
          MAGNA-X · engineered by SymmetryX Technologies
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05090F' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginRight: 12,
  },
  backGlyph: { color: '#FFFFFF', fontSize: 28, marginTop: -4 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A8A7D',
    marginRight: 6,
    shadowColor: '#1A8A7D',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  brandText: {
    color: 'rgba(232,238,243,0.65)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '700', marginTop: 6, letterSpacing: -0.6 },
  subtitle: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  section: { marginHorizontal: 20, marginBottom: 14, padding: 18 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  lightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  lightName: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  lightMeta: { color: 'rgba(232,238,243,0.55)', fontSize: 11, marginTop: 2 },
  twoColumn: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  halfCard: { flex: 1, padding: 14, marginHorizontal: 4, alignItems: 'center' },
  fansRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  fanLabel: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 11,
    letterSpacing: 0.5,
    marginTop: 6,
  },
  empty: { marginHorizontal: 20, padding: 24, alignItems: 'center' },
  emptyTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  emptyBody: {
    color: 'rgba(232,238,243,0.65)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  signature: {
    textAlign: 'center',
    color: 'rgba(232,238,243,0.35)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '500',
    marginTop: 20,
  },
});
