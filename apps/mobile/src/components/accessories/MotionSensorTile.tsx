import { StyleSheet, Text, View } from 'react-native';
import type { MotionEvent } from '@magnax/shared';

import { MotionRadar } from '@/components/sensors/MotionRadar';

interface Props {
  present: boolean;
  history: MotionEvent[];
  name?: string;
}

/**
 * Presence + event tile for a stand-alone motion sensor (Zigbee /
 * Matter / etc.). Re-uses the MotionRadar sweep animation and adds
 * a scrolling event log beneath — "wann zuletzt wer wo".
 */
export function MotionSensorTile({ present, history, name }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>BEWEGUNG {name ? `· ${name.toUpperCase()}` : ''}</Text>

      <MotionRadar motionDetected={present} size={140} />

      <View style={styles.divider} />

      <View style={styles.feed}>
        <Text style={styles.feedHeader}>LETZTE EREIGNISSE</Text>
        {history.length === 0 ? (
          <Text style={styles.feedEmpty}>Noch keine Bewegung aufgezeichnet.</Text>
        ) : (
          history.slice(0, 4).map((event) => (
            <View key={event.id} style={styles.feedRow}>
              <View style={styles.feedDot} />
              <Text style={styles.feedZone}>{event.zone}</Text>
              <Text style={styles.feedTime}>{formatTime(event.at)}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffS = Math.max(0, Math.round((now - date.getTime()) / 1000));
  if (diffS < 60) return `vor ${diffS} s`;
  if (diffS < 3600) return `vor ${Math.round(diffS / 60)} min`;
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: '100%' },
  eyebrow: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    width: '100%',
    marginVertical: 12,
  },
  feed: { width: '100%' },
  feedHeader: {
    color: 'rgba(232,238,243,0.5)',
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 8,
  },
  feedEmpty: {
    color: 'rgba(232,238,243,0.45)',
    fontSize: 12,
    fontStyle: 'italic',
  },
  feedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  feedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A8A7D',
    marginRight: 8,
  },
  feedZone: { color: '#FFFFFF', fontSize: 12, flex: 1 },
  feedTime: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
});
