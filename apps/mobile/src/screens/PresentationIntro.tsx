import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, RadialGradient, Stop } from 'react-native-svg';

import { MagnaXLogoMark } from '@/components/MagnaXLogoMark';

interface Props {
  onDone: () => void;
}

const DURATION_MS = 20_000;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);

/**
 * 20-second cinematic intro. A single choreographed sequence using
 * one master clock shared value (0 → 20 s) and interpolate() on
 * each layer. Four beats:
 *
 *  Beat 1 (0-5):  "Deine Decke."           — single rising node
 *  Beat 2 (5-10): "Wird intelligent."      — mesh emerges
 *  Beat 3 (10-15):"Ein System. Alles."     — functions orbit
 *  Beat 4 (15-20):"MAGNA-X · Revolution."  — brand reveal
 *
 * Tap anywhere to skip. `onDone` fires when the sequence ends or
 * the user skips.
 */
export function PresentationIntro({ onDone }: Props) {
  const { width, height } = useWindowDimensions();
  const center = { x: width / 2, y: height / 2 };

  const clock = useSharedValue(0);

  useEffect(() => {
    clock.value = withTiming(20, { duration: DURATION_MS, easing: Easing.linear });
    const timer = setTimeout(onDone, DURATION_MS + 200);
    return () => clearTimeout(timer);
  }, [clock, onDone]);

  // Mesh ring node positions
  const meshNodes = useMemo(() => {
    const count = 10;
    const radius = Math.min(width, height) * 0.32;
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      return {
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius,
        delayT: 5 + (i / count) * 2.5,
      };
    });
  }, [width, height, center.x, center.y]);

  return (
    <View style={styles.container}>
      {/* Ambient gradient background */}
      <LinearGradient
        colors={['#05090F', '#0A1520', '#05090F']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />

      <BackgroundGlow clock={clock} />

      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#1A8A7D" stopOpacity={0.9} />
            <Stop offset="1" stopColor="#1A8A7D" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Central node — lives the whole intro */}
        <CentralNode clock={clock} cx={center.x} cy={center.y} />

        {/* Mesh ring */}
        {meshNodes.map((node, i) => (
          <MeshNodePoint key={i} clock={clock} node={node} center={center} />
        ))}
      </Svg>

      {/* Orbit of function icons (beat 3) */}
      <OrbitingFunctions clock={clock} center={center} />

      {/* Beat text layers */}
      <BeatText clock={clock} from={0.6} to={4.6} label="Deine Decke." />
      <BeatText clock={clock} from={5.2} to={9.6} label="Wird intelligent." />
      <BeatText clock={clock} from={10.2} to={14.5} label="Ein System. Alles." />

      {/* Beat 4 — brand reveal */}
      <BrandReveal clock={clock} />

      {/* Skip button */}
      <Pressable
        onPress={onDone}
        style={[styles.skip, { top: 44 }]}
        hitSlop={20}
      >
        <Text style={styles.skipText}>ÜBERSPRINGEN</Text>
      </Pressable>
    </View>
  );
}

function BackgroundGlow({ clock }: { clock: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(clock.value, [0, 2, 15, 20], [0, 0.35, 0.6, 0.2]),
  }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <LinearGradient
        colors={['rgba(26,138,125,0)', 'rgba(26,138,125,0.15)', 'rgba(46,117,182,0.08)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
}

function CentralNode({
  clock,
  cx,
  cy,
}: {
  clock: SharedValue<number>;
  cx: number;
  cy: number;
}) {
  const glowProps = useAnimatedProps(() => ({
    r: interpolate(clock.value, [0, 4, 14, 17, 20], [10, 40, 80, 260, 0]),
    opacity: interpolate(clock.value, [0, 1, 15, 17, 18], [0, 0.6, 0.8, 0.6, 0]),
  }));

  const coreProps = useAnimatedProps(() => ({
    r: interpolate(clock.value, [0, 1.2, 15, 16.5, 17], [0, 6, 10, 28, 0]),
    opacity: interpolate(clock.value, [0, 0.6, 16, 17], [0, 1, 1, 0]),
  }));

  return (
    <>
      <AnimatedCircle cx={cx} cy={cy} fill="url(#nodeGlow)" animatedProps={glowProps} />
      <AnimatedCircle cx={cx} cy={cy} fill="#FFFFFF" animatedProps={coreProps} />
    </>
  );
}

function MeshNodePoint({
  clock,
  node,
  center,
}: {
  clock: SharedValue<number>;
  node: { x: number; y: number; delayT: number };
  center: { x: number; y: number };
}) {
  const nodeProps = useAnimatedProps(() => {
    const t0 = node.delayT;
    const opacity = interpolate(
      clock.value,
      [t0 - 0.3, t0, 14, 15.5, 16.2],
      [0, 1, 1, 0.4, 0],
      'clamp',
    );
    const r = interpolate(
      clock.value,
      [t0 - 0.3, t0, 14, 15.5, 16.2],
      [0, 4, 4, 2, 0],
      'clamp',
    );
    return { opacity, r };
  });

  const lineProps = useAnimatedProps(() => {
    const t0 = node.delayT + 0.2;
    const opacity = interpolate(
      clock.value,
      [t0, t0 + 0.6, 14, 15, 16],
      [0, 0.35, 0.4, 0.15, 0],
      'clamp',
    );
    return { opacity };
  });

  return (
    <>
      <AnimatedLine
        x1={center.x}
        y1={center.y}
        x2={node.x}
        y2={node.y}
        stroke="#1A8A7D"
        strokeWidth={1}
        animatedProps={lineProps}
      />
      <AnimatedCircle cx={node.x} cy={node.y} fill="#1A8A7D" animatedProps={nodeProps} />
    </>
  );
}

function OrbitingFunctions({
  clock,
  center,
}: {
  clock: SharedValue<number>;
  center: { x: number; y: number };
}) {
  const labels = ['Licht', 'Mesh', 'Sense', 'Cam', 'Klima'];
  return (
    <>
      {labels.map((label, i) => (
        <OrbitLabel
          key={label}
          clock={clock}
          center={center}
          index={i}
          total={labels.length}
          label={label}
        />
      ))}
    </>
  );
}

function OrbitLabel({
  clock,
  center,
  index,
  total,
  label,
}: {
  clock: SharedValue<number>;
  center: { x: number; y: number };
  index: number;
  total: number;
  label: string;
}) {
  const style = useAnimatedStyle(() => {
    const visible = interpolate(
      clock.value,
      [10.2, 11, 14, 15],
      [0, 1, 1, 0],
      'clamp',
    );
    const angle =
      ((index / total) * Math.PI * 2) +
      interpolate(clock.value, [10, 15], [0, Math.PI * 0.8]) -
      Math.PI / 2;
    const radius = 120;
    return {
      opacity: visible,
      transform: [
        { translateX: Math.cos(angle) * radius - 40 },
        { translateY: Math.sin(angle) * radius - 14 },
        { scale: 0.8 + visible * 0.2 },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.orbitLabel,
        { left: center.x, top: center.y },
        style,
      ]}
    >
      <Text style={styles.orbitText}>{label}</Text>
    </Animated.View>
  );
}

function BeatText({
  clock,
  from,
  to,
  label,
}: {
  clock: SharedValue<number>;
  from: number;
  to: number;
  label: string;
}) {
  const style = useAnimatedStyle(() => {
    const opacity = interpolate(
      clock.value,
      [from, from + 0.6, to - 0.6, to],
      [0, 1, 1, 0],
      'clamp',
    );
    const translateY = interpolate(clock.value, [from, from + 0.6], [18, 0], 'clamp');
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <Animated.View style={[styles.beatTextWrap, style]} pointerEvents="none">
      <Text style={styles.beatText}>{label}</Text>
    </Animated.View>
  );
}

function BrandReveal({ clock }: { clock: SharedValue<number> }) {
  const logoStyle = useAnimatedStyle(() => {
    const opacity = interpolate(clock.value, [15.5, 16.2, 19.6, 20], [0, 1, 1, 0], 'clamp');
    const scale = interpolate(clock.value, [15.5, 16.2, 17.2], [0.4, 1.08, 1], 'clamp');
    return { opacity, transform: [{ scale }] };
  });

  const wordmarkStyle = useAnimatedStyle(() => {
    const opacity = interpolate(clock.value, [16.6, 17.2, 19.6, 20], [0, 1, 1, 0], 'clamp');
    const translateY = interpolate(clock.value, [16.6, 17.2], [14, 0], 'clamp');
    return { opacity, transform: [{ translateY }] };
  });

  const taglineStyle = useAnimatedStyle(() => {
    const opacity = interpolate(clock.value, [17.5, 18.1, 19.6, 20], [0, 1, 1, 0], 'clamp');
    return { opacity };
  });

  return (
    <View style={styles.brandWrap} pointerEvents="none">
      <Animated.View style={[styles.brandLogo, logoStyle]}>
        <MagnaXLogoMark size={96} color="#1A8A7D" accent="#FFFFFF" />
      </Animated.View>
      <Animated.View style={wordmarkStyle}>
        <Text style={styles.wordmark}>MAGNA-X</Text>
      </Animated.View>
      <Animated.View style={[taglineStyle, { marginTop: 10, alignItems: 'center' }]}>
        <View style={styles.accentLine} />
        <Text style={styles.subtitle}>Die Revolution der Deckeninfrastruktur</Text>
        <Text style={styles.credit}>by SymmetryX Technologies</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05090F' },
  skip: {
    position: 'absolute',
    right: 22,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  skipText: {
    color: 'rgba(232,238,243,0.7)',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '600',
  },
  orbitLabel: { position: 'absolute' },
  orbitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.6,
    textShadowColor: 'rgba(26,138,125,0.6)',
    textShadowRadius: 10,
  },
  beatTextWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 140,
  },
  beatText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  brandWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: { marginBottom: 20 },
  wordmark: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '700',
    letterSpacing: -1.5,
  },
  accentLine: {
    width: 40,
    height: 2,
    backgroundColor: '#1A8A7D',
    marginBottom: 14,
    borderRadius: 1,
  },
  subtitle: {
    color: 'rgba(232,238,243,0.85)',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  credit: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 11,
    letterSpacing: 2.5,
    fontWeight: '600',
    marginTop: 10,
  },
});
