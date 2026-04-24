import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEVICE_METADATA } from '@magnax/shared';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button } from '@/components/Button';
import { ExitConfirmDialog } from '@/components/ExitConfirmDialog';
import { GlassCard } from '@/components/GlassCard';
import { useExitGuard } from '@/hooks/useExitGuard';
import { seedDemoLivingRoom } from '@/services/demoSeed';
import { useDeviceStore } from '@/store/deviceStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { RootScreenProps } from '@/navigation/types';

export function HomeScreen({ navigation }: RootScreenProps<'Home'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const exitGuard = useExitGuard(true);
  // Pull the raw record + ids separately so the selector returns a stable slice
  // on each render instead of a fresh array on every simulator tick.
  const deviceRecord = useDeviceStore((s) => s.devices);
  const orderedIds = useDeviceStore((s) => s.orderedIds);
  const devices = orderedIds
    .map((id) => deviceRecord[id])
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  const onlineCount = devices.filter((d) => d.status === 'online').length;
  const totalPowerW = devices.reduce(
    (sum, d) => sum + (d.state.on ? (d.state.brightness / 100) * 9 : 0),
    0,
  );

  // Group devices by room for the rooms section
  const rooms = devices.reduce<Record<string, typeof devices>>((acc, d) => {
    const key = d.roomId ?? 'Ohne Raum';
    (acc[key] ??= []).push(d);
    return acc;
  }, {});
  const roomEntries = Object.entries(rooms).sort(([a], [b]) => a.localeCompare(b));

  return (
    <View style={styles.container}>
      <AnimatedBackground intensity="calm" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View>
            <View style={styles.brandRow}>
              <View style={styles.brandDot} />
              <Text style={styles.brandText}>MAGNA-X · SymmetryX</Text>
            </View>
            <Text style={styles.greeting}>Guten Abend</Text>
          </View>
          <Pressable style={styles.profilePill} onPress={() => {}}>
            <View style={[styles.profileDot, { backgroundColor: theme.palette.teal }]} />
          </Pressable>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiSlot}>
            <GlassCard intensity="low" style={styles.kpi} glow>
              <Text style={styles.kpiEyebrow}>GERÄTE</Text>
              <Text style={styles.kpiValue}>
                {onlineCount}
                <Text style={styles.kpiSub}> / {devices.length}</Text>
              </Text>
              <Text style={styles.kpiHint}>online</Text>
            </GlassCard>
          </View>
          <View style={styles.kpiSlot}>
            <GlassCard intensity="low" style={styles.kpi}>
              <Text style={styles.kpiEyebrow}>LEISTUNG</Text>
              <Text style={styles.kpiValue}>
                {totalPowerW.toFixed(1)}
                <Text style={styles.kpiSub}> W</Text>
              </Text>
              <Text style={styles.kpiHint}>aktuell</Text>
            </GlassCard>
          </View>
          <Pressable style={styles.kpiSlot} onPress={() => navigation.navigate('Mesh')}>
            <GlassCard intensity="low" style={styles.kpi}>
              <View style={styles.kpiHeaderRow}>
                <Text style={styles.kpiEyebrow}>MESH</Text>
                <Text style={styles.kpiArrow}>›</Text>
              </View>
              <Text style={styles.kpiValue}>
                100<Text style={styles.kpiSub}>%</Text>
              </Text>
              <Text style={styles.kpiHint}>live öffnen</Text>
            </GlassCard>
          </Pressable>
        </View>

        {devices.length === 0 ? (
          <View style={styles.empty}>
            <GlassCard style={{ width: '100%', padding: 28, alignItems: 'center' }}>
              <Text style={styles.emptyTitle}>Noch keine Geräte</Text>
              <Text style={styles.emptyBody}>
                Starte das Setup und verwandle den ersten Deckenpunkt in einen MAGNA-X.
              </Text>
              <Button
                label="Gerät hinzufügen"
                onPress={() => navigation.navigate('SetupProduct')}
                style={{ marginTop: 20, minWidth: 220 }}
              />
              <View style={{ height: 10 }} />
              <Button
                label="Demo-Wohnzimmer laden"
                variant="secondary"
                onPress={() => seedDemoLivingRoom()}
                style={{ minWidth: 220 }}
              />
            </GlassCard>
          </View>
        ) : (
          <>
            {roomEntries.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Räume</Text>
                <View style={styles.roomsRow}>
                  {roomEntries.map(([name, list]) => {
                    const anyOn = list.some((d) => d.state.on);
                    return (
                      <Pressable
                        key={name}
                        style={styles.roomCardWrap}
                        onPress={() => navigation.navigate('RoomDetail', { roomName: name })}
                      >
                        <GlassCard intensity={anyOn ? 'high' : 'low'} glow={anyOn} style={styles.roomCard}>
                          <Text style={styles.roomName}>{name}</Text>
                          <Text style={styles.roomMeta}>{list.length} Geräte</Text>
                          <View style={styles.roomPills}>
                            {list.slice(0, 4).map((d) => (
                              <View key={d.id} style={styles.roomPill}>
                                <Text style={styles.roomPillText}>
                                  {DEVICE_METADATA[d.type].label.split(' ')[1]?.[0] ??
                                    DEVICE_METADATA[d.type].label[0] ??
                                    '?'}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </GlassCard>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            <Text style={styles.sectionHeader}>Alle Geräte</Text>
            <View style={styles.grid}>
              {devices.map((item) => {
                const meta = DEVICE_METADATA[item.type];
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => navigation.navigate('DeviceDetail', { deviceId: item.id })}
                    style={styles.gridItem}
                  >
                    <GlassCard
                      intensity={item.state.on ? 'high' : 'low'}
                      glow={item.state.on}
                      style={{ padding: 16, minHeight: 140 }}
                    >
                      <View style={styles.cardTop}>
                        <View
                          style={[
                            styles.cardDot,
                            {
                              backgroundColor:
                                item.status === 'online' ? '#4CD294' : 'rgba(255,255,255,0.35)',
                            },
                          ]}
                        />
                        <Text style={styles.cardMeta}>
                          {meta.label.split(' ')[1] ?? meta.label}
                        </Text>
                      </View>
                      <Text style={styles.cardName}>{item.name}</Text>
                      <Text style={styles.cardRoom}>{item.roomId ?? 'Kein Raum'}</Text>
                      <View style={styles.cardFooter}>
                        <Text style={styles.cardState}>
                          {item.state.on
                            ? `${item.state.brightness}% · ${item.state.colorTempK}K`
                            : 'Aus'}
                        </Text>
                      </View>
                    </GlassCard>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ paddingHorizontal: 20, marginTop: 12, gap: 10 }}>
              <Button
                label="Weiteres Gerät hinzufügen"
                variant="secondary"
                onPress={() => navigation.navigate('SetupProduct')}
              />
              <Button
                label="Demo-Wohnzimmer laden"
                variant="ghost"
                onPress={() => seedDemoLivingRoom()}
              />
            </View>
          </>
        )}
      </ScrollView>

      <ExitConfirmDialog
        visible={exitGuard.showDialog}
        onDismiss={exitGuard.dismissDialog}
        onConfirm={() => {
          exitGuard.confirmExit();
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        }}
        body="Wenn du jetzt zurück gehst, verlierst du dein aktuelles Dashboard und musst die Demo von vorne starten."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05090F', overflow: 'hidden' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A8A7D',
    marginRight: 6,
    shadowColor: '#1A8A7D',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  brandText: {
    color: 'rgba(232,238,243,0.65)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 10,
    letterSpacing: -0.6,
  },
  profilePill: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileDot: { width: 10, height: 10, borderRadius: 5 },
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  kpiSlot: { flex: 1, paddingHorizontal: 4 },
  kpi: { padding: 14 },
  kpiHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kpiArrow: { color: 'rgba(232,238,243,0.45)', fontSize: 18, lineHeight: 18 },
  kpiEyebrow: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 9,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  kpiValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  kpiSub: { color: 'rgba(232,238,243,0.55)', fontSize: 14, fontWeight: '500' },
  kpiHint: { color: 'rgba(232,238,243,0.45)', fontSize: 11, marginTop: 2 },
  sectionHeader: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  roomsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  roomCardWrap: { flex: 1, padding: 4 },
  roomCard: { padding: 16, minHeight: 110 },
  roomName: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  roomMeta: { color: 'rgba(232,238,243,0.6)', fontSize: 12, marginTop: 2 },
  roomPills: { flexDirection: 'row', marginTop: 12 },
  roomPill: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(46,117,182,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  roomPillText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  gridItem: { width: '50%', padding: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  cardDot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 6 },
  cardMeta: { color: 'rgba(232,238,243,0.55)', fontSize: 11, letterSpacing: 1.2 },
  cardName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 10,
    letterSpacing: -0.2,
  },
  cardRoom: { color: 'rgba(232,238,243,0.55)', fontSize: 12, marginTop: 2 },
  cardFooter: { marginTop: 14 },
  cardState: {
    color: 'rgba(232,238,243,0.85)',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  empty: { flex: 1, padding: 20, justifyContent: 'center' },
  emptyTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  emptyBody: {
    color: 'rgba(232,238,243,0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
});
