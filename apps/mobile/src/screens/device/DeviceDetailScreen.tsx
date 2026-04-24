import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEVICE_METADATA, toCapsWithBrand } from '@magnax/shared';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button } from '@/components/Button';
import { CameraLiveTile } from '@/components/accessories/CameraLiveTile';
import { ColorTempSlider } from '@/components/ColorTempSlider';
import { GlassCard } from '@/components/GlassCard';
import { LightHalo } from '@/components/LightHalo';
import { RadialDimmer } from '@/components/RadialDimmer';
import { SensorPanel } from '@/components/sensors/SensorPanel';
import { MotionSensorTile } from '@/components/accessories/MotionSensorTile';
import { getMqttService } from '@/services/mqtt';
import { useDeviceStore } from '@/store/deviceStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { RootScreenProps } from '@/navigation/types';

export function DeviceDetailScreen({ route, navigation }: RootScreenProps<'DeviceDetail'>) {
  const { deviceId } = route.params;
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const device = useDeviceStore((s) => s.devices[deviceId]);
  const setBrightness = useDeviceStore((s) => s.setBrightness);
  const setColorTemp = useDeviceStore((s) => s.setColorTemp);
  const setOn = useDeviceStore((s) => s.setOn);

  const [local, setLocal] = useState(() => ({
    on: device?.state.on ?? false,
    brightness: device?.state.brightness ?? 0,
    colorTempK: device?.state.colorTempK ?? 3000,
  }));

  useEffect(() => {
    if (!device) return;
    const mqtt = getMqttService();
    mqtt.ensureDeviceSim(device.id);
    const unsub = mqtt.subscribeState(device.id, (event) => {
      setLocal({ on: event.on, brightness: event.brightness, colorTempK: event.colorTempK });
    });
    return unsub;
  }, [device]);

  if (!device) {
    return (
      <View style={styles.container}>
        <AnimatedBackground />
        <Text style={{ color: '#FFFFFF', padding: 20 }}>Gerät nicht gefunden.</Text>
        <Button label="Zurück" onPress={() => navigation.goBack()} style={{ margin: 20 }} />
      </View>
    );
  }

  const meta = DEVICE_METADATA[device.type];

  const pushCommand = (patch: { brightness?: number; colorTempK?: number; on?: boolean }) => {
    getMqttService().publishCommand(device.id, patch);
  };

  const displayBrightness = local.on ? local.brightness : 0;

  return (
    <View style={styles.container}>
      <AnimatedBackground intensity={local.on ? 'active' : 'calm'} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={16} style={styles.backBtn}>
            <Text style={styles.backGlyph}>‹</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>{toCapsWithBrand(meta.label)}</Text>
            <Text style={styles.title}>{device.name}</Text>
            <Text style={styles.subtitle}>
              {device.roomId ?? 'Kein Raum'}  ·  {device.macAddress}
            </Text>
          </View>
          <StatusDot status={device.status} />
        </View>

        {device.capabilities.camera ? (
          <View style={{ paddingHorizontal: 20, marginBottom: 16, alignItems: 'center' }}>
            <CameraLiveTile
              width={320}
              height={180}
              privacyMode={device.state.accessory.camera?.privacyMode ?? false}
              streaming={device.state.accessory.camera?.streaming ?? true}
              motionDetected
            />
            <View style={{ height: 12 }} />
            <Button
              label="Kamera-Vollbild öffnen"
              onPress={() => navigation.navigate('Camera', { deviceId: device.id })}
              style={{ minWidth: 260 }}
            />
          </View>
        ) : device.type === 'motion' ? (
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <GlassCard glow={device.state.accessory.motionPresent ?? false}>
              <MotionSensorTile
                present={device.state.accessory.motionPresent ?? false}
                history={device.state.accessory.motionHistory ?? []}
                name={device.name}
              />
            </GlassCard>
          </View>
        ) : (
          <View style={styles.heroStage}>
            <LightHalo size={380} brightness={displayBrightness} colorTempK={local.colorTempK} />
            <RadialDimmer
              value={local.brightness}
              disabled={!local.on}
              onChange={(v) => {
                setLocal((prev) => ({ ...prev, brightness: v }));
                setBrightness(device.id, v);
              }}
              onCommit={(v) => pushCommand({ brightness: v, on: v > 0 })}
            />
          </View>
        )}

        {device.capabilities.sensors && (
          <View style={{ marginBottom: 16 }}>
            <SensorPanel reading={device.state.sensors} />
          </View>
        )}

        {device.capabilities.dimming && (
          <View style={styles.rowActions}>
            <GlassCard intensity="low" style={styles.actionCard} glow={local.on}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.actionEyebrow}>Licht</Text>
                  <Text style={styles.actionLabel}>{local.on ? 'An' : 'Aus'}</Text>
                </View>
                <Switch
                  value={local.on}
                  onValueChange={(v) => {
                    const next = { on: v, brightness: v && local.brightness === 0 ? 60 : local.brightness };
                    setLocal((prev) => ({ ...prev, ...next }));
                    setOn(device.id, v);
                    pushCommand(v ? { on: true, brightness: next.brightness } : { on: false });
                  }}
                  thumbColor="#FFFFFF"
                  trackColor={{ true: theme.palette.teal, false: 'rgba(232,238,243,0.2)' }}
                />
              </View>
            </GlassCard>

            <GlassCard intensity="low" style={styles.actionCard}>
              <Text style={styles.actionEyebrow}>Szene</Text>
              <Text style={styles.actionLabel}>Wohlfühl</Text>
            </GlassCard>
          </View>
        )}

        {device.capabilities.colorTemperature && (
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Farbtemperatur</Text>
            <Text style={styles.sectionHint}>
              {tempLabel(local.colorTempK)}  ·  {local.colorTempK} K
            </Text>
            <View style={{ height: 18 }} />
            <View style={{ alignItems: 'center' }}>
              <ColorTempSlider
                valueK={local.colorTempK}
                onChange={(v) => {
                  setLocal((prev) => ({ ...prev, colorTempK: v }));
                  setColorTemp(device.id, v);
                }}
                onCommit={(v) => pushCommand({ colorTempK: v })}
              />
            </View>
          </GlassCard>
        )}

        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Gerät</Text>
          <MetaRow label="MAC" value={device.macAddress} />
          <MetaRow label="Firmware" value={device.firmware.current} />
          <MetaRow label="Status" value={device.status} />
          {device.mesh ? (
            <>
              <MetaRow label="Mesh-Rolle" value={device.mesh.role} />
              <MetaRow label="Signal" value={`${device.mesh.rssiDbm} dBm`} />
            </>
          ) : null}
        </GlassCard>

        <Text style={styles.signature}>
          MAGNA-X · engineered by SymmetryX Technologies
        </Text>
      </ScrollView>
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={metaStyles.row}>
      <Text style={metaStyles.label}>{label}</Text>
      <Text style={metaStyles.value}>{value}</Text>
    </View>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'online' ? '#4CD294' : status === 'warning' ? '#FFB547' : status === 'offline' ? '#EF5350' : '#1A8A7D';
  return (
    <View style={[statusStyles.dotOuter, { borderColor: color }]}>
      <View style={[statusStyles.dotInner, { backgroundColor: color }]} />
    </View>
  );
}

function tempLabel(k: number): string {
  if (k < 2800) return 'Warmes Kerzenlicht';
  if (k < 3400) return 'Warmweiß';
  if (k < 4200) return 'Neutralweiß';
  if (k < 5200) return 'Tageslicht';
  return 'Kühles Tageslicht';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05090F', overflow: 'hidden' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
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
  },
  backGlyph: { color: '#FFFFFF', fontSize: 28, marginTop: -4 },
  eyebrow: {
    color: 'rgba(232,238,243,0.5)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginTop: 2, letterSpacing: -0.4 },
  subtitle: { color: 'rgba(232,238,243,0.55)', fontSize: 12, marginTop: 2, fontVariant: ['tabular-nums'] },
  heroStage: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    marginBottom: 20,
    height: 340,
  },
  rowActions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  actionCard: { flex: 1, padding: 14 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionEyebrow: {
    color: 'rgba(232,238,243,0.5)',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '600',
  },
  actionLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginTop: 4 },
  section: { marginHorizontal: 20, marginBottom: 16 },
  sectionTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },
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

const metaStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  label: { color: 'rgba(232,238,243,0.55)', fontSize: 13 },
  value: { color: '#FFFFFF', fontSize: 13, fontVariant: ['tabular-nums'] },
});

const statusStyles = StyleSheet.create({
  dotOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  dotInner: { width: 6, height: 6, borderRadius: 3 },
});
