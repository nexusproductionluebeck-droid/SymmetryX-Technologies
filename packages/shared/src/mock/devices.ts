import { CAPABILITY_MATRIX, type Device, type DeviceType } from '../types/device';

/**
 * Deterministic device factory used during discovery/onboarding
 * when real BLE + MQTT hardware is unavailable.
 */
export function makeMockDevice(
  type: DeviceType,
  index: number,
  overrides: Partial<Device> = {},
): Device {
  const id = `magnax-${type}-${index.toString().padStart(4, '0')}`;
  const mac = formatMac(type, index);
  const capabilities = CAPABILITY_MATRIX[type];

  const base: Device = {
    id,
    name: `${type.toUpperCase()} ${index}`,
    type,
    status: 'commissioning',
    roomId: null,
    macAddress: mac,
    ipAddress: null,
    capabilities,
    state: {
      on: false,
      brightness: 0,
      colorTempK: 3000,
      rgb: null,
      sensors: capabilities.sensors
        ? {
            temperatureC: 22.4,
            humidityPct: 48,
            co2Ppm: 620,
            luxAmbient: 180,
            motionDetected: false,
            recordedAt: new Date().toISOString(),
          }
        : null,
    },
    firmware: {
      current: '1.0.0',
      latest: '1.0.0',
      updateAvailable: false,
      lastUpdatedAt: null,
    },
    mesh: capabilities.mesh
      ? { role: 'leaf', rssiDbm: -52, connectedClients: 0, uplinkMbps: 0 }
      : null,
    lastSeen: new Date().toISOString(),
  };

  return { ...base, ...overrides };
}

function formatMac(type: DeviceType, index: number): string {
  const prefix = 'MX';
  const suffix = index.toString(16).padStart(8, '0').toUpperCase();
  const groups = suffix.match(/.{1,2}/g) ?? [];
  return [prefix, type.slice(0, 2).toUpperCase(), ...groups].join(':');
}

export const DISCOVERY_POOL: ReadonlyArray<DeviceType> = [
  'pure',
  'mesh',
  'sense',
  'sense-smoke',
  'cam',
  'stick',
];
