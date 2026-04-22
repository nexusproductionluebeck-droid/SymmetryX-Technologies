import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { MagnaXLogoMark } from '@/components/MagnaXLogoMark';
import { useTheme } from '@/theme/ThemeProvider';

const RING_SIZES = [180, 240, 300];

export function SplashScreen() {
  const theme = useTheme();
  const logoScale = useSharedValue(0.55);
  const logoOpacity = useSharedValue(0);
  const wordmarkY = useSharedValue(14);
  const wordmarkOpacity = useSharedValue(0);
  const ringPulse = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withTiming(1, { duration: 620, easing: Easing.out(Easing.back(1.6)) });
    logoOpacity.value = withTiming(1, { duration: 420 });
    wordmarkY.value = withDelay(220, withTiming(0, { duration: 560, easing: Easing.out(Easing.cubic) }));
    wordmarkOpacity.value = withDelay(220, withTiming(1, { duration: 560 }));
    ringPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, [logoScale, logoOpacity, wordmarkY, wordmarkOpacity, ringPulse]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: wordmarkY.value }],
    opacity: wordmarkOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <AnimatedBackground intensity="calm" />

      <View style={styles.stage}>
        {RING_SIZES.map((size, idx) => (
          <PulseRing key={size} size={size} delay={idx * 380} progress={ringPulse} />
        ))}

        <Animated.View style={logoStyle}>
          <MagnaXLogoMark size={112} color={theme.palette.teal} accent={theme.palette.white} />
        </Animated.View>
      </View>

      <Animated.View style={[styles.wordmarkWrap, wordmarkStyle]}>
        <Text style={styles.wordmark}>MagnaX</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>by SymmetryX Technologies</Text>
      </Animated.View>

      <View style={styles.footer} pointerEvents="none">
        <GlowRadial />
      </View>
    </View>
  );
}

function PulseRing({
  size,
  delay,
  progress,
}: {
  size: number;
  delay: number;
  progress: Animated.SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const localDelay = delay / 1400;
    const shifted = (progress.value - localDelay + 1) % 1;
    return {
      opacity: (1 - shifted) * 0.45,
      transform: [{ scale: 0.7 + shifted * 0.6 }],
    };
  });
  return (
    <Animated.View
      style={[
        ringStyles.ring,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    />
  );
}

function GlowRadial() {
  return (
    <Svg width="100%" height="100%">
      <Defs>
        <RadialGradient id="footerGlow" cx="50%" cy="100%" r="65%">
          <Stop offset="0" stopColor="#1A8A7D" stopOpacity={0.22} />
          <Stop offset="1" stopColor="#1A8A7D" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx="50%" cy="100%" r="60%" fill="url(#footerGlow)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05090F', alignItems: 'center', justifyContent: 'center' },
  stage: { alignItems: 'center', justifyContent: 'center' },
  wordmarkWrap: { marginTop: 36, alignItems: 'center' },
  wordmark: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
  },
  divider: { width: 40, height: 2, backgroundColor: 'rgba(26,138,125,0.9)', marginTop: 14, borderRadius: 1 },
  tagline: {
    color: 'rgba(232,238,243,0.55)',
    marginTop: 14,
    fontSize: 11,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 220 },
});

const ringStyles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(26,138,125,0.4)',
  },
});
