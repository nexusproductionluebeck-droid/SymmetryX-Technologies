import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { DEVICE_METADATA, type DeviceType } from '@magnax/shared';

import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { useSetupStore } from '@/store/setupStore';
import type { RootScreenProps } from '@/navigation/types';

const AVAILABLE: DeviceType[] = ['pure', 'mesh', 'sense', 'sense-smoke', 'cam', 'stick'];

export function SetupProductScreen({ navigation }: RootScreenProps<'SetupProduct'>) {
  const theme = useTheme();
  const { productType, setProductType, advance } = useSetupStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.intro, { color: theme.colors.textSecondary }]}>
        Welche MagnaX-Variante hast du gekauft? Die App passt die nächsten Schritte automatisch an.
      </Text>

      <FlatList
        data={AVAILABLE}
        keyExtractor={(type) => type}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => {
          const meta = DEVICE_METADATA[item];
          const active = productType === item;
          return (
            <Pressable
              onPress={() => setProductType(item)}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: active ? theme.palette.teal : theme.colors.border,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              <View style={[styles.iconPill, { backgroundColor: theme.palette.navy }]}>
                <Text style={styles.iconText}>{item[0]?.toUpperCase() ?? '?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>{meta.label}</Text>
                <Text style={[styles.cardBody, { color: theme.colors.textSecondary }]}>
                  {meta.tagline}
                </Text>
              </View>
              {meta.priceEur !== null && (
                <Text style={[styles.price, { color: theme.colors.accent }]}>
                  € {meta.priceEur.toFixed(2)}
                </Text>
              )}
            </Pressable>
          );
        }}
      />

      <Button
        label="Weiter"
        onPress={() => {
          if (!productType) return;
          advance('bluetooth');
          navigation.navigate('SetupBluetooth');
        }}
        disabled={!productType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16 },
  intro: { fontSize: 15, lineHeight: 22 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    marginVertical: 6,
  },
  iconPill: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { color: '#FFFFFF', fontWeight: '700', fontSize: 18 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardBody: { fontSize: 13, marginTop: 2 },
  price: { fontSize: 15, fontWeight: '700' },
});
