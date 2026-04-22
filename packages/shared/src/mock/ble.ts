import { DEVICE_METADATA, type Device, type DeviceType } from '../types/device';
import { DISCOVERY_POOL, makeMockDevice } from './devices';

export interface BleAdvertisement {
  id: string;
  localName: string;
  rssiDbm: number;
  type: DeviceType;
  serviceUuid: string;
  device: Device;
}

export type BleScanListener = (adv: BleAdvertisement) => void;

export interface BleScannerOptions {
  /** Pool of device types the mock scanner rotates through. */
  pool?: ReadonlyArray<DeviceType>;
  /** Delay between advertisement emissions in ms. */
  intervalMs?: number;
  /** Upper bound on number of advertisements emitted before stopping. */
  maxResults?: number;
  /** Deterministic seed for RSSI + ordering. */
  seed?: number;
}

/**
 * MagnaX BLE mock scanner.
 *
 * Emits pseudo-random advertisements resembling a house full of
 * commissioning-mode MagnaX devices. Swap for `react-native-ble-plx`
 * or `flutter_blue_plus` in a native build — same callback shape.
 */
export class MockBleScanner {
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<BleScanListener>();
  private emitted = 0;
  private readonly options: Required<BleScannerOptions>;

  constructor(options: BleScannerOptions = {}) {
    this.options = {
      pool: options.pool ?? DISCOVERY_POOL,
      intervalMs: options.intervalMs ?? 900,
      maxResults: options.maxResults ?? 8,
      seed: options.seed ?? 42,
    };
  }

  onAdvertisement(listener: BleScanListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  start(): void {
    if (this.timer) return;
    this.emitted = 0;
    this.timer = setInterval(() => this.tick(), this.options.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  isScanning(): boolean {
    return this.timer !== null;
  }

  private tick(): void {
    if (this.emitted >= this.options.maxResults) {
      this.stop();
      return;
    }
    const { pool, seed } = this.options;
    const type = pool[(this.emitted + seed) % pool.length];
    if (!type) return;
    const device = makeMockDevice(type, this.emitted + 1);
    const rssi = -40 - ((this.emitted * 7 + seed) % 40);
    const adv: BleAdvertisement = {
      id: device.id,
      localName: `${DEVICE_METADATA[type].label} (#${this.emitted + 1})`,
      rssiDbm: rssi,
      type,
      serviceUuid: '0000a5a5-0000-1000-8000-00805f9b34fb',
      device,
    };
    this.emitted += 1;
    for (const listener of this.listeners) listener(adv);
  }
}
