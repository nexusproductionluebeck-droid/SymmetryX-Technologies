import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { MagnaXLogoMark } from '@/components/MagnaXLogoMark';
import { useTheme } from '@/theme/ThemeProvider';
import { useSetupStore } from '@/store/setupStore';
import type { RootScreenProps } from '@/navigation/types';

export function SetupCompleteScreen({ navigation }: RootScreenProps<'SetupComplete'>) {
  const theme = useTheme();
  const reset = useSetupStore((s) => s.reset);
  const scale = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.1, { duration: 400, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 240 }),
    );
  }, [scale]);

  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleDone = () => {
    reset();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <LinearGradient colors={[theme.palette.navy, '#0A1B30']} style={styles.container}>
      <Animated.View style={logoStyle}>
        <MagnaXLogoMark size={112} color={theme.palette.teal} accent={theme.palette.white} />
      </Animated.View>
      <Text style={styles.title}>Dein erster MagnaX-Punkt ist live.</Text>
      <Text style={styles.body}>
        Ein Stück Decke weniger Deko, ein Stück mehr Infrastruktur. Willkommen im MagnaX-Universum.
      </Text>
      <Button label="Zum Dashboard" onPress={handleDone} style={{ marginTop: 32, minWidth: 240 }} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 28,
    letterSpacing: -0.4,
  },
  body: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    maxWidth: 320,
  },
});
