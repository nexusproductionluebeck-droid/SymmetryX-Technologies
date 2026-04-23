import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface Props {
  co2Ppm: number;
}

/**
 * CO₂ quality as a drifting mist.
 * - ≤ 800 ppm  : clean teal, thin
 * - 800–1200   : amber, denser
 * - > 1200     : red, dense + faster drift
 *
 * No numbers are needed to read it, but we surface the ppm value as
 * a quiet legend anyway for anyone who wants the data.
 */
export function BreathingMist({ co2Ppm }: Props) {
  const ppm = Math.max(400, Math.min(2000, co2Ppm));

  const quality = ppm <= 800 ? 'clean' : ppm <= 1200 ? 'amber' : 'danger';
  const color = quality === 'clean' ? '#1A8A7D' : quality === 'amber' ? '#E09A46' : '#D6584E';
  const label = quality === 'clean' ? 'Luft rein' : quality === 'amber' ? 'Etwas stickig' : 'Lüften!';
  const density = 0.25 + Math.min(1, (ppm - 400) / 1600) * 0.55;
  const driftSpeed = quality === 'danger' ? 9000 : quality === 'amber' ? 13000 : 17000;

  const drift = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: driftSpeed, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    pulse.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [drift, pulse, driftSpeed]);

  const cloud1 = useAnimatedStyle(() => ({
    transform: [{ translateX: -40 + drift.value * 80 }, { scale: 1 + pulse.value * 0.06 }],
    opacity: density,
  }));

  const cloud2 = useAnimatedStyle(() => ({
    transform: [{ translateX: 40 - drift.value * 70 }, { scale: 1 - pulse.value * 0.05 }],
    opacity: density * 0.8,
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.stage}>
        <Animated.View style={[styles.cloud, cloud1]}>
          <Svg width={220} height={120}>
            <Defs>
              <RadialGradient id="m1" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={color} stopOpacity={0.95} />
                <Stop offset="1" stopColor={color} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx="110" cy="60" r="60" fill="url(#m1)" />
          </Svg>
        </Animated.View>

        <Animated.View style={[styles.cloud, cloud2, { left: 40 }]}>
          <Svg width={200} height={100}>
            <Defs>
              <RadialGradient id="m2" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={color} stopOpacity={0.75} />
                <Stop offset="1" stopColor={color} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx="100" cy="50" r="50" fill="url(#m2)" />
          </Svg>
        </Animated.View>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendLabel}>CO₂</Text>
        <View style={styles.legendValueRow}>
          <Text style={[styles.legendValue, { color }]}>{Math.round(ppm)}</Text>
          <Text style={styles.legendUnit}>ppm</Text>
        </View>
        <Text style={[styles.legendQuality, { color }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  stage: { width: 220, height: 120, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  cloud: { position: 'absolute' },
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
