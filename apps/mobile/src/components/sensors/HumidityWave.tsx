import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  humidityPct: number;
  width?: number;
  height?: number;
}

/**
 * Humidity as a water surface. The fill level corresponds to the
 * relative humidity percentage; the wave crests oscillate to imply
 * "water in motion". Color shifts warm (dry) → cool (humid).
 */
export function HumidityWave({ humidityPct, width = 220, height = 120 }: Props) {
  const pct = Math.max(0, Math.min(100, humidityPct));
  const fillRatio = pct / 100;
  const baseline = height - fillRatio * (height - 24);

  const phase = useSharedValue(0);

  useEffect(() => {
    phase.value = withRepeat(
      withTiming(1, { duration: 3400, easing: Easing.linear }),
      -1,
      false,
    );
  }, [phase]);

  const waveProps = useAnimatedProps(() => {
    return { d: wavePath(width, height, baseline, phase.value, 0) };
  });
  const waveBackProps = useAnimatedProps(() => {
    return { d: wavePath(width, height, baseline + 6, phase.value, Math.PI) };
  });

  const tone = useMemo(() => {
    if (pct < 35) return { color: '#E09A46', label: 'Trocken' };
    if (pct > 65) return { color: '#2E75B6', label: 'Feucht' };
    return { color: '#1A8A7D', label: 'Wohlfühlbereich' };
  }, [pct]);

  return (
    <View style={styles.wrap}>
      <View style={[styles.stage, { width, height, borderRadius: 18 }]}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="water" x1={0} y1={0} x2={0} y2={height}>
              <Stop offset="0" stopColor={tone.color} stopOpacity={0.05} />
              <Stop offset="1" stopColor={tone.color} stopOpacity={0.55} />
            </LinearGradient>
            <LinearGradient id="waterBack" x1={0} y1={0} x2={0} y2={height}>
              <Stop offset="0" stopColor={tone.color} stopOpacity={0.02} />
              <Stop offset="1" stopColor={tone.color} stopOpacity={0.3} />
            </LinearGradient>
          </Defs>
          <AnimatedPath animatedProps={waveBackProps} fill="url(#waterBack)" />
          <AnimatedPath animatedProps={waveProps} fill="url(#water)" />
        </Svg>
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>FEUCHTE</Text>
        <View style={styles.legendValueRow}>
          <Text style={[styles.legendValue, { color: tone.color }]}>{pct.toFixed(0)}</Text>
          <Text style={styles.legendUnit}>%</Text>
        </View>
        <Text style={[styles.legendQuality, { color: tone.color }]}>{tone.label}</Text>
      </View>
    </View>
  );
}

function wavePath(width: number, height: number, baseline: number, phase: number, offset: number): string {
  'worklet';
  const amplitude = 6;
  const wavelength = width / 1.3;
  const steps = 24;
  let d = `M 0 ${height} `;
  for (let i = 0; i <= steps; i += 1) {
    const x = (i / steps) * width;
    const y =
      baseline +
      Math.sin((x / wavelength) * Math.PI * 2 + phase * Math.PI * 2 + offset) * amplitude;
    d += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  d += `L ${width} ${height} Z`;
  return d;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  stage: { overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)' },
  legend: { alignItems: 'center', gap: 2 },
  legendLabel: {
    color: 'rgba(232,238,243,0.5)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  legendValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  legendValue: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  legendUnit: { color: 'rgba(232,238,243,0.5)', fontSize: 11 },
  legendQuality: { fontSize: 11, letterSpacing: 1, marginTop: 2, fontWeight: '600' },
});
