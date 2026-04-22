import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEFAULT_ROOMS } from '@magnax/shared';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { useDeviceStore } from '@/store/deviceStore';
import { useSetupStore } from '@/store/setupStore';
import type { RootScreenProps } from '@/navigation/types';

export function SetupRoomScreen({ navigation }: RootScreenProps<'SetupRoom'>) {
  const insets = useSafeAreaInsets();
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
    <View style={styles.container}>
      <AnimatedBackground />
      <View style={[styles.inner, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.eyebrow}>SCHRITT 4 VON 5</Text>
        <Text style={styles.title}>Wo hängt's?</Text>

        <View style={styles.grid}>
          {DEFAULT_ROOMS.map((room) => {
            const active = roomName === room.name;
            return (
              <Pressable
                key={room.name}
                onPress={() => setRoom(room.name)}
                style={[
                  styles.chip,
                  active && styles.chipActive,
                ]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{room.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.orLabel}>ODER EIGENEN NAMEN</Text>
        <GlassCard intensity="low" style={{ padding: 12 }}>
          <TextInput
            value={custom}
            onChangeText={(t) => {
              setCustom(t);
              setRoom(t);
            }}
            placeholder="z. B. Lesezimmer"
            placeholderTextColor="rgba(232,238,243,0.35)"
            style={styles.input}
          />
        </GlassCard>

        <View style={{ flex: 1 }} />
        <Button
          label="Weiter"
          onPress={handleContinue}
          disabled={!roomName && custom.trim().length === 0}
          style={{ marginBottom: insets.bottom + 16 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05090F' },
  inner: { flex: 1, paddingHorizontal: 20 },
  eyebrow: {
    color: 'rgba(232,238,243,0.5)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '700', marginTop: 6, letterSpacing: -0.6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 22 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  chipActive: {
    backgroundColor: 'rgba(26,138,125,0.35)',
    borderColor: '#1A8A7D',
  },
  chipText: { color: 'rgba(232,238,243,0.85)', fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  orLabel: {
    color: 'rgba(232,238,243,0.5)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
    marginTop: 22,
    marginBottom: 8,
  },
  input: { color: '#FFFFFF', fontSize: 16, paddingHorizontal: 6, paddingVertical: 8 },
});
