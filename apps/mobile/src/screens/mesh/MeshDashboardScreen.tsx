import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { GlassCard } from '@/components/GlassCard';
import { MeshMap } from '@/components/mesh/MeshMap';
import { useDeviceStore } from '@/store/deviceStore';
import type { RootScreenProps } from '@/navigation/types';

export function MeshDashboardScreen({ navigation }: RootScreenProps<'Mesh'>) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const devices = useDeviceStore((s) => s.orderedIds.map((id) => s.devices[id]!));

  const mapSize = Math.min(width - 32, 360);

  const stats = useMemo(() => {
    const meshCapable = devices.filter((d) => d.capabilities.mesh);
    const online = devices.filter((d) => d.status === 'online').length;
    const warnings = devices.filter((d) => d.status === 'warning').length;
    const avgRssi = meshCapable.length
      ? Math.round(
          meshCapable.reduce((sum, d) => sum + (d.mesh?.rssiDbm ?? 0), 0) / meshCapable.length,
        )
      : 0;
    const throughputMbps = meshCapable.reduce((sum, d) => sum + (d.mesh?.uplinkMbps ?? 0), 0);
    return { online, total: devices.length, warnings, avgRssi, meshCapableCount: meshCapable.length, throughputMbps };
  }, [devices]);

  return (
    <View style={styles.container}>
      <AnimatedBackground intensity="active" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={16} style={styles.backBtn}>
            <Text style={styles.backGlyph}>‹</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <View style={styles.brandRow}>
              <View style={styles.brandDot} />
              <Text style={styles.brandText}>MESH · MAGNA-X</Text>
            </View>
            <Text style={styles.title}>Netzwerk lebt</Text>
            <Text style={styles.subtitle}>
              Jeder Deckenpunkt routet. Das WLAN heilt sich selbst.
            </Text>
          </View>
        </View>

        <View style={styles.mapWrap}>
          <MeshMap devices={devices} size={mapSize} />
          <View style={styles.legend}>
            <LegendDot color="#1A8A7D" label="Online" />
            <LegendDot color="#E09A46" label="Warnung" />
            <LegendDot color="#D6584E" label="Offline" />
          </View>
        </View>

        <View style={styles.kpiRow}>
          <GlassCard intensity="low" style={styles.kpi} glow>
            <Text style={styles.kpiEyebrow}>KNOTEN</Text>
            <Text style={styles.kpiValue}>
              {stats.online}
              <Text style={styles.kpiSub}> / {stats.total}</Text>
            </Text>
            <Text style={styles.kpiHint}>aktiv im Mesh</Text>
          </GlassCard>
          <GlassCard intensity="low" style={styles.kpi}>
            <Text style={styles.kpiEyebrow}>SIGNAL</Text>
            <Text style={styles.kpiValue}>
              {stats.avgRssi || '—'}
              <Text style={styles.kpiSub}> dBm</Text>
            </Text>
            <Text style={styles.kpiHint}>∅ RSSI</Text>
          </GlassCard>
        </View>

        <View style={styles.kpiRow}>
          <GlassCard intensity="low" style={styles.kpi}>
            <Text style={styles.kpiEyebrow}>UPTIME</Text>
            <Text style={styles.kpiValue}>
              99.94
              <Text style={styles.kpiSub}> %</Text>
            </Text>
            <Text style={styles.kpiHint}>letzte 30 Tage</Text>
          </GlassCard>
          <GlassCard intensity="low" style={styles.kpi}>
            <Text style={styles.kpiEyebrow}>DURCHSATZ</Text>
            <Text style={styles.kpiValue}>
              {stats.throughputMbps.toFixed(0)}
              <Text style={styles.kpiSub}> Mb/s</Text>
            </Text>
            <Text style={styles.kpiHint}>summiert</Text>
          </GlassCard>
        </View>

        <GlassCard style={styles.insightCard}>
          <Text style={styles.insightEyebrow}>LETZTE EREIGNISSE</Text>
          <InsightRow tone="ok" text="Mesh self-heal: Pfad über Knoten 3 neu geroutet" time="vor 2 Min" />
          <InsightRow tone="info" text="Neuer Knoten beigetreten · automatisch eingebunden" time="vor 18 Min" />
          <InsightRow tone="ok" text="Firmware-Rollout abgeschlossen auf allen Knoten" time="heute, 08:44" />
          <InsightRow tone="warn" text="Schwaches Signal im Flur — Mesh-Knoten empfohlen" time="gestern" />
        </GlassCard>

        <Text style={styles.signature}>
          MAGNA-X · engineered by SymmetryX Technologies
        </Text>
      </ScrollView>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={legendStyles.item}>
      <View style={[legendStyles.dot, { backgroundColor: color }]} />
      <Text style={legendStyles.label}>{label}</Text>
    </View>
  );
}

function InsightRow({
  tone,
  text,
  time,
}: {
  tone: 'ok' | 'warn' | 'info';
  text: string;
  time: string;
}) {
  const color = tone === 'warn' ? '#E09A46' : tone === 'ok' ? '#4CD294' : '#BCE0FF';
  return (
    <View style={insightStyles.row}>
      <View style={[insightStyles.dot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={insightStyles.text}>{text}</Text>
        <Text style={insightStyles.time}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05090F', overflow: 'hidden' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
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
  },
  backGlyph: { color: '#FFFFFF', fontSize: 28, marginTop: -4 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A8A7D',
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
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '700', marginTop: 6, letterSpacing: -0.5 },
  subtitle: { color: 'rgba(232,238,243,0.55)', fontSize: 13, marginTop: 4, lineHeight: 18 },
  mapWrap: { alignItems: 'center', gap: 12, marginTop: 4, marginBottom: 18 },
  legend: { flexDirection: 'row', gap: 16 },
  kpiRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 10 },
  kpi: { flex: 1, padding: 14 },
  kpiEyebrow: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  kpiValue: { color: '#FFFFFF', fontSize: 28, fontWeight: '700', marginTop: 6, letterSpacing: -1, fontVariant: ['tabular-nums'] },
  kpiSub: { color: 'rgba(232,238,243,0.55)', fontSize: 13, fontWeight: '500' },
  kpiHint: { color: 'rgba(232,238,243,0.45)', fontSize: 11, marginTop: 2 },
  insightCard: { marginHorizontal: 20, marginTop: 6, padding: 18 },
  insightEyebrow: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
    marginBottom: 14,
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

const legendStyles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  label: { color: 'rgba(232,238,243,0.55)', fontSize: 11, letterSpacing: 1 },
});

const insightStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 6 },
  text: { color: '#FFFFFF', fontSize: 13, lineHeight: 18 },
  time: { color: 'rgba(232,238,243,0.45)', fontSize: 11, marginTop: 2, letterSpacing: 0.5 },
});
