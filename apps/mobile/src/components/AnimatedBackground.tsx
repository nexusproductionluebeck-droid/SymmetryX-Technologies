import { useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  intensity?: 'calm' | 'active';
}

/**
 * Living-wallpaper backdrop for hero surfaces. Emits two slowly
 * counter-drifting auroras plus a faint node constellation that
 * suggests a ceiling mesh overhead. Intentionally low-frequency so
 * it reads as "depth" not "motion".
 */
export function AnimatedBackground({ intensity = 'calm' }: Props) {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();

  const drift = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: intensity === 'active' ? 14000 : 22000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    pulse.value = withRepeat(
      withTiming(1, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [drift, pulse, intensity]);

  const aura1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: -width * 0.2 + drift.value * width * 0.4 },
      { translateY: -height * 0.1 + drift.value * height * 0.1 },
      { scale: 1 + pulse.value * 0.08 },
    ],
    opacity: 0.55 + pulse.value * 0.15,
  }));

  const aura2 = useAnimatedStyle(() => ({
    transform: [
      { translateX: width * 0.3 - drift.value * width * 0.35 },
      { translateY: height * 0.3 - drift.value * height * 0.15 },
      { scale: 1 - pulse.value * 0.06 },
    ],
    opacity: 0.4 + (1 - pulse.value) * 0.15,
  }));

  const constellation = useMemo(() => seedConstellation(width, height), [width, height]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#060B11', '#0A1520', '#050810'] as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[StyleSheet.absoluteFill, aura1]}>
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="aura1" cx="35%" cy="30%" r="60%">
              <Stop offset="0" stopColor={theme.palette.blue} stopOpacity={0.5} />
              <Stop offset="1" stopColor={theme.palette.blue} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={width * 0.35} cy={height * 0.3} r={height * 0.45} fill="url(#aura1)" />
        </Svg>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, aura2]}>
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="aura2" cx="70%" cy="70%" r="55%">
              <Stop offset="0" stopColor={theme.palette.teal} stopOpacity={0.35} />
              <Stop offset="1" stopColor={theme.palette.teal} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={width * 0.7} cy={height * 0.7} r={height * 0.4} fill="url(#aura2)" />
        </Svg>
      </Animated.View>

      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {constellation.map((n, i) => (
          <Circle key={i} cx={n.x} cy={n.y} r={n.r} fill={theme.palette.teal} opacity={n.op} />
        ))}
      </Svg>
    </View>
  );
}

function seedConstellation(w: number, h: number) {
  const count = 28;
  const seed = 1337;
  const nodes: { x: number; y: number; r: number; op: number }[] = [];
  for (let i = 0; i < count; i += 1) {
    const rand = pseudoRandom(seed + i * 17);
    const rand2 = pseudoRandom(seed + i * 29);
    const rand3 = pseudoRandom(seed + i * 53);
    nodes.push({
      x: rand * w,
      y: rand2 * h,
      r: 0.8 + rand3 * 1.6,
      op: 0.08 + rand3 * 0.2,
    });
  }
  return nodes;
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
