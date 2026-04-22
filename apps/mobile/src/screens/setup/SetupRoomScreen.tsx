import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { DEFAULT_ROOMS } from '@magnax/shared';

import { Button } from '@/components/Button';
import { useDeviceStore } from '@/store/deviceStore';
import { useSetupStore } from '@/store/setupStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { RootScreenProps } from '@/navigation/types';

export function SetupRoomScreen({ navigation }: RootScreenProps<'SetupRoom'>) {
  const theme = useTheme();
  const { roomName, setRoom, discoveredDeviceId, advance } = useSetupStore();
  const setDeviceRoom = useDeviceStore((s) => s.setRoom);
  const [custom, setCustom] = useState('');

  const handleContinue = () => {
    const chosen = roomName ?? custom.trim();
    if (!chosen) return;
    setRoom(chosen);
    if (discoveredDeviceId) setDeviceRoom(discoveredDeviceId, chosen.toLowerCase());
    advance('test');
    navigation.navigate('SetupTest');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Wo hängt das Gerät?</Text>

      <View style={styles.grid}>
        {DEFAULT_ROOMS.map((room) => {
          const active = roomName === room.name;
          return (
            <Pressable
              key={room.name}
              onPress={() => setRoom(room.name)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? theme.palette.teal : theme.colors.surface,
                  borderColor: active ? theme.palette.teal : theme.colors.border,
                },
              ]}
            >
              <Text style={{ color: active ? '#FFFFFF' : theme.colors.textPrimary, fontWeight: '600' }}>
                {room.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.or, { color: theme.colors.textSecondary }]}>oder eigenen Namen vergeben</Text>
      <TextInput
        value={custom}
        onChangeText={(t) => {
          setCustom(t);
          setRoom(t);
        }}
        placeholder="z. B. Lesezimmer"
        placeholderTextColor={theme.colors.textSecondary}
        style={[styles.input, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
      />

      <Button
        label="Weiter"
        onPress={handleContinue}
        disabled={!roomName && custom.trim().length === 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  or: { fontSize: 13, marginTop: 20, marginBottom: 8 },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 16, marginBottom: 20 },
});
