/**
 * MAGNA-X ceiling hardware.
 */
export type MagnaxDeviceType =
  | 'pure'
  | 'mesh'
  | 'sense'
  | 'sense-smoke'
  | 'cam'
  | 'stick'
  | 'industrial'
  | 'plug'
  | 'pole'
  | 'switch';

/**
 * Third-party accessories the MAGNA-X app steers through the platform —
 * blinds, windows, fans, heaters, etc. They may speak Matter/Zigbee/
 * Thread under the hood, but in the app they sit alongside MAGNA-X
 * nodes as first-class room citizens.
 */
export type AccessoryType = 'blind' | 'window' | 'fan' | 'heater' | 'outlet' | 'motion';

export type DeviceType = MagnaxDeviceType | AccessoryType;

export const ACCESSORY_TYPES: ReadonlyArray<AccessoryType> = [
  'blind',
  'window',
  'fan',
  'heater',
  'outlet',
  'motion',
];

export function isAccessory(type: DeviceType): type is AccessoryType {
  return (ACCESSORY_TYPES as ReadonlyArray<string>).includes(type);
}

export type DeviceStatus = 'online' | 'offline' | 'warning' | 'commissioning';

export interface DeviceCapabilities {
  dimming: boolean;
  colorTemperature: boolean;
  rgb: boolean;
  mesh: boolean;
  sensors: boolean;
  camera: boolean;
  smokeDetector: boolean;
}

export interface SensorReading {
  temperatureC: number;
  humidityPct: number;
  co2Ppm: number;
  luxAmbient: number;
  motionDetected: boolean;
  recordedAt: string;
}

export interface FirmwareInfo {
  current: string;
  latest: string;
  updateAvailable: boolean;
  lastUpdatedAt: string | null;
}

export interface MeshInfo {
  role: 'root' | 'node' | 'leaf';
  rssiDbm: number;
  connectedClients: number;
  uplinkMbps: number;
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  roomId: string | null;
  macAddress: string;
  ipAddress: string | null;
  capabilities: DeviceCapabilities;
  state: DeviceState;
  firmware: FirmwareInfo;
  mesh: MeshInfo | null;
  lastSeen: string;
}

export type WindowMode = 'closed' | 'tilt' | 'open';

export interface MotionEvent {
  id: string;
  at: string;
  zone: string;
}

export interface CameraState {
  streaming: boolean;
  privacyMode: boolean;
  motionZonesActive: boolean;
  lastSnapshotAt: string | null;
}

/**
 * User-controllable toggles for a Sense module's *sensor* side of
 * the device. Strictly separate from the device's *light* side
 * (which is governed by `DeviceState.on / brightness / colorTempK`).
 */
export interface SensorSettings {
  motionDetection: boolean;
  airQualityAlert: boolean;
  temperatureAlert: boolean;
  smokeAlarm: boolean;
  presenceLogging: boolean;
  aiPatternDetection: boolean;
}

export const DEFAULT_SENSOR_SETTINGS: SensorSettings = {
  motionDetection: true,
  airQualityAlert: true,
  temperatureAlert: false,
  smokeAlarm: true,
  presenceLogging: true,
  aiPatternDetection: true,
};

/**
 * A single pattern surfaced by the MAGNA-X AI on-device pattern
 * recogniser. Produced locally from time-series sensor data.
 */
export type AiInsightKind =
  | 'air-quality-trend'
  | 'temperature-drift'
  | 'occupancy-routine'
  | 'smoke-anomaly'
  | 'energy-optimisation'
  | 'motion-schedule';

export type AiInsightTone = 'info' | 'advisory' | 'alert';

export interface AiInsight {
  id: string;
  kind: AiInsightKind;
  tone: AiInsightTone;
  title: string;
  body: string;
  detectedAt: string;
  confidence: number; // 0..1
}

export interface AccessoryState {
  /** Blind position 0 (fully open) – 100 (fully closed). */
  blindPosition: number | null;
  /** Window mode — closed, tilted, or fully open. */
  windowMode: WindowMode | null;
  /** Fan speed 0 – 100. */
  fanSpeed: number | null;
  /** Heater target temperature in °C. */
  heaterTargetC: number | null;
  /** Outlet power on/off. */
  outletOn: boolean | null;
  /** Motion sensor current occupancy + recent events. */
  motionPresent: boolean | null;
  /** Rolling buffer of recent motion events (newest first). */
  motionHistory: MotionEvent[] | null;
  /** Camera stream + privacy state (used by MAGNA-X Cam). */
  camera: CameraState | null;
  /** Per-device Sense configuration (checkbox toggles). */
  sensorSettings: SensorSettings | null;
}

export interface DeviceState {
  on: boolean;
  brightness: number;
  colorTempK: number;
  rgb: { r: number; g: number; b: number } | null;
  sensors: SensorReading | null;
  accessory: AccessoryState;
}

const EMPTY_ACCESSORY_STATE: AccessoryState = {
  blindPosition: null,
  windowMode: null,
  fanSpeed: null,
  heaterTargetC: null,
  outletOn: null,
  motionPresent: null,
  motionHistory: null,
  camera: null,
  sensorSettings: null,
};

export function makeAccessoryState(type: AccessoryType): AccessoryState {
  switch (type) {
    case 'blind':
      return { ...EMPTY_ACCESSORY_STATE, blindPosition: 0 };
    case 'window':
      return { ...EMPTY_ACCESSORY_STATE, windowMode: 'closed' };
    case 'fan':
      return { ...EMPTY_ACCESSORY_STATE, fanSpeed: 0 };
    case 'heater':
      return { ...EMPTY_ACCESSORY_STATE, heaterTargetC: 21 };
    case 'outlet':
      return { ...EMPTY_ACCESSORY_STATE, outletOn: false };
    case 'motion':
      return { ...EMPTY_ACCESSORY_STATE, motionPresent: false, motionHistory: [] };
    default:
      return EMPTY_ACCESSORY_STATE;
  }
}

export function makeCameraState(): CameraState {
  return {
    streaming: true,
    privacyMode: false,
    motionZonesActive: true,
    lastSnapshotAt: null,
  };
}

export function emptyAccessoryState(): AccessoryState {
  return EMPTY_ACCESSORY_STATE;
}

export const CAPABILITY_MATRIX: Record<DeviceType, DeviceCapabilities> = {
  pure: {
    dimming: true,
    colorTemperature: true,
    rgb: false,
    mesh: false,
    sensors: false,
    camera: false,
    smokeDetector: false,
  },
  mesh: {
    dimming: true,
    colorTemperature: true,
    rgb: false,
    mesh: true,
    sensors: false,
    camera: false,
    smokeDetector: false,
  },
  sense: {
    dimming: true,
    colorTemperature: true,
    rgb: false,
    mesh: true,
    sensors: true,
    camera: false,
    smokeDetector: false,
  },
  'sense-smoke': {
    dimming: true,
    colorTemperature: true,
    rgb: false,
    mesh: true,
    sensors: true,
    camera: false,
    smokeDetector: true,
  },
  cam: {
    dimming: true,
    colorTemperature: true,
    rgb: false,
    mesh: true,
    sensors: false,
    camera: true,
    smokeDetector: false,
  },
  stick: {
    dimming: true,
    colorTemperature: true,
    rgb: false,
    mesh: false,
    sensors: false,
    camera: false,
    smokeDetector: false,
  },
  industrial: {
    dimming: true,
    colorTemperature: true,
    rgb: false,
    mesh: true,
    sensors: true,
    camera: true,
    smokeDetector: true,
  },
  plug: {
    dimming: false,
    colorTemperature: false,
    rgb: false,
    mesh: false,
    sensors: false,
    camera: false,
    smokeDetector: false,
  },
  pole: {
    dimming: false,
    colorTemperature: false,
    rgb: false,
    mesh: false,
    sensors: false,
    camera: false,
    smokeDetector: false,
  },
  switch: {
    dimming: false,
    colorTemperature: false,
    rgb: false,
    mesh: false,
    sensors: false,
    camera: false,
    smokeDetector: false,
  },
  blind: {
    dimming: false,
    colorTemperature: false,
    rgb: false,
    mesh: false,
    sensors: false,
    camera: false,
    smokeDetector: false,
  },
  window: {
    dimming: false,
    colorTemperature: false,
    rgb: false,
    mesh: false,
    sensors: false,
    camera: false,
    smokeDetector: false,
  },
  fan: {
    dimming: false,
    colorTemperature: false,
    rgb: false,
    mesh: false,
    sensors: false,
    camera: false,
    smokeDetector: false,
  },
  heater: {
    dimming: false,
    colorTemperature: false,
    rgb: false,
    mesh: false,
    sensors: false,
    camera: false,
    smokeDetector: false,
  },
  outlet: {
    dimming: false,
    colorTemperature: false,
    rgb: false,
    mesh: false,
    sensors: false,
    camera: false,
    smokeDetector: false,
  },
  motion: {
    dimming: false,
    colorTemperature: false,
    rgb: false,
    mesh: false,
    sensors: false,
    camera: false,
    smokeDetector: false,
  },
};

export const DEVICE_METADATA: Record<
  DeviceType,
  { label: string; priceEur: number | null; tagline: string }
> = {
  pure: { label: 'MagnaX Pure', priceEur: 24.9, tagline: 'Nur Licht. Günstigster Einstieg.' },
  mesh: { label: 'MagnaX Mesh', priceEur: 39.9, tagline: 'WLAN-Mesh aus der Decke.' },
  sense: { label: 'MagnaX Sense', priceEur: 49.9, tagline: 'Bewegung, Temperatur, Luft.' },
  'sense-smoke': {
    label: 'MagnaX Sense+Rauch',
    priceEur: 89.9,
    tagline: 'Sensorik inkl. Rauchmelder.',
  },
  cam: { label: 'MagnaX Cam', priceEur: 129.9, tagline: 'Kamera aus der Decke.' },
  stick: { label: 'MagnaX Stick', priceEur: 44.9, tagline: 'Neonröhren-Ersatz.' },
  industrial: {
    label: 'MagnaX Industrial',
    priceEur: 249.9,
    tagline: 'Für Hallen und Logistik.',
  },
  plug: { label: 'MagnaX Plug', priceEur: null, tagline: 'Steckdose am Deckenpunkt.' },
  pole: { label: 'MagnaX Pole', priceEur: null, tagline: 'Lampenwechsel ohne Leiter.' },
  switch: { label: 'MagnaX Switch', priceEur: null, tagline: 'Intelligenter Schalter.' },
  blind: { label: 'Jalousie', priceEur: null, tagline: 'Beschattung stufenlos geregelt.' },
  window: { label: 'Fenster', priceEur: null, tagline: 'Zu · Gekippt · Offen per App.' },
  fan: { label: 'Lüfter', priceEur: null, tagline: 'Luftstrom über Drehzahl gesteuert.' },
  heater: { label: 'Heizung', priceEur: null, tagline: 'Zielwerte pro Raum.' },
  outlet: { label: 'Steckdose', priceEur: null, tagline: 'Zwischenschalter, remote.' },
  motion: { label: 'Bewegungssensor', priceEur: null, tagline: 'Präsenz + Ereignisse.' },
};
