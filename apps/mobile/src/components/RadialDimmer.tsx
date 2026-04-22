import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/theme/ThemeProvider';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  value: number;
  onChange: (next: number) => void;
  onCommit?: (next: number) => void;
  min?: number;
  max?: number;
  size?: number;
  disabled?: boolean;
  label?: string;
  valueFormatter?: (v: number) => string;
}

/**
 * Radial cockpit-style dimmer. Drag anywhere on the ring to rotate
 * the knob — the arc fills clockwise, the center shows the numeric
 * value, and a spring-backed highlight snaps to the angle.
 *
 * Touch math uses screen coordinates, so the gesture works from any
 * angle without the user having to start on the knob itself.
 */
export function RadialDimmer({
  value,
  onChange,
  onCommit,
  min = 0,
  max = 100,
  size = 260,
  disabled = false,
  label = 'Helligkeit',
  valueFormatter,
}: Props) {
  const theme = useTheme();
  const range = max - min;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Arc spans 280° (from 130° to 410°), leaving a 80° gap at the bottom
  // for visual balance (like a physical dial).
  const arcStart = 130;
  const arcSweep = 280;

  const normalized = useSharedValue((value - min) / range);

  const haptic = useCallback(() => {
    void Haptics.selectionAsync();
  }, []);

  const emitChange = useCallback(
    (n: number) => {
      const next = Math.round(min + n * range);
      onChange(next);
    },
    [min, range, onChange],
  );

  const emitCommit = useCallback(
    (n: number) => {
      const next = Math.round(min + n * range);
      onCommit?.(next);
    },
    [min, range, onCommit],
  );

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onBegin((event) => {
      const next = eventToNormalized(event.x, event.y, center, arcStart, arcSweep);
      normalized.value = withSpring(next, { damping: 22, stiffness: 260, mass: 0.4 });
      runOnJS(emitChange)(next);
      runOnJS(haptic)();
    })
    .onUpdate((event) => {
      const next = eventToNormalized(event.x, event.y, center, arcStart, arcSweep);
      normalized.value = next;
      runOnJS(emitChange)(next);
    })
    .onEnd(() => {
      runOnJS(emitCommit)(normalized.value);
      runOnJS(haptic)();
    });

  const arcLength = useDerivedValue(() => (normalized.value * arcSweep) / 360 * circumference);

  const arcProps = useAnimatedProps(() => ({
    strokeDasharray: [arcLength.value, circumference],
  }));

  const knobStyle = useAnimatedStyle(() => {
    const angleDeg = arcStart + normalized.value * arcSweep;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = center + radius * Math.cos(angleRad) - 18;
    const y = center + radius * Math.sin(angleRad) - 18;
    return { transform: [{ translateX: x }, { translateY: y }] };
  });

  const display = valueFormatter
    ? valueFormatter(value)
    : `${Math.round(((value - min) / range) * 100)}%`;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <GestureDetector gesture={pan}>
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size} style={{ transform: [{ rotate: '0deg' }] }}>
            <Defs>
              <LinearGradient id="arc" x1="0" y1="0" x2={size} y2={size}>
                <Stop offset="0" stopColor={theme.palette.blue} />
                <Stop offset="1" stopColor={theme.palette.teal} />
              </LinearGradient>
              <LinearGradient id="track" x1="0" y1="0" x2="0" y2={size}>
                <Stop offset="0" stopColor="rgba(232,238,243,0.08)" />
                <Stop offset="1" stopColor="rgba(232,238,243,0.02)" />
              </LinearGradient>
            </Defs>

            {/* Track (full dial gap at bottom) */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="url(#track)"
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={[(arcSweep / 360) * circumference, circumference]}
              strokeDashoffset={-(arcStart - 90) / 360 * circumference}
              strokeLinecap="round"
              transform={`rotate(${arcStart} ${center} ${center})`}
            />

            {/* Value arc */}
            <AnimatedCircle
              cx={center}
              cy={center}
              r={radius}
              stroke="url(#arc)"
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              transform={`rotate(${arcStart} ${center} ${center})`}
              animatedProps={arcProps}
            />
          </Svg>

          <Animated.View style={[styles.knob, knobStyle]}>
            <View style={[styles.knobInner, { backgroundColor: theme.palette.white }]} />
          </Animated.View>
        </View>
      </GestureDetector>

      <View style={styles.centerLabel} pointerEvents="none">
        <Text style={styles.labelSmall}>{label}</Text>
        <Text style={styles.labelBig}>{display}</Text>
      </View>
    </View>
  );
}

/**
 * Convert a touch (x, y) inside the SVG to a normalized [0,1] progress
 * along the dial arc.
 *
 * Math: atan2 → degrees → shift so 0° aligns with arc start → clamp
 * into the arc sweep.
 */
function eventToNormalized(
  x: number,
  y: number,
  center: number,
  arcStart: number,
  arcSweep: number,
): number {
  'worklet';
  const dx = x - center;
  const dy = y - center;
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  // Shift so arcStart -> 0
  angle = (angle - arcStart + 360) % 360;
  if (angle > arcSweep) {
    // Snap to the nearest end of the arc
    angle = angle - arcSweep > (360 - arcSweep) / 2 ? 0 : arcSweep;
  }
  return Math.max(0, Math.min(1, angle / arcSweep));
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  knob: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A8A7D',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
    backgroundColor: 'rgba(26,138,125,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  knobInner: { width: 10, height: 10, borderRadius: 5 },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelSmall: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  labelBig: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
});
