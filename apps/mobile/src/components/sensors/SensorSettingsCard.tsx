import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { SensorSettings } from '@magnax/shared';

import { GlassCard } from '@/components/GlassCard';

interface Props {
  settings: SensorSettings;
  onChange: (patch: Partial<SensorSettings>) => void;
  /** Hide the AI-toggle row — used when AI lives in its own card. */
  hideAiToggle?: boolean;
}

const ROWS: ReadonlyArray<{
  key: keyof SensorSettings;
  label: string;
  hint: string;
}> = [
  { key: 'motionDetection', label: 'Bewegungserkennung', hint: 'Sensor meldet Präsenz an Automationen.' },
  { key: 'airQualityAlert', label: 'Luftqualitäts-Alarm', hint: 'Benachrichtigung ab 1000 ppm CO₂.' },
  { key: 'temperatureAlert', label: 'Temperatur-Alarm', hint: 'Benachrichtigung ab <16 °C oder >28 °C.' },
  { key: 'smokeAlarm', label: 'Rauchmelder', hint: 'Akustischer + Push-Alarm bei Rauch.' },
  { key: 'presenceLogging', label: 'Präsenz-Protokoll', hint: 'Ereignisse werden lokal gespeichert.' },
];

/**
 * Sensorik-Einstellungen als Häkchen-Liste. Strikt getrennt vom
 * Dimmer — hier werden nur Sensor-Optionen geschaltet, nie Licht.
 */
export function SensorSettingsCard({ settings, onChange, hideAiToggle = false }: Props) {
  return (
    <GlassCard style={styles.card}>
      <Text style={styles.title}>Sensorik-Einstellungen</Text>
      <Text style={styles.hint}>Was der Sense-Sensor darf und wann er meldet.</Text>

      {ROWS.map((row) => (
        <CheckboxRow
          key={row.key}
          label={row.label}
          hint={row.hint}
          value={settings[row.key]}
          onToggle={() => {
            void Haptics.selectionAsync();
            onChange({ [row.key]: !settings[row.key] } as Partial<SensorSettings>);
          }}
        />
      ))}

      {!hideAiToggle && (
        <CheckboxRow
          label="MAGNA-X KI"
          hint="Mustererkennung auf Sensor-Verlauf — Muster + Vorschläge."
          value={settings.aiPatternDetection}
          onToggle={() => {
            void Haptics.selectionAsync();
            onChange({ aiPatternDetection: !settings.aiPatternDetection });
          }}
          accent
        />
      )}
    </GlassCard>
  );
}

function CheckboxRow({
  label,
  hint,
  value,
  onToggle,
  accent = false,
}: {
  label: string;
  hint: string;
  value: boolean;
  onToggle: () => void;
  accent?: boolean;
}) {
  return (
    <Pressable onPress={onToggle} style={styles.row}>
      <View
        style={[
          styles.box,
          value && (accent ? styles.boxAccent : styles.boxChecked),
        ]}
      >
        {value && (
          <Text style={[styles.check, accent && styles.checkAccent]}>✓</Text>
        )}
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, accent && styles.rowLabelAccent]}>{label}</Text>
        <Text style={styles.rowHint}>{hint}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18 },
  title: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  hint: { color: 'rgba(232,238,243,0.55)', fontSize: 12, marginTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
    marginTop: 8,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(232,238,243,0.35)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  boxChecked: {
    backgroundColor: 'rgba(26,138,125,0.35)',
    borderColor: '#1A8A7D',
  },
  boxAccent: {
    backgroundColor: 'rgba(124,92,230,0.35)',
    borderColor: '#7C5CE6',
  },
  check: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', lineHeight: 18 },
  checkAccent: { color: '#FFFFFF' },
  rowText: { flex: 1 },
  rowLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  rowLabelAccent: { color: '#FFFFFF' },
  rowHint: { color: 'rgba(232,238,243,0.55)', fontSize: 11, marginTop: 2, lineHeight: 15 },
});
