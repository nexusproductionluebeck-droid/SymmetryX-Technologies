import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@/theme/ThemeProvider';
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
  const theme = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.brand },
        headerTintColor: theme.palette.white,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeCarouselScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Anmelden' }} />
      <Stack.Screen name="SetupProduct" component={SetupProductScreen} options={{ title: 'Was hast du gekauft?' }} />
      <Stack.Screen name="SetupBluetooth" component={SetupBluetoothScreen} options={{ title: 'Gerät finden' }} />
      <Stack.Screen name="SetupWifi" component={SetupWifiScreen} options={{ title: 'WLAN' }} />
      <Stack.Screen name="SetupRoom" component={SetupRoomScreen} options={{ title: 'Raum zuweisen' }} />
      <Stack.Screen name="SetupTest" component={SetupTestScreen} options={{ title: 'Funktionstest' }} />
      <Stack.Screen name="SetupComplete" component={SetupCompleteScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'MagnaX' }} />
      <Stack.Screen name="DeviceDetail" component={DeviceDetailScreen} options={{ title: 'Gerät' }} />
    </Stack.Navigator>
  );
}
