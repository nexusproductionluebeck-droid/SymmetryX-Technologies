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
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/theme/ThemeProvider';
import { MagnaXLogoMark } from '@/components/MagnaXLogoMark';

export function SplashScreen() {
  const theme = useTheme();
  const scale = useSharedValue(0.6);
  const glow = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.back(1.8)) });
    glow.value = withDelay(
      220,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 700 }),
          withTiming(0.3, { duration: 700 }),
        ),
        -1,
        true,
      ),
    );
  }, [scale, glow]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.6 + glow.value * 0.4,
  }));

  return (
    <LinearGradient
      colors={[theme.palette.navy, '#0A1B30']}
      style={styles.container}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <MagnaXLogoMark size={96} color={theme.palette.teal} accent={theme.palette.white} />
      </Animated.View>
      <Text style={styles.wordmark}>MagnaX</Text>
      <Text style={styles.tagline}>by SymmetryX Technologies</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoWrap: { marginBottom: 24 },
  wordmark: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  tagline: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
