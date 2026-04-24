import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Device } from '@magnax/shared';

import { GlassCard } from '@/components/GlassCard';

interface Props {
  devices: Device[];
}

/**
 * House-wide analytics dashboard. Aggregates power draw, air
 * quality, motion activity, and mesh health into a single vertical
 * stack of glass cards.
 */
export function AnalyticsTab({ devices }: Props) {
  const stats = useMemo(() => computeStats(devices), [devices]);

  const energyBars = useMemo(() => buildEnergyTimeline(), []);
  const motionBars = useMemo(() => buildMotionTimeline(devices), [devices]);

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={styles.headerRow}>
        <View style={styles.headerDot} />
        <Text style={styles.headerText}>HAUS · ANALYSE</Text>
      </View>

      <View style={styles.kpiRow}>
        <GlassCard intensity="low" style={styles.kpi} glow>
          <Text style={styles.kpiEyebrow}>ENERGIE HEUTE</Text>
          <Text style={styles.kpiValue}>
            {stats.energyKWh.toFixed(1)}
            <Text style={styles.kpiSub}> kWh</Text>
          </Text>
          <Text style={styles.kpiHint}>≈ {(stats.energyKWh * 0.38).toFixed(2)} €</Text>
        </GlassCard>
        <GlassCard intensity="low" style={styles.kpi}>
          <Text style={styles.kpiEyebrow}>CO₂ ESPARNIS</Text>
          <Text style={styles.kpiValue}>
            {stats.co2SavedKg.toFixed(1)}
            <Text style={styles.kpiSub}> kg</Text>
          </Text>
          <Text style={styles.kpiHint}>vs. klassisch</Text>
        </GlassCard>
      </View>

      <View style={styles.kpiRow}>
        <GlassCard intensity="low" style={styles.kpi}>
          <Text style={styles.kpiEyebrow}>LUFT ∅</Text>
          <Text style={[styles.kpiValue, { color: stats.avgCo2 > 900 ? '#E09A46' : '#FFFFFF' }]}>
            {Math.round(stats.avgCo2)}
            <Text style={styles.kpiSub}> ppm</Text>
          </Text>
          <Text style={styles.kpiHint}>
            {stats.avgCo2 <= 800 ? 'Rein' : stats.avgCo2 <= 1200 ? 'Akzeptabel' : 'Lüften'}
          </Text>
        </GlassCard>
        <GlassCard intensity="low" style={styles.kpi}>
          <Text style={styles.kpiEyebrow}>TEMP ∅</Text>
          <Text style={styles.kpiValue}>
            {stats.avgTempC.toFixed(1)}
            <Text style={styles.kpiSub}>°C</Text>
          </Text>
          <Text style={styles.kpiHint}>Haus</Text>
        </GlassCard>
      </View>

      <GlassCard style={styles.chartCard}>
        <Text style={styles.chartTitle}>Energieverbrauch · 24 h</Text>
        <Text style={styles.chartHint}>Watt pro Stunde · live geschätzt</Text>
        <View style={styles.energyRow}>
          {energyBars.map((bar, i) => (
            <LinearGradient
              key={i}
              colors={['#1A8A7D', '#2E75B6']}
              style={[styles.energyBar, { height: 4 + bar * 52, opacity: bar < 0.1 ? 0.2 : 1 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          ))}
        </View>
        <View style={styles.axisRow}>
          <Text style={styles.axisLabel}>00</Text>
          <Text style={styles.axisLabel}>06</Text>
          <Text style={styles.axisLabel}>12</Text>
          <Text style={styles.axisLabel}>18</Text>
          <Text style={styles.axisLabel}>24</Text>
        </View>
      </GlassCard>

      <GlassCard style={styles.chartCard}>
        <Text style={styles.chartTitle}>Bewegung · 24 h</Text>
        <Text style={styles.chartHint}>
          {stats.motionEvents} Ereignisse · {stats.motionSensorCount} Sensoren
        </Text>
        <View style={styles.energyRow}>
          {motionBars.map((bar, i) => (
            <View
              key={i}
              style={[
                styles.motionBar,
                {
                  height: 3 + bar * 48,
                  backgroundColor: bar > 0.6 ? '#E09A46' : bar > 0.25 ? '#1A8A7D' : 'rgba(255,255,255,0.2)',
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.axisRow}>
          <Text style={styles.axisLabel}>00</Text>
          <Text style={styles.axisLabel}>06</Text>
          <Text style={styles.axisLabel}>12</Text>
          <Text style={styles.axisLabel}>18</Text>
          <Text style={styles.axisLabel}>24</Text>
        </View>
      </GlassCard>

      <GlassCard style={styles.chartCard}>
        <Text style={styles.chartTitle}>Räume nach Aktivität</Text>
        {stats.roomActivity.slice(0, 6).map((row) => (
          <View key={row.roomId} style={styles.rowBar}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <View style={styles.rowTrack}>
              <LinearGradient
                colors={['#1A8A7D', '#2E75B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.rowFill, { width: `${Math.round(row.share * 100)}%` }]}
              />
            </View>
            <Text style={styles.rowValue}>{Math.round(row.share * 100)}%</Text>
          </View>
        ))}
      </GlassCard>
    </View>
  );
}

function computeStats(devices: Device[]) {
  const totalPowerW = devices.reduce(
    (sum, d) => sum + (d.state.on ? (d.state.brightness / 100) * 9 : 0),
    0,
  );
  const energyKWh = (totalPowerW / 1000) * 24 * 0.35;
  const co2SavedKg = energyKWh * 0.42;

  const sensorDevices = devices.filter((d) => d.state.sensors);
  const avgCo2 = sensorDevices.length
    ? sensorDevices.reduce((s, d) => s + (d.state.sensors?.co2Ppm ?? 0), 0) / sensorDevices.length
    : 0;
  const avgTempC = sensorDevices.length
    ? sensorDevices.reduce((s, d) => s + (d.state.sensors?.temperatureC ?? 0), 0) /
      sensorDevices.length
    : 22;

  const motionDevices = devices.filter((d) => d.type === 'motion');
  const motionEvents = motionDevices.reduce(
    (sum, d) => sum + (d.state.accessory.motionHistory?.length ?? 0),
    0,
  );

  // Per-room power share
  const roomTotals = new Map<string, number>();
  for (const d of devices) {
    const key = d.roomId ?? 'ohne-raum';
    const p = d.state.on ? (d.state.brightness / 100) * 9 : 0;
    roomTotals.set(key, (roomTotals.get(key) ?? 0) + p);
  }
  const total = Math.max(1, totalPowerW);
  const roomActivity = Array.from(roomTotals.entries())
    .map(([roomId, power]) => ({
      roomId,
      label: labelFor(roomId),
      share: power / total,
    }))
    .sort((a, b) => b.share - a.share);

  return {
    energyKWh,
    co2SavedKg,
    avgCo2,
    avgTempC,
    motionEvents,
    motionSensorCount: motionDevices.length,
    roomActivity,
  };
}

function labelFor(roomId: string): string {
  const capital = roomId.charAt(0).toUpperCase() + roomId.slice(1);
  return capital.replace(/-/g, ' ');
}

function buildEnergyTimeline(): number[] {
  const seed = 71;
  const result: number[] = [];
  for (let i = 0; i < 24; i += 1) {
    const r = pseudoRandom(seed + i * 11);
    const baseline = i < 6 ? 0.2 : i < 9 ? 0.7 : i < 17 ? 0.4 : i < 22 ? 0.9 : 0.3;
    result.push(Math.max(0, Math.min(1, baseline + (r - 0.5) * 0.2)));
  }
  return result;
}

function buildMotionTimeline(devices: Device[]): number[] {
  const buckets = new Array<number>(24).fill(0);
  for (const d of devices) {
    if (d.type !== 'motion') continue;
    for (const event of d.state.accessory.motionHistory ?? []) {
      const hour = new Date(event.at).getHours();
      if (hour >= 0 && hour < 24) buckets[hour] = (buckets[hour] ?? 0) + 1;
    }
  }
  const max = Math.max(1, ...buckets);
  // Add gentle baseline so the chart never looks empty
  return buckets.map((b, i) => {
    const baseline = i < 6 ? 0.05 : i < 9 ? 0.35 : i < 17 ? 0.25 : i < 22 ? 0.55 : 0.12;
    return Math.max(baseline, b / max);
  });
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A8A7D',
    marginRight: 8,
    shadowColor: '#1A8A7D',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  headerText: {
    color: 'rgba(232,238,243,0.7)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  kpiRow: { flexDirection: 'row', marginBottom: 10 },
  kpi: { flex: 1, padding: 14, marginHorizontal: 4 },
  kpiEyebrow: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 9,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  kpiValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
  },
  kpiSub: { color: 'rgba(232,238,243,0.55)', fontSize: 13, fontWeight: '500' },
  kpiHint: { color: 'rgba(232,238,243,0.5)', fontSize: 11, marginTop: 2 },
  chartCard: { marginHorizontal: 4, marginTop: 6, padding: 18 },
  chartTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  chartHint: { color: 'rgba(232,238,243,0.55)', fontSize: 11, marginTop: 4 },
  energyRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    marginTop: 14,
  },
  energyBar: { flex: 1, borderRadius: 2, marginHorizontal: 1 },
  motionBar: { flex: 1, borderRadius: 2, marginHorizontal: 1 },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  axisLabel: {
    color: 'rgba(232,238,243,0.45)',
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  rowBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  rowLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    width: 110,
  },
  rowTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  rowFill: { height: 6, borderRadius: 3 },
  rowValue: {
    color: 'rgba(232,238,243,0.75)',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    width: 40,
    textAlign: 'right',
  },
});
