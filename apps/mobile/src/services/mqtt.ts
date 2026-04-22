import {
  MockMqttClient,
  attachMockDeviceFirmware,
  type DeviceCommand,
  type DeviceStateEvent,
} from '@magnax/shared';

/**
 * MQTT service facade. Swap `MockMqttClient` for `mqtt.js` or
 * `mqtt_client` (Flutter) once real brokers are provisioned.
 */
class MqttService {
  private client = new MockMqttClient();
  private firmwareUnsubs = new Map<string, () => void>();

  async connect(): Promise<void> {
    if (this.client.isConnected()) return;
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  /**
   * Ensure a mock "firmware" is attached for the given device so
   * commands round-trip through state events. No-op once attached.
   */
  ensureDeviceSim(deviceId: string): void {
    if (this.firmwareUnsubs.has(deviceId)) return;
    const unsub = attachMockDeviceFirmware(this.client, deviceId, {
      on: false,
      brightness: 0,
      colorTempK: 3000,
    });
    this.firmwareUnsubs.set(deviceId, unsub);
  }

  publishCommand(deviceId: string, command: DeviceCommand): void {
    this.ensureDeviceSim(deviceId);
    this.client.publish<DeviceCommand>(`magnax/device/${deviceId}/command`, command, { qos: 1 });
  }

  subscribeState(deviceId: string, listener: (event: DeviceStateEvent) => void): () => void {
    this.ensureDeviceSim(deviceId);
    return this.client.subscribe<DeviceStateEvent>(
      `magnax/device/${deviceId}/state`,
      (env) => listener(env.payload),
    );
  }
}

let instance: MqttService | null = null;

export function getMqttService(): MqttService {
  if (!instance) instance = new MqttService();
  return instance;
}
