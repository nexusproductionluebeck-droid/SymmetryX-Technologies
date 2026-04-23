import { makeMockDevice, type Device } from '@magnax/shared';

import { useDeviceStore } from '@/store/deviceStore';

/**
 * Seeds a demo living-room: two MAGNA-X lights + one blind + one
 * window + one fan, all pre-assigned to "Wohnzimmer". Used for
 * investor / partner demos so the app is not empty on first launch.
 *
 * Idempotent — clicking twice doesn't add duplicate devices.
 */
export function seedDemoLivingRoom(): void {
  const store = useDeviceStore.getState();
  const existing = Object.values(store.devices);
  const hasRoom = existing.some((d) => (d.roomId ?? '').toLowerCase() === 'wohnzimmer');
  if (hasRoom) return;

  const plan: Array<{ id: string; patch: Partial<Device> }> = [
    {
      id: 'demo-pure-living-01',
      patch: {
        name: 'Sofa-Licht',
        status: 'online',
        roomId: 'wohnzimmer',
        state: {
          on: true,
          brightness: 72,
          colorTempK: 2800,
          rgb: null,
          sensors: null,
          accessory: emptyAccessory(),
        },
      },
    },
    {
      id: 'demo-sense-living-01',
      patch: {
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
          accessory: emptyAccessory(),
        },
      },
    },
  ];

  // Two MAGNA-X lights
  store.upsert(
    mergeDevice(makeMockDevice('pure', 1001), plan[0]!.id, plan[0]!.patch),
  );
  store.upsert(
    mergeDevice(makeMockDevice('sense', 1002), plan[1]!.id, plan[1]!.patch),
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
}

function mergeDevice(base: Device, id: string, patch: Partial<Device>): Device {
  return { ...base, ...patch, id };
}

function emptyAccessory() {
  return {
    blindPosition: null,
    windowMode: null,
    fanSpeed: null,
    heaterTargetC: null,
    outletOn: null,
  };
}
