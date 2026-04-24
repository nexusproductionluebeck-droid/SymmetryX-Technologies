import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Device } from '@magnax/shared';

import { CameraLiveTile } from '@/components/accessories/CameraLiveTile';
import { GlassCard } from '@/components/GlassCard';

interface Props {
  cams: Device[];
  onSelect: (deviceId: string) => void;
}

/**
 * Security-style camera grid. Every cam in the house on one screen,
 * live preview each, tap to open full detail.
 */
export function CamerasTab({ cams, onSelect }: Props) {
  if (cams.length === 0) {
    return (
      <View style={styles.empty}>
        <GlassCard style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Keine Kameras</Text>
          <Text style={styles.emptyBody}>
            Füge eine MAGNA-X Cam hinzu oder starte den Demo-Modus, um das Haus zu sehen.
          </Text>
        </GlassCard>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View style={styles.headerDot} />
        <Text style={styles.headerText}>LIVE · {cams.length} KAMERA{cams.length === 1 ? '' : 'S'}</Text>
      </View>

      <View style={styles.grid}>
        {cams.map((cam) => (
          <Pressable
            key={cam.id}
            style={styles.item}
            onPress={() => onSelect(cam.id)}
          >
            <CameraLiveTile
              width={164}
              height={110}
              privacyMode={cam.state.accessory.camera?.privacyMode ?? false}
              streaming={cam.state.accessory.camera?.streaming ?? true}
              motionDetected
              compact
              label={`LIVE`}
            />
            <Text style={styles.camName}>{cam.name}</Text>
            <Text style={styles.camRoom}>{cam.roomId ?? '—'}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D6584E',
    marginRight: 8,
    shadowColor: '#D6584E',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  headerText: {
    color: 'rgba(232,238,243,0.7)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  item: { width: '50%', padding: 4 },
  camName: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginTop: 8 },
  camRoom: { color: 'rgba(232,238,243,0.55)', fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
  empty: { paddingHorizontal: 20, marginTop: 24 },
  emptyCard: { padding: 24, alignItems: 'center' },
  emptyTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  emptyBody: {
    color: 'rgba(232,238,243,0.7)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});
