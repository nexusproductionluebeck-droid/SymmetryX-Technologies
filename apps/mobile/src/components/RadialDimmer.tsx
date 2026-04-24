import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/theme/ThemeProvider';

const AnimatedPath = Animated.createAnimatedComponent(Path);

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

const ARC_START_DEG = 130;
const ARC_SWEEP_DEG = 280;

/**
 * Radial cockpit-style dimmer. Drag anywhere on the ring to rotate
 * the knob — the arc fills clockwise, the center shows the numeric
 * value, the spring-backed highlight snaps to the angle.
 *
 * Critically: both the arc fill (SVG Path with dynamic `d`) and the
 * knob position share a single source-of-truth shared value and the
 * exact same angle-to-coordinate math. They're guaranteed to stay
 * synchronised frame-for-frame.
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
      const next = eventToNormalized(event.x, event.y, center);
      normalized.value = withSpring(next, { damping: 22, stiffness: 260, mass: 0.4 });
      runOnJS(emitChange)(next);
      runOnJS(haptic)();
    })
    .onUpdate((event) => {
      const next = eventToNormalized(event.x, event.y, center);
      normalized.value = next;
      runOnJS(emitChange)(next);
    })
    .onEnd(() => {
      runOnJS(emitCommit)(normalized.value);
      runOnJS(haptic)();
    });

  // Full-sweep track path (static) — drawn underneath the fill.
  const trackPath = buildArcPath(center, center, radius, ARC_START_DEG, ARC_SWEEP_DEG);

  // Animated fill arc. Uses the same angle math as the knob, so
  // the knob always sits at the tip of the fill — never "ahead" or
  // "behind".
  const fillProps = useAnimatedProps(() => {
    const sweep = normalized.value * ARC_SWEEP_DEG;
    const safeSweep = Math.max(0.001, sweep);
    const startRad = (ARC_START_DEG * Math.PI) / 180;
    const endRad = ((ARC_START_DEG + safeSweep) * Math.PI) / 180;
    const startX = center + radius * Math.cos(startRad);
    const startY = center + radius * Math.sin(startRad);
    const endX = center + radius * Math.cos(endRad);
    const endY = center + radius * Math.sin(endRad);
    const largeArc = safeSweep > 180 ? 1 : 0;
    const d = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`;
    return {
      d,
      opacity: normalized.value < 0.002 ? 0 : 1,
    };
  });

  const knobStyle = useAnimatedStyle(() => {
    const angleDeg = ARC_START_DEG + normalized.value * ARC_SWEEP_DEG;
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
          <Svg width={size} height={size}>
            <Defs>
              <LinearGradient id="rd-arc" x1="0" y1="0" x2={size} y2={size}>
                <Stop offset="0" stopColor={theme.palette.blue} />
                <Stop offset="1" stopColor={theme.palette.teal} />
              </LinearGradient>
            </Defs>

            {/* Track (static full sweep) */}
            <Path
              d={trackPath}
              stroke="rgba(232,238,243,0.08)"
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
            />

            {/* Fill (animated 0 → current sweep) */}
            <AnimatedPath
              animatedProps={fillProps}
              stroke="url(#rd-arc)"
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
            />

            {/* Glow dot at the centre (purely decorative) */}
            <Circle cx={center} cy={center} r={3} fill="rgba(255,255,255,0.15)" />
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
 * Build an SVG arc path on the JS side (for the static track).
 */
function buildArcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  sweepDeg: number,
): string {
  const startRad = (startDeg * Math.PI) / 180;
  const endRad = ((startDeg + sweepDeg) * Math.PI) / 180;
  const startX = cx + r * Math.cos(startRad);
  const startY = cy + r * Math.sin(startRad);
  const endX = cx + r * Math.cos(endRad);
  const endY = cy + r * Math.sin(endRad);
  const largeArc = sweepDeg > 180 ? 1 : 0;
  return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`;
}

function eventToNormalized(x: number, y: number, center: number): number {
  'worklet';
  const dx = x - center;
  const dy = y - center;
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  angle = (angle - ARC_START_DEG + 360) % 360;
  if (angle > ARC_SWEEP_DEG) {
    angle = angle - ARC_SWEEP_DEG > (360 - ARC_SWEEP_DEG) / 2 ? 0 : ARC_SWEEP_DEG;
  }
  return Math.max(0, Math.min(1, angle / ARC_SWEEP_DEG));
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
