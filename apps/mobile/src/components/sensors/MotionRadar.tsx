import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Line, Stop } from 'react-native-svg';

interface Props {
  size?: number;
  motionDetected: boolean;
}

/**
 * Motion radar. A sweeping beam continuously rotates around the
 * origin; when motion is detected a pulse ring expands outward and
 * the status caption flips to "Bewegung erkannt". Reads at a glance
 * — no numbers, no decoding.
 */
export function MotionRadar({ size = 160, motionDetected }: Props) {
  const center = size / 2;
  const radius = center - 8;

  const sweep = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    sweep.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.linear }),
      -1,
      false,
    );
  }, [sweep]);

  useEffect(() => {
    if (motionDetected) {
      pulse.value = 0;
      pulse.value = withSequence(
        withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 0 }),
      );
    }
  }, [motionDetected, pulse]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sweep.value * 360}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: (1 - pulse.value) * 0.6,
    transform: [{ scale: 0.6 + pulse.value * 0.85 }],
  }));

  return (
    <View style={styles.wrap}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="ring" x1="0" y1="0" x2={size} y2={size}>
              <Stop offset="0" stopColor="#1A8A7D" stopOpacity={0.4} />
              <Stop offset="1" stopColor="#2E75B6" stopOpacity={0.4} />
            </LinearGradient>
          </Defs>
          <Circle cx={center} cy={center} r={radius} stroke="url(#ring)" strokeWidth={1} fill="none" />
          <Circle cx={center} cy={center} r={radius * 0.66} stroke="rgba(255,255,255,0.08)" strokeWidth={1} fill="none" />
          <Circle cx={center} cy={center} r={radius * 0.33} stroke="rgba(255,255,255,0.08)" strokeWidth={1} fill="none" />
          <Line x1={center} y1={8} x2={center} y2={size - 8} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
          <Line x1={8} y1={center} x2={size - 8} y2={center} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        </Svg>

        <Animated.View style={[StyleSheet.absoluteFill, sweepStyle]}>
          <Svg width={size} height={size}>
            <Defs>
              <LinearGradient id="sweep" x1={center} y1={center} x2={size} y2={center}>
                <Stop offset="0" stopColor="#1A8A7D" stopOpacity={0.85} />
                <Stop offset="1" stopColor="#1A8A7D" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Line
              x1={center}
              y1={center}
              x2={size - 8}
              y2={center}
              stroke="url(#sweep)"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFill, pulseStyle]}>
          <Svg width={size} height={size}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#1A8A7D"
              strokeWidth={2}
              fill="none"
              opacity={0.8}
            />
          </Svg>
        </Animated.View>

        <View style={[styles.core, { left: center - 6, top: center - 6 }]} />
      </View>

      <View style={styles.caption}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: motionDetected ? '#4CD294' : 'rgba(255,255,255,0.25)' },
          ]}
        />
        <Text style={[styles.captionText, motionDetected && styles.captionTextActive]}>
          {motionDetected ? 'Bewegung erkannt' : 'Keine Bewegung'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12 },
  core: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1A8A7D',
    shadowColor: '#1A8A7D',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  caption: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  captionText: {
    color: 'rgba(232,238,243,0.6)',
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: '500',
  },
  captionTextActive: { color: '#4CD294' },
});
