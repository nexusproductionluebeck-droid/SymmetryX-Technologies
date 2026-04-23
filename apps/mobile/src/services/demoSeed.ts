import {
  emptyAccessoryState,
  makeCameraState,
  makeMockDevice,
  type Device,
} from '@magnax/shared';

import { useDeviceStore } from '@/store/deviceStore';

/**
 * Seeds a demo living-room: MAGNA-X lights + Cam + motion sensor +
 * blind + window + fan, all pre-assigned to "Wohnzimmer". Used for
 * investor / partner demos so the app is not empty on first launch.
 *
 * Idempotent — clicking twice doesn't add duplicate devices.
 */
export function seedDemoLivingRoom(): void {
  const store = useDeviceStore.getState();
  const existing = Object.values(store.devices);
  const hasRoom = existing.some((d) => (d.roomId ?? '').toLowerCase() === 'wohnzimmer');
  if (hasRoom) return;

  // Two MAGNA-X lights
  store.upsert(
    mergeDevice(makeMockDevice('pure', 1001), 'demo-pure-living-01', {
      name: 'Sofa-Licht',
      status: 'online',
      roomId: 'wohnzimmer',
      state: {
        on: true,
        brightness: 72,
        colorTempK: 2800,
        rgb: null,
        sensors: null,
        accessory: emptyAccessoryState(),
      },
    }),
  );
  store.upsert(
    mergeDevice(makeMockDevice('sense', 1002), 'demo-sense-living-01', {
      name: 'Deckenlicht Sense',
      status: 'online',
      roomId: 'wohnzimmer',
      state: {
        on: true,
        brightness: 45,
        colorTempK: 3400,
        rgb: null,
        sensors: {
          temperatureC: 22.4,
          humidityPct: 48,
          co2Ppm: 620,
          luxAmbient: 220,
          motionDetected: false,
          recordedAt: new Date().toISOString(),
        },
        accessory: emptyAccessoryState(),
      },
    }),
  );

  // Accessories
  store.upsert(
    mergeDevice(makeMockDevice('blind', 1003), 'demo-blind-living-01', {
      name: 'Jalousie',
      status: 'online',
      roomId: 'wohnzimmer',
    }),
  );
  store.upsert(
    mergeDevice(makeMockDevice('window', 1004), 'demo-window-living-01', {
      name: 'Fenster Süd',
      status: 'online',
      roomId: 'wohnzimmer',
    }),
  );
  store.upsert(
    mergeDevice(makeMockDevice('fan', 1005), 'demo-fan-living-01', {
      name: 'Deckenlüfter',
      status: 'online',
      roomId: 'wohnzimmer',
    }),
  );

  // Motion sensor + Cam — with a small pre-seeded history so the
  // feed has content on first render.
  store.upsert(
    mergeDevice(makeMockDevice('motion', 1006), 'demo-motion-living-01', {
      name: 'Flur-Seite',
      status: 'online',
      roomId: 'wohnzimmer',
      state: {
        on: false,
        brightness: 0,
        colorTempK: 3000,
        rgb: null,
        sensors: null,
        accessory: {
          ...emptyAccessoryState(),
          motionPresent: false,
          motionHistory: [
            {
              id: 'seed-motion-1',
              at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
              zone: 'Sofa-Bereich',
            },
            {
              id: 'seed-motion-2',
              at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
              zone: 'Eingang',
            },
            {
              id: 'seed-motion-3',
              at: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
              zone: 'Fenster Süd',
            },
          ],
        },
      },
    }),
  );
  store.upsert(
    mergeDevice(makeMockDevice('cam', 1007), 'demo-cam-living-01', {
      name: 'MAGNA-X Cam',
      status: 'online',
      roomId: 'wohnzimmer',
      state: {
        on: true,
        brightness: 0,
        colorTempK: 3000,
        rgb: null,
        sensors: null,
        accessory: { ...emptyAccessoryState(), camera: makeCameraState() },
      },
    }),
  );
}

function mergeDevice(base: Device, id: string, patch: Partial<Device>): Device {
  return { ...base, ...patch, id };
}
