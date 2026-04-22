import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { DeviceCard } from '@/components/DeviceCard';
import { useDeviceStore } from '@/store/deviceStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { RootScreenProps } from '@/navigation/types';

export function HomeScreen({ navigation }: RootScreenProps<'Home'>) {
  const theme = useTheme();
  const devices = useDeviceStore((s) => s.orderedIds.map((id) => s.devices[id]!));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.heading, { color: theme.colors.textPrimary }]}>Dein Zuhause</Text>
      <Text style={[styles.subheading, { color: theme.colors.textSecondary }]}>
        {devices.length} Gerät{devices.length === 1 ? '' : 'e'} verbunden
      </Text>

      {devices.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
            Noch keine Geräte
          </Text>
          <Text style={[styles.emptyBody, { color: theme.colors.textSecondary }]}>
            Starte das Setup und verwandle den ersten Deckenpunkt in einen MagnaX.
          </Text>
          <Button
            label="Gerät hinzufügen"
            onPress={() => navigation.navigate('SetupProduct')}
            style={{ marginTop: 24, minWidth: 220 }}
          />
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(d) => d.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12, paddingVertical: 16 }}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <DeviceCard
                device={item}
                onPress={() => navigation.navigate('DeviceDetail', { deviceId: item.id })}
              />
            </View>
          )}
          ListFooterComponent={
            <Button
              label="Weiteres Gerät hinzufügen"
              variant="secondary"
              onPress={() => navigation.navigate('SetupProduct')}
              style={{ marginTop: 12 }}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 28, fontWeight: '700', letterSpacing: -0.4 },
  subheading: { fontSize: 14, marginTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptyBody: { fontSize: 14, textAlign: 'center', marginTop: 8, maxWidth: 280, lineHeight: 20 },
});
