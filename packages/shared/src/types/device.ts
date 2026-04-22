export type DeviceType =
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

export interface DeviceState {
  on: boolean;
  brightness: number;
  colorTempK: number;
  rgb: { r: number; g: number; b: number } | null;
  sensors: SensorReading | null;
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
};
