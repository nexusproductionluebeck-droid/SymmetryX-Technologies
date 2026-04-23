import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEVICE_METADATA } from '@magnax/shared';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button } from '@/components/Button';
import { CameraLiveTile } from '@/components/accessories/CameraLiveTile';
import { GlassCard } from '@/components/GlassCard';
import { useDeviceStore } from '@/store/deviceStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { RootScreenProps } from '@/navigation/types';

export function CameraScreen({ navigation, route }: RootScreenProps<'Camera'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { deviceId } = route.params;

  const device = useDeviceStore((s) => s.devices[deviceId]);
  const setCamera = useDeviceStore((s) => s.setCamera);

  // Rolling timeline: for demo, 24 h of activity with a few motion peaks.
  const timeline = useMemo(() => buildTimeline(), []);

  if (!device || !device.state.accessory.camera) {
    return (
      <View style={styles.container}>
        <AnimatedBackground />
        <Text style={{ color: '#FFFFFF', padding: 20, paddingTop: 80 }}>
          Keine Kamera-Daten.
        </Text>
        <Button
          label="Zurück"
          onPress={() => navigation.goBack()}
          style={{ margin: 20 }}
        />
      </View>
    );
  }

  const cam = device.state.accessory.camera;
  const tileWidth = Math.min(width - 40, 560);

  const takeSnapshot = () => {
    setCamera(device.id, { lastSnapshotAt: new Date().toISOString() });
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground intensity="calm" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={16} style={styles.backBtn}>
            <Text style={styles.backGlyph}>‹</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <View style={styles.brandRow}>
              <View style={styles.brandDot} />
              <Text style={styles.brandText}>KAMERA · {DEVICE_METADATA[device.type].label.toUpperCase()}</Text>
            </View>
            <Text style={styles.title}>{device.name}</Text>
            <Text style={styles.subtitle}>
              {device.roomId ?? 'Kein Raum'} · 160° Weitwinkel · H.265
            </Text>
          </View>
        </View>

        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <CameraLiveTile
            width={tileWidth}
            height={Math.round((tileWidth * 9) / 16)}
            privacyMode={cam.privacyMode}
            streaming={cam.streaming}
            motionDetected
          />
        </View>

        <View style={styles.actionRow}>
          <View style={{ flex: 1 }}>
            <Button
              label={cam.privacyMode ? 'Privatsphäre AUS' : 'Privatsphäre EIN'}
              variant={cam.privacyMode ? 'secondary' : 'primary'}
              onPress={() => setCamera(device.id, { privacyMode: !cam.privacyMode })}
            />
          </View>
          <View style={{ width: 10 }} />
          <View style={{ flex: 1 }}>
            <Button
              label="Schnappschuss"
              variant="secondary"
              onPress={takeSnapshot}
              disabled={cam.privacyMode}
            />
          </View>
        </View>

        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Einstellungen</Text>
          <SettingRow
            label="Livestream"
            description="Dauerhafte Ansicht aktiv"
            value={cam.streaming && !cam.privacyMode}
            onChange={(v) => setCamera(device.id, { streaming: v })}
            disabled={cam.privacyMode}
          />
          <SettingRow
            label="Bewegungszonen"
            description="Benachrichtigung bei erkanntem Ereignis"
            value={cam.motionZonesActive && !cam.privacyMode}
            onChange={(v) => setCamera(device.id, { motionZonesActive: v })}
            disabled={cam.privacyMode}
          />
          <SettingRow
            label="Privatsphäre-Modus"
            description="Stream + Aufzeichnung werden hardware­seitig blockiert"
            value={cam.privacyMode}
            onChange={(v) => setCamera(device.id, { privacyMode: v })}
          />
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>24 h Aktivität</Text>
          <Text style={styles.sectionHint}>Bewegungsereignisse je Stunde</Text>
          <View style={timelineStyles.row}>
            {timeline.map((bar, i) => (
              <View
                key={i}
                style={[
                  timelineStyles.bar,
                  {
                    height: 4 + bar * 38,
                    backgroundColor: bar > 0.7
                      ? '#E09A46'
                      : bar > 0.3
                        ? '#1A8A7D'
                        : 'rgba(255,255,255,0.15)',
                  },
                ]}
              />
            ))}
          </View>
          <View style={timelineStyles.labels}>
            <Text style={timelineStyles.label}>00</Text>
            <Text style={timelineStyles.label}>06</Text>
            <Text style={timelineStyles.label}>12</Text>
            <Text style={timelineStyles.label}>18</Text>
            <Text style={timelineStyles.label}>24</Text>
          </View>
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Letzte Ereignisse</Text>
          <EventRow time="vor 3 Min" zone="Sofa-Bereich" level="ok" />
          <EventRow time="vor 18 Min" zone="Eingang" level="ok" />
          <EventRow time="vor 42 Min" zone="Fenster Süd" level="warn" />
          <EventRow time="heute, 07:12" zone="Eingang" level="ok" />
        </GlassCard>

        <Text style={[styles.signature, { color: theme.colors.textSecondary }]}>
          MAGNA-X · engineered by SymmetryX Technologies
        </Text>
      </ScrollView>
    </View>
  );
}

function SettingRow({
  label,
  description,
  value,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={settingStyles.row}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={settingStyles.label}>{label}</Text>
        <Text style={settingStyles.description}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        thumbColor="#FFFFFF"
        trackColor={{ true: '#1A8A7D', false: 'rgba(232,238,243,0.18)' }}
      />
    </View>
  );
}

function EventRow({ time, zone, level }: { time: string; zone: string; level: 'ok' | 'warn' }) {
  const color = level === 'warn' ? '#E09A46' : '#1A8A7D';
  return (
    <View style={eventStyles.row}>
      <View style={[eventStyles.dot, { backgroundColor: color }]} />
      <Text style={eventStyles.zone}>{zone}</Text>
      <Text style={eventStyles.time}>{time}</Text>
    </View>
  );
}

function buildTimeline(): number[] {
  const bars = 24;
  const result: number[] = [];
  const seed = 41;
  for (let i = 0; i < bars; i += 1) {
    const r = pseudoRandom(seed + i * 13);
    const baseline = i < 6 ? 0.05 : i < 9 ? 0.5 : i < 17 ? 0.3 : i < 22 ? 0.7 : 0.2;
    result.push(Math.max(0, Math.min(1, baseline + (r - 0.5) * 0.4)));
  }
  return result;
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05090F' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginRight: 12,
  },
  backGlyph: { color: '#FFFFFF', fontSize: 28, marginTop: -4 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A8A7D',
    marginRight: 6,
    shadowColor: '#1A8A7D',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  brandText: {
    color: 'rgba(232,238,243,0.65)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '700', marginTop: 6, letterSpacing: -0.5 },
  subtitle: { color: 'rgba(232,238,243,0.55)', fontSize: 12, marginTop: 4 },
  actionRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16 },
  section: { marginHorizontal: 20, marginBottom: 14, padding: 18 },
  sectionTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  sectionHint: { color: 'rgba(232,238,243,0.55)', fontSize: 12, marginTop: 4 },
  signature: {
    textAlign: 'center',
    color: 'rgba(232,238,243,0.35)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '500',
    marginTop: 20,
  },
});

const settingStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  label: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  description: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
});

const eventStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 10 },
  zone: { color: '#FFFFFF', fontSize: 13, flex: 1 },
  time: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
});

const timelineStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 48,
    gap: 2,
    marginTop: 14,
  },
  bar: { flex: 1, borderRadius: 2 },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  label: {
    color: 'rgba(232,238,243,0.45)',
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
});
