import type { AiInsight, AiInsightKind, AiInsightTone, Device } from '@magnax/shared';

/**
 * MAGNA-X on-device pattern recogniser (mock).
 *
 * Derives insights deterministically from the current device state
 * (sensor reading, motion history) so demo sessions produce stable,
 * plausible patterns without needing real time-series history yet.
 * Replace with the actual on-device model once the inference runtime
 * is wired up.
 */

interface Template {
  kind: AiInsightKind;
  tone: AiInsightTone;
  title: string;
  body: string;
  when: (device: Device) => boolean;
  confidence: (device: Device) => number;
}

const TEMPLATES: ReadonlyArray<Template> = [
  {
    kind: 'air-quality-trend',
    tone: 'advisory',
    title: 'Luftqualität verschlechtert sich abends',
    body: 'Der CO₂-Wert steigt werktags zwischen 18 und 22 Uhr regelmäßig über 1000 ppm. Vorschlag: automatische Lüftung.',
    when: (d) => (d.state.sensors?.co2Ppm ?? 0) > 720,
    confidence: (d) => 0.78 + Math.min(0.15, ((d.state.sensors?.co2Ppm ?? 720) - 720) / 2000),
  },
  {
    kind: 'temperature-drift',
    tone: 'info',
    title: 'Raum kühlt bei Abwesenheit',
    body: 'Wenn niemand zu Hause ist, fällt die Temperatur um ca. 1,4 °C ab. Heizung könnte früher hochfahren, sobald Präsenz erkannt wird.',
    when: (d) => (d.state.sensors?.temperatureC ?? 22) < 22 && (d.state.accessory.motionHistory?.length ?? 0) > 0,
    confidence: () => 0.71,
  },
  {
    kind: 'occupancy-routine',
    tone: 'info',
    title: 'Routine erkannt',
    body: 'Werktags zwischen 07:10 und 07:40 Uhr bist du zuverlässig in diesem Raum. Schon automatische Szene vorbereiten?',
    when: (d) => (d.state.accessory.motionHistory?.length ?? 0) >= 2,
    confidence: (d) => 0.6 + Math.min(0.3, (d.state.accessory.motionHistory?.length ?? 0) * 0.04),
  },
  {
    kind: 'motion-schedule',
    tone: 'info',
    title: 'Ungenutzte Stunden identifiziert',
    body: 'Zwischen 10 und 15 Uhr gibt es an Werktagen keine Bewegung. Beleuchtung kann in dieser Zeit dezenter laufen.',
    when: (d) => (d.state.accessory.motionHistory?.length ?? 0) >= 1,
    confidence: () => 0.68,
  },
  {
    kind: 'smoke-anomaly',
    tone: 'alert',
    title: 'Kurzzeitige Rauchspitzen',
    body: 'Drei kurze Auslöser am Rauchmelder in den letzten 30 Tagen. Empfehlung: Position prüfen, Küchendämpfe möglich.',
    when: (d) => d.capabilities.smokeDetector,
    confidence: () => 0.55,
  },
  {
    kind: 'energy-optimisation',
    tone: 'advisory',
    title: 'Sparpotenzial erkannt',
    body: 'Dieser Raum wird häufig mit voller Helligkeit betrieben, während Tageslicht verfügbar ist. Tageslicht-adaptives Dimmen könnte ≈ 22 % Strom sparen.',
    when: (d) => (d.state.sensors?.luxAmbient ?? 0) > 180 && d.state.on && d.state.brightness > 60,
    confidence: () => 0.82,
  },
];

export function generateAiInsights(device: Device): AiInsight[] {
  const settings = device.state.accessory.sensorSettings;
  if (!settings?.aiPatternDetection) return [];

  const now = Date.now();
  const applicable = TEMPLATES.filter((t) => t.when(device));

  // Stagger detection times deterministically from device id so
  // relative timestamps vary ("vor 3 min", "vor 2 Std") rather than
  // all showing "jetzt".
  const seed = hashSeed(device.id);
  return applicable.map((template, i) => {
    const minsAgo = ((seed + i * 37) % 220) + 2;
    return {
      id: `${device.id}-${template.kind}`,
      kind: template.kind,
      tone: template.tone,
      title: template.title,
      body: template.body,
      detectedAt: new Date(now - minsAgo * 60_000).toISOString(),
      confidence: Math.round(template.confidence(device) * 100) / 100,
    };
  });
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (diffSec < 60) return `vor ${diffSec} s`;
  if (diffSec < 3600) return `vor ${Math.round(diffSec / 60)} Min`;
  if (diffSec < 86400) return `vor ${Math.round(diffSec / 3600)} Std`;
  return `vor ${Math.round(diffSec / 86400)} Tagen`;
}
