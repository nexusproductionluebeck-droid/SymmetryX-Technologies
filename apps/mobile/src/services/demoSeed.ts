import {
  emptyAccessoryState,
  makeCameraState,
  makeMockDevice,
  type AccessoryState,
  type Device,
  type DeviceType,
  type SensorReading,
} from '@magnax/shared';

import { useDeviceStore } from '@/store/deviceStore';

/**
 * Seeds a complete single-family home demo: 8 rooms across ground
 * floor + upper floor + utility, 30+ devices covering every
 * accessory + MAGNA-X hardware variant. Idempotent; a second call
 * is a no-op if the home already exists.
 */

interface RoomPlan {
  id: string;
  label: string;
  floor: 'EG' | 'OG' | 'KG';
  devices: DeviceSeed[];
}

interface DeviceSeed {
  type: DeviceType;
  name: string;
  initial?: Partial<Device['state']>;
  index: number;
}

const HOME: RoomPlan[] = [
  {
    id: 'wohnzimmer',
    label: 'Wohnzimmer',
    floor: 'EG',
    devices: [
      { type: 'pure', name: 'Sofa-Licht', index: 1001, initial: lightOn(72, 2800) },
      { type: 'sense', name: 'Deckenlicht Sense', index: 1002, initial: senseOn(45, 3400) },
      { type: 'blind', name: 'Jalousie Süd', index: 1003 },
      { type: 'window', name: 'Fenster Süd', index: 1004 },
      { type: 'fan', name: 'Deckenlüfter', index: 1005 },
      { type: 'motion', name: 'Bewegung Sofa', index: 1006, initial: motionSeed() },
      { type: 'cam', name: 'MAGNA-X Cam', index: 1007, initial: camOn() },
    ],
  },
  {
    id: 'kueche',
    label: 'Küche',
    floor: 'EG',
    devices: [
      { type: 'sense', name: 'Arbeitsplatte', index: 1101, initial: senseOn(85, 4200) },
      { type: 'pure', name: 'Esstisch', index: 1102, initial: lightOn(60, 2700) },
      { type: 'sense-smoke', name: 'Herd-Sensor', index: 1103 },
      { type: 'blind', name: 'Küchen-Jalousie', index: 1104 },
      { type: 'motion', name: 'Bewegung Küche', index: 1105, initial: motionSeed() },
    ],
  },
  {
    id: 'flur-eg',
    label: 'Flur EG',
    floor: 'EG',
    devices: [
      { type: 'mesh', name: 'Flur-Licht', index: 1201, initial: lightOn(30, 3000) },
      { type: 'motion', name: 'Bewegung Eingang', index: 1202, initial: motionSeed() },
      { type: 'cam', name: 'Eingangs-Cam', index: 1203, initial: camOn() },
    ],
  },
  {
    id: 'buero',
    label: 'Büro',
    floor: 'EG',
    devices: [
      { type: 'sense', name: 'Arbeitsplatz', index: 1301, initial: senseOn(90, 5200) },
      { type: 'blind', name: 'Büro-Jalousie', index: 1302 },
      { type: 'window', name: 'Büro-Fenster', index: 1303 },
      { type: 'fan', name: 'Tisch-Lüfter', index: 1304 },
    ],
  },
  {
    id: 'schlafzimmer',
    label: 'Schlafzimmer',
    floor: 'OG',
    devices: [
      { type: 'pure', name: 'Nachttisch links', index: 1401, initial: lightOn(20, 2200) },
      { type: 'pure', name: 'Nachttisch rechts', index: 1402 },
      { type: 'sense', name: 'Deckenlicht', index: 1403 },
      { type: 'blind', name: 'Schlafzimmer-Jalousie', index: 1404 },
      { type: 'window', name: 'Fenster Nord', index: 1405 },
    ],
  },
  {
    id: 'kinderzimmer',
    label: 'Kinderzimmer',
    floor: 'OG',
    devices: [
      { type: 'pure', name: 'Kinderlicht', index: 1501, initial: lightOn(55, 2500) },
      { type: 'sense-smoke', name: 'Rauchmelder', index: 1502 },
      { type: 'motion', name: 'Bewegung Tür', index: 1503, initial: motionSeed() },
      { type: 'blind', name: 'Jalousie', index: 1504 },
    ],
  },
  {
    id: 'badezimmer',
    label: 'Badezimmer',
    floor: 'OG',
    devices: [
      { type: 'sense', name: 'Spiegellicht', index: 1601, initial: senseOn(75, 4000) },
      { type: 'fan', name: 'Lüftung', index: 1602 },
      { type: 'motion', name: 'Bewegung', index: 1603, initial: motionSeed() },
    ],
  },
  {
    id: 'garage',
    label: 'Garage',
    floor: 'KG',
    devices: [
      { type: 'industrial', name: 'Hallen-Licht', index: 1701, initial: lightOn(100, 5500) },
      { type: 'cam', name: 'Garage Cam', index: 1702, initial: camOn() },
      { type: 'motion', name: 'Tor-Bewegung', index: 1703, initial: motionSeed() },
    ],
  },
];

export function seedDemoHome(): void {
  const store = useDeviceStore.getState();
  const existing = Object.values(store.devices);
  const hasHome = existing.some((d) => d.id.startsWith('demo-home-'));
  if (hasHome) return;

  for (const room of HOME) {
    for (const seed of room.devices) {
      const base = makeMockDevice(seed.type, seed.index);
      const accessory: AccessoryState = seed.initial?.accessory ?? base.state.accessory;
      const device: Device = {
        ...base,
        id: `demo-home-${room.id}-${seed.index}`,
        name: seed.name,
        status: 'online',
        roomId: room.id,
        state: {
          ...base.state,
          ...(seed.initial ?? {}),
          accessory,
        },
      };
      store.upsert(device);
    }
  }
}

/**
 * Legacy single-room seed — kept for the older "Demo-Wohnzimmer
 * laden" button label on empty-state home, now redirects to the
 * full home.
 */
export function seedDemoLivingRoom(): void {
  seedDemoHome();
}

export const DEMO_HOME_ROOMS: ReadonlyArray<{ id: string; label: string; floor: 'EG' | 'OG' | 'KG' }> =
  HOME.map(({ id, label, floor }) => ({ id, label, floor }));

function lightOn(brightness: number, colorTempK: number): Partial<Device['state']> {
  return {
    on: true,
    brightness,
    colorTempK,
    rgb: null,
    sensors: null,
    accessory: emptyAccessoryState(),
  };
}

function senseOn(brightness: number, colorTempK: number): Partial<Device['state']> {
  const sensors: SensorReading = {
    temperatureC: 21 + Math.random() * 3,
    humidityPct: 42 + Math.random() * 12,
    co2Ppm: 540 + Math.random() * 200,
    luxAmbient: 150 + Math.random() * 300,
    motionDetected: false,
    recordedAt: new Date().toISOString(),
  };
  return {
    on: true,
    brightness,
    colorTempK,
    rgb: null,
    sensors,
    accessory: emptyAccessoryState(),
  };
}

function camOn(): Partial<Device['state']> {
  return {
    on: true,
    brightness: 0,
    colorTempK: 3000,
    rgb: null,
    sensors: null,
    accessory: { ...emptyAccessoryState(), camera: makeCameraState() },
  };
}

function motionSeed(): Partial<Device['state']> {
  const now = Date.now();
  return {
    on: false,
    brightness: 0,
    colorTempK: 3000,
    rgb: null,
    sensors: null,
    accessory: {
      ...emptyAccessoryState(),
      motionPresent: false,
      motionHistory: [
        { id: `seed-${now}-1`, at: new Date(now - 3 * 60_000).toISOString(), zone: 'Zentrum' },
        { id: `seed-${now}-2`, at: new Date(now - 18 * 60_000).toISOString(), zone: 'Tür' },
      ],
    },
  };
}
