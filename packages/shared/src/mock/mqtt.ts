import type {
  DeviceCommand,
  DeviceStateEvent,
  MqttEnvelope,
  MqttListener,
} from '../types/mqtt';

/**
 * In-memory MQTT stand-in. Mirrors the subset of the mqtt.js contract
 * we depend on so swapping to a real broker (Mosquitto, HiveMQ,
 * AWS IoT Core) is a one-line change in the service wiring.
 */
export class MockMqttClient {
  private listeners = new Map<string, Set<MqttListener>>();
  private retained = new Map<string, MqttEnvelope>();
  private connected = false;

  async connect(): Promise<void> {
    await delay(120);
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await delay(40);
    this.connected = false;
    this.listeners.clear();
  }

  isConnected(): boolean {
    return this.connected;
  }

  subscribe<T>(topic: string, listener: MqttListener<T>): () => void {
    const set = this.listeners.get(topic) ?? new Set();
    set.add(listener as MqttListener);
    this.listeners.set(topic, set);
    const retained = this.retained.get(topic);
    if (retained) (listener as MqttListener)(retained);
    return () => {
      const current = this.listeners.get(topic);
      if (!current) return;
      current.delete(listener as MqttListener);
      if (current.size === 0) this.listeners.delete(topic);
    };
  }

  publish<T>(topic: string, payload: T, opts: { qos?: 0 | 1 | 2; retain?: boolean } = {}): void {
    const env: MqttEnvelope<T> = {
      topic,
      payload,
      qos: opts.qos ?? 0,
      retain: opts.retain ?? false,
      timestamp: new Date().toISOString(),
    };
    if (env.retain) this.retained.set(topic, env as MqttEnvelope);
    for (const [pattern, set] of this.listeners) {
      if (!topicMatches(pattern, topic)) continue;
      for (const listener of set) listener(env as MqttEnvelope);
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function topicMatches(pattern: string, topic: string): boolean {
  if (pattern === topic) return true;
  const patternParts = pattern.split('/');
  const topicParts = topic.split('/');
  for (let i = 0; i < patternParts.length; i += 1) {
    const p = patternParts[i];
    if (p === '#') return true;
    if (p === '+') continue;
    if (p !== topicParts[i]) return false;
  }
  return patternParts.length === topicParts.length;
}

/**
 * Attach a mock "firmware" to a client that echoes commands back as
 * state events, simulating a real ESP32 responding to `magnax/device/+/command`.
 */
export function attachMockDeviceFirmware(
  client: MockMqttClient,
  deviceId: string,
  initial: { brightness?: number; colorTempK?: number; on?: boolean } = {},
): () => void {
  let on = initial.on ?? false;
  let brightness = initial.brightness ?? 0;
  let colorTempK = initial.colorTempK ?? 3000;

  const commandTopic = `magnax/device/${deviceId}/command`;
  const stateTopic = `magnax/device/${deviceId}/state`;

  const unsubscribe = client.subscribe<DeviceCommand>(commandTopic, (env) => {
    const cmd = env.payload;
    if (typeof cmd.on === 'boolean') on = cmd.on;
    if (typeof cmd.brightness === 'number') brightness = clamp(cmd.brightness, 0, 100);
    if (typeof cmd.colorTempK === 'number') colorTempK = clamp(cmd.colorTempK, 2200, 6500);

    const powerDrawW = on ? Math.max(0.4, (brightness / 100) * 9) : 0;
    const event: DeviceStateEvent = {
      deviceId,
      on,
      brightness,
      colorTempK,
      powerDrawW,
      updatedAt: new Date().toISOString(),
    };
    client.publish(stateTopic, event, { retain: true });
  });

  return unsubscribe;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
