import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { WelcomeCarouselScreen } from '@/screens/WelcomeCarouselScreen';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { SetupProductScreen } from '@/screens/setup/SetupProductScreen';
import { SetupBluetoothScreen } from '@/screens/setup/SetupBluetoothScreen';
import { SetupWifiScreen } from '@/screens/setup/SetupWifiScreen';
import { SetupRoomScreen } from '@/screens/setup/SetupRoomScreen';
import { SetupTestScreen } from '@/screens/setup/SetupTestScreen';
import { SetupCompleteScreen } from '@/screens/setup/SetupCompleteScreen';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { DeviceDetailScreen } from '@/screens/device/DeviceDetailScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        // Every screen renders its own AnimatedBackground, so the
        // navigator itself is transparent-first.
        headerStyle: { backgroundColor: 'transparent' },
        headerTransparent: true,
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#05090F' },
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeCarouselScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: '' }} />
      <Stack.Screen name="SetupProduct" component={SetupProductScreen} options={{ title: 'Produkt' }} />
      <Stack.Screen name="SetupBluetooth" component={SetupBluetoothScreen} options={{ title: 'Scan' }} />
      <Stack.Screen name="SetupWifi" component={SetupWifiScreen} options={{ title: 'Netzwerk' }} />
      <Stack.Screen name="SetupRoom" component={SetupRoomScreen} options={{ title: 'Raum' }} />
      <Stack.Screen name="SetupTest" component={SetupTestScreen} options={{ title: 'Test' }} />
      <Stack.Screen name="SetupComplete" component={SetupCompleteScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DeviceDetail" component={DeviceDetailScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
