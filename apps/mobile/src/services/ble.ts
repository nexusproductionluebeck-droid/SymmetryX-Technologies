import { MockBleScanner, type BleAdvertisement } from '@magnax/shared';

/**
 * BLE service facade. During development the mock scanner emits
 * deterministic advertisements. On device, replace with
 * `react-native-ble-plx` and keep the listener contract identical.
 */
export class BleService {
  private scanner = new MockBleScanner({ intervalMs: 800, maxResults: 6 });

  startScan(onFound: (adv: BleAdvertisement) => void): () => void {
    const unsubscribe = this.scanner.onAdvertisement(onFound);
    this.scanner.start();
    return () => {
      unsubscribe();
      this.scanner.stop();
    };
  }

  stopScan(): void {
    this.scanner.stop();
  }
}

let instance: BleService | null = null;

export function getBleService(): BleService {
  if (!instance) instance = new BleService();
  return instance;
}
