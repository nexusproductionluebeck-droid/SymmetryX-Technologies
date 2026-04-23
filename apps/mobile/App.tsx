import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FEATURES } from '@/config/features';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { RootNavigator } from '@/navigation/RootNavigator';
import { PresentationIntro } from '@/screens/PresentationIntro';
import { SplashScreen } from '@/screens/SplashScreen';
import { bootstrapServices } from '@/services/bootstrap';
import { startMeshSimulator } from '@/services/meshSimulator';
import { startMotionSimulator } from '@/services/motionSimulator';
import { startSensorSimulator } from '@/services/sensorSimulator';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [introDone, setIntroDone] = useState(!FEATURES.SHOW_PRESENTATION_INTRO);

  useEffect(() => {
    let cancelled = false;
    bootstrapServices()
      .then(() => {
        if (!cancelled) setIsReady(true);
      })
      .catch((err: unknown) => {
        console.error('Bootstrap failed', err);
        if (!cancelled) setIsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const sensor = startSensorSimulator();
    const mesh = startMeshSimulator();
    const motion = startMotionSimulator();
    return () => {
      sensor.stop();
      mesh.stop();
      motion.stop();
    };
  }, [isReady]);

  // Staging of the cold-start sequence:
  //   1. PresentationIntro (20 s, skippable, feature-flagged)
  //   2. SplashScreen (while bootstrapServices resolves, min ~2.8 s)
  //   3. NavigationContainer + RootNavigator
  const showIntro = !introDone;
  const showSplash = introDone && !isReady;
  const showApp = introDone && isReady;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <View style={styles.root}>
            {showIntro && <PresentationIntro onDone={() => setIntroDone(true)} />}
            {showSplash && <SplashScreen />}
            {showApp && (
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            )}
            <StatusBar style="light" />
          </View>
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
