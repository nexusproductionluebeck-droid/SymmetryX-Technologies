import { StyleSheet, Text, View } from 'react-native';
import type { SensorReading } from '@magnax/shared';

import { GlassCard } from '@/components/GlassCard';
import { BreathingMist } from './BreathingMist';
import { HumidityWave } from './HumidityWave';
import { LuxOrb } from './LuxOrb';
import { MotionRadar } from './MotionRadar';
import { TemperatureField } from './TemperatureField';

interface Props {
  reading: SensorReading | null;
}

/**
 * Hero sensor composition for Sense devices. Arranges the five
 * visualisations into a grid that reads as a single "room-state
 * weather map". Intentionally no tabular numbers — each tile is its
 * own micro-dashboard.
 */
export function SensorPanel({ reading }: Props) {
  if (!reading) {
    return (
      <GlassCard intensity="low" style={styles.empty}>
        <Text style={styles.emptyText}>Sensorik wird initialisiert …</Text>
      </GlassCard>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.heading}>
        <View style={styles.headingDot} />
        <Text style={styles.headingLabel}>RAUM ATMET</Text>
      </View>

      <GlassCard intensity="med" style={styles.heroCard}>
        <View style={styles.heroInner}>
          <MotionRadar motionDetected={reading.motionDetected} size={180} />
        </View>
      </GlassCard>

      <View style={styles.row}>
        <GlassCard intensity="low" style={styles.halfCard}>
          <TemperatureField temperatureC={reading.temperatureC} width={160} height={110} />
        </GlassCard>
        <GlassCard intensity="low" style={styles.halfCard}>
          <HumidityWave humidityPct={reading.humidityPct} width={160} height={110} />
        </GlassCard>
      </View>

      <View style={styles.row}>
        <GlassCard intensity="low" style={styles.halfCard}>
          <BreathingMist co2Ppm={reading.co2Ppm} />
        </GlassCard>
        <GlassCard intensity="low" style={styles.halfCard}>
          <LuxOrb luxAmbient={reading.luxAmbient} size={140} />
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12, paddingHorizontal: 20 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 2 },
  headingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A8A7D',
    shadowColor: '#1A8A7D',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  headingLabel: {
    color: 'rgba(232,238,243,0.65)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  heroCard: { padding: 18, alignItems: 'center' },
  heroInner: { alignItems: 'center', gap: 8 },
  row: { flexDirection: 'row', gap: 12 },
  halfCard: { flex: 1, padding: 14, alignItems: 'center', minHeight: 180, justifyContent: 'center' },
  empty: {
    marginHorizontal: 20,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: { color: 'rgba(232,238,243,0.55)', fontSize: 13 },
});
