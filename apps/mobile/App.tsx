import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { RootNavigator } from '@/navigation/RootNavigator';
import { SplashScreen } from '@/screens/SplashScreen';
import { bootstrapServices } from '@/services/bootstrap';
import { startMeshSimulator } from '@/services/meshSimulator';
import { startMotionSimulator } from '@/services/motionSimulator';
import { startSensorSimulator } from '@/services/sensorSimulator';

export default function App() {
  const [isReady, setIsReady] = useState(false);

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

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <View style={styles.root}>
            {isReady ? (
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            ) : (
              <SplashScreen />
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
