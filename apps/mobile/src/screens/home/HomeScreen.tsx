import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEVICE_METADATA } from '@magnax/shared';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { useDeviceStore } from '@/store/deviceStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { RootScreenProps } from '@/navigation/types';

export function HomeScreen({ navigation }: RootScreenProps<'Home'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const devices = useDeviceStore((s) => s.orderedIds.map((id) => s.devices[id]!));

  const onlineCount = devices.filter((d) => d.status === 'online').length;
  const totalPowerW = devices.reduce((sum, d) => sum + (d.state.on ? (d.state.brightness / 100) * 9 : 0), 0);

  return (
    <View style={styles.container}>
      <AnimatedBackground intensity="calm" />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.eyebrow}>DEIN ZUHAUSE</Text>
          <Text style={styles.greeting}>Guten Abend</Text>
        </View>
        <Pressable style={styles.profilePill} onPress={() => {}}>
          <View style={[styles.profileDot, { backgroundColor: theme.palette.teal }]} />
        </Pressable>
      </View>

      <View style={styles.kpiRow}>
        <GlassCard intensity="low" style={styles.kpi} glow>
          <Text style={styles.kpiEyebrow}>GERÄTE</Text>
          <Text style={styles.kpiValue}>
            {onlineCount}
            <Text style={styles.kpiSub}> / {devices.length}</Text>
          </Text>
          <Text style={styles.kpiHint}>online</Text>
        </GlassCard>
        <GlassCard intensity="low" style={styles.kpi}>
          <Text style={styles.kpiEyebrow}>LEISTUNG</Text>
          <Text style={styles.kpiValue}>{totalPowerW.toFixed(1)}<Text style={styles.kpiSub}> W</Text></Text>
          <Text style={styles.kpiHint}>aktuell</Text>
        </GlassCard>
        <GlassCard intensity="low" style={styles.kpi}>
          <Text style={styles.kpiEyebrow}>MESH</Text>
          <Text style={styles.kpiValue}>100<Text style={styles.kpiSub}>%</Text></Text>
          <Text style={styles.kpiHint}>uptime</Text>
        </GlassCard>
      </View>

      {devices.length === 0 ? (
        <View style={styles.empty}>
          <GlassCard style={{ width: '100%', padding: 28, alignItems: 'center' }}>
            <Text style={styles.emptyTitle}>Noch keine Geräte</Text>
            <Text style={styles.emptyBody}>
              Starte das Setup und verwandle den ersten Deckenpunkt in einen MagnaX.
            </Text>
            <Button
              label="Gerät hinzufügen"
              onPress={() => navigation.navigate('SetupProduct')}
              style={{ marginTop: 20, minWidth: 220 }}
            />
          </GlassCard>
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(d) => d.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
          contentContainerStyle={{ gap: 12, paddingTop: 12, paddingBottom: insets.bottom + 80 }}
          ListHeaderComponent={
            <Text style={styles.sectionHeader}>Räume · Geräte</Text>
          }
          renderItem={({ item }) => {
            const meta = DEVICE_METADATA[item.type];
            return (
              <Pressable
                onPress={() => navigation.navigate('DeviceDetail', { deviceId: item.id })}
                style={{ flex: 1 }}
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
                        { backgroundColor: item.status === 'online' ? '#4CD294' : 'rgba(255,255,255,0.35)' },
                      ]}
                    />
                    <Text style={styles.cardMeta}>{meta.label.split(' ')[1] ?? meta.label}</Text>
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
          }}
          ListFooterComponent={
            <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
              <Button
                label="Weiteres Gerät hinzufügen"
                variant="secondary"
                onPress={() => navigation.navigate('SetupProduct')}
              />
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05090F' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: 'rgba(232,238,243,0.5)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  greeting: { color: '#FFFFFF', fontSize: 32, fontWeight: '700', marginTop: 4, letterSpacing: -0.6 },
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
  kpiRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 8 },
  kpi: { flex: 1, padding: 14 },
  kpiEyebrow: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 9,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  kpiValue: { color: '#FFFFFF', fontSize: 28, fontWeight: '700', marginTop: 6, letterSpacing: -1, fontVariant: ['tabular-nums'] },
  kpiSub: { color: 'rgba(232,238,243,0.55)', fontSize: 14, fontWeight: '500' },
  kpiHint: { color: 'rgba(232,238,243,0.45)', fontSize: 11, marginTop: 2 },
  sectionHeader: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardDot: { width: 7, height: 7, borderRadius: 3.5 },
  cardMeta: { color: 'rgba(232,238,243,0.55)', fontSize: 11, letterSpacing: 1.2 },
  cardName: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginTop: 10, letterSpacing: -0.2 },
  cardRoom: { color: 'rgba(232,238,243,0.55)', fontSize: 12, marginTop: 2 },
  cardFooter: { marginTop: 14 },
  cardState: { color: 'rgba(232,238,243,0.85)', fontSize: 12, fontVariant: ['tabular-nums'] },
  empty: { flex: 1, padding: 20, justifyContent: 'center' },
  emptyTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  emptyBody: { color: 'rgba(232,238,243,0.7)', fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20 },
});
