import { getMqttService } from './mqtt';

const MIN_SPLASH_MS = 2800;

export async function bootstrapServices(): Promise<void> {
  const started = Date.now();
  const mqtt = getMqttService();
  await mqtt.connect();

  // Always hold the splash for at least MIN_SPLASH_MS so the brand
  // moment never feels like a flash. Real network / cache work that
  // takes longer simply replaces the artificial hold.
  const elapsed = Date.now() - started;
  if (elapsed < MIN_SPLASH_MS) {
    await delay(MIN_SPLASH_MS - elapsed);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
