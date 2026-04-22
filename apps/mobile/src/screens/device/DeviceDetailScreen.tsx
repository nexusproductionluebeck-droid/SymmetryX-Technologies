import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { DEVICE_METADATA } from '@magnax/shared';

import { Button } from '@/components/Button';
import { ColorTempSlider } from '@/components/ColorTempSlider';
import { Dimmer } from '@/components/Dimmer';
import { getMqttService } from '@/services/mqtt';
import { useDeviceStore } from '@/store/deviceStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { RootScreenProps } from '@/navigation/types';

export function DeviceDetailScreen({ route, navigation }: RootScreenProps<'DeviceDetail'>) {
  const { deviceId } = route.params;
  const theme = useTheme();
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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.textPrimary }}>Gerät nicht gefunden.</Text>
        <Button label="Zurück" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const meta = DEVICE_METADATA[device.type];
  const pushCommand = (patch: { brightness?: number; colorTempK?: number; on?: boolean }) => {
    getMqttService().publishCommand(device.id, patch);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{device.name}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {meta.label}  ·  {device.roomId ?? 'Kein Raum'}
        </Text>
      </View>

      <View style={[styles.heroCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.heroRow}>
          <Text style={[styles.heroLabel, { color: theme.colors.textSecondary }]}>Licht</Text>
          <Switch
            value={local.on}
            onValueChange={(v) => {
              setLocal((prev) => ({ ...prev, on: v, brightness: v ? Math.max(prev.brightness, 60) : prev.brightness }));
              setOn(device.id, v);
              pushCommand({ on: v, ...(v && local.brightness === 0 ? { brightness: 60 } : {}) });
            }}
            thumbColor={theme.palette.white}
            trackColor={{ true: theme.palette.teal, false: theme.colors.border }}
          />
        </View>

        <View style={{ height: 24 }} />

        <Dimmer
          value={local.brightness}
          label="Helligkeit"
          disabled={!local.on}
          onChange={(v) => {
            setLocal((prev) => ({ ...prev, brightness: v }));
            setBrightness(device.id, v);
          }}
          onCommit={(v) => pushCommand({ brightness: v, on: v > 0 })}
        />

        <View style={{ height: 24 }} />

        {device.capabilities.colorTemperature && (
          <ColorTempSlider
            valueK={local.colorTempK}
            onChange={(v) => {
              setLocal((prev) => ({ ...prev, colorTempK: v }));
              setColorTemp(device.id, v);
            }}
            onCommit={(v) => pushCommand({ colorTempK: v })}
          />
        )}
      </View>

      <View style={[styles.metaCard, { backgroundColor: theme.colors.surface }]}>
        <MetaRow label="MAC-Adresse" value={device.macAddress} />
        <MetaRow label="Firmware" value={device.firmware.current} />
        <MetaRow label="Status" value={device.status} />
        {device.mesh ? (
          <>
            <MetaRow label="Mesh-Rolle" value={device.mesh.role} />
            <MetaRow label="Signal" value={`${device.mesh.rssiDbm} dBm`} />
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[metaStyles.row, { borderBottomColor: theme.colors.border }]}>
      <Text style={[metaStyles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[metaStyles.value, { color: theme.colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 4 },
  heroCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  heroRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: { fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' },
  metaCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 4,
    borderRadius: 16,
  },
});

const metaStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: 13 },
  value: { fontSize: 14, fontWeight: '500', fontVariant: ['tabular-nums'] },
});
