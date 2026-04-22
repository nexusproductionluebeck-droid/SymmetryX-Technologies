import { create } from 'zustand';
import type { Device, DeviceType } from '@magnax/shared';

interface DeviceStoreState {
  devices: Record<string, Device>;
  orderedIds: string[];
  upsert: (device: Device) => void;
  remove: (id: string) => void;
  setBrightness: (id: string, brightness: number) => void;
  setColorTemp: (id: string, colorTempK: number) => void;
  setOn: (id: string, on: boolean) => void;
  setRoom: (id: string, roomId: string) => void;
  listByType: (type: DeviceType) => Device[];
}

export const useDeviceStore = create<DeviceStoreState>((set, get) => ({
  devices: {},
  orderedIds: [],
  upsert: (device) =>
    set((state) => {
      const existed = Boolean(state.devices[device.id]);
      return {
        devices: { ...state.devices, [device.id]: device },
        orderedIds: existed ? state.orderedIds : [...state.orderedIds, device.id],
      };
    }),
  remove: (id) =>
    set((state) => {
      const { [id]: _removed, ...rest } = state.devices;
      return {
        devices: rest,
        orderedIds: state.orderedIds.filter((x) => x !== id),
      };
    }),
  setBrightness: (id, brightness) =>
    set((state) => {
      const device = state.devices[id];
      if (!device) return state;
      return {
        devices: {
          ...state.devices,
          [id]: { ...device, state: { ...device.state, brightness, on: brightness > 0 } },
        },
      };
    }),
  setColorTemp: (id, colorTempK) =>
    set((state) => {
      const device = state.devices[id];
      if (!device) return state;
      return {
        devices: {
          ...state.devices,
          [id]: { ...device, state: { ...device.state, colorTempK } },
        },
      };
    }),
  setOn: (id, on) =>
    set((state) => {
      const device = state.devices[id];
      if (!device) return state;
      const brightness = on && device.state.brightness === 0 ? 60 : device.state.brightness;
      return {
        devices: {
          ...state.devices,
          [id]: { ...device, state: { ...device.state, on, brightness } },
        },
      };
    }),
  setRoom: (id, roomId) =>
    set((state) => {
      const device = state.devices[id];
      if (!device) return state;
      return {
        devices: { ...state.devices, [id]: { ...device, roomId, status: 'online' } },
      };
    }),
  listByType: (type) => Object.values(get().devices).filter((d) => d.type === type),
}));
