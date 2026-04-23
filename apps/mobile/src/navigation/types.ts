import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SetupProduct: undefined;
  SetupBluetooth: undefined;
  SetupWifi: undefined;
  SetupRoom: undefined;
  SetupTest: undefined;
  SetupComplete: undefined;
  Home: undefined;
  DeviceDetail: { deviceId: string };
  Mesh: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
