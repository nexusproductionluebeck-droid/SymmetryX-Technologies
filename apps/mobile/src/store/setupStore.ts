import { create } from 'zustand';
import type { DeviceType } from '@magnax/shared';

export type SetupStep =
  | 'product'
  | 'bluetooth'
  | 'wifi'
  | 'room'
  | 'test'
  | 'complete';

interface SetupStoreState {
  productType: DeviceType | null;
  discoveredDeviceId: string | null;
  wifiSsid: string | null;
  wifiPassword: string | null;
  roomName: string | null;
  step: SetupStep;
  setProductType: (type: DeviceType) => void;
  setDiscoveredDevice: (id: string) => void;
  setWifi: (ssid: string, password: string) => void;
  setRoom: (name: string) => void;
  advance: (step: SetupStep) => void;
  reset: () => void;
}

const initial = {
  productType: null,
  discoveredDeviceId: null,
  wifiSsid: null,
  wifiPassword: null,
  roomName: null,
  step: 'product' as SetupStep,
};

export const useSetupStore = create<SetupStoreState>((set) => ({
  ...initial,
  setProductType: (productType) => set({ productType }),
  setDiscoveredDevice: (discoveredDeviceId) => set({ discoveredDeviceId }),
  setWifi: (wifiSsid, wifiPassword) => set({ wifiSsid, wifiPassword }),
  setRoom: (roomName) => set({ roomName }),
  advance: (step) => set({ step }),
  reset: () => set(initial),
}));
