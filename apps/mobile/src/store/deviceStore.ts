import { create } from 'zustand';
import {
  DEFAULT_SENSOR_SETTINGS,
  type AccessoryState,
  type CameraState,
  type Device,
  type DeviceType,
  type MotionEvent,
  type SensorReading,
  type SensorSettings,
  type WindowMode,
} from '@magnax/shared';

interface DeviceStoreState {
  devices: Record<string, Device>;
  orderedIds: string[];
  upsert: (device: Device) => void;
  remove: (id: string) => void;
  setBrightness: (id: string, brightness: number) => void;
  setColorTemp: (id: string, colorTempK: number) => void;
  setOn: (id: string, on: boolean) => void;
  setRoom: (id: string, roomId: string) => void;
  setSensors: (id: string, sensors: SensorReading) => void;
  setAccessory: (id: string, patch: Partial<AccessoryState>) => void;
  setBlindPosition: (id: string, position: number) => void;
  setWindowMode: (id: string, mode: WindowMode) => void;
  setFanSpeed: (id: string, speed: number) => void;
  recordMotionEvent: (id: string, event: MotionEvent) => void;
  setMotionPresent: (id: string, present: boolean) => void;
  setCamera: (id: string, patch: Partial<CameraState>) => void;
  setSensorSettings: (id: string, patch: Partial<SensorSettings>) => void;
  listByType: (type: DeviceType) => Device[];
  listByRoom: (roomId: string) => Device[];
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
  setSensors: (id, sensors) =>
    set((state) => {
      const device = state.devices[id];
      if (!device || !device.capabilities.sensors) return state;
      return {
        devices: {
          ...state.devices,
          [id]: { ...device, state: { ...device.state, sensors } },
        },
      };
    }),
  setAccessory: (id, patch) =>
    set((state) => {
      const device = state.devices[id];
      if (!device) return state;
      return {
        devices: {
          ...state.devices,
          [id]: {
            ...device,
            state: { ...device.state, accessory: { ...device.state.accessory, ...patch } },
          },
        },
      };
    }),
  setBlindPosition: (id, position) =>
    get().setAccessory(id, { blindPosition: Math.max(0, Math.min(100, position)) }),
  setWindowMode: (id, mode) => get().setAccessory(id, { windowMode: mode }),
  setFanSpeed: (id, speed) =>
    get().setAccessory(id, { fanSpeed: Math.max(0, Math.min(100, speed)) }),
  recordMotionEvent: (id, event) =>
    set((state) => {
      const device = state.devices[id];
      if (!device) return state;
      const previous = device.state.accessory.motionHistory ?? [];
      const history = [event, ...previous].slice(0, 12);
      return {
        devices: {
          ...state.devices,
          [id]: {
            ...device,
            state: {
              ...device.state,
              accessory: {
                ...device.state.accessory,
                motionHistory: history,
                motionPresent: true,
              },
            },
          },
        },
      };
    }),
  setMotionPresent: (id, present) => get().setAccessory(id, { motionPresent: present }),
  setCamera: (id, patch) =>
    set((state) => {
      const device = state.devices[id];
      if (!device) return state;
      const current = device.state.accessory.camera;
      if (!current) return state;
      return {
        devices: {
          ...state.devices,
          [id]: {
            ...device,
            state: {
              ...device.state,
              accessory: { ...device.state.accessory, camera: { ...current, ...patch } },
            },
          },
        },
      };
    }),
  setSensorSettings: (id, patch) =>
    set((state) => {
      const device = state.devices[id];
      if (!device || !device.capabilities.sensors) return state;
      const current = device.state.accessory.sensorSettings ?? DEFAULT_SENSOR_SETTINGS;
      return {
        devices: {
          ...state.devices,
          [id]: {
            ...device,
            state: {
              ...device.state,
              accessory: {
                ...device.state.accessory,
                sensorSettings: { ...current, ...patch },
              },
            },
          },
        },
      };
    }),
  listByType: (type) => Object.values(get().devices).filter((d) => d.type === type),
  listByRoom: (roomId) =>
    Object.values(get().devices).filter(
      (d) => (d.roomId ?? '').toLowerCase() === roomId.toLowerCase(),
    ),
}));
