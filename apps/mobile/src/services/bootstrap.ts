import { getMqttService } from './mqtt';

export async function bootstrapServices(): Promise<void> {
  const mqtt = getMqttService();
  await mqtt.connect();
  // A real build warms caches, restores session, checks for firmware
  // updates, and primes the MQTT subscription list. The mock version
  // is intentionally minimal — real network calls gate behind this.
  await delay(600);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
