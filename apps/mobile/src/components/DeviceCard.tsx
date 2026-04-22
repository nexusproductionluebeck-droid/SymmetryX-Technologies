import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DEVICE_METADATA, type Device } from '@magnax/shared';

import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  device: Device;
  onPress: () => void;
}

export function DeviceCard({ device, onPress }: Props) {
  const theme = useTheme();
  const meta = DEVICE_METADATA[device.type];
  const statusColor =
    device.status === 'online'
      ? theme.palette.green
      : device.status === 'warning'
        ? theme.palette.orange
        : device.status === 'offline'
          ? theme.palette.red
          : theme.palette.teal;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
    >
      <View style={styles.header}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{device.name}</Text>
      </View>
      <Text style={[styles.type, { color: theme.colors.textSecondary }]}>{meta.label}</Text>
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          {device.state.on ? `${device.state.brightness}% · ${device.state.colorTempK} K` : 'Aus'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  name: { fontSize: 16, fontWeight: '600' },
  type: { fontSize: 12, marginTop: 4 },
  footer: { marginTop: 12 },
  footerText: { fontSize: 13, fontVariant: ['tabular-nums'] },
});
