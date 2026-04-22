import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button } from '@/components/Button';
import { MagnaXLogoMark } from '@/components/MagnaXLogoMark';
import { useTheme } from '@/theme/ThemeProvider';
import { useSetupStore } from '@/store/setupStore';
import type { RootScreenProps } from '@/navigation/types';

export function SetupCompleteScreen({ navigation }: RootScreenProps<'SetupComplete'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reset = useSetupStore((s) => s.reset);

  const scale = useSharedValue(0.55);
  const fade = useSharedValue(0);
  const titleY = useSharedValue(18);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.12, { duration: 480, easing: Easing.out(Easing.back(1.8)) }),
      withTiming(1, { duration: 280 }),
    );
    fade.value = withTiming(1, { duration: 420 });
    titleY.value = withDelay(220, withTiming(0, { duration: 520, easing: Easing.out(Easing.cubic) }));
  }, [scale, fade, titleY]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: fade.value,
  }));
  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: fade.value,
  }));

  const handleDone = () => {
    reset();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground intensity="active" />

      <View style={styles.stage}>
        <Animated.View style={logoStyle}>
          <MagnaXLogoMark size={128} color={theme.palette.teal} accent={theme.palette.white} />
        </Animated.View>

        <Animated.View style={[styles.textWrap, titleStyle]}>
          <Text style={styles.title}>Live.</Text>
          <Text style={styles.body}>
            Dein erster MagnaX-Punkt ist aktiv. Ein Stück Decke weniger Deko, ein Stück mehr
            Infrastruktur.
          </Text>
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Button label="Zum Dashboard" onPress={handleDone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05090F' },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  textWrap: { alignItems: 'center', marginTop: 36, maxWidth: 360 },
  title: { color: '#FFFFFF', fontSize: 56, fontWeight: '700', letterSpacing: -2 },
  body: {
    color: 'rgba(232,238,243,0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  footer: { paddingHorizontal: 24 },
});
