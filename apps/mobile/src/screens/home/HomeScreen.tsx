import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEVICE_METADATA } from '@magnax/shared';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button } from '@/components/Button';
import { ExitConfirmDialog } from '@/components/ExitConfirmDialog';
import { GlassCard } from '@/components/GlassCard';
import { useExitGuard } from '@/hooks/useExitGuard';
import { seedDemoHome } from '@/services/demoSeed';
import { useDeviceStore } from '@/store/deviceStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { RootScreenProps } from '@/navigation/types';

import { HomeTabs, type HomeTab } from './HomeTabs';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { CamerasTab } from './tabs/CamerasTab';

export function HomeScreen({ navigation }: RootScreenProps<'Home'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const exitGuard = useExitGuard(true);

  const deviceRecord = useDeviceStore((s) => s.devices);
  const orderedIds = useDeviceStore((s) => s.orderedIds);
  const devices = orderedIds
    .map((id) => deviceRecord[id])
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  const cams = devices.filter((d) => d.capabilities.camera);

  const [tab, setTab] = useState<HomeTab>('rooms');

  // Handle tab=mesh by navigating to the dedicated Mesh dashboard
  // (keeps the full-screen cockpit-map experience) and immediately
  // resetting the tab back to Räume so the user returns to a sane
  // state.
  useEffect(() => {
    if (tab === 'mesh') {
      setTab('rooms');
      navigation.navigate('Mesh');
    }
  }, [tab, navigation]);

  const onlineCount = devices.filter((d) => d.status === 'online').length;
  const totalPowerW = devices.reduce(
    (sum, d) => sum + (d.state.on ? (d.state.brightness / 100) * 9 : 0),
    0,
  );

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
            <Text style={styles.greeting}>Dein Zuhause</Text>
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
          <View style={styles.kpiSlot}>
            <GlassCard intensity="low" style={styles.kpi}>
              <Text style={styles.kpiEyebrow}>RÄUME</Text>
              <Text style={styles.kpiValue}>{roomEntries.length}</Text>
              <Text style={styles.kpiHint}>gesamt</Text>
            </GlassCard>
          </View>
        </View>

        <HomeTabs active={tab} onChange={setTab} />

        {devices.length === 0 ? (
          <View style={styles.empty}>
            <GlassCard style={{ width: '100%', padding: 28, alignItems: 'center' }}>
              <Text style={styles.emptyTitle}>Noch keine Geräte</Text>
              <Text style={styles.emptyBody}>
                Starte das Setup oder lade das komplette Demo-Einfamilienhaus — acht
                Räume über drei Etagen mit über 30 Geräten.
              </Text>
              <Button
                label="Gerät hinzufügen"
                onPress={() => navigation.navigate('SetupProduct')}
                style={{ marginTop: 20, minWidth: 220 }}
              />
              <View style={{ height: 10 }} />
              <Button
                label="Einfamilienhaus laden"
                variant="secondary"
                onPress={() => seedDemoHome()}
                style={{ minWidth: 220 }}
              />
            </GlassCard>
          </View>
        ) : tab === 'rooms' ? (
          <RoomsTab
            roomEntries={roomEntries}
            devices={devices}
            onOpenRoom={(name) => navigation.navigate('RoomDetail', { roomName: name })}
            onOpenDevice={(id) => navigation.navigate('DeviceDetail', { deviceId: id })}
            onAddDevice={() => navigation.navigate('SetupProduct')}
            onSeed={() => seedDemoHome()}
          />
        ) : tab === 'cameras' ? (
          <CamerasTab
            cams={cams}
            onSelect={(id) => navigation.navigate('Camera', { deviceId: id })}
          />
        ) : tab === 'analytics' ? (
          <AnalyticsTab devices={devices} />
        ) : null}
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

function RoomsTab({
  roomEntries,
  devices,
  onOpenRoom,
  onOpenDevice,
  onAddDevice,
  onSeed,
}: {
  roomEntries: Array<[string, ReadonlyArray<ReturnType<typeof useDeviceStore.getState>['devices'][string]>]>;
  devices: Array<ReturnType<typeof useDeviceStore.getState>['devices'][string]>;
  onOpenRoom: (name: string) => void;
  onOpenDevice: (id: string) => void;
  onAddDevice: () => void;
  onSeed: () => void;
}) {
  return (
    <>
      {roomEntries.length > 0 && (
        <>
          <Text style={styles.sectionHeader}>Räume</Text>
          <View style={styles.roomsWrap}>
            {roomEntries.map(([name, list]) => {
              const anyOn = list.some((d) => d && d.state.on);
              const cams = list.filter((d) => d && d.capabilities.camera).length;
              const motion = list.filter((d) => d && d.type === 'motion').length;
              return (
                <Pressable
                  key={name}
                  style={styles.roomCardWrap}
                  onPress={() => onOpenRoom(name)}
                >
                  <GlassCard intensity={anyOn ? 'high' : 'low'} glow={anyOn} style={styles.roomCard}>
                    <Text style={styles.roomName}>{labelFor(name)}</Text>
                    <Text style={styles.roomMeta}>
                      {list.length} Geräte{cams ? ` · ${cams} Cam` : ''}{motion ? ` · ${motion} Bewegung` : ''}
                    </Text>
                    <View style={styles.roomPills}>
                      {list.slice(0, 5).map((d) => {
                        if (!d) return null;
                        const meta = DEVICE_METADATA[d.type];
                        const letter =
                          meta.label.split(' ')[1]?.[0] ?? meta.label[0] ?? '?';
                        return (
                          <View key={d.id} style={styles.roomPill}>
                            <Text style={styles.roomPillText}>{letter.toUpperCase()}</Text>
                          </View>
                        );
                      })}
                      {list.length > 5 && (
                        <View style={[styles.roomPill, { backgroundColor: 'transparent' }]}>
                          <Text style={styles.roomPillText}>+{list.length - 5}</Text>
                        </View>
                      )}
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
              onPress={() => onOpenDevice(item.id)}
              style={styles.gridItem}
            >
              <GlassCard
                intensity={item.state.on ? 'high' : 'low'}
                glow={item.state.on}
                style={{ padding: 14, minHeight: 130 }}
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
                <Text style={styles.cardName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.cardRoom} numberOfLines={1}>
                  {labelFor(item.roomId ?? 'Kein Raum')}
                </Text>
              </GlassCard>
            </Pressable>
          );
        })}
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
        <Button label="Weiteres Gerät hinzufügen" variant="secondary" onPress={onAddDevice} />
        <View style={{ height: 10 }} />
        <Button label="Einfamilienhaus nachladen" variant="ghost" onPress={onSeed} />
      </View>
    </>
  );
}

function labelFor(roomId: string): string {
  if (roomId === 'Ohne Raum') return roomId;
  return roomId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
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
    fontSize: 30,
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
    marginBottom: 10,
  },
  kpiSlot: { flex: 1, paddingHorizontal: 4 },
  kpi: { padding: 14 },
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
  roomsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  roomCardWrap: { width: '50%', padding: 4 },
  roomCard: { padding: 14, minHeight: 124 },
  roomName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    textTransform: 'capitalize',
  },
  roomMeta: { color: 'rgba(232,238,243,0.6)', fontSize: 11, marginTop: 4 },
  roomPills: { flexDirection: 'row', marginTop: 12, flexWrap: 'wrap' },
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
  gridItem: { width: '50%', padding: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  cardDot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 6 },
  cardMeta: { color: 'rgba(232,238,243,0.55)', fontSize: 11, letterSpacing: 1.2 },
  cardName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 8, letterSpacing: -0.2 },
  cardRoom: { color: 'rgba(232,238,243,0.55)', fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
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
