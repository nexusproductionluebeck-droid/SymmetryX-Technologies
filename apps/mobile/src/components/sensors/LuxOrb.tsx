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
  luxAmbient: number;
  size?: number;
}

/**
 * Ambient light as an orb. Intensity + size of the glow scale with
 * the lux reading. At night the orb barely shimmers, at noon it
 * blooms.
 */
export function LuxOrb({ luxAmbient, size = 160 }: Props) {
  const lux = Math.max(0, luxAmbient);
  const normalized = Math.min(1, lux / 600);

  const breath = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [breath]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.85 + breath.value * 0.1 }],
    opacity: 0.55 + breath.value * 0.25,
  }));

  const qualitative =
    lux < 50 ? 'Dunkel' : lux < 200 ? 'Dämmerung' : lux < 500 ? 'Raumlicht' : 'Tageslicht';

  return (
    <View style={styles.wrap}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={orbStyle}>
          <Svg width={size} height={size}>
            <Defs>
              <RadialGradient id="lux" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#FFE3B0" stopOpacity={0.95 * normalized + 0.1} />
                <Stop offset="0.5" stopColor="#F5B061" stopOpacity={0.6 * normalized + 0.05} />
                <Stop offset="1" stopColor="#F5B061" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={size / 2} cy={size / 2} r={size / 2 - 6} fill="url(#lux)" />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={size * 0.16}
              fill="#FFFFFF"
              opacity={0.25 + normalized * 0.55}
            />
          </Svg>
        </Animated.View>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendLabel}>UMGEBUNG</Text>
        <View style={styles.legendValueRow}>
          <Text style={styles.legendValue}>{Math.round(lux)}</Text>
          <Text style={styles.legendUnit}>lx</Text>
        </View>
        <Text style={styles.legendQuality}>{qualitative}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8 },
  legend: { alignItems: 'center', gap: 2 },
  legendLabel: {
    color: 'rgba(232,238,243,0.5)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  legendValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  legendValue: { color: '#F5B061', fontSize: 22, fontWeight: '700', letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  legendUnit: { color: 'rgba(232,238,243,0.5)', fontSize: 11 },
  legendQuality: { color: '#F5B061', fontSize: 11, letterSpacing: 1, marginTop: 2, fontWeight: '600' },
});
